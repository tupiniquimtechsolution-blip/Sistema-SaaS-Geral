-- Production bootstrap only.
-- Confirmed: brand name. Everything else is PENDENTE_DE_CONFIRMACAO.
-- Invented catalog/prices/hours/testimonials live in supabase/seed/demo.sql
-- and are NEVER applied by migrations.

insert into public.business_settings (
  id, name, tagline, description, phone, whatsapp, email, instagram,
  address, city, state, timezone, booking_slot_minutes, cancellation_hours, lgpd_policy_version
) values (
  '00000000-0000-4000-8000-000000000001',
  'Vanessa Braz',
  'Beleza & Autoestima',
  'PENDENTE_DE_CONFIRMACAO',
  'PENDENTE_DE_CONFIRMACAO',
  '',
  'PENDENTE_DE_CONFIRMACAO',
  'PENDENTE_DE_CONFIRMACAO',
  'PENDENTE_DE_CONFIRMACAO',
  'PENDENTE_DE_CONFIRMACAO',
  'PENDENTE_DE_CONFIRMACAO',
  'America/Sao_Paulo',
  30,
  24,
  '1.0'
);

insert into public.professionals (id, display_name, bio, active, sort_order)
values (
  '11111111-1111-4111-8111-111111111111',
  'Vanessa Braz',
  'PENDENTE_DE_CONFIRMACAO',
  true,
  1
);
