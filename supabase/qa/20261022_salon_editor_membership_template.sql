-- QA-only enrollment of one officially-created Supabase Auth user.
-- DEPENDENCY: Supabase Auth Admin dashboard must have created user first.
-- DO NOT execute until the third dedicated Auth UUID is known and verified.
-- Execute in the QA project ynqbnimlpxlokrxlucdm, SAME database session:
-- BEGIN;
-- SELECT set_config('qa.salon_editor_user_id','<AUTH_USER_UUID>',true);
-- <paste the DO block below without the surrounding illustrative comments>
-- COMMIT;
-- This file intentionally FAILS CLOSED without the one-time session setting.

DO $enroll$
DECLARE
  v_editor_text text := current_setting('qa.salon_editor_user_id',true);
  v_editor uuid;
  v_tenant uuid := 'f92215f9-da30-4453-9190-aece00984284';
  v_foreign uuid := 'a8494bfa-ac05-478c-b06f-3031e0d2cb8c';
  v_role uuid := 'a1cfc9e4-ed77-4891-a91e-568b17be40de';
  v_membership uuid;
BEGIN
  IF v_editor_text IS NULL OR v_editor_text = ''
    OR v_editor_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  THEN RAISE EXCEPTION 'Explicit QA editor Auth UUID session parameter required'; END IF;

  v_editor := v_editor_text::uuid;
  IF v_editor IN (
    '90be8f98-2002-493d-8bb4-bf0b35b7f48e'::uuid,
    '7560c592-331f-4992-a925-f095c76858f4'::uuid
  ) THEN RAISE EXCEPTION 'Cannot promote either original QA Viewer'; END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id=v_editor)
    OR EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id=v_editor)
    OR EXISTS (SELECT 1 FROM public.memberships WHERE user_id=v_editor)
  THEN RAISE EXCEPTION 'Editor must be a new, unassigned, non-platform-admin official Auth user'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE id=v_tenant AND slug='qa-isolation-tenant-a' AND vertical_id='salon')
    OR NOT EXISTS (SELECT 1 FROM public.tenants WHERE id=v_foreign AND slug='qa-isolation-tenant-b' AND vertical_id='salon')
  THEN RAISE EXCEPTION 'Expected isolated Salon QA tenants missing'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.roles
    WHERE id=v_role AND tenant_id=v_tenant AND key='qa_salon_cms_editor' AND is_system=false
  ) OR (
    SELECT count(*) FROM public.role_permissions rp WHERE rp.role_id=v_role
  ) <> 2 OR EXISTS (
    SELECT 1 FROM public.role_permissions rp JOIN public.permissions p ON p.id=rp.permission_id
    WHERE rp.role_id=v_role AND p.key NOT IN ('cms.read','cms.write')
  ) THEN RAISE EXCEPTION 'QA editor role not limited to cms.read/cms.write'; END IF;

  INSERT INTO public.memberships(tenant_id,user_id,status,joined_at)
  VALUES (v_tenant,v_editor,'active',now()) RETURNING id INTO v_membership;

  INSERT INTO public.membership_roles(membership_id,role_id)
  VALUES (v_membership,v_role);

  IF (SELECT count(*) FROM public.memberships WHERE user_id=v_editor) <> 1
     OR (SELECT count(*) FROM public.membership_roles WHERE membership_id=v_membership) <> 1
  THEN RAISE EXCEPTION 'Unexpected editor memberships/roles after provisioning'; END IF;

  -- The original two isolated QA viewers must still be exclusively Viewer.
  IF EXISTS (
    SELECT 1 FROM public.memberships m
    LEFT JOIN public.membership_roles mr ON mr.membership_id=m.id
    LEFT JOIN public.roles r ON r.id=mr.role_id
    WHERE m.user_id IN (
      '90be8f98-2002-493d-8bb4-bf0b35b7f48e',
      '7560c592-331f-4992-a925-f095c76858f4'
    )
    GROUP BY m.user_id
    HAVING count(DISTINCT m.id) <> 1 OR count(mr.role_id) <> 1
       OR count(*) FILTER (WHERE r.key='viewer') <> 1
  ) THEN RAISE EXCEPTION 'Original QA viewer invariant changed'; END IF;
END;
$enroll$;
