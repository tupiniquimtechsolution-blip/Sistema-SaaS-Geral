import type { SupabaseClient } from "@supabase/supabase-js";

export interface OnboardingVertical {
  id: string;
  name: string;
  description: string | null;
}

export interface OnboardingPlan {
  id: string;
  name: string;
  description: string | null;
}

export interface TenantProvisionInput {
  name: string;
  slug: string;
  verticalId: string;
  planId: string;
}

export function normalizeTenantSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

export function isValidTenantSlug(value: string): boolean {
  return /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(value);
}

export async function listOnboardingOptions(client: SupabaseClient): Promise<{
  verticals: OnboardingVertical[];
  plans: OnboardingPlan[];
}> {
  const [verticalsResult, plansResult] = await Promise.all([
    client.from("vertical_registry").select("id,name,description").eq("is_enabled", true).order("name"),
    client.from("plans").select("id,name,description").eq("is_active", true).eq("is_public", true).order("sort_order"),
  ]);
  if (verticalsResult.error) throw new Error(`Não foi possível carregar verticais: ${verticalsResult.error.message}`);
  if (plansResult.error) throw new Error(`Não foi possível carregar planos: ${plansResult.error.message}`);
  return {
    verticals: (verticalsResult.data ?? []) as OnboardingVertical[],
    plans: (plansResult.data ?? []) as OnboardingPlan[],
  };
}

export async function provisionTenant(client: SupabaseClient, input: TenantProvisionInput): Promise<string> {
  const name = input.name.trim();
  const slug = normalizeTenantSlug(input.slug || name);
  if (name.length < 2 || name.length > 120) throw new Error("Nome do tenant deve ter entre 2 e 120 caracteres.");
  if (!isValidTenantSlug(slug)) throw new Error("Slug inválido. Use pelo menos 3 caracteres alfanuméricos, com hífens internos opcionais.");
  if (!input.verticalId) throw new Error("Selecione uma vertical.");
  if (!input.planId) throw new Error("Selecione um plano.");

  const { data, error } = await client.rpc("create_tenant_with_owner", {
    p_name: name,
    p_slug: slug,
    p_vertical_id: input.verticalId,
    p_plan_id: input.planId,
  });
  if (error) {
    if (error.message.includes("duplicate") || error.message.includes("unique")) {
      throw new Error("Este slug já está em uso. Escolha outro identificador.");
    }
    throw new Error(`Não foi possível criar o tenant: ${error.message}`);
  }
  if (typeof data !== "string" || !data) throw new Error("Provisionamento concluído sem identificador de tenant.");
  return data;
}
