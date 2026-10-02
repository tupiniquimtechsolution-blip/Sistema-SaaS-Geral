import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

interface UsageEvent {
  id: string;
  operation: string;
  credits: number;
  created_at: string;
}

type UsageState = { status: "loading" } | { status: "denied" } | { status: "error"; message: string } | { status: "ready"; events: UsageEvent[] };

export function hasBillingReadPermission(result: unknown): boolean {
  return result === true;
}

export function BillingCenter({ client, tenantId }: { client: SupabaseClient; tenantId: string }) {
  const [state, setState] = useState<UsageState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    void (async () => {
      try {
        const { data: allowed, error: permissionError } = await client.rpc("has_tenant_permission", {
          p_tenant_id: tenantId,
          p_permission: "billing.read",
        });
        if (permissionError) throw permissionError;
        if (!hasBillingReadPermission(allowed)) {
          if (!cancelled) setState({ status: "denied" });
          return;
        }
        const { data, error } = await client
          .from("ai_usage_events")
          .select("id, operation, credits, created_at")
          .eq("tenant_id", tenantId)
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) throw error;
        if (!cancelled) setState({ status: "ready", events: (data ?? []) as UsageEvent[] });
      } catch (error) {
        if (!cancelled) setState({ status: "error", message: error instanceof Error ? error.message : "Não foi possível ler o uso." });
      }
    })();
    return () => { cancelled = true; };
  }, [client, tenantId]);

  return <main className="billing-center" aria-labelledby="billing-center-title">
    <header className="billing-heading"><div><p className="eyebrow">BILLING · SOMENTE LEITURA</p><h2 id="billing-center-title">Uso e cobrança</h2><p>Exibimos apenas dados que o tenant está autorizado a consultar. Não há checkout, alteração de plano ou portal de pagamento conectado nesta superfície.</p></div><span className="billing-authority">Stripe webhook · autoridade do estado</span></header>
    <section className="billing-card" aria-labelledby="ai-usage-title">
      <div className="billing-card-heading"><div><p className="eyebrow">AI TENANT STUDIO</p><h3 id="ai-usage-title">Eventos recentes de uso</h3></div><span>Máximo: 10 eventos mais recentes</span></div>
      {state.status === "loading" ? <p className="billing-message" role="status">Verificando `billing.read` e carregando eventos autorizados…</p> : null}
      {state.status === "denied" ? <p className="billing-message">Sua sessão não possui a permissão `billing.read`. Nenhum dado de uso foi carregado.</p> : null}
      {state.status === "error" ? <p className="billing-error" role="alert">Não foi possível carregar dados autorizados: {state.message}</p> : null}
      {state.status === "ready" && state.events.length === 0 ? <p className="billing-message">Nenhum evento de uso de IA está visível para este tenant.</p> : null}
      {state.status === "ready" && state.events.length > 0 ? <div className="billing-table-wrap"><table><thead><tr><th>Operação</th><th>Créditos</th><th>Data e hora</th></tr></thead><tbody>{state.events.map((event) => <tr key={event.id}><td><code>{event.operation}</code></td><td>{event.credits}</td><td><time dateTime={event.created_at}>{new Date(event.created_at).toLocaleString()}</time></td></tr>)}</tbody></table></div> : null}
      <p className="billing-footnote">Esta lista é limitada aos 10 registros recentes; não representa consumo total ou valores monetários.</p>
    </section>
    <section className="billing-followup" aria-label="Ações indisponíveis">
      <h3>Assinatura, faturas e métodos de pagamento</h3>
      <p>Não há contrato tenant-scoped de leitura de assinatura/faturas nem endpoint autenticado para checkout ou portal neste app. Não exibimos plano, preço, invoice ou ação especulativa. Consulte o follow-up de backend no ledger do RC.</p>
    </section>
  </main>;
}
