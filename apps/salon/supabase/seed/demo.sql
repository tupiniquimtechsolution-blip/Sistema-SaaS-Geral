-- DEMO ONLY — never applied by supabase db push / production migrations.
-- Load locally with: psql "$DATABASE_URL" -f supabase/seed/demo.sql
-- Enable the frontend catalog preview with VITE_DEMO_CATALOG=true (never in production).

insert into public.service_categories (id, name, slug, sort_order) values
  ('22222222-0000-4000-8000-000000000001', 'Sobrancelhas', 'sobrancelhas', 1),
  ('22222222-0000-4000-8000-000000000002', 'Cílios', 'cilios', 2),
  ('22222222-0000-4000-8000-000000000003', 'Facial', 'facial', 3),
  ('22222222-0000-4000-8000-000000000004', 'Corporal', 'corporal', 4)
on conflict (id) do nothing;

insert into public.services (
  id, category_id, name, slug, description, duration_minutes, price_cents, sort_order
) values
  ('33333333-0000-4000-8000-000000000001', '22222222-0000-4000-8000-000000000001', 'Design de Sobrancelhas', 'design-sobrancelhas', 'DEMO — não usar em produção.', 45, 6000, 1),
  ('33333333-0000-4000-8000-000000000002', '22222222-0000-4000-8000-000000000001', 'Micropigmentação de Sobrancelhas', 'micropigmentacao-sobrancelhas', 'DEMO — não usar em produção.', 120, 45000, 2),
  ('33333333-0000-4000-8000-000000000003', '22222222-0000-4000-8000-000000000002', 'Extensão de Cílios', 'extensao-cilios', 'DEMO — não usar em produção.', 90, 18000, 3),
  ('33333333-0000-4000-8000-000000000004', '22222222-0000-4000-8000-000000000002', 'Lash Lifting', 'lash-lifting', 'DEMO — não usar em produção.', 60, 12000, 4),
  ('33333333-0000-4000-8000-000000000005', '22222222-0000-4000-8000-000000000003', 'Limpeza de Pele Profunda', 'limpeza-pele', 'DEMO — não usar em produção.', 75, 15000, 5),
  ('33333333-0000-4000-8000-000000000006', '22222222-0000-4000-8000-000000000003', 'Peeling de Diamante', 'peeling-diamante', 'DEMO — não usar em produção.', 60, 20000, 6),
  ('33333333-0000-4000-8000-000000000007', '22222222-0000-4000-8000-000000000004', 'Massagem Relaxante', 'massagem-relaxante', 'DEMO — não usar em produção.', 60, 13000, 7),
  ('33333333-0000-4000-8000-000000000008', '22222222-0000-4000-8000-000000000004', 'Drenagem Linfática', 'drenagem-linfatica', 'DEMO — não usar em produção.', 60, 14000, 8)
on conflict (id) do nothing;

insert into public.professional_services (professional_id, service_id)
select '11111111-1111-4111-8111-111111111111', id from public.services
on conflict do nothing;

insert into public.business_hours (professional_id, weekday, open_time, close_time) values
  (null, 1, '09:00', '19:00'),
  (null, 2, '09:00', '19:00'),
  (null, 3, '09:00', '19:00'),
  (null, 4, '09:00', '20:00'),
  (null, 5, '09:00', '20:00'),
  (null, 6, '09:00', '16:00')
on conflict do nothing;
