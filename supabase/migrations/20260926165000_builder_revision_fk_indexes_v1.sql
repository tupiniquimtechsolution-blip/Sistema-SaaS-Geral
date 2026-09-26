-- Cover foreign keys used by Builder revision history/audit joins.
CREATE INDEX IF NOT EXISTS page_revisions_page_id_idx ON public.page_revisions(page_id);
CREATE INDEX IF NOT EXISTS page_revisions_source_revision_id_idx ON public.page_revisions(source_revision_id) WHERE source_revision_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS page_revisions_created_by_idx ON public.page_revisions(created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS page_revisions_updated_by_idx ON public.page_revisions(updated_by) WHERE updated_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS page_revisions_submitted_by_idx ON public.page_revisions(submitted_by) WHERE submitted_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS page_revisions_approved_by_idx ON public.page_revisions(approved_by) WHERE approved_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS page_revisions_published_by_idx ON public.page_revisions(published_by) WHERE published_by IS NOT NULL;
