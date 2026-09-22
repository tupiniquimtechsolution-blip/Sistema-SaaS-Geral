# Roadmap, fases, waves e matriz de tarefas

Data: 22/09/2026. Estados: PASS / FAIL / BLOCKED / NOT RUN / MISSING e status Agenor.

## Fase 0 — Governança e fundação

**Objetivo:** fonte de verdade, monorepo, Toolbox, segurança, tenancy e contratos centrais.

- Monorepo canônico: PASS.
- Toolbox versionado: PASS.
- SaaS Core unit: PASS 86/86.
- Database package: PASS 3/3.
- Auth package: PASS 3/3.
- Tenancy package: PASS 13/13.
- Cross-tenant DB real: PASS 58/58.
- Storage tenant-aware: PASS 42/42.
- Secret scan: PASS.

**Status:** concluída para a fundação; continua sujeita a regressão em cada release.

## Fase 1 — Verticais de referência

- Bakery: EM ANDAMENTO — fechar ciclo completo tenant→config→site.
- Pet: código pronto; smoke consolidado final pendente.
- Restaurant: código pronto; smoke consolidado final pendente.
- MetalArt: código pronto; matriz final de hosting precisa ser reconciliada.
- Heavy Machinery: código pronto; matriz final de hosting precisa ser reconciliada.
- Religious House: standalone publicado; importação SaaS pendente.
- Salon: Vanessa standalone atualizado; integração no Core pendente.
- LED: repo canônico localizado, mas vazio — BLOCKED_LED_SOURCE_CONTENT_EMPTY.

## Fase 2 — Site Builder / Preview Studio

1. especificar contratos de draft/configuração;
2. scaffold seguro do app;
3. seleção tenant/vertical;
4. Brand Studio: logo, cores, fontes, favicon;
5. CMS: páginas, seções, textos, CTA;
6. Media Manager tenant-aware;
7. contato/integrations: WhatsApp, Instagram, Maps etc.;
8. autosave/draft revisionado;
9. preview privado por revision;
10. aprovação;
11. publish request auditável;
12. rollback para revision publicada anterior.

**Status:** EM ANDAMENTO (arquitetura + scaffold documental iniciados nesta wave). Persistência real ainda NOT RUN.

## Fase 3 — Onboarding sem fork

Fluxo alvo: `criar tenant → selecionar vertical → escolher plano → aplicar entitlements → branding/conteúdo/mídia → preview → domínio → publicar`.

Critério: nenhum passo ordinário exige copiar repositório ou editar código específico do cliente.

## Fase 4 — Salon e Religious House

### Salon
Usar Vanessa Braz como tenant/template de referência. Seguir Issue #4/PR #5: `REUSE / ADAPT / NEW / DROP`, sem aplicar migrations Vanessa diretamente no Supabase compartilhado.

### Religious House
Preservar standalone publicado; importar/reconciliar source real em `apps/religious-house`; dados religiosos sensíveis continuam com entitlement + permission + RLS reforçados.

## Fase 5 — Billing, domínios e publicação

- provider de billing: BLOCKED por credencial/decisão de provider;
- webhook idempotente: contrato unitário já existe, integração externa pendente;
- upgrade/downgrade/cancelamento: pendente;
- domínio/SSL automático: pendente;
- Cloudflare durable release matrix: pendente de fechamento consolidado.

## Fase 6 — Release comercial

- E2E crítico: NOT RUN consolidado;
- lint consolidado: NOT RUN no último handoff canônico;
- a11y WCAG 2.2 AA: NOT RUN consolidado;
- Lighthouse/performance: NOT RUN consolidado;
- observabilidade operacional: parcialmente implementada, release gate pendente;
- termos/privacidade/LGPD comercial: documentação/gates pendentes;
- primeiro tenant vendido e provisionado pelo fluxo padrão: NOT RUN.

## Backlog Agenor canônico

| # | Tarefa | Status | Prioridade |
|---:|---|---|---|
| 1 | Fechar Bakery ponta a ponta | Em Andamento | Crítica |
| 2 | Localizar repo LED | **Concluída** — repo `tupiniquimtechsolution-blip/LED` encontrado | Alta |
| 3 | Validar SaaS Core e isolamento | Concluída | Crítica |
| 4 | Consolidar Pet/Restaurant/Máquinas/Religious | Em Andamento | Alta |
| 5 | Site Builder / Preview Studio | Em Andamento | Crítica |
| 6 | Importar Religious House | A Fazer | Alta |
| 7 | Integrar Vanessa em Salon | Em Andamento | Crítica |
| 8 | Fechar deploy matrix Cloudflare + smoke | A Fazer | Crítica |
| 9 | Onboarding comercial sem fork | A Fazer | Crítica |
| 10 | Billing/ciclo de assinatura | A Fazer | Alta |
| 11 | Domínio customizado + SSL | A Fazer | Alta |
| 12 | E2E/a11y/Lighthouse/security/regression | A Fazer | Alta |
| 13 | Pacote comercial + primeiro onboarding | A Fazer | Alta |
| 14 | Obter/popular código fonte do LED no repo canônico | **Bloqueada** | Alta |
| 15 | Consolidar Bíblia/documentação/modelo comercial v1 | Concluída após commit desta wave | Alta |

## Pendências que impedem “comercializável”

#5, #7, #9 e #8 são o caminho crítico imediato. #10–#13 encerram monetização/release. #14 bloqueia apenas o vertical LED e não precisa bloquear a venda dos demais verticais.
