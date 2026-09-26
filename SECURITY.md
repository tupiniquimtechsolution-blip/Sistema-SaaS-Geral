# Security Policy — Sistema SaaS Geral

## Estado

Este repositório está em migração para um SaaS multi-tenant. Nenhum vertical deve ser tratado como produção SaaS apenas por estar importado no monorepo.

## Princípios

- secrets nunca no Git;
- public browser configuration ≠ privileged configuration;
- autenticação não substitui autorização;
- autorização não substitui isolamento tenant;
- `tenant_id` sem política server-side não é segurança;
- menor privilégio;
- default deny;
- validação de inputs no servidor;
- logs e analytics sem secrets/PII desnecessária;
- audit trail para mutações privilegiadas;
- backups e rollback antes de alterações irreversíveis.

## Gate multi-tenant

Antes de release paga, exigir:

1. tenant canônico e membership real;
2. RBAC/permissions server-side;
3. banco e storage tenant-aware;
4. RLS/políticas equivalentes;
5. testes negativos A→B e B→A;
6. admin autenticado e auditado;
7. rate limiting e anti-abuse;
8. uploads seguros;
9. webhooks assinados/idempotentes;
10. CI/security gates com evidência.

## Threats prioritárias

- cross-tenant data leakage;
- IDOR/BOLA;
- privilege escalation;
- broken access control;
- session/token leakage;
- SQL/injection;
- XSS;
- CSRF quando aplicável;
- SSRF;
- unsafe upload;
- webhook spoofing/replay;
- mass assignment;
- open redirect;
- dependency/supply-chain risk;
- exposure de dados sensíveis em logs/analytics.

## Uploads e mídia

- ownership por tenant;
- visibilidade explícita pública/privada;
- URLs assinadas para privado;
- limite de tamanho/quantidade;
- validação server-side de MIME/extensão e assinatura quando possível;
- nomes seguros;
- executáveis bloqueados;
- lifecycle/retention documentados.

## Billing

Nenhum dado completo de cartão deve ser armazenado pela aplicação. Use provider compatível e mantenha tokens/secrets server-side. Webhooks de billing devem ser autenticados, idempotentes e auditados.

## LGPD

Aplicar minimização, finalidade, retenção e controles de acesso. Dados que revelem religião/participação religiosa devem receber proteção reforçada; narrativas de consultas espirituais não devem ser coletadas por padrão.

## Reporte

Não abra issue pública contendo secrets, payloads exploráveis, dados pessoais ou informações sensíveis de tenants. Use canal privado do proprietário.
