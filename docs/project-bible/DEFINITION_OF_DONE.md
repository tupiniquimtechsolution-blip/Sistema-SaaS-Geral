# Definition of Done — Produto Comercializável

O projeto só pode receber `COMMERCIAL_RELEASE = PASS` quando todos os gates abaixo tiverem evidência real.

## Produto

- [ ] Site Builder funcional: editar branding, textos, mídias, seções, contatos e integrações por tenant.
- [ ] Preview privado/draft antes de publicar.
- [ ] Aprovação/publicação auditável.
- [ ] Novo cliente criado sem fork de repositório.
- [ ] Pelo menos um tenant novo provisionado do zero pelo fluxo padrão.
- [ ] Planos/features/entitlements aplicados ao tenant.
- [ ] Billing real com webhook idempotente e estados de assinatura.
- [ ] Domínio customizado com validação e rollback documentados.

## Segurança

- [x] RLS/cross-tenant DB comprovado no Core.
- [x] Storage tenant-aware comprovado no Core.
- [x] RBAC/entitlements unitariamente cobertos no Core.
- [ ] E2E autenticado cross-tenant final em release candidate.
- [ ] Dependency audit final sem vulnerabilidade crítica aberta injustificada.
- [ ] Secret scan final de repo + bundles.
- [ ] Headers/CSP/cookies/redirects validados em deployment real.
- [ ] Billing signature/replay/idempotency testados end-to-end.

## LGPD

- [ ] Política de privacidade final por produto/tenant.
- [ ] Termos/contrato e responsabilidades de controlador/operador definidos.
- [ ] Retenção/exportação/correção/exclusão documentadas.
- [ ] Consentimento quando aplicável.
- [ ] Publicação de mídia com provenance/licença/autorização.
- [ ] Dados religiosos/sensíveis com gate reforçado e default deny.

## UX / Qualidade

Para cada vertical comercializado:
- [ ] Desktop/mobile/tablet smoke.
- [ ] Navegação/CTA/forms/links.
- [ ] SPA refresh/deep links.
- [ ] Assets/imagens/vídeos sem 404.
- [ ] Console sem erro relevante.
- [ ] Network principal sem 4xx/5xx inesperado.
- [ ] WCAG 2.2 AA crítico.
- [ ] Lighthouse/performance dentro do orçamento definido.
- [ ] Reduced motion e teclado.
- [ ] Identidade visual preservada.

## Operação

- [ ] Runbook de deploy.
- [ ] Runbook de rollback.
- [ ] Backup/restore validado.
- [ ] Observabilidade/log sanitizado.
- [ ] Matriz de ambientes/envs.
- [ ] Inventário de domínios/Workers.
- [ ] Suporte/SLA por plano.
- [ ] Incident response mínimo.

## Comercial

- [ ] Pricing aprovado internamente.
- [ ] Limites e add-ons documentados.
- [ ] Proposta/contrato/onboarding padronizados.
- [ ] Custos de terceiros transparentes.
- [ ] Política de cancelamento/renovação.
- [ ] Primeiro cliente onboardado e publicado pelo fluxo padrão.

## Regra final

`COMMERCIAL_RELEASE = PASS` somente se todos os itens obrigatórios estiverem `PASS` ou, quando realmente opcionais, explicitamente `N/A` com justificativa.

`NOT RUN` nunca equivale a `PASS`.
