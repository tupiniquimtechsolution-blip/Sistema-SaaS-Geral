import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listOnboardingOptions,
  normalizeTenantSlug,
  provisionTenant,
  type OnboardingPlan,
  type OnboardingVertical,
} from "tupiniquim-database";

export function OnboardingPanel({
  client,
  onCreated,
  onSignOut,
}: {
  client: SupabaseClient;
  onCreated(tenantId: string, verticalId: string): void;
  onSignOut(): void;
}) {
  const [verticals, setVerticals] = useState<OnboardingVertical[]>([]);
  const [plans, setPlans] = useState<OnboardingPlan[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", verticalId: "", planId: "starter" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void listOnboardingOptions(client)
      .then((options) => {
        if (!active) return;
        setVerticals(options.verticals);
        setPlans(options.plans);
        setForm((current) => ({
          ...current,
          verticalId: current.verticalId || options.verticals[0]?.id || "",
          planId: options.plans.some((plan) => plan.id === current.planId)
            ? current.planId
            : options.plans[0]?.id || "",
        }));
      })
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : "Falha ao carregar onboarding"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [client]);

  const suggestedSlug = useMemo(() => normalizeTenantSlug(form.name), [form.name]);

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">ONBOARDING SEM FORK</p>
          <h1>Crie seu primeiro tenant</h1>
        </div>
        <button className="secondary" type="button" onClick={onSignOut}>Sair</button>
      </header>

      <section className="state-card">
        <p>O tenant será provisionado no SaaS Core com owner membership, branding/theme/settings, plano e trilha de auditoria. Nenhum repositório é copiado.</p>
        <form
          className="auth-form"
          onSubmit={async (event) => {
            event.preventDefault();
            if (submitting) return;
            setError(null);
            setSubmitting(true);
            try {
              const slug = normalizeTenantSlug(form.slug || suggestedSlug);
              const tenantId = await provisionTenant(client, { ...form, slug });
              onCreated(tenantId, form.verticalId);
            } catch (reason) {
              setError(reason instanceof Error ? reason.message : "Falha ao criar tenant");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <label>Nome do negócio<input required minLength={2} maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Padaria Aurora" /></label>
          <label>Slug<input required value={form.slug || suggestedSlug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="padaria-aurora" /></label>
          <label>Vertical<select disabled={loading} value={form.verticalId} onChange={(event) => setForm({ ...form, verticalId: event.target.value })}>{verticals.map((vertical) => <option key={vertical.id} value={vertical.id}>{vertical.name}</option>)}</select></label>
          <label>Plano<select disabled={loading} value={form.planId} onChange={(event) => setForm({ ...form, planId: event.target.value })}>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label>
          <button type="submit" disabled={loading || submitting || !form.verticalId || !form.planId}>{submitting ? "Criando tenant…" : "Criar tenant e abrir Builder"}</button>
          {error ? <p className="error-text" role="alert">{error}</p> : null}
        </form>
        <p className="guardrail">Domínio customizado e cobrança por provider permanecem nos gates próprios; este passo cria o tenant, aplica defaults e inicia trial/subscription manual canônica.</p>
      </section>
    </main>
  );
}
