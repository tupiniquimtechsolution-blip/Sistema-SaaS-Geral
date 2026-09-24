import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canTransitionBuilderRevision, type BuilderRevisionStatus } from "tupiniquim-saas-core";
import {
  appendPageRevisionSection,
  assertPageRevisionSnapshot,
  buildPageRevisionSnapshot,
  clonePageRevisionSnapshot,
  createPageRevision,
  fetchPageRevisions,
  movePageRevisionSection,
  normalizeDraftSlug,
  restorePageRevisionAsDraft,
  setPageRevisionSectionEnabled,
  transitionPageRevision,
  updateDraftPageRevision,
  updatePageRevisionSectionContentValue,
  type PageBundle,
  type PageRevisionRow,
  type PageRevisionSnapshot,
  type PageRevisionSnapshotSection,
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

const PIPELINE: Array<{ status: Exclude<PageRevisionStatus, "rolled_back">; label: string }> = [
  { status: "draft", label: "Editar" },
  { status: "in_review", label: "Revisar" },
  { status: "approved", label: "Aprovar" },
  { status: "published", label: "Publicar" },
];

export function RevisionWorkflow({ client, tenantId, bundle, onLiveChanged }: RevisionWorkflowProps) {
  const [revisions, setRevisions] = useState<PageRevisionRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draftDirty, setDraftDirty] = useState(false);

  const reload = useCallback(async () => {
    const next = await fetchPageRevisions(client, tenantId, bundle.page.id);
    setRevisions(next);
    setSelectedId((current) => next.some((revision) => revision.id === current) ? current : next[0]?.id ?? "");
  }, [bundle.page.id, client, tenantId]);

  useEffect(() => {
    setSelectedId("");
    setDraftDirty(false);
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
      if (draftDirty) throw new Error("Salve as alterações do draft antes de mudar o status.");
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
      setDraftDirty(false);
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
          <p className="revision-subtitle">Edite o snapshot privado. O site publicado só muda depois de revisão e aprovação.</p>
        </div>
        <span>cms.write + RLS</span>
      </div>

      <div className="revision-toolbar">
        <label>
          Revisão
          <select
            value={selectedId}
            disabled={draftDirty}
            onChange={(event) => {
              setSelectedId(event.target.value);
              setDraftDirty(false);
              setMessage(null);
            }}
          >
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
          disabled={busy || draftDirty || revisions.some((revision) => ["draft", "in_review", "approved"].includes(revision.status))}
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
            setDraftDirty(false);
            setMessage(`Revisão v${created.revision} criada como draft.`);
          })}
        >
          Criar nova revisão
        </button>
      </div>

      {selected ? (
        <>
          <RevisionPipeline status={selected.status} />
          <RevisionStatus revision={selected} dirty={draftDirty} />
          {selected.status === "draft" ? (
            <DraftRevisionEditor
              key={`${selected.id}:${selected.updated_at}`}
              revision={selected}
              busy={busy}
              onDirtyChange={setDraftDirty}
              onSave={(snapshot) => void run(async () => {
                const updated = await updateDraftPageRevision(client, {
                  tenantId,
                  pageId: bundle.page.id,
                  revisionId: selected.id,
                  snapshot,
                });
                await reload();
                setSelectedId(updated.id);
                setDraftDirty(false);
                setMessage(`Draft v${updated.revision} salvo sem alterar a versão publicada.`);
              })}
            />
          ) : null}

          <div className="revision-actions">
            {selected.status === "draft" ? <button type="button" disabled={busy || draftDirty} onClick={() => move("in_review")}>Enviar para revisão</button> : null}
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
                  setDraftDirty(false);
                  setMessage(`Rollback preparado como novo draft v${restored.revision}.`);
                })}
              >
                Restaurar como novo draft
              </button>
            ) : null}
          </div>

          {selected.status !== "draft" ? <RevisionPreview revision={selected.revision} status={selected.status} snapshot={selected.snapshot} /> : null}
        </>
      ) : (
        <p className="guardrail compact">Crie a primeira revisão para congelar um snapshot antes de review/approval/publicação.</p>
      )}
      {message ? <p className="status-message" role="status">{message}</p> : null}
    </section>
  );
}

function RevisionPipeline({ status }: { status: PageRevisionStatus }) {
  const currentIndex = PIPELINE.findIndex((step) => step.status === status);
  return (
    <ol className="revision-pipeline" aria-label="Fluxo de publicação">
      {PIPELINE.map((step, index) => {
        const state = status === "rolled_back" ? "historical" : index < currentIndex ? "complete" : index === currentIndex ? "current" : "pending";
        return (
          <li key={step.status} className={`pipeline-step ${state}`} aria-current={state === "current" ? "step" : undefined}>
            <span>{index + 1}</span>
            <strong>{step.label}</strong>
          </li>
        );
      })}
    </ol>
  );
}

