-- Idempotent reference seed for local development / fresh environments.
-- No real client credentials, secrets, reviews, prices or production data belong here.

insert into public.vertical_registry(id,name,description,default_theme,default_modules) values
  ('bakery','Padaria','Catálogo, pedidos, delivery/pickup e encomendas','{}'::jsonb,'{"commerce":true,"orders":true,"booking":false,"crm":true}'::jsonb),
  ('pet','Pet Shop','Tutores, pets, serviços, booking, commerce e loyalty','{}'::jsonb,'{"commerce":true,"orders":true,"booking":true,"crm":true,"loyalty":true}'::jsonb),
  ('restaurant','Restaurante','Cardápio, reservas, pedidos, eventos e delivery/pickup','{}'::jsonb,'{"commerce":true,"orders":true,"booking":true,"events":true,"crm":true}'::jsonb),
  ('led','Painéis de LED / Comunicação Visual','Catálogo B2B, vistoria, quotes, projetos e suporte','{}'::jsonb,'{"crm":true,"quotes":true,"projects":true,"support":true}'::jsonb),
  ('heavy-machinery','Máquinas Pesadas','Showroom, inventory, leads, quotes, trade-in e suporte','{}'::jsonb,'{"inventory":true,"crm":true,"quotes":true,"projects":true,"support":true}'::jsonb),
  ('religious-house','Templo / Casa Religiosa','CMS, calendário, eventos, booking e galeria','{}'::jsonb,'{"booking":true,"events":true,"commerce":false,"crm":false}'::jsonb)
on conflict (id) do update set
  name=excluded.name,
  description=excluded.description,
  default_theme=excluded.default_theme,
  default_modules=excluded.default_modules,
  is_enabled=true,
  updated_at=now();

insert into public.features(key,description,value_type) values
  ('commerce.enabled','Commerce module availability','boolean'),
  ('orders.enabled','Orders module availability','boolean'),
  ('booking.enabled','Booking module availability','boolean'),
  ('crm.enabled','CRM module availability','boolean'),
  ('quotes.enabled','Quotes/proposals module availability','boolean'),
  ('projects.enabled','Projects/installations module availability','boolean'),
  ('events.enabled','Events module availability','boolean'),
  ('loyalty.enabled','Loyalty module availability','boolean'),
  ('inventory.enabled','Inventory module availability','boolean'),
  ('support.enabled','Support/warranty module availability','boolean'),
  ('customDomain.enabled','Custom domain support','boolean'),
  ('locations.max','Maximum number of business locations','integer'),
  ('users.max','Maximum tenant members','integer'),
  ('products.max','Maximum catalog products/equipment entries','integer'),
  ('storage.bytes','Tenant storage quota in bytes','integer'),
  ('media.maxFileSize','Maximum upload size in bytes','integer'),
  ('audit.retentionDays','Audit retention target in days','integer')
on conflict (key) do update set description=excluded.description,value_type=excluded.value_type;

insert into public.plans(id,name,description,is_public,is_active,sort_order) values
  ('demo','Demo','Tenant de demonstração, sem promessa comercial.',false,true,0),
  ('starter','Starter','Base white-label com conteúdo e presença digital.',true,true,10),
  ('pro','Pro','Operação digital com módulos comerciais selecionados.',true,true,20),
  ('business','Business','Operação avançada multiusuário/multimódulo.',true,true,30)
on conflict (id) do update set
  name=excluded.name,
  description=excluded.description,
  is_public=excluded.is_public,
  is_active=excluded.is_active,
  sort_order=excluded.sort_order,
  updated_at=now();

-- DEMO
insert into public.plan_entitlements(plan_id,feature_key,value) values
  ('demo','commerce.enabled','true'::jsonb),
  ('demo','orders.enabled','true'::jsonb),
  ('demo','booking.enabled','true'::jsonb),
  ('demo','crm.enabled','true'::jsonb),
  ('demo','quotes.enabled','true'::jsonb),
  ('demo','projects.enabled','true'::jsonb),
  ('demo','events.enabled','true'::jsonb),
  ('demo','loyalty.enabled','true'::jsonb),
  ('demo','inventory.enabled','true'::jsonb),
  ('demo','support.enabled','true'::jsonb),
  ('demo','customDomain.enabled','false'::jsonb),
  ('demo','locations.max','1'::jsonb),
  ('demo','users.max','3'::jsonb),
  ('demo','products.max','100'::jsonb),
  ('demo','storage.bytes','1073741824'::jsonb),
  ('demo','media.maxFileSize','26214400'::jsonb),
  ('demo','audit.retentionDays','30'::jsonb)
