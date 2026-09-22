# Qualidade, Segurança, LGPD e Tupiniquim Toolbox

Este documento transforma `.agents/skills/tupiniquim-toolbox/SKILL.md` em gate de programa para o SaaS completo.

## Gate obrigatório por alteração

1. Reconhecimento: branch/HEAD, stack, lockfile, CI/deploy, configs/env, migrations, integração e dados afetados.
2. Preservação visual: sem redesign silencioso; corrigir apenas requisito explícito, bug, a11y, responsividade, segurança ou performance.
3. White-label: logo, paleta, tipografia, mídia, contatos, horários, CTA, seções e módulos devem caminhar para configuração tenant-aware.
4. Segurança: default deny, authorization server-side, RLS, testes negativos cross-tenant, validação de schema, upload seguro, anti-XSS/IDOR/SSRF/open redirect/mass assignment/privilege escalation, rate-limit, secrets server-side, webhook signature/idempotência, logs minimizados.
5. LGPD: minimização, finalidade, retenção, exportação/correção/exclusão, consentimento quando necessário, privacy by default e gate reforçado para dado sensível religioso.
6. Qualidade: lint, typecheck, unit, integration, E2E, cross-tenant, build, dependency audit, a11y e performance conforme stack.
7. Performance: code splitting, lazy loading, mídia responsiva/otimizada, sem SDK admin público, meta LCP/INP/CLS saudável.
8. Acessibilidade: WCAG 2.2 AA como meta; teclado, foco, landmarks, labels, contraste, headings, alt, reduced motion e target size.
9. Git: wave branch, commits pequenos, PR antes de main, sem force-push/rewrite/clean destrutivo.
10. Claims: separar verificado/tenant/demo/histórico/inferido; nunca publicar preço, review, certificação ou serviço demo como fato real.

## Matriz atual

| Gate | Estado |
|---|---|
| Auth real | PASS fundação |
| RBAC | PASS fundação |
| RLS cross-tenant | PASS 58/58 |
| Storage tenant-aware | PASS 42/42 |
| SaaS Core unit | PASS 86/86 |
| Secret scan | PASS último registro canônico |
| Builder auth/RBAC/RLS | NOT RUN — Builder ainda em construção |
| Billing provider real | BLOCKED/PENDENTE |
| E2E comercial completo | NOT RUN |
| A11y consolidada | NOT RUN |
| Lighthouse consolidado | NOT RUN |
| Backup/restore operacional validado | PENDENTE |
| Observabilidade/SLA de produção | PENDENTE |

## Gate específico do Builder

- Renderer nunca recebe `service_role`.
- Draft pertence a tenant + usuário/membership autorizados.
- Preview token é curto, revogável e não concede mutação.
- Publish exige permission específica e audit log.
- Media Manager valida ownership tenant, MIME, tamanho e path canônico.
- Config de integração no browser guarda apenas IDs/configuração pública; secrets ficam no backend/provider.
- Qualquer “preview de outro tenant” deve falhar por default.

## Gate de vertical

Cada vertical comercializado deve provar:
- build/typecheck;
- home/assets/rotas/refresh;
- mobile;
- console/network sem erro relevante;
- identidade correta;
- auth/admin protegidos quando aplicável;
- fluxo crítico do segmento;
- nenhum dado demo indevido;
- acessibilidade e performance registradas.

PASS sem evidência é inválido.
