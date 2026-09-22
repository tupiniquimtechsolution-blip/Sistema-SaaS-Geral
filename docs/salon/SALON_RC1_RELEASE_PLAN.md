# Salon / Vanessa Braz — Release Candidate 1

Target técnico: **`salon-v1.0.0-rc.1`**  
App: `apps/salon`  
Tenant/template de referência: **Vanessa Braz — Beleza & Autoestima**  
Branch: `chatgpt/integrate-salon-vanessa`  
Base: `freebuff/big-master-wave-01-monorepo`  
Supabase canônico: `mmykyzzkcugxunmekwew` (`sa-east-1`)  
Status inicial: **RC IN PROGRESS**

> RC significa feature-complete para o escopo acordado e apto a validação de release. Não significa GA, publicação definitiva, conformidade jurídica automática ou autorização de mídia. Nenhum merge em `main` deve ocorrer antes dos gates bloqueantes abaixo.

## 1. Escopo congelado do RC1

O RC1 conclui o **site do salão** e sua integração mínima real ao SaaS Core, preservando a direção visual Vanessa já validada. Não é uma nova wave de redesign.

Incluído:

- Home/hero premium responsiva;
- Serviços reais do tenant;
- Galeria/mídia somente quando autorizada;
- CTA e WhatsApp confirmados;
- Instagram confirmado;
- contato/endereço sem completar dados ausentes por inferência;
- booking completo serviço → profissional → data → horário → identificação → revisão → confirmação;
- autenticação/conta quando necessária ao fluxo;
- tenant resolution real e fail-closed em live;
- brand/theme/settings vindos do SaaS Core;
- serviços, profissionais, disponibilidade e booking compartilhados;
- conflito de agenda impedido no banco;
- RLS/RBAC/cross-tenant real;
- Cloudflare preview/RC HTTPS;
- CI, PostgreSQL real, dependency audit, CodeQL, a11y e Lighthouse;
- documentação de evidência/rollback/known issues.

Ficam fora do RC1 se não estiverem confirmados/configurados:

- serviços/preços/horários inventados;
- cidade/UF/CEP/e-mail inferidos;
- depoimentos/claims promocionais não comprovados;
- publicação automática de fotos com pessoas identificáveis;
- cobrança Mercado Pago live sem credenciais/sandbox validados;
- qualquer `service_role` no browser;
- fork ou regra `if tenant === 'vanessa'`.

## 2. Estado comprovado no início do RC

Checkpoint de código: `59db6b5c7f072811f74194723790268c479f78c5`.

Run `Salon Vanessa Gates` #18 (`35785311397`) no checkpoint:

- `salon-quality`: PASS;
- locked install: PASS;
- Typecheck Salon: PASS;
- Build Salon: PASS;
- Production dependency audit: PASS;
- `salon-postgres-integrity`: PASS;
- tenant integrity / booking overlap em PostgreSQL real: PASS;
- provisioning/registry idempotente: PASS.

Já existe no PR:

- `apps/salon`;
- template/config white-label;
- adapter SaaS Core;
- `wrangler.jsonc` para Cloudflare;
- migration genérica de integridade/overlap de booking;
- migration de registro do vertical `salon`;
- migration de customer booking flow;
- provisioning Vanessa;
- testes PostgreSQL reais;
- workflow dedicado `Salon Vanessa Gates`.

## 3. Blockers reais para RC1

### Gate A — Runtime live público

- [ ] `App.tsx` não pode depender apenas de `getSalonPreviewConfig()` em live.
- [ ] `VITE_DEMO_MODE=false` deve resolver o tenant real sem fallback silencioso para Vanessa preview.
- [ ] Resolução pública deve ser por contrato seguro de hostname/tenant, não por tenant arbitrário escolhido pelo browser.
- [ ] Falha de resolução deve mostrar estado seguro e explícito.
- [ ] Brand/theme/settings do Supabase devem alimentar a UI sem redesign.

### Gate B — Conteúdo real

- [ ] Serviços exibidos vêm de `services` do tenant.
- [ ] Profissionais exibidos vêm de `staff_resources`/`service_resources`.
- [ ] Disponibilidade vem de `availability_rules`/`availability_overrides`.
- [ ] Nenhum preço, horário ou serviço de preview aparece como dado real em live.
- [ ] WhatsApp e Instagram confirmados continuam funcionais.
- [ ] Endereço incompleto continua marcado como parcial até confirmação de cidade/UF/CEP.

### Gate C — Booking ponta a ponta

- [x] Integridade tenant-aware e bloqueio de overlap têm teste PostgreSQL real no branch.
- [ ] Migrations RC necessárias devem ser reconciliadas/aplicadas no Supabase hospedado por forward migration, nunca por replay destrutivo.
- [ ] UI deve consumir serviço → profissional → data → slot reais.
- [ ] Criação de booking deve validar server-side serviço, profissional, tenant e intervalo.
- [ ] Double booking concorrente deve falhar no banco.
- [ ] Confirmação visual só ocorre depois da persistência real.
- [ ] Histórico/status do booking deve ser auditável.

### Gate D — Auth / cliente / CRM

