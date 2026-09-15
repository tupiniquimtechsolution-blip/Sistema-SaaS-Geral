# PHASE 0.1 — FOUNDATION CORRECTION · CHECKPOINT

**Projeto-alvo do sprint:** CRM Tupiniquim (Prisma + NextAuth + pnpm)
**Repositório auditado:** `sandbox-workspace` (workspace atual desta sessão)
**Veredito:** ⛔ **NOT READY FOR PHASE 1 — bloqueio de contexto** (detalhes na §1)

---

## 1. Bloqueio principal: divergência de repositório

O diagnóstico da Fase 0 referenciado pelo sprint descreve um projeto que **não existe
neste workspace**. Evidências coletadas por auditoria direta (não por suposição):

| Artefato esperado pela Fase 0 | Estado encontrado |
|---|---|
| `packageManager: pnpm@11.16.0` em package.json | ❌ Campo inexistente |
| `pnpm-lock.yaml` | ❌ Inexistente — lockfile é `package-lock.json` (npm, v3) |
| Prisma (`prisma/schema.prisma`, migrations, `@prisma/client`) | ❌ Nenhum arquivo, nenhuma dependência, nenhum script `prisma:*` |
| `DATABASE_URL` / uso de banco | ❌ Zero ocorrências em código-fonte |
| `SEED_ADMIN_PASSWORD` (seed com fallback inseguro) | ❌ Zero ocorrências |
| `AUTH_SECRET` / NextAuth / `JWT_SECRET` | ❌ Zero ocorrências |
| `.env.example` | ❌ Inexistente |
| Scripts `lint`, `test`, `prisma:generate` | ❌ Inexistentes — apenas `dev`, `build`, `typecheck` |
| Relatório de instalação "1 moderate + 7 high" | ❌ Não reproduzível — o relatório deste workspace indicou **3 moderate** (npm registry, instalação de `gsap`/`lenis` em sessão anterior) |
| `.gitignore` | ❌ Inexistente — **corrigido neste sprint** (§6) |

O workspace contém um **site institucional/catálogo front-end** (Vite 6 + React 18 +
Tailwind v4 + react-router), estático, sem camada de servidor, sem ORM e sem autenticação.

> **Decisão:** não foi fabricada uma fundação inexistente (criar Prisma/seed/auth do zero
> seria scaffold de Fase 1, explicitamente vedado pelo sprint). Nenhum comando destrutivo
> foi executado. Nenhum lockfile foi trocado ou gerado.

---

## 2. Ambiente — antes → depois

| Item | Antes | Depois |
|---|---|---|
| Projeto | `sandbox-workspace` (site estático Vite/React) | Idem (inalterado) |
| Node | **Indetectável** — este ambiente não expõe shell (`node --version` indisponível nas ferramentas). O manifesto do projeto não declara `engines`. | Idem |
| Package manager oficial | **npm** (implícito; `package-lock.json` presente, v3) | Idem — nenhum lockfile concorrente criado |
| Banco de dados | Nenhum | Nenhum |
| Prisma | Ausente | Ausente (não instalado — não faz parte deste projeto) |
| Variáveis de ambiente | Nenhum arquivo `.env*`; o app **não lê nenhuma env var** | Idem |
| `.gitignore` | Ausente (segredos não protegidos) | **Criado** com `.env`, `.env.local`, `.env.*.local`, `.backups/`, chaves, logs, caches |
| `.env.example` | Ausente | **Não criado de forma especulativa** — não há variáveis suportadas hoje; criar uma listaria variáveis fantasmas. Recomendado para quando houver integração real (ver §8) |

---

## 3. Segredos — auditoria

Varredura regex por `SEED_ADMIN_PASSWORD|AUTH_SECRET|DATABASE_URL|JWT_SECRET|NEXTAUTH|
prisma|next-auth|ADMIN_PASSWORD|password` em todo o tree:

- **Código-fonte (`src/`):** zero ocorrências de segredos ou fallbacks de credencial.
- **Únicas ocorrências:** `node_modules/` e `dist/` (código de terceiros: React, Supabase
  auth-js, Vite, TypeScript libs) — esperado e inofensivo.
- **Histórico Git:** **não auditável** — este ambiente não expõe acesso a `git`.
  Ação recomendada no repositório real do CRM:
  `git log --all -p -S "SEED_ADMIN_PASSWORD" -- '*.ts' '*.js' '*.env*'` e equivalente para
  `AUTH_SECRET`/connection strings. Se houver hit: **rotacionar imediatamente** a credencial
  (tratá-la como vazada), avaliar `git-filter-repo` com aprovação explícita — nunca reescrever
  histórico automaticamente.

## 4. Vulnerabilidades de dependências

- **Não foi executado** `npm audit` / `pnpm audit` — este ambiente não permite shell livre,
  e executar `audit fix`/`update` cegamente violaria o próprio sprint.
- Dado observável mais próximo: a instalação mais recente neste workspace reportou
  **3 moderate** (npm registry) — e não as "1 moderate + 7 high" citadas, o que reforça que
  o relatório da Fase 0 pertence a outro projeto.
