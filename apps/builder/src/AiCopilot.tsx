import { useState } from "react";
import type { FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AI_OPERATION_POLICIES, type AiOperationKey, type AiOperationRisk } from "tupiniquim-saas-core";

interface AiCopilotProps {
  client: SupabaseClient;
  tenantId: string;
  pageId?: string;
  enabled: boolean;
}

interface Proposal {
  operation: AiOperationKey;
  summary: string;
  protectedFields: string[];
  arguments: Record<string, unknown>;
  confirmationRequired: boolean;
  executable: false;
}

const OPERATION_LABELS: Record<AiOperationKey, string> = {
  updateContentField: "Atualizar campo de conteúdo",
  updateProductPrice: "Atualizar preço de produto",
  replaceMedia: "Substituir mídia",
  updateBusinessHours: "Atualizar horário comercial",
  updateThemeTokens: "Atualizar tokens do tema",
  addRegisteredSection: "Adicionar seção registrada",
  reorderSections: "Reordenar seções",
  proposePageRedesign: "Propor redesign da página",
  previewRevision: "Pré-visualizar revisão",
  submitRevision: "Enviar revisão",
  publishApprovedRevision: "Publicar revisão aprovada",
};

const RISK_LABELS: Record<AiOperationRisk, string> = {
  low: "Baixo", medium: "Médio", high: "Alto", critical: "Crítico",
};

export function parseProposal(value: unknown): Proposal | null {
  if (!value || typeof value !== "object") return null;
  const proposal = value as Partial<Proposal>;
  if (typeof proposal.operation !== "string" || !(proposal.operation in AI_OPERATION_POLICIES)) return null;
  if (typeof proposal.summary !== "string" || !Array.isArray(proposal.protectedFields) || !proposal.protectedFields.every((field) => typeof field === "string")) return null;
  if (!proposal.arguments || typeof proposal.arguments !== "object" || Array.isArray(proposal.arguments)) return null;
  if (typeof proposal.confirmationRequired !== "boolean" || proposal.executable !== false) return null;
  return proposal as Proposal;
}

export function AiCopilot({ client, tenantId, pageId, enabled }: AiCopilotProps) {
  const [prompt, setPrompt] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  if (!enabled) {
    return <aside className="ai-copilot" aria-label="AI Tenant Studio">
      <p className="eyebrow">AI TENANT STUDIO</p><h3>Recurso não habilitado</h3>
      <p>O entitlement de chat IA não está ativo para este tenant. Nenhuma ação ou conteúdo foi alterado.</p>
      <span className="ai-state-pill muted">Indisponível neste plano</span>
    </aside>;
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim() || busy) return;
    setBusy(true); setHasFailed(false); setMessage(null); setProposal(null);
    try {
      const { data, error } = await client.functions.invoke("tenant-ai-gateway", {
        body: { tenantId, pageId: pageId || null, prompt: prompt.trim() },
      });
      if (error) throw error;
      const parsed = parseProposal(data?.proposal);
      if (!parsed) throw new Error(data?.error ?? "A resposta não corresponde ao contrato de proposta não executável.");
      setProposal(parsed);
    } catch (error) {
      setHasFailed(true);
      setMessage(error instanceof Error ? error.message : "Copiloto indisponível.");
    } finally { setBusy(false); }
  };

  const policy = proposal ? AI_OPERATION_POLICIES[proposal.operation] : null;
  return <aside className="ai-copilot" aria-label="AI Tenant Studio" aria-busy={busy}>
    <header className="ai-studio-header">
      <p className="eyebrow">AI TENANT STUDIO</p>
      <h3>Proponha uma mudança</h3>
      <p>Propostas são revisáveis e não executáveis. A IA não concede permissões nem publica conteúdo.</p>
    </header>
    <div className="ai-state-rail" role="status" aria-live="polite">
      <span className={!proposal && !busy && !hasFailed ? "current" : ""}>1 · Pedido</span>
      <span className={busy ? "current" : ""}>2 · Análise</span>
      <span className={proposal ? "current" : ""}>3 · Proposta</span>
    </div>
    <form onSubmit={(event) => void submit(event)}>
      <label htmlFor="tenant-ai-request">Instruções para a proposta<textarea id="tenant-ai-request" value={prompt} maxLength={4000} rows={4} placeholder="Ex.: Sugira uma hero mais clara. Preserve logo, identidade e conteúdo de produtos." onChange={(event) => setPrompt(event.target.value)} /></label>
      <div className="ai-form-footer"><span>{prompt.length}/4000</span><button type="submit" disabled={busy || !prompt.trim()}>{busy ? "Analisando proposta…" : hasFailed ? "Tentar novamente" : "Gerar proposta"}</button></div>
    </form>
    {busy ? <p className="ai-inline-state" role="status">A solicitação está sendo analisada. Nenhuma operação está sendo executada.</p> : null}
    {message ? <div className="ai-error" role="alert"><strong>Não foi possível gerar a proposta</strong><p>{message}</p><span>Estado: falha recuperável · revise o pedido ou tente novamente.</span></div> : null}
    {proposal && policy ? <section className="ai-proposal" aria-label="Proposta da IA">
      <div className="proposal-title-row"><div><p className="eyebrow">PROPOSTA · AINDA NÃO APLICADA</p><h4>{OPERATION_LABELS[proposal.operation]}</h4></div><span className={`risk-pill risk-${policy.risk}`}>Risco {RISK_LABELS[policy.risk]}</span></div>
      <p className="proposal-summary">{proposal.summary}</p>
      <dl className="proposal-facts">
        <div><dt>Capacidade</dt><dd><code>{policy.capability}</code></dd></div>
        <div><dt>Permissão exigida</dt><dd><code>{policy.permission}</code></dd></div>
        <div><dt>Confirmação explícita</dt><dd>{proposal.confirmationRequired ? "Obrigatória antes de qualquer ação" : "Não indicada para esta proposta"}</dd></div>
      </dl>
      <div className="proposal-detail-grid">
        <section><h5>Campos protegidos</h5>{proposal.protectedFields.length ? <ul>{proposal.protectedFields.map((field, index) => <li key={`${field}-${index}`}>{field}</li>)}</ul> : <p>Nenhum campo protegido foi informado pelo contrato.</p>}</section>
        <section><h5>Argumentos propostos</h5><pre>{JSON.stringify(proposal.arguments, null, 2)}</pre></section>
      </div>
      <div className="ai-nonexecution-note"><strong>Sem execução disponível</strong><p>Este endpoint retorna apenas uma proposta (<code>executable: false</code>). Revisão, aprovação, publicação e rollback permanecem no fluxo do Builder.</p></div>
    </section> : null}
  </aside>;
}
