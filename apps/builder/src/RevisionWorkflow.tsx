import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canTransitionBuilderRevision, type BuilderRevisionStatus } from "tupiniquim-saas-core";
import {
  assertPageRevisionSnapshot,
  buildPageRevisionSnapshot,
  createPageRevision,
  fetchPageRevisions,
  normalizeDraftSlug,
  restorePageRevisionAsDraft,
  transitionPageRevision,
  updateDraftPageRevision,
  type PageBundle,
  type PageRevisionRow,
  type PageRevisionSnapshot,
  type PageRevisionStatus,
} from "tupiniquim-database";

interface RevisionWorkflowProps {
  client: SupabaseClient;
  tenantId: string;
  bundle: PageBundle;
  onLiveChanged(pageId: string): Promise<void>;
}

const STATUS_LABEL: Record<PageRevisionStatus, string> = {
  draft: "Draft",
  in_review: "Em revisão",
  approved: "Aprovada",
  published: "Publicada",
  rolled_back: "Histórica",
};

export function RevisionWorkflow({ client, tenantId, bundle, onLiveChanged }: RevisionWorkflowProps) {
  const [revisions, setRevisions] = useState<PageRevisionRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const next = await fetchPageRevisions(client, tenantId, bundle.page.id);
    setRevisions(next);
    setSelectedId((current) => next.some((revision) => revision.id === current) ? current : next[0]?.id ?? "");
  }, [bundle.page.id, client, tenantId]);

  useEffect(() => {
    setSelectedId("");
    void reload().catch((error) => setMessage(error instanceof Error ? error.message : "Revision load failed"));
  }, [reload]);

  const selected = useMemo(
    () => revisions.find((revision) => revision.id === selectedId) ?? null,
    [revisions, selectedId],
  );

  const run = async (operation: () => Promise<void>) => {
    setBusy(true);
    setMessage(null);
    try {
      await operation();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Revision operation failed");
    } finally {
      setBusy(false);
    }
  };

  const move = (to: PageRevisionStatus) => {
    if (!selected) return;
    void run(async () => {
      if (!canTransitionBuilderRevision(selected.status as BuilderRevisionStatus, to as BuilderRevisionStatus)) {
        throw new Error(`Transição inválida: ${selected.status} → ${to}`);
      }
      const updated = await transitionPageRevision(client, {
        tenantId,
        pageId: bundle.page.id,
        revisionId: selected.id,
        from: selected.status,
        to,
      });
      await reload();
      setSelectedId(updated.id);
      if (to === "published") await onLiveChanged(bundle.page.id);
      setMessage(`Revisão v${updated.revision}: ${STATUS_LABEL[updated.status]}.`);
    });
  };

  return (
    <section className="revision-workflow" aria-labelledby="revision-workflow-title">
      <div className="revision-header">
        <div>
          <p className="eyebrow">VERSIONED WORKFLOW</p>
          <h3 id="revision-workflow-title">Revisões, aprovação e rollback</h3>
        </div>
        <span>cms.write + RLS</span>
      </div>

      <div className="revision-toolbar">
        <label>
          Revisão
          <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
            <option value="">Nenhuma revisão</option>
            {revisions.map((revision) => (
              <option key={revision.id} value={revision.id}>
                v{revision.revision} · {STATUS_LABEL[revision.status]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={busy || revisions.some((revision) => ["draft", "in_review", "approved"].includes(revision.status))}
          onClick={() => void run(async () => {
            const source = revisions.find((revision) => revision.status === "published") ?? null;
            const created = await createPageRevision(client, {
              tenantId,
              pageId: bundle.page.id,
              snapshot: buildPageRevisionSnapshot(bundle),
              sourceRevisionId: source?.id ?? null,
            });
            await reload();
            setSelectedId(created.id);
            setMessage(`Revisão v${created.revision} criada como draft.`);
          })}
        >
          Criar nova revisão
        </button>
      </div>

      {selected ? (
        <>
          <RevisionStatus revision={selected} />
          {selected.status === "draft" ? (
            <DraftRevisionEditor
              key={`${selected.id}:${selected.updated_at}`}
              revision={selected}
              busy={busy}
              onSave={(snapshot) => void run(async () => {
                const updated = await updateDraftPageRevision(client, {
                  tenantId,
                  pageId: bundle.page.id,
                  revisionId: selected.id,
                  snapshot,
                });
                await reload();
                setSelectedId(updated.id);
                setMessage(`Draft v${updated.revision} salvo.`);
              })}
            />
          ) : null}

          <div className="revision-actions">
            {selected.status === "draft" ? <button type="button" disabled={busy} onClick={() => move("in_review")}>Enviar para revisão</button> : null}
            {selected.status === "in_review" ? <button className="secondary" type="button" disabled={busy} onClick={() => move("draft")}>Retornar ao draft</button> : null}
            {selected.status === "in_review" ? <button type="button" disabled={busy} onClick={() => move("approved")}>Aprovar</button> : null}
            {selected.status === "approved" ? <button className="secondary" type="button" disabled={busy} onClick={() => move("draft")}>Reabrir draft</button> : null}
            {selected.status === "approved" ? <button type="button" disabled={busy} onClick={() => move("published")}>Publicar revisão</button> : null}
            {selected.status === "published" || selected.status === "rolled_back" ? (
              <button
                className="secondary"
                type="button"
                disabled={busy || revisions.some((revision) => ["draft", "in_review", "approved"].includes(revision.status))}
                onClick={() => void run(async () => {
                  const restored = await restorePageRevisionAsDraft(client, {
                    tenantId,
                    pageId: bundle.page.id,
                    source: selected,
                  });
                  await reload();
                  setSelectedId(restored.id);
                  setMessage(`Rollback preparado como novo draft v${restored.revision}.`);
                })}
              >
                Restaurar como novo draft
              </button>
            ) : null}
          </div>

          <RevisionPreview revision={selected} />
        </>
      ) : (
        <p className="guardrail compact">Crie a primeira revisão para congelar um snapshot antes de review/approval/publicação.</p>
      )}
      {message ? <p className="status-message" role="status">{message}</p> : null}
    </section>
  );
}

function RevisionStatus({ revision }: { revision: PageRevisionRow }) {
  return (
    <div className="revision-status">
      <strong>v{revision.revision} · {STATUS_LABEL[revision.status]}</strong>
      <span>criada {new Date(revision.created_at).toLocaleString()}</span>
      {revision.source_revision_id ? <span>rollback/source: {revision.source_revision_id.slice(0, 8)}</span> : null}
    </div>
  );
}

function DraftRevisionEditor({ revision, busy, onSave }: {
  revision: PageRevisionRow;
  busy: boolean;
  onSave(snapshot: PageRevisionSnapshot): void;
}) {
  return (
    <form
      className="draft-form"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const title = String(formData.get("title") ?? "").trim();
        const slug = normalizeDraftSlug(String(formData.get("slug") ?? ""));
        const newText = String(formData.get("newText") ?? "").trim();
        const sections = revision.snapshot.sections.map((section) => ({ ...section, content: { ...section.content } }));
        if (newText) {
          const position = sections.reduce((max, section) => Math.max(max, section.position), -1) + 1;
          sections.push({ section_type: "richText", position, is_enabled: true, content: { text: newText } });
        }
        onSave(assertPageRevisionSnapshot({
          page: { ...revision.snapshot.page, slug, title },
          sections,
        }));
      }}
    >
      <h3>Editar snapshot draft</h3>
      <label>Slug<input name="slug" defaultValue={revision.snapshot.page.slug} required /></label>
      <label>Título<input name="title" defaultValue={revision.snapshot.page.title} required /></label>
      <label>Adicionar texto opcional<textarea name="newText" placeholder="Nova seção de texto nesta revisão" /></label>
      <button type="submit" disabled={busy}>Salvar snapshot</button>
    </form>
  );
}

function RevisionPreview({ revision }: { revision: PageRevisionRow }) {
  return (
    <article className="preview-surface revision-preview" aria-label={`Preview da revisão ${revision.revision}`}>
      <p className="eyebrow">REVISION v{revision.revision} · {STATUS_LABEL[revision.status].toUpperCase()}</p>
      <h3>{revision.snapshot.page.title}</h3>
      <p>/{revision.snapshot.page.slug}</p>
      {revision.snapshot.sections.length === 0 ? <p>Snapshot sem seções.</p> : null}
      {revision.snapshot.sections.filter((section) => section.is_enabled).map((section) => (
        <section className="preview-section" key={`${section.position}:${section.section_type}`}>
          <strong>{section.section_type}</strong>
          {typeof section.content.text === "string" ? <p>{section.content.text}</p> : <pre>{JSON.stringify(section.content, null, 2)}</pre>}
        </section>
      ))}
      <p className="preview-private">Snapshot versionado · publicação só ocorre após draft → revisão → aprovação.</p>
    </article>
  );
}
