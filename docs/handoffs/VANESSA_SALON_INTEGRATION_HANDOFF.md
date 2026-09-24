# Handoff — Vanessa Braz → Sistema-SaaS-Geral / vertical Salon

## Decisão canônica

O projeto `tupiniquimtechsolution-blip/Vanessa-Braz` deixa de ser tratado como um backend/Supabase isolado e passa a ser **fonte de produto, UX e regras de domínio** para um novo vertical white-label de salão/beleza dentro do monorepo `Sistema-SaaS-Geral`.

### Decisão de identidade e autenticação — 2026-09-24

Vanessa Braz **não terá sistema próprio de usuário/senha nem Supabase dedicado**.

Toda autenticação, identidade, perfis, memberships, tenancy, autorização e dados transacionais autenticados devem usar os contratos canônicos do `Sistema-SaaS-Geral`.

Isso significa:

- o login/cadastro do cliente deve ser fornecido pelo SaaS Geral;
- o acesso administrativo deve usar RBAC/memberships do SaaS Geral;
- Vanessa será um tenant/configuração do vertical `salon`;
- nenhum segundo diretório de usuários deverá existir apenas para Vanessa;
- nenhuma senha/credencial de usuário deve ser persistida ou gerida pelo app Vanessa;
- não criar projeto Supabase exclusivo para Vanessa;
- código Auth/Supabase existente no repo Vanessa é referência de domínio/teste e só pode ser reaproveitado após reconciliação com o SaaS Core.

O objetivo NÃO é copiar dois backends nem aplicar as migrations de Vanessa diretamente no banco compartilhado. O objetivo é reconciliar o que Vanessa já validou com o SaaS Core multi-tenant existente.

Branch preparada para esta integração:

`chatgpt/integrate-salon-vanessa`

Base:

`freebuff/big-master-wave-01-monorepo`

Não usar `main` como branch de desenvolvimento desta integração e não fazer force push.

---

## Fontes de verdade

### Monorepo de destino

- Repo: `tupiniquimtechsolution-blip/Sistema-SaaS-Geral`
- PR canônico em andamento: #2
- Branch de base: `freebuff/big-master-wave-01-monorepo`
- Supabase canônico compartilhado: `mmykyzzkcugxunmekwew`
- Região: `sa-east-1`

O banco compartilhado já possui tenancy/RBAC/RLS, CMS/media, CRM, commerce, booking/events, storage tenant-aware e verticais existentes.

### Projeto fonte Vanessa Braz

- Repo: `tupiniquimtechsolution-blip/Vanessa-Braz`
- PR #2 — app/backend auditado — HEAD `83d3834cf528e913e0d371b57c2775361cd14d64`
- PR #4 — mídia WEB-v2/responsiva — HEAD `3fd46af4566178dd6dfea66dd363a9466faffde9`
- PR #5 — hardening deploy/webhook — HEAD `736e7215c8b6f33f1284827bf77e5b4a67005647`
- PR #8 — redesign/UI/preview Cloudflare — branch `chatgpt/clandestine-layout-refresh`

Esses PRs continuam separados no repo fonte e NÃO devem ser mergeados cegamente dentro do monorepo. Eles devem ser usados como referência de implementação e evidência.

---

## Estado do Supabase compartilhado relevante ao vertical salão

O projeto `Sistema-SaaS-Geral` já possui:

- `tenants`, `tenant_domains`, `tenant_brands`, `tenant_themes`, `tenant_settings`, `locations`;
- `profiles`, `memberships`, roles/permissions/RBAC;
- `services`;
- `staff_resources`;
- `service_resources`;
- `availability_rules` e `availability_overrides`;
- `bookings` e histórico de status;
- `contacts` e `leads`;
- `media_assets` + Storage tenant-aware;
- features/entitlements;
- auditoria e observabilidade de plataforma.

Isto cobre a maior parte do domínio de Vanessa sem criar tabelas paralelas.

Mapeamento esperado:

| Vanessa | SaaS Geral |
|---|---|
| autenticação/login | Auth/identity canônicos do SaaS Geral |
| perfis/membros | `profiles` / `memberships` / RBAC |
| profissionais | `staff_resources` |
| serviços | `services` |
| profissional x serviço | `service_resources` |
| disponibilidade | `availability_rules` / `availability_overrides` |
| agendamentos | `bookings` |
| clientes | `contacts` |
| leads | `leads` |
| marca/contato/endereço | `tenant_brands` / `locations` |
| tema/paleta | `tenant_themes` |
| configurações | `tenant_settings` |
| mídias | `media_assets` + Storage |

### Gaps que DEVEM ser auditados antes de migration

O schema compartilhado deve ser auditado principalmente para:

