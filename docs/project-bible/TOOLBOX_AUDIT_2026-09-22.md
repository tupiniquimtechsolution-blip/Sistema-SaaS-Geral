# Tupiniquim Toolbox — Auditoria de Aplicação ao SaaS

**Data:** 22/09/2026  
**Skill canônica:** `.agents/skills/tupiniquim-toolbox/SKILL.md`

Este documento converte o baseline do Toolbox em checklist permanente de engenharia para o `Sistema-SaaS-Geral`.

## 1. Reconhecimento

- Branch/HEAD identificados: `freebuff/big-master-wave-01-monorepo`.
- Monorepo: npm workspaces `apps/*` + `packages/*`.
- Lockfile: `package-lock.json` na raiz.
- Cloudflare Workers Static Assets é o alvo de hosting; Vercel permanece rollback.
- Supabase compartilhado permanece backend canônico e não deve ser alterado sem migration/gate explícito.

**Status:** PASS para reconhecimento; working tree local não se aplica a execução via GitHub connector.

## 2. Estrutura profissional de pastas

Padrão canônico:

```text
/
├─ .agents/skills/tupiniquim-toolbox/
├─ .github/workflows/
├─ apps/
│  ├─ platform/              # control plane interno
│  ├─ builder/               # Site Builder / Preview Studio
│  ├─ bakery/
│  ├─ pet/
│  ├─ restaurant/
│  ├─ metalart/
│  ├─ heavy-machinery/
│  ├─ salon/
│  ├─ religious-house/
│  └─ led/
├─ packages/
│  ├─ saas-core/
│  ├─ database/
│  ├─ auth/
│  └─ tenancy/
├─ supabase/
│  ├─ migrations/
│  └─ seed.sql
├─ scripts/
├─ infra/
└─ docs/
   ├─ project-bible/
   ├─ prompts/
   ├─ migrations/
   ├─ handoffs/
   └─ runbooks/
```

Regras:
- lógica reutilizável em `packages/`, não copiada entre verticais;
- dados/configuração do cliente devem ser tenant-aware, não novos diretórios por cliente;
- `apps/platform` controla; `apps/builder` edita; verticais renderizam;
- secrets nunca em `apps/*` nem em documentos versionados.

## 3. White-label

Obrigatório por tenant:
- logo/favicons;
- paleta/tokens semânticos;
- tipografia;
- imagens/vídeos;
- contatos e redes sociais;
- endereço/horário;
- CTAs;
- páginas/seções;
- integrações;
- feature entitlements.

**Gate:** nenhuma personalização ordinária deve exigir `if tenant === ...` ou fork.

## 4. Segurança

Evidência já registrada:
- SaaS Core unit: PASS 86/86;
- cross-tenant database: PASS 58/58;
- storage: PASS 42/42;
- default deny/RBAC/entitlements: evidências documentadas;
- secret scan de artefatos auditados: PASS.

Pendente antes da venda:
- E2E crítico completo: NOT RUN;
- dependency audit final da wave: NOT RUN;
- headers/CSP por deployment final: NOT RUN;
- billing provider signature/end-to-end: BLOCKED/NOT RUN;
- restore/backup operacional: deve ser reconfirmado no gate final.

## 5. LGPD

- Minimização e finalidade: obrigatórias.
- Dados religiosos: gate reforçado, default-off por entitlement/permissão.
- Dados de clientes finais: evitar PII em logs/analytics.
- Media consent/publication authorization: separar de disponibilidade técnica do arquivo.
- Direito de correção/exclusão/exportação: requisito de produto onde aplicável.

## 6. Qualidade

Todo app promovido a `COMMERCIAL_READY` deve registrar:
- `lint`;
- `typecheck`;
- unit;
- integration;
- E2E;
- negative cross-tenant quando houver dados privados;
- build;
- dependency audit;
- secret scan;
- a11y WCAG 2.2 AA;
- Lighthouse/performance;
- smoke de rotas/assets/refresh/console/network.

Nunca enfraquecer teste para obter verde.

## 7. Performance e mídia

- responsive images/srcset;
- lazy loading fora do LCP;
- preload somente de ativos LCP justificados;
- limitar vídeo/background pesado;
- respeitar `prefers-reduced-motion`;
- não remover mídia legítima para contornar limitações temporárias de deploy;
- manter provenance e autorização de publicação.

## 8. Gate de release comercial

Release pago exige todos:
1. auth real;
2. RBAC real;
3. tenant isolation provada;
4. storage tenant-aware;
5. admin protegido;
6. audit log;
7. backup/restore validado;
8. CI/gates finais;
9. E2E crítico;
10. observabilidade;
11. billing/entitlements coerentes;
12. onboarding sem fork;
13. Builder/preview tenant-aware;
14. documentação operacional/comercial/LGPD;
15. nenhum segredo/dado demo indevido.

## Resultado da auditoria atual

`TOOLBOX_BASELINE_PRESENT = PASS`  
`CORE_SECURITY_EVIDENCE = PASS`  
`COMMERCIAL_RELEASE_GATE = NOT READY`

Motivos principais: Builder funcional, onboarding, billing, domínio operacional, verticais incompletos, E2E final e primeiro tenant comercial ainda pendentes.