- **Plano de auditoria seguro para o repositório real do CRM** (executar lá, nesta ordem):
  1. `pnpm audit --json > audit-phase01.json` (leitura, sem mutação)
  2. Para cada achado, classificar: direta vs. transitiva; severidade; versão afetada;
     fix disponível (`pnpm why <pkg>` para mapear o caminho de dependência)
  3. Aplicar **apenas** fixes compatíveis: `pnpm update <pkg> --filter ...` por pacote,
     seguido de `pnpm run typecheck && pnpm run test && pnpm run build`
  4. **Vedado:** `pnpm audit fix --force`, `pnpm update --latest`, bumps de major sem análise
- Achado de dependência neste workspace: `@supabase/supabase-js@^2.98` é **dependência
  direta não utilizada** pelo site (herança do scaffold). Recomendação: removê-la (reduz
  superfície e bundle) — não executado aqui para não gerar drift de lockfile sem `npm install`
  de verificação no ambiente apropriado. Observação: o pacote emite warning de deprecação
  para Node ≤ 20 — dado útil para a decisão de Node do CRM (alinha-se à meta de Node ≥ 22.13).

## 5. Comandos executados (ferramentas disponíveis)

| Comando equivalente | Resultado |
|---|---|
| `list_files` (tree completo) | ✅ Concluído — inventário da §1 |
| Grep de segredos/fundação em todo o tree | ✅ Concluído — zero hits em fonte |
| Leitura de `package.json` | ✅ Sem `packageManager`, sem engines, scripts: dev/build/typecheck |
| `npm run build` (via ferramenta de build) | ✅ **Sucesso** — 51 módulos, `dist/` gerado, sem erros |
| `pnpm install` / `pnpm run prisma:generate` / `lint` / `test` | ⛔ **Não executáveis** — pnpm/Prisma/ESLint/test-runner não existem neste projeto, e o ambiente não expõe shell |
| `migrate reset` / `db push` / alterações destrutivas | ⛔ Não executados (nem existiria alvo) |

## 6. Arquivos modificados neste sprint

| Arquivo | Ação | Justificativa |
|---|---|---|
| `.gitignore` | **Criado** | Protege `.env`, `.env.local`, `.env.*.local`, `.backups/`, `*.pem`, `*.key`, logs, caches, `node_modules`, `dist`. `.env.example` **não** ignorado. Correção segura e universal. |
| `docs/checkpoints/PHASE-0.1-FOUNDATION.md` | **Criado** | Este documento. |

Nenhum outro arquivo foi tocado. `package.json` e lockfiles permanecem **exatamente** como encontrados.

## 7. Riscos

1. **Risco de contexto (ALTO):** prosseguir para a Fase 1 neste workspace construiria o CRM
   sobre um repositório que é um site institucional — dívida técnica e retrabalho certos.
2. **Sem `engines`/`packageManager` declarados:** qualquer ambiente pode instalar com qualquer
   Node/gerenciador. Para o CRM real: manter `packageManager: pnpm@11.16.0` + `engines.node >=22.13`
   e usar Corepack (`corepack enable && corepack prepare pnpm@11.16.0 --activate`) — **não**
   trocar pnpm por npm como contorno permanente.
3. **Supabase-js órfão** neste workspace aumenta superfície de supply-chain sem utilidade.

## 8. Bloqueios restantes (para declarar READY FOR PHASE 1)

1. **Obter o repositório real do CRM Tupiniquim** neste workspace (ou redirecionar o sprint
   para ele) — pré-condição de todos os itens abaixo.
2. Confirmar Node ≥ 22.13 no ambiente de execução (`node --version`) e ativar pnpm 11.16.0 via Corepack.
3. `pnpm install --frozen-lockfile` → **um único** lockfile (pnpm); remover `package-lock.json` do CRM se existir lá.
4. `DATABASE_URL` disponível → `pnpm run prisma:generate` + `pnpm dlx prisma migrate status`
   (não-destrutivo; **nunca** `migrate reset`/`db push` sem diagnóstico).
5. **SEED_ADMIN_PASSWORD:** exigir variável explícita em seed; sem variável em ambiente
   `production`, o seed deve **falhar** (não usar default). Nunca commitar senha real —
   gerar aleatoriamente no primeiro seed (`crypto.randomBytes`) e exibir **uma única vez**.
6. **AUTH_SECRET:** fallback permitido **apenas** quando `NODE_ENV !== 'production'`;
   em produção, fail-fast no boot com mensagem clara. Gerar com `openssl rand -base64 32`.
7. `.env.example` do CRM classificado em `# REQUIRED` / `# OPTIONAL` / `# FUTURE INTEGRATION` / `# SECRET`, sem valores reais.
8. Executar e anexar: `pnpm install`, `prisma:generate`, `lint`, `typecheck`, `test`, `build`.

---

## RESULTADO DO SPRINT

- ✅ PACKAGE MANAGER: coerente (npm + package-lock.json) — porém **do projeto errado**
- ✅ NODE: manifesto não declara engines; ambiente não auditável por ferramentas disponíveis
- ⛔ PRISMA: inexistente neste repositório
- ✅ ENVIRONMENT: nenhum segredo em fonte; `.gitignore` criado; `.env` real inexistente
- ⚠️ DEPENDÊNCIAS: auditadas por inspeção (sem shell); plano de auditoria formal documentado
- ✅ BUILD: verificado e passando
- ⛔ **NOT READY FOR PHASE 1** — pendente o bloqueio de contexto (§8.1)
