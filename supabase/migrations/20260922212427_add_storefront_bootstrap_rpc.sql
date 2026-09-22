-- Public storefront bootstrap — APPLIED REMOTELY (forward-only)
-- Sistema SaaS Geral — Supabase canônico: mmykyzzkcugxunmekwew
--
-- ✅ STATUS: APPLIED — remote migration
--    20260922212427_add_storefront_bootstrap_rpc
--    was applied on 2026-09-22 after the branch quality gate passed.
--
-- Post-apply validation confirmed:
--   * SECURITY DEFINER = true;
--   * fixed search_path = public, pg_temp;
--   * EXECUTE granted to anon + authenticated;
--   * anon resolves qa-tenant-a (trialing / bakery) and receives JSON objects;
--   * settings never exposes private_settings;
--   * invalid tenant slug returns zero rows;
--   * anon still sees zero rows through direct tenant_settings SELECT/RLS.
--
-- Purpose:
--   Allow an anonymous/public storefront to resolve the minimum safe tenant
--   configuration by slug without granting public SELECT on public.tenants or
--   public.tenant_settings.
--
-- Security contract:
--   * SECURITY DEFINER is intentionally narrow and read-only.
--   * only demo/trialing/active tenants are returned.
--   * private_settings is NEVER selected or returned.
--   * no subscription, membership, role, permission or private tenant data is
--     exposed.
--   * callers receive one curated JSON projection for brand/theme/public settings.
--   * function search_path is fixed; there is no dynamic SQL.
--   * anon/authenticated get EXECUTE only; underlying table RLS is unchanged.
--
-- Do NOT re-apply this migration. The filename is aligned to the remote
-- migration ledger so normal Supabase migration tooling can recognize it.

create or replace function public.get_storefront_bootstrap(p_tenant_slug text)
returns table (
  tenant_id uuid,
  tenant_slug text,
  tenant_status text,
  vertical_id text,
  brand jsonb,
  theme jsonb,
  settings jsonb
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    t.id as tenant_id,
    t.slug as tenant_slug,
    t.status as tenant_status,
    t.vertical_id,
    jsonb_strip_nulls(
      jsonb_build_object(
        'display_name', b.display_name,
        'tagline', b.tagline,
        'logo_url', b.logo_url,
        'logo_alt_url', b.logo_alt_url,
        'favicon_url', b.favicon_url,
        'hero_media_url', b.hero_media_url,
        'phone', b.phone,
        'whatsapp', b.whatsapp,
        'email', b.email,
        'instagram_url', b.instagram_url,
        'facebook_url', b.facebook_url,
        'other_socials', coalesce(b.other_socials, '{}'::jsonb),
        'address', coalesce(b.address, '{}'::jsonb),
        'opening_hours', coalesce(b.opening_hours, '{}'::jsonb),
        'primary_cta_label', b.primary_cta_label,
        'primary_cta_url', b.primary_cta_url,
        'seo_defaults', coalesce(b.seo_defaults, '{}'::jsonb)
      )
    ) as brand,
    jsonb_build_object(
      'tokens', coalesce(th.tokens, '{}'::jsonb),
      'typography', coalesce(th.typography, '{}'::jsonb),
      'component_style', coalesce(th.component_style, '{}'::jsonb)
    ) as theme,
    jsonb_strip_nulls(
      jsonb_build_object(
        'locale', s.locale,
        'timezone', s.timezone,
        'currency', s.currency,
        'public_settings', coalesce(s.public_settings, '{}'::jsonb)
      )
    ) as settings
  from public.tenants t
  left join public.tenant_brands b on b.tenant_id = t.id
  left join public.tenant_themes th on th.tenant_id = t.id
  left join public.tenant_settings s on s.tenant_id = t.id
  where t.slug = nullif(btrim(p_tenant_slug), '')
    and t.status in ('demo', 'trialing', 'active')
  limit 1;
$$;

revoke all on function public.get_storefront_bootstrap(text) from public;
grant execute on function public.get_storefront_bootstrap(text) to anon, authenticated;

comment on function public.get_storefront_bootstrap(text) is
  'Public-safe storefront bootstrap by tenant slug. Returns curated brand/theme/public_settings only; never private_settings or membership data.';