- pagamentos vinculados a booking;
- eventos de webhook de pagamento/idempotência;
- consentimentos LGPD versionados equivalentes ao projeto Vanessa;
- eventual hold temporário de slot/deposito;
- garantias de conflito de agenda no banco.

Não criar tabelas `vanessa_*`.

Se esses recursos forem necessários, implementar como capacidade genérica do SaaS Core, por exemplo `booking_payments`, `payment_events`, `consents` ou equivalente, sempre tenant-owned, com RLS default-deny, idempotência e testes cross-tenant.

---

## Novo vertical

Adicionar um vertical genérico:

- id recomendado: `salon`
- nome: `Salão / Beleza & Estética`
- módulos padrão: `booking=true`, `crm=true`, `commerce=true`

Vanessa Braz deve ser um **tenant/configuração deste vertical**, não um fork e não um conjunto de `if tenant === 'vanessa'`.

O bootstrap do tenant Vanessa só deve ocorrer pelo fluxo seguro e canônico do SaaS Geral, incluindo owner/membership/roles.

---

## App de destino

Criar o vertical em:

`apps/salon`

Regras:

1. preservar a linguagem visual e os fluxos validados em Vanessa como template inicial do vertical;
2. remover hard-codes de cliente e converter em configuração por tenant;
3. logo, cores, tipografia, mídias, contatos, endereço, horários, serviços, preços, CTAs e integrações devem vir de tenant config/data;
4. nenhum dado Vanessa deve ser obrigatório para outro salão usar o mesmo app;
5. não redesenhar sem necessidade técnica;
6. mobile-first, WCAG 2.2 AA, reduced-motion e performance devem permanecer gates;
7. áreas autenticadas devem consumir a sessão/identidade compartilhada do SaaS Geral; não criar segundo login local no `apps/salon`.

---

## Auth e sessão

A integração de autenticação passa a ser um gate explícito do vertical.

Obrigatório:

- utilizar a sessão canônica do SaaS Geral;
- resolver `tenant_id` de forma confiável e server-side quando necessário;
- validar membership/role para áreas administrativas;
- impedir acesso cross-tenant;
- não armazenar passwords ou tokens de usuário em código/localStorage customizado;
- não criar tabelas de credenciais próprias do vertical;
- testes negativos tenant A → tenant B e tenant B → tenant A;
- logout, expiração e sessão devem seguir o contrato compartilhado do SaaS Core.

---

## Mídia

O projeto Vanessa possui pipeline auditado de mídia.

Checkpoint aprovado:

- 40/40 usos principais passaram no gate visual;
- WEB-v2 é a variante final dos 40 usos;
- hero 1/2 ficaram em WEB-v2, `enhanced` não foi promovido;
- candidatos 320/480/640/960/main foram preparados;
- Lighthouse sintético no checkpoint refinado: score 72→78, LCP 7136ms→4810ms, peso 1.616.401B→829.110B.

Mas **qualidade visual não equivale a autorização de publicação**.

As mídias Vanessa com pessoas identificáveis permanecem `PENDENTE_DE_CONFIRMACAO` para publicação.

No SaaS Geral:

- o template `apps/salon` não deve depender dessas fotos;
- os assets Vanessa podem ser migrados como tenant media somente após gate de consentimento/publicação;
- Storage deve usar o modelo tenant-aware já existente;
- preservar hashes e variantes responsivas quando houver migração real.

---

## Booking

Preservar o fluxo funcional validado no projeto Vanessa:

serviço → profissional → data → horário → identificação/sessão SaaS → revisão → pagamento quando aplicável → confirmação.

Mas implementar sobre os contratos compartilhados do SaaS Geral.

Obrigatório:

- conflito de horário impedido no banco, não apenas na UI;
- autorização tenant-aware;
- validação server-side;
- estados explícitos de booking;
- histórico/auditoria;
- negative tests A→B e B→A;
- slots nunca podem vazar entre tenants.

Se o schema atual não garantir exclusão/lock equivalente ao que foi validado em Vanessa, criar migration genérica e teste real PostgreSQL, não uma correção específica para Vanessa.

---

## Pagamentos / Mercado Pago

A implementação Vanessa validou:

- webhook como autoridade;
- assinatura HMAC Mercado Pago com `ts`, `v1`, `x-request-id` e `data.id` canônico;
- lookup autoritativo `GET /v1/payments/{id}`;
- idempotência concorrente no banco;
- validação de valor/referência;
- timeout e payload limits no hardening.

Na unificação, transformar isso em integração reutilizável do SaaS Core.

Nunca colocar access token, service role ou webhook secret no browser.

Não migrar as tabelas/RPCs Vanessa literalmente se já existir abstração equivalente no monorepo. Primeiro produzir matriz `REUSE / ADAPT / NEW / DROP`.

