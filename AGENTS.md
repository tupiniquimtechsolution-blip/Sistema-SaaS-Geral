# AGENTS.md — Sistema SaaS Geral

## Fonte de verdade

Este repositório é o monorepo canônico do **Tupiniquim Vertical SaaS**. Leia antes de qualquer alteração:

1. este `AGENTS.md`;
2. `.agents/skills/tupiniquim-toolbox/SKILL.md`;
3. `SECURITY.md`;
4. `docs/PLANEJAMENTO_MESTRE_TUPINIQUIM_VERTICAL_SAAS.md`;
5. `docs/MIGRATION_MANIFEST.md`;
6. documentação específica do vertical alterado;
7. código e testes atuais.

Código executável e migrations validadas prevalecem sobre documentação histórica. Divergências devem ser registradas, nunca resolvidas silenciosamente.

## Regra de continuidade

Não reinicie o projeto. Não recrie layouts existentes por preferência estética. Preserve o comportamento visual e comercial de cada site de origem durante a migração para a engrenagem SaaS.

## Verticais

- `apps/bakery` — origem: `PadocaAppPremium`;
- `apps/pet` — origem: `SitePetPremium`;
- `apps/restaurant` — origem: `RestauranteSite`;
- `apps/led` — origem pendente de identificação canônica;
- `apps/heavy-machinery` — origem: `BigMachines`;
- `apps/religious-house` — origem: `TemploCabocloTupinamba-FlechaDourada`.

## Arquitetura obrigatória

Um único SaaS Core + módulos compartilhados + vertical packs. Novo cliente = novo tenant, não novo fork.

Personalizações de marca, paleta, tipografia, mídia, contatos, domínio, páginas e módulos devem ser dados/configuração por tenant.

## Segurança obrigatória

- autenticação não equivale a isolamento;
- toda informação pertencente ao cliente deve possuir escopo de tenant server-side;
- RBAC/permissions validados no servidor;
- RLS/políticas equivalentes com default deny;
- testes negativos cross-tenant;
- secrets nunca no Git nem no frontend;
- uploads validados e tenant-aware;
- storage privado para conteúdo privado;
- rate limiting em auth, formulários públicos, uploads, webhooks e endpoints caros;
- audit log para ações privilegiadas;
- menor privilégio para banco, CI, storage e integrações;
- migrations destrutivas exigem diagnóstico, backup e rollback.

## Git

Proibido sem autorização explícita:

- `git reset --hard`;
- `git clean -fd`;
- `push --force`;
- reescrever histórico;
- apagar branches de origem;
- migrations destrutivas em produção.

Trabalhar em branch dedicada e PR. `main` é canônica/releasable quando os gates estiverem verdes.

## Migração dos repositórios legados

Os repositórios de origem devem permanecer intactos durante a importação. A migração é inicialmente **copy + reconcile + validate**, não delete/move destrutivo. Só considerar descontinuação/arquivamento de origem após equivalência funcional comprovada no monorepo.

Preservar:

- layout e UX atuais;
- assets legítimos;
- documentação útil;
- apresentações PDF;
- histórico de decisões relevante;
- integrações legítimas;
- particularidades de cada vertical.

Não copiar:

- `node_modules`;
- builds gerados (`dist`, `.next`, etc.);
- caches;
- secrets;
- arquivos temporários;
- dados fictícios apresentados como reais.

## Gates

Quando aplicável, executar e registrar:

- install locked;
- lint;
- typecheck;
- unit tests;
- integration tests;
- cross-tenant security tests;
- E2E;
- build;
- dependency audit;
- accessibility;
- performance budget;
- security review.

Estados permitidos: `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`, `MISSING`.

Nunca registrar PASS sem execução.

## Definition of Done

Uma alteração não está concluída apenas porque compila. Deve manter isolamento tenant, permissões, UX do vertical, validação, testes relevantes, documentação e rollback quando necessário.

## Handoff obrigatório

Ao encerrar uma wave/fase relevante, atualizar um handoff com:

```text
PROJETO:
BRANCH:
HEAD:
FASE/STATUS:
ÚLTIMA ALTERAÇÃO:
DECISÕES CONFIRMADAS:
NÃO ALTERAR:
MIGRATIONS:
TESTES/GATES:
SEGURANÇA:
BLOQUEIOS:
PRÓXIMA AÇÃO EXATA:
```
