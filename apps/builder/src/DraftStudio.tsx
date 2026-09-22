import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createTenantDraftPage,
  fetchTenantBuilderPages,
  fetchTenantPageBundle,
  type PageBundle,
  type PageRow,
} from "tupiniquim-database";
import { RevisionWorkflow } from "./RevisionWorkflow";

interface DraftStudioProps {
  client: SupabaseClient;
  tenantId: string;
  userId: string;
}

export function DraftStudio({ client, tenantId, userId }: DraftStudioProps) {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [preview, setPreview] = useState<PageBundle | null>(null);
  const [form, setForm] = useState({ slug: "", title: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reloadPages = useCallback(async () => {
    const next = await fetchTenantBuilderPages(client, tenantId);
    setPages(next);
    setSelectedId((current) => current || next[0]?.id || "");
  }, [client, tenantId]);

  const loadPreview = useCallback(async (pageId: string) => {
    if (!pageId) {
      setPreview(null);
      return;
    }
    setPreview(await fetchTenantPageBundle(client, tenantId, pageId));
  }, [client, tenantId]);

  const refreshLive = useCallback(async (pageId: string) => {
    await reloadPages();
    setSelectedId(pageId);
    await loadPreview(pageId);
  }, [loadPreview, reloadPages]);

  useEffect(() => {
    setPreview(null);
    setSelectedId("");
    void reloadPages().catch((error) => setMessage(error instanceof Error ? error.message : "Builder page load failed"));
  }, [reloadPages]);

  useEffect(() => {
    void loadPreview(selectedId).catch((error) => setMessage(error instanceof Error ? error.message : "Preview load failed"));
  }, [loadPreview, selectedId]);

  const run = async (operation: () => Promise<void>) => {
    setBusy(true);
    setMessage(null);
    try {
      await operation();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Builder operation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="studio-card" aria-labelledby="draft-studio-title">
      <div className="card-heading studio-heading">
        <div>
          <p className="eyebrow">PRIVATE BUILDER</p>
          <h2 id="draft-studio-title">Draft Studio + Workflow</h2>
        </div>
        <span>RLS + cms.write</span>
      </div>

      <div className="studio-grid">
        <div className="studio-controls">
          <label>
            Página
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
              <option value="">Selecione uma página</option>
              {pages.map((page) => <option key={page.id} value={page.id}>{page.title} · /{page.slug} · {page.status}</option>)}
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
                await refreshLive(created.id);
                setMessage("Página draft criada. Crie uma revisão antes de editar/publicar.");
              });
            }}
          >
            <h3>Nova página</h3>
            <label>Slug<input value={form.slug} placeholder="nova-pagina" onChange={(event) => setForm({ ...form, slug: event.target.value })} required /></label>
            <label>Título<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
            <button type="submit" disabled={busy}>Criar página draft</button>
          </form>

          <p className="guardrail compact">Edição versionada ocorre no snapshot abaixo. `pages/page_sections` só recebem o snapshot quando uma revisão aprovada é publicada.</p>
          {message ? <p className="status-message" role="status">{message}</p> : null}
        </div>

        <LivePreview bundle={preview} />
      </div>

      {preview ? (
        <RevisionWorkflow
          client={client}
          tenantId={tenantId}
          bundle={preview}
          onLiveChanged={refreshLive}
        />
      ) : null}
    </section>
  );
}

function LivePreview({ bundle }: { bundle: PageBundle | null }) {
  if (!bundle) {
    return <article className="preview-surface"><p className="eyebrow">LIVE STATE</p><h3>Nenhuma página selecionada</h3><p>Selecione uma página acessível ao tenant.</p></article>;
  }

  return (
    <article className="preview-surface" aria-label={`Estado atual de ${bundle.page.title}`}>
      <p className="eyebrow">LIVE · {bundle.page.status.toUpperCase()} · /{bundle.page.slug}</p>
      <h3>{bundle.page.title}</h3>
      {bundle.sections.length === 0 ? <p>Esta página ainda não possui seções projetadas.</p> : null}
      {bundle.sections.filter((section) => section.is_enabled).map((section) => (
        <section className="preview-section" key={section.id}>
          <strong>{section.section_type}</strong>
          {typeof section.content.text === "string" ? <p>{section.content.text}</p> : <pre>{JSON.stringify(section.content, null, 2)}</pre>}
        </section>
      ))}
      <p className="preview-private">Estado canônico atual · drafts permanecem privados por RLS · publicados seguem a rota pública existente.</p>
    </article>
  );
}
