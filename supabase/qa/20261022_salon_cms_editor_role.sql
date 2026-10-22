-- TASK-78 / Salon + Builder editorial QA only.
-- Apply ONLY to the independent Supabase QA project ynqbnimlpxlokrxlucdm.
-- NOT a production migration. No Auth user creation or membership grant.
-- Idempotent per tenant; the only entitlements are cms.read and cms.write.
BEGIN;

DO $setup$
DECLARE
  a uuid := 'f92215f9-da30-4453-9190-aece00984284';
  b uuid := 'a8494bfa-ac05-478c-b06f-3031e0d2cb8c';
  v_role_id uuid;
  existing_count int;
  perm_count int;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.tenants
    WHERE id = a AND slug = 'qa-isolation-tenant-a' AND vertical_id = 'salon'
  ) OR NOT EXISTS (
    SELECT 1 FROM public.tenants
    WHERE id = b AND slug = 'qa-isolation-tenant-b' AND vertical_id = 'salon'
  ) THEN
    RAISE EXCEPTION 'QA-only identity guard: expected two isolated Salon tenants not found';
  END IF;

  -- Both original users must remain exactly Viewer on their own tenant.
  IF (
    SELECT count(*) FROM public.membership_roles mr
    JOIN public.memberships m ON m.id=mr.membership_id
    JOIN public.roles r ON r.id=mr.role_id
    WHERE (m.user_id='90be8f98-2002-493d-8bb4-bf0b35b7f48e' AND m.tenant_id=a
       OR m.user_id='7560c592-331f-4992-a925-f095c76858f4' AND m.tenant_id=b)
      AND m.status='active' AND r.key='viewer'
  ) <> 2 THEN
    RAISE EXCEPTION 'Original QA-A and QA-B Viewer roles not confirmed';
  END IF;

  SELECT count(*), min(id::text)::uuid
  INTO existing_count, v_role_id
  FROM public.roles
  WHERE tenant_id=a AND key='qa_salon_cms_editor';

  IF existing_count > 1 THEN RAISE EXCEPTION 'Duplicate QA editor roles detected'; END IF;

  IF v_role_id IS NULL THEN
    INSERT INTO public.roles(tenant_id,key,name,description,is_system)
    VALUES (a,'qa_salon_cms_editor','QA Salon CMS Editor',
      'TASK-78 isolated QA editorial role; cms.read + cms.write only',false)
    RETURNING id INTO v_role_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.roles WHERE id=v_role_id AND tenant_id=a
      AND key='qa_salon_cms_editor' AND is_system=false
  ) THEN RAISE EXCEPTION 'QA editor role integrity failed'; END IF;

  SELECT count(*) INTO perm_count
  FROM public.permissions WHERE key IN ('cms.read','cms.write');
  IF perm_count <> 2 THEN RAISE EXCEPTION 'CMS permission catalog incomplete'; END IF;

  INSERT INTO public.role_permissions(role_id,permission_id)
  SELECT v_role_id,p.id FROM public.permissions p
  WHERE p.key IN ('cms.read','cms.write')
    AND NOT EXISTS (
      SELECT 1 FROM public.role_permissions rp
      WHERE rp.role_id=v_role_id AND rp.permission_id=p.id
    );

  -- Block any accidental excess grants to the temporary editorial role.
  IF EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.permissions p ON p.id=rp.permission_id
    WHERE rp.role_id=v_role_id AND p.key NOT IN ('cms.read','cms.write')
  ) THEN
    RAISE EXCEPTION 'Excess privileges on QA editorial role';
  END IF;

  IF (SELECT count(*) FROM public.role_permissions WHERE role_permissions.role_id=v_role_id) <> 2 THEN
    RAISE EXCEPTION 'Unexpected QA editorial permission count';
  END IF;
END;
$setup$;

COMMIT;