function RevisionStatus({ revision, dirty }: { revision: PageRevisionRow; dirty: boolean }) {
  return (
    <div className="revision-status">
      <strong>v{revision.revision} · {STATUS_LABEL[revision.status]}</strong>
      {dirty ? <span className="dirty-badge">Alterações não salvas</span> : <span>Snapshot sincronizado</span>}
      <span>criada {new Date(revision.created_at).toLocaleString()}</span>
      {revision.source_revision_id ? <span>rollback/source: {revision.source_revision_id.slice(0, 8)}</span> : null}
    </div>
  );
}

function DraftRevisionEditor({ revision, busy, onSave, onDirtyChange }: {
  revision: PageRevisionRow;
  busy: boolean;
  onSave(snapshot: PageRevisionSnapshot): void;
  onDirtyChange(dirty: boolean): void;
}) {
  const [title, setTitle] = useState(revision.snapshot.page.title);
  const [slug, setSlug] = useState(revision.snapshot.page.slug);
  const [sectionSnapshot, setSectionSnapshot] = useState(() => clonePageRevisionSnapshot(revision.snapshot));
  const [editorError, setEditorError] = useState<string | null>(null);

  const workingSnapshot: PageRevisionSnapshot = {
    page: {
      ...sectionSnapshot.page,
      title,
      slug,
      seo: { ...sectionSnapshot.page.seo },
    },
    sections: sectionSnapshot.sections,
  };
  const dirty = JSON.stringify(workingSnapshot) !== JSON.stringify(revision.snapshot);

  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);

  const mutateSections = (operation: (snapshot: PageRevisionSnapshot) => PageRevisionSnapshot) => {
    try {
      setSectionSnapshot((current) => operation(current));
      setEditorError(null);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : "Não foi possível atualizar a seção.");
    }
  };

  return (
    <div className="revision-editor-grid">
      <div className="revision-editor-controls">
        <form
          className="draft-form"
          onSubmit={(event) => {
            event.preventDefault();
            try {
              const snapshot = assertPageRevisionSnapshot({
                page: {
                  ...sectionSnapshot.page,
                  slug: normalizeDraftSlug(slug),
                  title: title.trim(),
                },
                sections: sectionSnapshot.sections,
              });
              setEditorError(null);
              onSave(snapshot);
            } catch (error) {
              setEditorError(error instanceof Error ? error.message : "Snapshot inválido.");
            }
          }}
        >
          <div className="editor-heading-row">
            <div>
              <h3>Editar snapshot draft</h3>
              <p>Estas alterações ficam privadas até a publicação aprovada.</p>
            </div>
            {dirty ? <span className="dirty-badge">Não salvo</span> : <span className="saved-badge">Salvo</span>}
          </div>
          <label>Slug<input value={slug} onChange={(event) => setSlug(event.target.value)} required /></label>
          <label>Título<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>

          <div className="section-editor-list">
            <div className="section-list-heading">
              <div>
                <strong>Seções</strong>
                <span>{sectionSnapshot.sections.length} no snapshot</span>
              </div>
              <button
                className="secondary compact-button"
                type="button"
                onClick={() => mutateSections((current) => appendPageRevisionSection(current))}
              >
                + Adicionar texto
              </button>
            </div>

            {sectionSnapshot.sections.length === 0 ? <p className="empty-editor">Nenhuma seção. Adicione uma seção de texto para começar.</p> : null}
            {sectionSnapshot.sections.map((section) => (
              <SectionEditor
                key={`${section.position}:${section.section_type}`}
                section={section}
                total={sectionSnapshot.sections.length}
                onMove={(direction) => mutateSections((current) => movePageRevisionSection(current, section.position, direction))}
                onEnabled={(enabled) => mutateSections((current) => setPageRevisionSectionEnabled(current, section.position, enabled))}
                onContent={(key, value) => mutateSections((current) => updatePageRevisionSectionContentValue(current, section.position, key, value))}
                onError={setEditorError}
              />
            ))}
          </div>

          {editorError ? <p className="error-text" role="alert">{editorError}</p> : null}
          <div className="save-row">
            <button type="submit" disabled={busy || !dirty}>Salvar snapshot</button>
            <span>{dirty ? "Salve antes de enviar para revisão." : "Pronto para revisão quando o conteúdo estiver correto."}</span>
          </div>
        </form>
      </div>

      <div className="live-preview-column">
        <div className="live-preview-heading">
          <div>
            <p className="eyebrow">LIVE DRAFT PREVIEW</p>
            <strong>Preview em tempo real</strong>
          </div>
          <span>não publicado</span>
        </div>
        <RevisionPreview revision={revision.revision} status="draft" snapshot={workingSnapshot} live />
      </div>
    </div>
  );
}

