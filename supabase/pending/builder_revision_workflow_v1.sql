-- builder_revision_workflow_v1.sql
-- Forward-only change designed from the canonical remote schema.
-- Stage this SQL, validate application gates, then apply through Supabase migrations.

create table if not exists public.page_revisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  page_id uuid not null references public.pages(id) on delete restrict,
  revision integer not null check (revision > 0),
  status text not null default 'draft'
    check (status in ('draft', 'in_review', 'approved', 'published', 'rolled_back')),
  snapshot jsonb not null,
  source_revision_id uuid references public.page_revisions(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid not null references auth.users(id) on delete restrict,
  submitted_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, page_id, revision)
);

create index if not exists page_revisions_tenant_page_idx
  on public.page_revisions (tenant_id, page_id, revision desc);

create unique index if not exists page_revisions_single_open_idx
  on public.page_revisions (tenant_id, page_id)
  where status in ('draft', 'in_review', 'approved');

create unique index if not exists page_revisions_single_published_idx
  on public.page_revisions (tenant_id, page_id)
  where status = 'published';

alter table public.page_revisions enable row level security;
alter table public.page_revisions force row level security;

revoke all on table public.page_revisions from public;
revoke all on table public.page_revisions from anon;
revoke all on table public.page_revisions from authenticated;
grant select, insert, update on table public.page_revisions to authenticated;
grant all on table public.page_revisions to service_role;

create policy page_revisions_member_read
  on public.page_revisions
  for select
  to authenticated
  using (public.is_tenant_member(tenant_id));

create policy page_revisions_manage_insert
  on public.page_revisions
  for insert
  to authenticated
  with check (public.has_tenant_permission(tenant_id, 'cms.write'));

create policy page_revisions_manage_update
  on public.page_revisions
  for update
  to authenticated
  using (public.has_tenant_permission(tenant_id, 'cms.write'))
  with check (public.has_tenant_permission(tenant_id, 'cms.write'));

create or replace function public.builder_page_revision_guard()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_page_tenant uuid;
  v_slug text;
  v_title text;
