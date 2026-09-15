## Objetivo

<!-- O que esta PR altera e por quê? -->

## Escopo

- [ ] SaaS Core
- [ ] Padaria
- [ ] Pet Shop
- [ ] Restaurante
- [ ] LED
- [ ] Máquinas Pesadas
- [ ] Templo/Casa Religiosa
- [ ] Infra/CI/Docs

## Tenant / Security impact

- Dados tenant-owned afetados:
- Permissions/RBAC afetados:
- RLS/policies afetadas:
- Storage/uploads afetados:
- Secrets/integrations afetados:

## Layout preservation

- [ ] Layout não alterado
- [ ] Alteração visual intencional e documentada
- [ ] Mobile validado
- [ ] Reduced motion/a11y considerados

## Migrations

- Migration criada:
- Destrutiva? `NO` por padrão
- Rollback/backup:

## Gates executados

| Gate | Resultado |
| --- | --- |
| install | NOT RUN |
| lint | NOT RUN |
| typecheck | NOT RUN |
| unit | NOT RUN |
| integration | NOT RUN |
| cross-tenant | NOT RUN |
| E2E | NOT RUN |
| build | NOT RUN |
| dependency audit | NOT RUN |

Use somente: `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`, `MISSING`.

## Evidências

<!-- logs, screenshots, comandos, links -->

## Riscos e rollback

<!-- risco objetivo e como reverter -->

## Checklist

- [ ] sem secrets
- [ ] sem dados demo apresentados como reais
- [ ] sem force-push/history rewrite
- [ ] permissions validadas server-side quando aplicável
- [ ] cross-tenant considerado/testado quando aplicável
- [ ] docs/handoff atualizados
