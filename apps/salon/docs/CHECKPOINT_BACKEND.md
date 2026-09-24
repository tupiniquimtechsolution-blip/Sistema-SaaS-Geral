# CHECKPOINT — Backend e pagamentos

## BRANCH
`arena/01a0aada-vanessa-braz`

Sem merge em `main`. Sem force push.

## BASE_SHA
`9067422296f98d195e97d5daf175b43628fa2381`

## CHANGESET_DESTA_REVISAO

1. `780a10f` — aquisição atômica de eventos de pagamento e teste PostgreSQL concorrente.
2. `00ebd05` — ID canônico da notificação Mercado Pago e validação URL/body.
3. `167c452` — neutralização de claims públicas sem confirmação.
4. Documentação deste checkpoint e `.agent/STATUS.md` — registrada no commit subsequente.

## SCHEMA_STATUS

- Migrations versionadas incluem `20260916000002_payment_event_concurrency.sql`.
- `apply_payment_event` insere primeiro um evento provisório em `payment_events` com a chave única `(provider, provider_event_id)`.
- A transação que não adquirir a chave retorna `{ ok: true, duplicate: true }`; ela não altera `payments`, `appointments` ou `audit_logs`.
- Erros posteriores fazem rollback da aquisição, permitindo retry legítimo.
- Aplicação em Supabase hospedado: **INTEGRATION_PENDING** (`supabase db push`).

## PAYMENT_WEBHOOK_STATUS

- HMAC Mercado Pago: manifesto oficial `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`.
- A fonte canônica de `data.id` é o query string/URL da notificação.
- Se o body também fornecer `data.id`, qualquer divergência retorna `webhook_payment_id_mismatch` antes da validação HMAC.
- O lookup autenticado `GET /v1/payments/{id}` é a fonte de verdade para ID, status, valor e `external_reference`.
- Credenciais, segredo e URL registrada no Mercado Pago: **INTEGRATION_PENDING**.

## RLS_STATUS

Preservado do HEAD base validado: PostgreSQL real, `DATABASE_URL` obrigatório no CI e cenários transacionais para anon, customer A, customer B e admin. Não há alteração da estratégia de RLS nesta revisão.

## CONTENT_STATUS

Layout, direção editorial e acervo fornecido foram preservados. Claims sobre serviços, produtos, atendimento, resultados, espaço físico, pagamentos, contato e termos foram trocadas por conteúdo condicional ou `PENDENTE_DE_CONFIRMACAO` até confirmação.

## QUALITY_GATES (local, 2026-09-16)

Executado contra PostgreSQL real 15.18 via `DATABASE_URL`:

```text
npm ci                 PASS
npm run lint           PASS
npm run typecheck      PASS
npm test               PASS (36 testes, 12 arquivos)
npm run test:security  PASS (13 testes, 4 arquivos)
npm run test:postgres  PASS (1 teste real, 1 arquivo)
npm run build          PASS
```

## GITHUB_STATUS

Os commits de código desta revisão passaram nos checks reais do PR [#3](https://github.com/tupiniquimtechsolution-blip/Vanessa-Braz/pull/3):

- CI `quality`: [run 35138494872](https://github.com/tupiniquimtechsolution-blip/Vanessa-Braz/actions/runs/35138494872) — **PASS**.
- CodeQL `Analyze (javascript-typescript)`: [run 35138495005](https://github.com/tupiniquimtechsolution-blip/Vanessa-Braz/actions/runs/35138495005) — **PASS**.

O GitHub continua sendo a fonte de verdade para o HEAD de qualquer commit posterior.

## INTEGRATION_PENDING

1. `supabase db push` em projeto hospedado descartável/validado.
2. Credenciais sandbox/produção do Mercado Pago configuradas somente no ambiente server-side.
3. Registro da URL do Edge Function no Mercado Pago e teste de webhook assinado ponta a ponta.
4. Confirmação do catálogo, preços, contato, localização, regras e textos jurídicos.

## RISKS

1. `DATABASE_URL` de testes é destrutiva para os schemas de teste e nunca pode apontar para produção.
2. O endpoint de pagamento não substitui a configuração real de secrets, HTTPS e observabilidade no ambiente hospedado.
3. Conteúdo público continua deliberadamente conservador até a confirmação da responsável.