---

## LGPD

Preservar a separação conceitual já usada em Vanessa:

- consentimento operacional;
- marketing;
- imagem/publicação.

Não declarar compliance legal automático.

O modelo compartilhado precisa suportar finalidade, versão, timestamp, revogação quando aplicável e tenant_id.

Imagens de clientes não devem se tornar mídia pública por simples presença no Git ou Storage.

---

## Supabase / migrations

NÃO criar Supabase exclusivo para Vanessa e NÃO aplicar as migrations do repo Vanessa diretamente em `mmykyzzkcugxunmekwew`.

Primeiro:

1. listar migration history remota;
2. reconciliar com `supabase/migrations` do monorepo e o PR #3 de infraestrutura;
3. gerar gap analysis;
4. criar migrations novas, append-only e genéricas apenas para gaps reais;
5. validar RLS/advisors;
6. executar teste autenticado cross-tenant;
7. validar integração Auth/membership/tenant resolution pelo contrato do SaaS Geral.

Observação de histórico: existe uma migration remota inofensiva `noop_test` criada por uma verificação anterior, contendo apenas `SELECT 1;`. Ela não alterou schema nem dados. Não tentar mascarar nem reescrever history por causa dela; apenas documentar durante a reconciliação.

---

## Plano de execução obrigatório

### Fase 0 — Reconciliação

- confirmar branch e HEAD;
- ler `AGENTS.md`, Toolbox e planejamento mestre;
- auditar `apps/*`, `packages/saas-core`, migrations e CI;
- comparar Vanessa PR #2/#4/#5/#8 com contratos atuais;
- produzir `docs/salon/VANESSA_RECONCILIATION.md` com matriz `REUSE / ADAPT / NEW / DROP`;
- incluir Auth/session/tenant resolution na matriz;
- nenhuma migration destrutiva;
- nenhum merge em main.

### Fase 1 — Vertical salon

- registrar `salon` no contrato/registry do monorepo;
- criar `apps/salon` como vertical white-label;
- preservar visual/UX Vanessa como template, mas desacoplar brand/data;
- integrar tenant resolution e sessão/Auth do SaaS Geral;
- fallback demo deve ser claramente demo e nunca vazar para produção.

### Fase 2 — Booking + staff + CRM

- reutilizar `services`, `staff_resources`, `service_resources`, availability e bookings;
- portar apenas regras ausentes;
- provar cross-tenant real;
- confirmar conflito de agenda no banco.

### Fase 3 — Payments + consent

- generalizar Mercado Pago e payment events para SaaS Core;
- generalizar consentimentos;
- RLS/idempotência/testes reais.

### Fase 4 — Mídia

- conectar media registry/Storage tenant-aware;
- migrar apenas assets autorizados;
- preservar responsive strategy;
- sem `enhanced` automático.

### Fase 5 — Gates

Executar e registrar:

- install;
- lint;
- typecheck;
- unit;
- integration;
- security;
- PostgreSQL/RLS real;
- Auth/session integration;
- cross-tenant;
- build;
- CodeQL;
- dependency audit;
- Lighthouse/a11y do app salon.

### Fase 6 — Preview

Somente depois dos gates:

- projeto de Preview para `apps/salon`;
- Preview primeiro;
- variáveis browser-safe e server-only separadas;
- validar Auth, tenant resolution, booking, RLS, mídia, CSP e webhook;
- Production continua bloqueada até dados comerciais, textos jurídicos e autorização de mídia.

---

## Proibições

- não recriar Supabase separado para Vanessa;
- não criar sistema de usuário/senha exclusivo para Vanessa;
- não aplicar schema Vanessa inteiro sobre o banco compartilhado;
- não duplicar tabelas já existentes;
- não hard-code Vanessa no SaaS Core;
- não publicar mídia sem autorização;
- não inventar preços, endereço, WhatsApp, horários ou claims;
- não usar service role no frontend;
- não persistir passwords/tokens de usuário em mecanismo customizado;
- não enfraquecer RLS/testes para obter PASS;
- não fazer force push;
- não mergear main sem gate e autorização explícita.

---

## Entrega esperada do agente

Ao terminar cada fase, retornar:

- branch / HEAD;
- arquivos alterados;
- migrations criadas/aplicadas;
- contratos Auth/session/tenant reutilizados;
- tabelas/contratos reutilizados;
- testes executados com PASS/FAIL/BLOCKED;
- estado do cross-tenant;
- advisors Supabase;
- riscos;
- pendências externas;
- próximo gate.

A primeira resposta após receber este handoff deve ser somente a **Fase 0 de reconciliação real do estado atual**, sem começar reescrita ou migration antes de validar o que já existe.