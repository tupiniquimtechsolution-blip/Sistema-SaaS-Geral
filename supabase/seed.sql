-- seed.sql — Tupiniquim Vertical SaaS — Demo seed
-- Parcial: estrutura pronta, mas somente executável quando projeto Supabase estiver configurado.

-- Plans
INSERT INTO plans (id, name, entitlements, is_demo) VALUES
  ('demo-plan', 'Demo', '["commerce.enabled","catalog.read","orders.read","orders.create"]', true),
  ('starter-plan', 'Starter', '["commerce.enabled","catalog.read","catalog.write","orders.read","orders.create","media.read","media.write","brand.read","brand.write","cms.read","cms.write"]', false),
  ('pro-plan', 'Pro', '["commerce.enabled","booking.enabled","crm.enabled","quotes.enabled","catalog.read","catalog.write","orders.read","orders.create","orders.status.write","media.read","media.write","brand.read","brand.write","cms.read","cms.write","members.read","members.roles.write","integrations.read","integrations.write","audit.read"]', false),
  ('business-plan', 'Business', '["commerce.enabled","booking.enabled","crm.enabled","quotes.enabled","events.enabled","customDomain.enabled","catalog.read","catalog.write","orders.read","orders.create","orders.status.write","media.read","media.write","brand.read","brand.write","cms.read","cms.write","members.read","members.invite","members.roles.write","integrations.read","integrations.write","billing.read","billing.write","audit.read"]', false)
ON CONFLICT DO NOTHING;

-- Demo tenant Fornalha — explicitamente demo, nunca fato comercial implícito
INSERT INTO tenants (id, slug, vertical, status, brand, theme, palette, settings, created_by, created_at)
VALUES (
  gen_random_uuid(),
  'fornalha',
  'bakery',
  'demo',
  '{"name":"Fornalha Premium","tagline":"Pão, bolos e doces frescos todos os dias","logo":"/logo.svg","logoAlt":"Fornalha Premium","favicon":"/favicon.svg"}',
  '{"headingFont":"var(--font-heading)","bodyFont":"var(--font-body)"}',
  '{"primary":"var(--primary)","secondary":"var(--secondary)","accent":"var(--accent)","background":"var(--bg)","surface":"var(--surface)","foreground":"var(--fg)","paper":"var(--paper)","line":"var(--line)","espresso":"var(--espresso)","caramel":"var(--caramel)","dim":"var(--dim)","success":"var(--success)","warning":"var(--warning)","danger":"var(--danger)"}',
  '{"whatsapp":"5511999999999","delivery":true,"pickup":true,"address":"Rua Exemplo, 999 - São Paulo, SP","schedule":"Seg-Sex 7h-18h | Sáb 8h-14h","social":{"instagram":"@fornalha"},"integrations":{"whatsapp":{"enabled":true,"number":"5511999999999"},"ifood":{"enabled":false,"url":""},"keeta":{"enabled":false},"food99":{"enabled":false}}}',
  NULL,
  now()
)
ON CONFLICT DO NOTHING;