begin
  if v_user is null then
    raise exception 'authenticated session required';
  end if;

  select p.tenant_id
    into v_page_tenant
    from public.pages p
   where p.id = new.page_id
   for update;

  if v_page_tenant is null or v_page_tenant <> new.tenant_id then
    raise exception 'cross-tenant page revision denied';
  end if;

  if not public.has_tenant_permission(new.tenant_id, 'cms.write') then
    raise exception 'cms.write required';
  end if;

  if jsonb_typeof(new.snapshot) <> 'object'
     or jsonb_typeof(new.snapshot -> 'page') <> 'object'
     or jsonb_typeof(new.snapshot -> 'sections') <> 'array' then
    raise exception 'invalid builder revision snapshot';
  end if;

  v_slug := btrim(new.snapshot #>> '{page,slug}');
  v_title := btrim(new.snapshot #>> '{page,title}');

  if v_slug is null or v_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'revision snapshot requires canonical slug';
  end if;

  if v_title is null or v_title = '' then
    raise exception 'revision snapshot requires title';
  end if;

  if jsonb_typeof(new.snapshot #> '{page,seo}') <> 'object' then
    raise exception 'revision snapshot requires seo object';
  end if;

  if exists (
    select 1
      from jsonb_array_elements(new.snapshot -> 'sections') as section(value)
     where jsonb_typeof(section.value) <> 'object'
        or coalesce(btrim(section.value ->> 'section_type'), '') = ''
        or coalesce(section.value ->> 'position', '') !~ '^(0|[1-9][0-9]*)$'
        or jsonb_typeof(section.value -> 'is_enabled') <> 'boolean'
        or jsonb_typeof(section.value -> 'content') <> 'object'
  ) then
    raise exception 'invalid revision section snapshot';
  end if;

  if exists (
    select 1
      from jsonb_array_elements(new.snapshot -> 'sections') as section(value)
     group by (section.value ->> 'position')::integer
    having count(*) > 1
  ) then
    raise exception 'revision section positions must be unique';
  end if;

  if tg_op = 'INSERT' then
    if new.status is distinct from 'draft' then
      raise exception 'new page revisions must start as draft';
    end if;

    select coalesce(max(r.revision), 0) + 1
      into new.revision
      from public.page_revisions r
     where r.tenant_id = new.tenant_id
       and r.page_id = new.page_id;

    if new.source_revision_id is not null then
      perform 1
        from public.page_revisions source
       where source.id = new.source_revision_id
         and source.tenant_id = new.tenant_id
         and source.page_id = new.page_id
         and source.status in ('published', 'rolled_back');
      if not found then
        raise exception 'rollback source revision is invalid';
      end if;
    end if;

    new.status := 'draft';
    new.created_by := v_user;
    new.updated_by := v_user;
    new.created_at := now();
    new.updated_at := now();
    new.submitted_by := null;
    new.approved_by := null;
    new.published_by := null;
    new.published_at := null;
    return new;
  end if;

  if new.tenant_id <> old.tenant_id
     or new.page_id <> old.page_id
     or new.revision <> old.revision
     or new.created_by <> old.created_by
     or new.created_at <> old.created_at
     or new.source_revision_id is distinct from old.source_revision_id then
    raise exception 'revision identity is immutable';
  end if;

  if new.snapshot is distinct from old.snapshot
     and not (old.status = 'draft' and new.status = 'draft') then
    raise exception 'revision snapshot is immutable outside draft';
  end if;

  if new.status <> old.status then
    if not (
      (old.status = 'draft' and new.status = 'in_review')
      or (old.status = 'in_review' and new.status in ('draft', 'approved'))
      or (old.status = 'approved' and new.status in ('draft', 'published'))
      or (old.status = 'published' and new.status = 'rolled_back')
    ) then
      raise exception 'invalid builder revision transition: % -> %', old.status, new.status;
    end if;

    if old.status = 'draft' and new.status = 'in_review' then
      new.submitted_by := v_user;
    elsif old.status = 'in_review' and new.status = 'approved' then
      new.approved_by := v_user;
    elsif new.status = 'draft' then
      new.submitted_by := null;
      new.approved_by := null;
      new.published_by := null;
      new.published_at := null;
    elsif old.status = 'approved' and new.status = 'published' then
      update public.page_revisions
         set status = 'rolled_back',
             updated_by = v_user,
             updated_at = now()
       where tenant_id = new.tenant_id
         and page_id = new.page_id
         and status = 'published'
         and id <> old.id;

      new.published_by := v_user;
      new.published_at := now();
    end if;
  end if;

  new.updated_by := v_user;
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.builder_page_revision_guard() from public;
revoke all on function public.builder_page_revision_guard() from anon;
revoke all on function public.builder_page_revision_guard() from authenticated;

create trigger builder_page_revision_guard_trigger
before insert or update on public.page_revisions
for each row execute function public.builder_page_revision_guard();

create or replace function public.builder_project_published_revision()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_updated integer;
begin
  if old.status is distinct from 'published' and new.status = 'published' then
    update public.pages
       set slug = new.snapshot #>> '{page,slug}',
           title = new.snapshot #>> '{page,title}',
           seo = new.snapshot #> '{page,seo}',
           status = 'published',
           published_at = new.published_at,
           updated_by = auth.uid(),
           updated_at = now()
     where id = new.page_id
       and tenant_id = new.tenant_id;

    get diagnostics v_updated = row_count;
    if v_updated <> 1 then
      raise exception 'published revision projection target unavailable';
    end if;

    delete from public.page_sections
     where page_id = new.page_id
       and tenant_id = new.tenant_id;

    insert into public.page_sections (
      page_id,
      tenant_id,
      section_type,
      position,
      is_enabled,
      content
    )
    select
      new.page_id,
      new.tenant_id,
      section.value ->> 'section_type',
      (section.value ->> 'position')::integer,
      (section.value ->> 'is_enabled')::boolean,
      section.value -> 'content'
    from jsonb_array_elements(new.snapshot -> 'sections') as section(value)
    order by (section.value ->> 'position')::integer;
  end if;

  return new;
end;
$$;

revoke all on function public.builder_project_published_revision() from public;
revoke all on function public.builder_project_published_revision() from anon;
revoke all on function public.builder_project_published_revision() from authenticated;

create trigger builder_project_published_revision_trigger
after update on public.page_revisions
for each row execute function public.builder_project_published_revision();
