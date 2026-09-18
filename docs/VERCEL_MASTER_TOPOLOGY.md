# VERCEL MASTER TOPOLOGY

Data: 2026-09-18 · Branch `freebuff/big-master-wave-01-monorepo` · HEAD base 95fb0a6

## Modelo conceitual

```text
WORKSPACE (team Vercel — identidade organizacional neutra; alvo conceitual
           "Tupiniquim Tech Solution"; nome atual legado NÃO é arquitetura)
   │
   ├── sistema-saas-geral        → PLATAFORMA (control plane) — apps/platform
   ├── saas-bakery               → vertical Padaria — apps/bakery
   ├── saas-pet                  → vertical Pet — apps/pet
   ├── saas-restaurant           → vertical Restaurante — apps/restaurant
   ├── saas-metalart             → vertical MetalArt — apps/metalart
   ├── saas-heavy-machinery      → vertical Máquinas Pesadas — apps/heavy-machinery
   ├── saas-religious-house      → vertical Templo (quando source desbloqueado)
   ├── saas-salon                → vertical Salão (quando app existir)
   └── saas-led                  → SOMENTE quando o source real existir
```

## Central app (estado atual)

apps/platform é o **control plane** do SaaS (não apenas uma landing): 6 views
(Dashboard, Verticais + dossiê, Core com maturidade honesta, Tenants,
Deployments, Status), navegação por hash, zero secrets, zero backend falso.
Evidência e veredito: docs/PLATFORM_COMPLETION_REPORT.md. Migração futura de
hosting (Vercel → Cloudflare) planejada em docs/CLOUDFLARE_MIGRATION_MASTER_PLAN.md
— NÃO executar até SYSTEM_COMPLETE.

## Regras invariáveis

1. **Vercel Project ≠ Tenant.** Um projeto publica uma aplicação; cada cliente
   comercial de uma aplicação é um tenant (dados/config runtime no Supabase
   `mmykyzzkcugxunmekwew`) — branding, domínio, entitlements e dados próprios
   sem fork de código.
2. **Um Vercel Project por aplicação deployable**, cada um com Root Directory /
   Build Command / Output Directory próprios. NENHUM `vercel.json` global
   forçando todos os projetos a publicar a mesma app.
3. **Supabase canônico único** para a plataforma multi-tenant:
   `mmykyzzkcugxunmekwew` — nunca um Supabase por cliente.
4. **Ambientes**: Preview (branches/homologação) e Production (releases
   aprovados) + Development/local. Custom environments (staging/qa/demo/pilot)
   permanecem FUTURE/OPTIONAL.
5. **Secrets**: apenas variáveis `VITE_*` browser-safe no frontend; service_role,
   senhas QA e JWT secrets NUNCA no Vercel frontend.
6. **Deploy legacy**: o migration/validate/cutover/deprecate substitui delete
   prematuro (Bakery permanece servida pelo projeto central até o cutover do
   projeto dedicado validar).

## Estado por projeto

**Cutover do projeto central (2026-09-18):** `vercel.json` repontado de
`build:bakery`/`apps/bakery/dist` para `build:platform`/`apps/platform/dist`.
Correção de diagnóstico: o deployment do commit b8babe9 ficou READY com
GET / = 200 (URL de deployment confirmada pelo owner) — mas servia **Bakery**
porque o vercel.json ainda apontava para `build:bakery` (o 404 registrado
antes referia-se ao alias de produção antes de qualquer promoção). Com o
cutover, o projeto central passa a publicar a PLATAFORMA; a Bakery continua
servida pelo deployment validado até o projeto dedicado `saas-bakery` ser
criado e validado pelo owner (instruções exatas em docs/VERCEL_OWNER_ACTIONS.md)
— preservando o preview funcional (migrate/validate/cutover/deprecate, sem
downtime desnecessário).

Ver `docs/VERCEL_TOPOLOGY_AUDIT.md` (estado real + ações) e
`docs/DEPLOYMENT_RELEASE_MATRIX.md` (gates por app). A criação/configuração dos
projetos dedicados no dashboard Vercel é ação do owner (permissão de team
necessária); os comandos exatos estão em docs/VERCEL_OWNER_ACTIONS.md.

## Git integration (target)

Todos os projetos apontam para `tupiniquimtechsolution-blip/Sistema-SaaS-Geral`,
branch de trabalho `freebuff/big-master-wave-01-monorepo`; Production por
release explícita (promote), não por push automático de main (main ainda não é
a fonte desta wave).