function SectionEditor({ section, total, onMove, onEnabled, onContent, onError }: {
  section: PageRevisionSnapshotSection;
  total: number;
  onMove(direction: "up" | "down"): void;
  onEnabled(enabled: boolean): void;
  onContent(key: string, value: unknown): void;
  onError(message: string | null): void;
}) {
  const fields = Object.entries(section.content);
  return (
    <fieldset className={`section-editor ${section.is_enabled ? "" : "section-disabled"}`}>
      <legend>#{section.position + 1} · {section.section_type}</legend>
      <div className="section-editor-toolbar">
        <label className="toggle-label">
          <input type="checkbox" checked={section.is_enabled} onChange={(event) => onEnabled(event.target.checked)} />
          {section.is_enabled ? "Visível" : "Oculta"}
        </label>
        <div className="move-buttons" aria-label={`Ordenar seção ${section.position + 1}`}>
          <button className="secondary compact-button" type="button" disabled={section.position === 0} onClick={() => onMove("up")} aria-label="Mover seção para cima">↑</button>
          <button className="secondary compact-button" type="button" disabled={section.position === total - 1} onClick={() => onMove("down")} aria-label="Mover seção para baixo">↓</button>
        </div>
      </div>
      {fields.length === 0 ? <p className="empty-editor">Esta seção não possui campos editáveis.</p> : null}
      {fields.map(([key, value]) => (
        <ContentField key={key} fieldKey={key} value={value} onChange={(next) => onContent(key, next)} onError={onError} />
      ))}
    </fieldset>
  );
}

function ContentField({ fieldKey, value, onChange, onError }: {
  fieldKey: string;
  value: unknown;
  onChange(value: unknown): void;
  onError(message: string | null): void;
}) {
  const label = fieldKey.replaceAll("_", " ");
  if (typeof value === "boolean") {
    return (
      <label className="toggle-label content-toggle">
        <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
        {label}
      </label>
    );
  }
  if (typeof value === "number") {
    return <label>{label}<input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
  }
  if (typeof value === "string") {
    const multiline = value.length > 80 || value.includes("\n") || ["text", "description", "body", "content"].includes(fieldKey.toLowerCase());
    return multiline
      ? <label>{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} /></label>
      : <label>{label}<input value={value} onChange={(event) => onChange(event.target.value)} /></label>;
  }
  return <StructuredContentField fieldKey={label} value={value} onChange={onChange} onError={onError} />;
}

function StructuredContentField({ fieldKey, value, onChange, onError }: {
  fieldKey: string;
  value: unknown;
  onChange(value: unknown): void;
  onError(message: string | null): void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  return (
    <label>
      {fieldKey}
      <textarea
        className="structured-field"
        value={text}
        onChange={(event) => {
          const nextText = event.target.value;
          setText(nextText);
          try {
            const parsed: unknown = JSON.parse(nextText);
            onChange(parsed);
            onError(null);
          } catch {
            onError(`O campo ${fieldKey} precisa conter JSON válido.`);
          }
        }}
      />
    </label>
  );
}

function RevisionPreview({ revision, status, snapshot, live = false }: {
  revision: number;
  status: PageRevisionStatus;
  snapshot: PageRevisionSnapshot;
  live?: boolean;
}) {
  const enabledSections = snapshot.sections.filter((section) => section.is_enabled);
  return (
    <article className="preview-surface revision-preview" aria-label={`Preview da revisão ${revision}`}>
      <p className="eyebrow">{live ? "LIVE " : ""}REVISION v{revision} · {STATUS_LABEL[status].toUpperCase()}</p>
      <h3>{snapshot.page.title || "Sem título"}</h3>
      <p>/{snapshot.page.slug || "sem-slug"}</p>
      {snapshot.sections.length === 0 ? <p>Snapshot sem seções.</p> : null}
      {snapshot.sections.length > 0 && enabledSections.length === 0 ? <p>Todas as seções estão ocultas neste snapshot.</p> : null}
      {enabledSections.map((section) => (
        <section className="preview-section" key={`${section.position}:${section.section_type}`}>
          <strong>{section.section_type}</strong>
          <PreviewContent content={section.content} />
        </section>
      ))}
      <p className="preview-private">Snapshot versionado · publicação só ocorre após draft → revisão → aprovação.</p>
    </article>
  );
}

function PreviewContent({ content }: { content: Record<string, unknown> }) {
  const entries = Object.entries(content);
  if (entries.length === 0) return <p>Sem conteúdo configurado.</p>;
  return (
    <div className="preview-content">
      {entries.map(([key, value]) => {
        if (typeof value === "string") return <p key={key}>{value}</p>;
        if (typeof value === "number" || typeof value === "boolean") return <p key={key}><strong>{key}:</strong> {String(value)}</p>;
        return <pre key={key}>{JSON.stringify(value, null, 2)}</pre>;
      })}
    </div>
  );
}
