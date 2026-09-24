# ADR 0001 — Supabase Auth + RLS default-deny

## Status
Aceito

## Contexto
O frontend baseline autenticava em localStorage. Isso não atende LGPD nem impede IDOR.

## Decisão
Usar Supabase Auth. A aplicação não armazena senha. Toda tabela pública tem RLS + FORCE. Clientes só leem os próprios dados. Admin exige `profiles.role = 'admin'`.

## Consequências
Login/agenda reais exigem projeto Supabase. Sem credenciais, o catálogo público não inventa preços.
