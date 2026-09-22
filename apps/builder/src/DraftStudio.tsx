import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  addDraftTextSection,
  createTenantDraftPage,
  fetchPrivateDraftPage,
  fetchTenantDraftPages,
  updateTenantDraftPage,
  type DraftPageBundle,
  type PageRow,
} from "tupiniquim-database";

interface DraftStudioProps {
  client: SupabaseClient;
  tenantId: string;
  userId: string;
}

export function DraftStudio({ client, tenantId, userId }: DraftStudioProps) {
  const [drafts, setDrafts] = useState<PageRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [preview, setPreview] = useState<DraftPageBundle | null>(null);
  const [form, setForm] = useState({ slug: "", title: "" });
  const [sectionText, setSectionText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reloadDrafts = useCallback(async () => {
    const next = await fetchTenantDraftPages(client, tenantId);
    setDrafts(next);
    setSelectedId((current) => current || next[0]?.id || "");
  }, [client, tenantId]);

  const loadPreview = useCallback(async (pageId: string) => {
    if (!pageId) {
      setPreview(null);
      return;
    }
    setPreview(await fetchPrivateDraftPage(client, tenantId, pageId));
  }, [client, tenantId]);

  useEffect(() => {
    setPreview(null);
    setSelectedId("");
    void reloadDrafts().catch((error) => setMessage(error instanceof Error ? error.message : "Draft load failed"));
  }, [reloadDrafts]);

  useEffect(() => {
    void loadPreview(selectedId).catch((error) => setMessage(error instanceof Error ? error.message : "Preview load failed"));
  }, [loadPreview, selectedId]);

  const run = async (operation: () => Promise<void>) => {
    setBusy(true);
    setMessage(null);
    try {
      await operation();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Draft operation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="studio-card" aria-labelledby="draft-studio-title">
      <div className="card-heading studio-heading">
        <div>
          <p className="eyebrow">PRIVATE PREVIEW</p>
          <h2 id="draft-studio-title">Draft Studio</h2>
        </div>
        <span>RLS + cms.write</span>
      </div>

      <div className="studio-grid">
        <div className="studio-controls">
          <label>
            Draft existente
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              <option value="">Selecione um draft</option>
              {drafts.map((draft) => <option key={draft.id} value={draft.id}>{draft.title} · /{draft.slug}</option>)}
            </select>
          </label>

          <form
            className="draft-form"
            onSubmit={(event) => {
              event.preventDefault();
              void run(async () => {
                const created = await createTenantDraftPage(client, {
                  tenantId,
                  userId,
                  slug: form.slug,
                  title: form.title,
                });
                setForm({ slug: "", title: "" });
                await reloadDrafts();
                setSelectedId(created.id);
                await loadPreview(created.id);
                setMessage("Draft criado com sucesso.");
              });
            }}
          >
            <h3>Novo draft</h3>
            <label>Slug<input value={form.slug} placeholder="nova-pagina" onChange={(event) => setForm({ ...form, slug: event.target.value })} required /></label>
            <label>Título<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
            <button type="submit" disabled={busy}>Criar draft</button>
          </form>

          {preview ? (
            <form
              className="draft-form"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const title = String(formData.get("title") ?? "");
                void run(async () => {
                  await updateTenantDraftPage(client, {
                    tenantId,
                    pageId: preview.page.id,
                    userId,
                    title,
                    seo: preview.page.seo,
                  });
                  await reloadDrafts();
                  await loadPreview(preview.page.id);
                  setMessage("Draft salvo.");
                });
              }}
            >
              <h3>Editar metadados</h3>
              <label>Título<input name="title" defaultValue={preview.page.title} required /></label>
              <button type="submit" disabled={busy}>Salvar draft</button>
            </form>
          ) : null}

          {preview ? (
            <form
              className="draft-form"
              onSubmit={(event) => {
                event.preventDefault();
                void run(async () => {
                  await addDraftTextSection(client, { tenantId, pageId: preview.page.id, text: sectionText });
                  setSectionText("");
                  await loadPreview(preview.page.id);
                  setMessage("Seção adicionada ao draft.");
                });
              }}
            >
              <h3>Nova seção de texto</h3>
              <label>Texto<textarea value={sectionText} onChange={(event) => setSectionText(event.target.value)} required /></label>
              <button type="submit" disabled={busy}>Adicionar seção</button>
            </form>
          ) : null}

          <p className="guardrail compact">Criação e edição dependem da policy `cms.write`. Falhas de RLS são exibidas; nunca são contornadas no cliente.</p>
          {message ? <p className="status-message" role="status">{message}</p> : null}
        </div>

        <PrivatePreview bundle={preview} />
      </div>
    </section>
  );
}

function PrivatePreview({ bundle }: { bundle: DraftPageBundle | null }) {
  if (!bundle) {
    return <article className="preview-surface"><p className="eyebrow">PREVIEW</p><h3>Nenhum draft selecionado</h3><p>O preview de drafts exige sessão autenticada e membership no tenant.</p></article>;
  }

  return (
    <article className="preview-surface" aria-label={`Preview privado de ${bundle.page.title}`}>
      <p className="eyebrow">DRAFT · /{bundle.page.slug}</p>
      <h3>{bundle.page.title}</h3>
      {bundle.sections.length === 0 ? <p>Este draft ainda não possui seções.</p> : null}
      {bundle.sections.filter((section) => section.is_enabled).map((section) => (
        <section className="preview-section" key={section.id}>
          <strong>{section.section_type}</strong>
          {typeof section.content.text === "string" ? <p>{section.content.text}</p> : <pre>{JSON.stringify(section.content, null, 2)}</pre>}
        </section>
      ))}
      <p className="preview-private">Privado · não usa `dangerouslySetInnerHTML` · conteúdo draft não é rota pública.</p>
    </article>
  );
}