- [ ] Fluxo de identificação/autenticação necessário ao booking deve funcionar no ambiente hospedado.
- [ ] Cliente deve reutilizar `contacts`/perfil compartilhado, sem tabela Vanessa específica.
- [ ] Nenhum cliente do tenant A pode ser lido/escrito pelo tenant B.
- [ ] Bootstrap do owner/admin do tenant Vanessa deve ser seguro e documentado.

### Gate E — Payments

Pagamento não bloqueia o RC visual/booking básico se o tenant operar com agendamento sem cobrança online, mas qualquer UI de pagamento deve refletir somente provider/configuração real.

- [ ] decidir e documentar para RC: `booking sem pagamento online` ou `Mercado Pago sandbox validado`;
- [ ] se Mercado Pago entrar no RC, webhook/idempotência/lookup autoritativo devem usar a capacidade genérica do SaaS Core;
- [ ] nenhuma confirmação de pagamento pode ser simulada como live.

### Gate F — Mídia

Checkpoint técnico do projeto Vanessa já validou WEB-v2/responsivas. Porém:

- [ ] migrar para o tenant apenas mídias autorizadas para publicação;
- [ ] usar Storage/media registry tenant-aware quando a migração ocorrer;
- [ ] preservar responsive strategy;
- [ ] `enhanced` não é promovido automaticamente;
- [ ] pessoas identificáveis continuam bloqueadas até autorização específica.

### Gate G — LGPD / conteúdo jurídico

- [ ] Política/Termos do RC não podem afirmar revisão jurídica inexistente;
- [ ] consentimentos operacional/marketing/imagem devem permanecer separados;
- [ ] export/delete/retention devem ser documentados conforme capacidade realmente disponível;
- [ ] não declarar "LGPD compliant" por decreto.

### Gate H — Segurança

- [ ] hosted Supabase RLS real validado para tabelas Salon críticas;
- [ ] cross-tenant A→B e B→A para serviços/profissionais/slots/bookings/clientes;
- [ ] publishable key somente no browser;
- [ ] `service_role`/secrets ausentes de bundle/Git;
- [ ] CSP/headers do deploy RC validados;
- [ ] rate limiting/hardening das operações públicas críticas documentado;
- [ ] CodeQL GREEN no HEAD final.

### Gate I — UI/UX / performance

- [ ] preservar identidade premium Vanessa sem redesign arbitrário;
- [ ] mobile-first;
- [ ] reduced-motion;
- [ ] navegação por teclado/foco/labels nos fluxos críticos;
- [ ] WCAG 2.2 AA nos pontos críticos;
- [ ] Lighthouse registrado para mobile;
- [ ] sem regressão crítica de LCP/CLS;
- [ ] links WhatsApp/Instagram/Maps sem 404/placeholder enganoso.

### Gate J — Deploy RC

- [ ] deploy Cloudflare do `apps/salon` em URL própria de RC/preview;
- [ ] HTTPS válido;
- [ ] envs browser-safe corretas;
- [ ] smoke: Home → Serviços → Agendar → serviço → profissional → data → slot → identificação → revisão → persistência/resultado;
- [ ] smoke WhatsApp/Instagram/Maps;
- [ ] console/network sem erro crítico;
- [ ] rollback documentado.

### Gate K — Evidência e promoção

- [ ] criar `docs/salon/SALON_RC1_EVIDENCE.md` com SHA final, URL, Supabase ref, migrations, workflow runs, testes, Lighthouse/a11y, smoke, known issues e rollback;
- [ ] atualizar `docs/salon/VANESSA_RECONCILIATION.md` com o estado executado;
- [ ] atualizar Bíblia/Agenor/Notion/Miro depois dos gates reais;
- [ ] PR #5 só sai de draft depois dos blockers RC fecharem;
- [ ] eventual tag será **`salon-v1.0.0-rc.1`**, apenas após evidência final.

## 4. Ordem de execução

1. Reconciliar migrations Salon do branch com o estado remoto do Supabase.
2. Fechar runtime live público e tenant resolution fail-closed.
3. Ligar serviços/profissionais/disponibilidade reais à UI.
4. Fechar booking ponta a ponta e cross-tenant.
5. Definir o escopo de pagamento do RC e remover qualquer ambiguidade da UI.
6. Integrar somente mídia autorizada; manter placeholders seguros onde faltar autorização.
7. Executar segurança, CodeQL, a11y e Lighthouse.
8. Fazer deploy Cloudflare RC e smoke real.
9. Gerar `SALON_RC1_EVIDENCE.md`, known issues e rollback.
10. Somente então marcar PR #5 ready e criar `salon-v1.0.0-rc.1`.

## 5. Stop conditions

Não promover para RC se qualquer condição ocorrer:

- CI/CodeQL vermelho ou pendente no HEAD candidato;
- live usa preview/demo silenciosamente;
- tenant pode ser escolhido arbitrariamente pelo browser sem validação;
- booking confirma antes da persistência real;
- conflito de agenda depende somente da UI;
- vazamento cross-tenant;
- serviço/preço/horário inventado em produção;
- mídia identificável publicada sem autorização;
- secret/service-role no client/Git;
- deploy não possui smoke reproduzível.
