# Governança, Risco, Segurança, Privacidade e Release

**Checkpoint:** 2026-09-22

## 1. Modelo de governança

### Fonte de verdade por camada

- **GitHub:** código, migrations, PRs, CI, ADRs e evidência técnica.
- **Supabase:** estado real de schema, RLS, Storage, Auth e advisors.
- **Notion:** projeto, backlog numerado, documentação operacional e decisões de gestão.
- **Miro:** espelho visual de fases, dependências e status.
- **Agenor:** protocolo que mantém Notion/Miro coerentes com a evidência atual.

Nenhuma ferramenta de planejamento pode substituir evidência de execução.

## 2. RACI mínimo

| Atividade | Owner do produto | Agente/Engenharia | Cliente/Tenant | Jurídico/Contábil quando aplicável |
|---|---|---|---|---|
| visão/priorização | A/R | C | C | I |
| arquitetura/core | A | R | I | I |
| segurança/isolamento | A | R | I | C |
| branding/conteúdo tenant | A | C | R/A pela veracidade | I |
| publicação de mídia | A | C | R pela autorização | C |
| preço/tabela | A | C | C via pesquisa | C |
| termos/privacidade | A | C | I | R/C |
| deploy/release | A | R | I | I |
| incident response | A | R | I/C | C quando necessário |

`R=Responsible`, `A=Accountable`, `C=Consulted`, `I=Informed`.

## 3. Gestão de mudanças

Toda mudança relevante deve ter:

- issue/task identificável;
- branch isolada;
- escopo explícito;
- teste proporcional ao risco;
- PR;
- CI real;
- risco/rollback;
- atualização documental/handoff.

Proibido usar force push/reset destrutivo como rotina ou enfraquecer testes apenas para obter verde.

## 4. Segurança — baseline obrigatório

- default deny;
- tenant_id + membership/permission server-side;
- RLS em tabelas tenant-owned;
- cross-tenant negative tests;
- service role somente server-side;
- secrets fora do Git/bundle público;
- validação de entrada;
- idempotência de webhooks/eventos;
- rate limiting/anti-abuse;
- CSP e headers compatíveis;
- uploads validados por ownership, tamanho, tipo e metadados;
- logs sem secrets/PII desnecessária;
- dependabot/audit/CodeQL;
- backups e processo de restore proporcional ao estágio do produto.

## 5. Threats que devem continuar no radar

- IDOR/BOLA entre tenants;
- escalada de papel/permissão;
- bypass de RLS via service role mal usado;
- webhook replay/falsificação;
- double booking/race condition;
- manipulação de preço no client;
- upload malicioso;
- XSS em conteúdo configurável;
- SSRF em integrações/URLs;
- open redirect;
- vazamento de mídia privada;
- segredo em logs/builds;
- dependência comprometida;
- domínio customizado apontado para tenant errado.

## 6. LGPD / privacidade por design

A plataforma deve distinguir:

- dado operacional necessário ao serviço;
- dado de marketing;
- consentimento de imagem/publicação;
- dados sensíveis, especialmente religião/saúde quando algum vertical tocar essas categorias.

Controles técnicos recomendados:

- minimização;
- purpose tagging quando necessário;
- versionamento de consentimento;
- timestamps e revogação;
- acesso por função;
- retenção definida;
- exportação/correção/exclusão conforme base/obrigação aplicável;
- audit trail;
- storage público/privado explícito.

**Não declarar conformidade jurídica automática.** Textos/fluxos precisam de validação adequada ao negócio e ao tratamento realizado.

## 7. Governança de mídia

Estados diferentes:

1. `TECHNICALLY_VALID` — arquivo/derivado funciona;
2. `VISUALLY_APPROVED` — qualidade visual aprovada;
3. `PUBLICATION_AUTHORIZED` — existe autorização/base para uso público.

Nunca promover 1 ou 2 para 3 automaticamente.

## 8. Gate de PR

Antes de pronto para review:

- escopo confere com issue/task;
- não há secrets;
- lockfile coerente;
- lint/typecheck/test/build;
- security tests quando aplicável;
- migrations append-only e revisadas;
- RLS/cross-tenant quando dados privados mudarem;
- a11y/performance quando UI mudar;
- docs atualizados;
- rollback/impacto documentados.

## 9. Gate de release candidate

Executar no RC:

- install locked;
- lint;
- typecheck;
- unit;
- integration;
- PostgreSQL real nos fluxos críticos;
- RLS/cross-tenant;
- security regression;
- E2E dos fluxos críticos;
- build;
- CodeQL;
- dependency audit;
- secret scan;
- a11y;
- Lighthouse/Core Web Vitals;
- smoke em Preview;
- domínio/SSL quando aplicável;
- observabilidade/logs;
- rollback testável.

## 10. Gate de produção

Produção requer:

- RC verde;
- ambiente/secrets corretos;
- migration plan;
- backup/restore apropriado;
- conteúdo comercial confirmado;
- mídia autorizada;
- termos/políticas publicados quando exigidos;
- billing coerente;
- dono do release identificado;
- plano de rollback;
- monitoramento pós-deploy.

## 11. Gestão de incidentes

Se incidente de segurança, isolamento ou pagamento:

1. conter o impacto;
2. preservar evidências/logs;
3. revogar/rotacionar segredo quando necessário;
4. identificar tenants/usuários afetados sem especulação;
5. corrigir em branch/PR com teste de regressão;
6. documentar root cause e ações preventivas;
7. avaliar obrigações de comunicação com responsável jurídico/privacidade.

## 12. Registro de riscos

| Risco | Impacto | Estado | Mitigação |
|---|---|---|---|
| Builder ainda inexistente | alto comercial | aberto | task #5 crítica |
| verticais incompletos | alto | aberto | tasks #1/#4/#6/#7 |
| source LED desconhecida | médio/alto | bloqueado | task #2 |
| billing ainda não fechado | alto comercial | aberto | task #10 |
| onboarding depende de trabalho manual | alto escala | aberto | tasks #5/#9 |
| domínio/SSL não automatizado | médio/alto | aberto | task #11 |
| pricing ainda sem validação cliente | alto comercial | aberto | task #14 |
| mídia Vanessa sem autorização confirmada | alto publicação | aberto | publication gate independente |
| textos comerciais/jurídicos variam por tenant | médio/alto | aberto | confirmação + revisão apropriada |
| infra free pode ser insuficiente para produção | médio | monitorar | orçamento Pro/escala + métricas reais |

## 13. ADRs obrigatórios para mudanças estruturais

Criar/atualizar ADR quando houver:

- mudança de tenant resolution;
- novo provider crítico;
- novo modelo de billing;
- mudança de storage público/privado;
- novo modelo de consentimento;
- alteração de estratégia de deploy/domain;
- split de banco/projeto Supabase;
- mudança de monorepo/build system.

## 14. Cadência de auditoria

- por PR: checks de código/segurança;
- semanal enquanto Wave ativa: blockers e risks;
- antes de release: auditoria completa;
- após DDL relevante: Supabase Security/Performance Advisors;
- após incidentes: postmortem e teste de regressão;
- trimestral quando comercial: revisão de acesso, custos, dependências e política de retenção.
