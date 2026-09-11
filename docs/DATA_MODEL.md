# Data Model — Tupiniquim Vertical SaaS

## Objetivo

Este modelo sustenta um SaaS multi-tenant compartilhado pelos verticais Padaria, Pet Shop, Restaurante, LED/Comunicação Visual, Máquinas Pesadas e Templo/Casa Religiosa.

A regra central é:

> Todo dado operacional pertencente a um cliente deve possuir escopo de tenant validado no servidor.

## Camadas

### Platform

- `vertical_registry`
- `tenants`
- `tenant_domains`
- `tenant_brands`
- `tenant_themes`
- `tenant_settings`
- `locations`

### Identity / Authorization

- `profiles`
- `platform_admins`
- `memberships`
- `roles`
- `permissions`
- `role_permissions`
- `membership_roles`
- `invitations`

### Billing / Entitlements

- `features`
- `plans`
- `plan_entitlements`
- `subscriptions`
- `tenant_entitlements`
- `tenant_features`

### CMS / Media

- `pages`
- `page_sections`
- `media_assets`
- Supabase Storage buckets `tenant-media-public` / `tenant-media-private`

### CRM / Operations

- `contacts`
- `leads`
- `integration_connections`
- `webhook_endpoints`
- `webhook_deliveries`
- `notifications`
- `audit_logs`
- `usage_metrics`

### Commerce

- `product_categories`
- `products`
- `product_variants`
- `product_modifier_groups`
- `product_modifiers`
- `product_media`
- `coupons`
- `fulfillment_methods`
- `orders`
- `order_items`
- `order_status_history`

### Booking / Events

- `services`
- `service_resources`
- `service_resource_links`
- `availability_rules`
- `availability_overrides`
- `bookings`
- `booking_status_history`
- `events`
- `event_registrations`

### B2B / Projects

- `equipment_categories`
- `equipment`
- `equipment_media`
- `inventory_items`
- `technical_solutions`
- `site_surveys`
- `quotes`
- `quote_items`
- `proposal_versions`
- `projects`
- `project_updates`
- `documents`
- `trade_in_requests`
- `financing_requests`
- `warranty_records`
- `support_tickets`

### Pet Shop

- `pets`
- `pet_service_history`
- `loyalty_accounts`
- `loyalty_transactions`
- `bookings.pet_id`

Não inclui prontuário veterinário.

### Restaurante

- `menus`
- `menu_sections`
- `menu_items`
- `allergens`
- `menu_item_allergens`
- `restaurant_reservation_details`

### Templo/Casa Religiosa

- `religious_event_details`
- `religious_booking_details`
- `contribution_configs`

Módulos de membros, médiuns, presença e registros privados de consulta não são criados por padrão porque podem revelar dados religiosos sensíveis.

## Isolamento

A camada de segurança usa simultaneamente:

1. `tenant_id` explícito;
2. Supabase Auth;
3. membership ativa;
4. permissions por RBAC;
5. RLS default deny;
6. Storage tenant-aware;
7. testes cross-tenant.

`tenant_id` sozinho não é considerado isolamento.

## Onboarding

A função `create_tenant_with_owner(...)` cria atomicamente:

- tenant;
- brand inicial;
- theme inicial;
- settings iniciais;
- membership do usuário autenticado;
- role `owner`.

Criação direta de tenant pelo browser não é necessária.

## Public vs private

Conteúdo público pode ser lido por `anon` somente quando explicitamente publicado/ativo:

- Brand/Theme necessários ao storefront;
- locations públicas;
- CMS publicado;
- mídia pública;
- catálogo ativo;
- serviços/eventos publicados;
- menus publicados;
- showroom B2B público.

Dados operacionais permanecem privados:

- orders;
- bookings;
- CRM;
- quotes;
- projects;
- private documents;
- integrations;
- audit logs;
- subscriptions;
- members.

## Secrets

Segredos de providers não devem ser gravados em JSON público. Tabelas de integração armazenam apenas `secret_ref` para apontar para secret management/server configuration.

## Demo

`seed.sql` contém somente dados de referência da plataforma (verticais, features, planos, entitlements). O tenant demo Fornalha deve ser criado por bootstrap controlado após existir uma identidade demo segura; nunca via credencial hard-coded no Git.
