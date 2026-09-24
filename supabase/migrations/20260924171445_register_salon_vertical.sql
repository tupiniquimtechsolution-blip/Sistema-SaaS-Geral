-- Tupiniquim Vertical SaaS — reusable Salon / Beleza & Estética vertical.
-- Generic product registry entry only; this does not provision Vanessa Braz or
-- any other customer tenant.
-- Review first; production application requires explicit Supabase mutation authorization.

insert into public.vertical_registry (
  id,
  name,
  description,
  is_enabled,
  default_theme,
  default_modules
) values (
  'salon',
  'Salão / Beleza & Estética',
  'Serviços, profissionais, agenda, CRM, mídia e experiência white-label para beleza e estética',
  true,
  '{"preset":"salon-premium"}'::jsonb,
  '{"booking":true,"crm":true,"media":true}'::jsonb
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  is_enabled = true,
  default_theme = public.vertical_registry.default_theme || excluded.default_theme,
  default_modules = public.vertical_registry.default_modules || excluded.default_modules,
  updated_at = now();
