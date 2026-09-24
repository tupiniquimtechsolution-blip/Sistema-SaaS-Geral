# ADR 0002 — Webhook é a autoridade de pagamento

## Status
Aceito

## Contexto
O frontend não pode confirmar pagamento. Mercado Pago assina webhooks com `x-signature` (`ts`, `v1`) e `x-request-id`.

## Decisão
1. Verificar HMAC-SHA256 do manifesto oficial.
2. Buscar o pagamento em `GET /v1/payments/{id}`.
3. Aplicar estado em `apply_payment_event` (transação, idempotência por `provider + provider_event_id`, preço do agendamento).

## Consequências
Eventos duplicados retornam `duplicate: true`. Divergência de valor aborta com `price_mismatch` e não confirma o horário.
