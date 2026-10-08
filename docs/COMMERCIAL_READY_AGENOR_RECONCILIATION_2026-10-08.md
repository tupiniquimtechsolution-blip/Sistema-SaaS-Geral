# Agenor — SaaS Commercial Ready · reconciliação de tarefas

**Data da verificação:** 2026-10-08  
**Estado:** `COMMERCIAL_READY=BLOCKED` (não é aprovação de produção)  
**Fonte operacional:** [Central Tupiniquim / Sites SaaS White Label](https://app.notion.com/p/3de189310488813b8814fc45ff03511b) e sua relação na base [Tarefas](https://app.notion.com/p/88884587a67f4bf6aec63ab5f5606b46).  
**Evidência técnica:** GitHub, PRs e CI; status "Concluída" do Notion refere-se à tarefa delimitada, não ao release comercial inteiro.

## Escopo reconciliado

A base Notion possui 117 tarefas globais na consulta de contagem e **20 registros vinculados diretamente** ao projeto SaaS. O pedido menciona **34 tarefas**: 14 outras **não puderam ser identificadas com vínculo inequívoco** nessa relação. Não criar itens fictícios nem assumir que tarefas de outros projetos são automaticamente parte do SaaS. É necessário identificar a visão/IDs originais dos 14 registros adicionais.

| Sequência | ID Notion | Tarefa (resumo) | Status Notion em 08/10 | Evidência / pendência de release |
|---:|---|---|---|---|
| 1 | TASK-17 | Bakery E2E no SaaS Core | Concluída | Evidências na Wave 01, conferir promoção/integração |
| 2 | TASK-18 | Localizar repo LED | Concluída | Repo encontrado; fonte ausente |
| 3 | TASK-19 | Contratos SaaS Core e isolamento | Concluída | Escopo Core, não release total |
| 4 | TASK-20 | Contratos pet/restaurant/machines/religious | Em Andamento | Religious House pendente |
| 5 | TASK-71 | Builder / Preview Studio | Concluída | Implementação/evidência em branch, não confundir com main |
| 6 | TASK-72 | Importar religious-house | Em Andamento | Source, app, CI, deploy/smoke |
| 7 | TASK-73 | Vanessa em apps/salon | Concluída | RC técnico comprovado; dados comerciais fail-closed |
| 8 | TASK-74 | Cloudflare deploy matrix / smoke | Em Andamento | Heavy Machinery 404 e religious-house |
| 9 | TASK-75 | Onboarding tenant sem fork | Concluída | RPC e QA em branch; validar primeiro cliente |
| 10 | TASK-76 | Billing e assinatura | A Fazer | Stripe Test Mode, webhook assinado, idempotência, entitlements |
| 11 | TASK-77 | Custom domain + SSL | A Fazer | hostname→tenant, SSL, rollback sem DNS não autorizado |
| 12 | TASK-78 | E2E/a11y/Lighthouse/security | A Fazer | Evidência completa same-SHA pré-release |
| 13 | TASK-79 | Pacote comercial e primeiro onboarding | A Fazer | Primeiro tenant **novo** provisionado/publicado pelo fluxo padrão |
| 14 | TASK-80 | Validar preço com pilotos | A Fazer | 3–5 clientes reais, registrar objeções/custos/aceite |
| 15 | TASK-113 | Bíblia / comercial v1 | Concluída | Documentação, pricing segue hipótese |
| 16 | TASK-116 | Bíblia canônica contínua | Concluída | Manutenção contínua exigida |
| 17 | TASK-117 | RC-01 Vanessa | Concluída | QA/registros técnicos; integrações finais em release geral |
| 18 | TASK-112 | Fonte LED no repo | Bloqueada | `BLOCKED_LED_SOURCE_CONTENT_EMPTY` |
| 19 | TASK-114 | Importação executável LED | Bloqueada | `BLOCKED_LED_SOURCE_CONTENT_MISSING`, depende #18 |
| 20 | TASK-115 | Biblioteca visual Vanessa | Concluída | Merge técnico, gates pós-commit sob #7/#8 |

**Integridade da numeração:** o Notion tinha #14 em três páginas e #15 em duas. Em 08/10/2026, os registros TASK-112, TASK-114 e TASK-115 foram **explicitamente migrados** para #18, #19 e #20 (mantidos IDs globais, notas com aliases anteriores). Os IDs #14 pricing e #15 Bíblia foram preservados; não houve mudança de status.

**Contagem exata atual:** 10 concluídas (histórico técnico/documental), 3 em andamento, 5 a fazer, 2 bloqueadas. Não equivale a 10/20 testes de release aprovados.

## Git e release topology, capturado em 08/10

- [PR #19 — UI convergence](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/pull/19): **OPEN**, head `feature/ui-saas-convergence-wave-01@55ae94365a72d1fe1e0d028f4a110ea5e416bda3`, base `chatgpt/release-green-convergence`. Não fundido.
- [PR #18 — release convergence](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/pull/18): **OPEN/DRAFT**, head `chatgpt/release-green-convergence`, base `freebuff/big-master-wave-01-monorepo`. Não fundido.
- [Issue #20 — gates externos](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/issues/20) reúne necessidades Supabase, Stripe, Cloudflare e AI provider.
- Branch `main` somente com README/docs no root; **não representa** o RC validado. Não realizar push/merge/deploy direto em `main` como atalho.
- **Política de hospedagem atual: Cloudflare somente.** Vercel legado proibido como release, preview ou fallback.

## Sequência de execução com critérios de aceite

| Ordem | Gate | Pronto quando |
|---:|---|---|
| 1 | Contratos religious-house + Cloudflare matrix (#4/#6/#8) | app compilável, CI e smoke real de todos os verticais suportados; Heavy Machinery sem 404 |
| 2 | Billing (#10) | Checkout test, webhook assinado, ledger idempotente, ciclo de assinatura persistido, entitlements correlatos (sem autoridade do browser) |
| 3 | Domínio/SSL (#11) | mapeamento tenant-hostname, prova de TLS, rollback, sem alterar DNS alheio sem autorização |
| 4 | Final QA (#12) | lint/typecheck/test/build/e2e/a11y/Lighthouse/security + Cloudflare RC Stage + same-SHA evidence GREEN |
| 5 | Primeiro tenant (#13) | provisionamento, branding/preview, aprovação e publicação repetível, evidência e rollback |
| 6 | Oferta/preços (#14) | 3–5 conversas reais, custos, objeções, aprovação de tabela e consentimentos/mídias |
| 7 | LED (#18/#19) | fonte original recuperada e importada; caso vertical fora do escopo comercial, registrar exclusão explícita |
| 8 | Go/No-Go | checks de billing, auth, RLS, isolamento, LGPD, backup, deploy, rollback e runbook 100% PASS ou N/A justificado |

## Bloqueios externos objetivos

1. **Supabase canônico:** projeto SaaS `mmykyzzkcugxunmekwew` não visível no conector desta sessão; ele expõe apenas **Pausa AI** `bccdypogqyrzmflimlom`. Nenhuma ação SQL/migration foi feita no projeto errado. Nunca aplicar `0001_multi_tenant_schema.sql` ou `supabase db push` às cegas.
2. **Stripe Test Mode:** falta prova de lifecycle via provider conectado/confirmado e webhooks assinados; não inventar credenciais, preços ou assinaturas.
3. **Cloudflare:** Stage/Version URLs e credenciais CI, gates same-SHA e smoke/rollback. Não promover tráfego real antes de QA.
4. **Domínios:** nomes, titularidade e mudanças DNS exigem autorização específica.
5. **Comercial:** cliente/piloto real, tabela validada, autorização de mídias e primeiro onboarding; nunca fabricar evidências.
6. **LED:** código fonte original indisponível; não inventar implementação.

## Evidência e continuidade

- Checkpoint no [Notion](https://app.notion.com/p/3de189310488813b8814fc45ff03511b).
- Espelho no [Miro Central Tupiniquim Visual](https://miro.com/app/board/uXjVHl4fqwQ=/) (comentário no frame Sites SaaS White Label; não equivale a alterar todos os cartões).
- [Issue #20](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/issues/20) atualizada com o estado de bloqueios e integridade das sequências.

**Regra de finalização:** só escrever `COMMERCIAL_READY` depois de CI, billing, Cloudflare, domínio, primeiro tenant e evidência comercial auditável; código que existe em branch ou Notion "Concluída" não é por si só certificação de produção.
