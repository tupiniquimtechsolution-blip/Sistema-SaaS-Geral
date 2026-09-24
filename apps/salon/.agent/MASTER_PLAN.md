# MASTER_PLAN.md — Vanessa Braz

## FASES

### FASE 0–6 — Frontend editorial ✅
Direção editorial e acervo fornecido preservados. Claims públicas e comerciais sem confirmação foram neutralizadas, sem redesenho.

### FASE 7 — Backend + Supabase 🟡
- [x] Schema PostgreSQL versionado
- [x] Migrations
- [x] RLS default-deny e cenários reais para anon, customer A, customer B e admin
- [x] RPC de agendamento com preço server-side
- [ ] `supabase db push` em projeto hospedado (INTEGRATION_PENDING)

### FASE 8 — Pagamentos 🟡
- [x] PaymentProvider e DemoProvider
- [x] MercadoPagoProvider: HMAC oficial `ts`/`v1` + `x-request-id`
- [x] `data.id` canônico da URL da notificação; divergência com body é recusada
- [x] Consulta autoritativa `GET /v1/payments/{id}` para status e valor
- [x] `apply_payment_event` com aquisição atômica por `provider + event_id`
- [x] Teste de concorrência real PostgreSQL: uma aplicação e uma resposta duplicada
- [ ] Credenciais sandbox reais, URL registrada e teste ponta a ponta (INTEGRATION_PENDING)

### FASE 9 — Segurança + LGPD 🟡
- [x] Audit log
- [x] Consentimentos separados
- [x] Conteúdo público sem preços, procedimentos, resultados, espaço físico ou condições não confirmadas
- [ ] Exportação / exclusão
- [ ] Rate limiting / CSP no deploy

### FASE 10 — Testes 🟡
- [x] Unit / integration / security / e2e lógico
- [x] PostgreSQL real no CI com `DATABASE_URL` obrigatório
- [x] Concorrência de idempotência testada com duas conexões reais
- [ ] Playwright contra projeto hospedado

### FASE 11 — Polimento 🟡
- [x] Conteúdo legal e comercial marcado como pendente de confirmação
- [ ] Conteúdo final aprovado pela responsável

### FASE 12 — Deploy ⏳
- [ ] Ambiente Supabase e Edge Function configurados
- [ ] Domínio, CSP, rate limiting e observabilidade configurados

### FASE 13 — GitHub 🟡
- [x] Repositório conectado
- [x] CI, CodeQL e Dependabot configurados
- [x] CI e CodeQL dos commits de código confirmados no GitHub (PR #3)
- [ ] Proteção de `main` após auditoria

## STATUS ATUAL
Bloqueios de código desta revisão concluídos e validados localmente. Aguardar CI e CodeQL reais do HEAD publicado. Sem merge em `main`.