on conflict (plan_id,feature_key) do update set value=excluded.value;

-- STARTER
insert into public.plan_entitlements(plan_id,feature_key,value) values
  ('starter','commerce.enabled','false'::jsonb),
  ('starter','orders.enabled','false'::jsonb),
  ('starter','booking.enabled','false'::jsonb),
  ('starter','crm.enabled','false'::jsonb),
  ('starter','quotes.enabled','false'::jsonb),
  ('starter','projects.enabled','false'::jsonb),
  ('starter','events.enabled','true'::jsonb),
  ('starter','loyalty.enabled','false'::jsonb),
  ('starter','inventory.enabled','false'::jsonb),
  ('starter','support.enabled','false'::jsonb),
  ('starter','customDomain.enabled','true'::jsonb),
  ('starter','locations.max','1'::jsonb),
  ('starter','users.max','3'::jsonb),
  ('starter','products.max','100'::jsonb),
  ('starter','storage.bytes','2147483648'::jsonb),
  ('starter','media.maxFileSize','26214400'::jsonb),
  ('starter','audit.retentionDays','30'::jsonb)
on conflict (plan_id,feature_key) do update set value=excluded.value;

-- PRO
insert into public.plan_entitlements(plan_id,feature_key,value) values
  ('pro','commerce.enabled','true'::jsonb),
  ('pro','orders.enabled','true'::jsonb),
  ('pro','booking.enabled','true'::jsonb),
  ('pro','crm.enabled','true'::jsonb),
  ('pro','quotes.enabled','true'::jsonb),
  ('pro','projects.enabled','false'::jsonb),
  ('pro','events.enabled','true'::jsonb),
  ('pro','loyalty.enabled','true'::jsonb),
  ('pro','inventory.enabled','true'::jsonb),
  ('pro','support.enabled','false'::jsonb),
  ('pro','customDomain.enabled','true'::jsonb),
  ('pro','locations.max','3'::jsonb),
  ('pro','users.max','10'::jsonb),
  ('pro','products.max','1000'::jsonb),
  ('pro','storage.bytes','10737418240'::jsonb),
  ('pro','media.maxFileSize','26214400'::jsonb),
  ('pro','audit.retentionDays','90'::jsonb)
on conflict (plan_id,feature_key) do update set value=excluded.value;

-- BUSINESS
insert into public.plan_entitlements(plan_id,feature_key,value) values
  ('business','commerce.enabled','true'::jsonb),
  ('business','orders.enabled','true'::jsonb),
  ('business','booking.enabled','true'::jsonb),
  ('business','crm.enabled','true'::jsonb),
  ('business','quotes.enabled','true'::jsonb),
  ('business','projects.enabled','true'::jsonb),
  ('business','events.enabled','true'::jsonb),
  ('business','loyalty.enabled','true'::jsonb),
  ('business','inventory.enabled','true'::jsonb),
  ('business','support.enabled','true'::jsonb),
  ('business','customDomain.enabled','true'::jsonb),
  ('business','locations.max','25'::jsonb),
  ('business','users.max','100'::jsonb),
  ('business','products.max','10000'::jsonb),
  ('business','storage.bytes','53687091200'::jsonb),
  ('business','media.maxFileSize','26214400'::jsonb),
  ('business','audit.retentionDays','365'::jsonb)
on conflict (plan_id,feature_key) do update set value=excluded.value;

-- IMPORTANT: no real/demo client tenant is inserted here because tenant ownership must be linked
-- to a real authenticated user through create_tenant_with_owner(). The Fornalha demo tenant
-- should be created by the app/bootstrap script once a controlled demo owner identity exists.
