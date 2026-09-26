import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

interface AiCopilotProps {
  client: SupabaseClient;
  tenantId: string;
  pageId?: string;
  enabled: boolean;
}

export function AiCopilot({ client, tenantId, pageId, enabled }: AiCopilotProps) {
  const [prompt, setPrompt] = useState("");
  const [proposal, setProposal] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!enabled) {
    return <aside className="ai-copilot" aria-label="Copiloto IA"><p className="eyebrow">AI COPILOT</p><h3>Recurso do plano</h3><p>O chat de edição por IA não está habilitado neste plano.</p></aside>;
  }

  return <aside className="ai-copilot" aria-label="Copiloto IA">
    <p className="eyebrow">AI COPILOT · PROPOSAL ONLY</p>
    <h3>O que você quer mudar?</h3>
    <p>Descreva a alteração. A IA cria uma proposta; autorização, confirmação e publicação continuam separadas.</p>
    <form onSubmit={async (event) => {
      event.preventDefault();
      if (!prompt.trim()) return;
      setBusy(true); setMessage(null); setProposal(null);
      try {
        const { data, error } = await client.functions.invoke("tenant-ai-gateway", {
          body: { tenantId, pageId: pageId || null, prompt: prompt.trim() },
        });
        if (error) throw error;
        if (!data?.proposal) throw new Error(data?.error ?? "A IA não retornou uma proposta válida.");
        setProposal(data.proposal as Record<string, unknown>);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Copiloto indisponível.");
      } finally { setBusy(false); }
    }}>
      <label>Pedido<textarea value={prompt} maxLength={4000} rows={5} placeholder="Ex.: Deixe a home mais sofisticada. Não altere o logo nem os produtos." onChange={(event) => setPrompt(event.target.value)} /></label>
      <button type="submit" disabled={busy || !prompt.trim()}>{busy ? "Analisando…" : "Gerar proposta"}</button>
    </form>
    {message ? <p className="status-message" role="status">{message}</p> : null}
    {proposal ? <section className="ai-proposal" aria-label="Proposta da IA"><h4>Proposta estruturada</h4><pre>{JSON.stringify(proposal, null, 2)}</pre><p className="guardrail compact">Ainda não executada. Alterações mutáveis passam pelos gates de RBAC, entitlement, confirmação, revisão e RLS.</p></section> : null}
  </aside>;
}
