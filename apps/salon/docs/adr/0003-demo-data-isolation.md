# ADR 0003 — Isolamento de dados demonstrativos

## Status
Aceito

## Contexto
`QWEN.md` proíbe inventar procedimento, preço, depoimento e contato. O seed anterior persistia catálogo fictício em produção.

## Decisão
Migrations de produção só gravam a marca confirmada e campos `PENDENTE_DE_CONFIRMACAO`. O catálogo demo vive em `supabase/seed/demo.sql` e só entra no frontend com `VITE_DEMO_CATALOG=true`.

## Consequências
Home/serviços/agenda ficam vazios até o catálogo real existir no banco. Preview local opcional não é fonte de produção.
