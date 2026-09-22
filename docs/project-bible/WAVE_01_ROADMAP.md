# Wave 01 — Roadmap, Fases e Backlog Canônico

**Checkpoint:** 2026-09-22  
**Fonte operacional:** GitHub/evidência técnica → Notion numerado → Miro visual → chat.

## 1. Macro-fases

### Fase A — Fundação e governança
**Objetivo:** estabelecer monorepo, regras, CI, segurança, Supabase multi-tenant e contratos comuns.  
**Estado:** substancialmente concluída; manutenção contínua.

Entregas já evidenciadas:
- monorepo e Toolbox;
- SaaS Core;
- tenancy/Auth/RBAC/entitlements;
- RLS e Storage tenant-aware;
- CI/CodeQL e baseline de segurança;
- Supabase compartilhado;
- control plane publicado.

### Fase B — Fechamento dos verticais
**Objetivo:** integrar cada vertical sem fork e com contratos reais.  
**Estado:** em andamento.

Inclui Bakery, Pet, Restaurant, Heavy Machinery, Religious House, Salon e LED.

### Fase C — Site Builder / Preview Studio
**Objetivo:** permitir customização de tenants sem alteração de código por cliente.  
**Estado:** a fazer; crítica.

### Fase D — Operação comercial
**Objetivo:** onboarding sem fork, billing, domínio, deploy auditável, suporte e pacote comercial.  
**Estado:** a fazer.

### Fase E — Release comercial
**Objetivo:** gates finais e primeiro tenant novo criado pelo fluxo padrão.  
**Estado:** bloqueado pelas fases anteriores.

## 2. Backlog numerado Agenor

| # | Task | Status | Prioridade | Fase | Condição de conclusão |
|---:|---|---|---|---|---|
| 1 | Fechar vertical bakery ponta a ponta no SaaS Core | Em Andamento | Crítica | B | app + contratos Core + dados + deploy/smoke + gates comprovados |
| 2 | Localizar repositório canônico do vertical LED | Bloqueada | Alta | B | fonte canônica identificada e validada antes de importação |
| 3 | Validar contratos compartilhados do SaaS Core e isolamento multi-tenant | **Concluída** | Crítica | A | evidência real de Core/RLS/Storage/cross-tenant registrada |
| 4 | Consolidar contratos dos verticais pet, restaurante, máquinas e casa religiosa | Em Andamento | Alta | B | quatro verticais reconciliados ao Core sem duplicações |
| 5 | Construir Site Builder / Preview Studio multi-tenant | A Fazer | Crítica | C | branding/conteúdo/mídia/seções + preview + aprovação/publicação |
| 6 | Importar Terreiro como vertical religious-house no monorepo | A Fazer | Alta | B | app canônico no monorepo, dados sensíveis protegidos, gates verdes |
| 7 | Integrar Vanessa Braz em apps/salon no SaaS Core | A Fazer | Crítica | B | REUSE/ADAPT/NEW/DROP + app salon white-label + booking/RLS/gates |
| 8 | Fechar matriz de deploys duráveis Cloudflare e smoke tests | A Fazer | Crítica | D | todos os alvos priorizados com deploy repetível, smoke e rollback |
| 9 | Implementar onboarding comercial de tenant sem fork | A Fazer | Crítica | D | tenant criado por configuração, sem cópia de repo/código |
| 10 | Implementar billing e ciclo de assinatura | A Fazer | Alta | D | checkout/provider, webhook, subscription state e entitlements |
| 11 | Automatizar domínio customizado e SSL no Cloudflare | A Fazer | Alta | D | hostname→tenant, validação, SSL, observabilidade e rollback |
| 12 | Executar gates finais E2E, a11y, Lighthouse, segurança e regressão | A Fazer | Alta | E | matriz completa de gates executada no release candidate |
| 13 | Fechar pacote comercial e primeiro onboarding | A Fazer | Alta | E | oferta + contratos operacionais + tenant novo provisionado e publicado |
| 14 | Validar pricing com clientes piloto e fechar tabela comercial | A Fazer | Alta | D/E | 3–5 entrevistas/propostas reais, objeções registradas e preço final aprovado |

## 3. Ordem de execução recomendada pelo protocolo Agenor

A ordem não é puramente numérica. Aplicar:

1. continuar tarefas `Em Andamento` executáveis;
2. priorizar `Crítica` sobre `Alta`;
3. respeitar dependências bloqueantes;
4. usar `Sequência` para desempate.

### Próximo foco prático

- concluir #1 e avançar #4 em paralelo quando não houver conflito;
- #2 permanece bloqueada até aparecer fonte LED confiável;
- iniciar #5 por ser habilitador comercial crítico;
- executar #7 (Salon/Vanessa) com reconciliação antes de migrations;
- fechar #8–#11 para transformar o produto técnico em operação comercial;
- executar #12 como gate de release, não como substituto de testes contínuos;
- #13 e #14 fecham comercialização e validação de preço.

## 4. Dependências principais

```text
Core validado (#3)
 ├─> Verticais (#1/#4/#6/#7)
 ├─> Builder (#5)
 └─> Onboarding (#9)

Verticais + Builder
 ├─> Deploy matrix (#8)
 ├─> Domínio/SSL (#11)
 └─> Primeiro onboarding (#13)

Billing (#10) + Onboarding (#9)
 └─> Oferta comercial real (#13)

Pricing documental
 └─> Validação piloto (#14)
     └─> preço final / aquisição paga

Tudo acima
 └─> Gates finais (#12)
     └─> release comercial
```

## 5. O que já está concluído no programa

- baseline de governança e Toolbox;
- arquitetura multi-tenant compartilhada;
- Supabase de plataforma provisionado;
- contratos centrais de identidade/tenancy/entitlements;
- evidências de isolamento técnico registradas;
- control plane operacional publicado;
- estratégia white-label formalizada;
- decisão de Site Builder/Preview Studio formalizada;
- decisão Salon/Vanessa como tenant/template formalizada;
- pipeline de mídia Vanessa auditado tecnicamente;
- documentação de pricing e economia unitária criada neste ciclo.

## 6. O que NÃO está concluído

- produto comercial completo;
- Builder/Preview Studio;
- integração de todos os verticais prioritários;
- Salon em `apps/salon`;
- source LED;
- onboarding sem fork ponta a ponta;
- billing real;
- domínio customizado/SSL automatizado;
- pacote jurídico/privacidade final;
- autorização de mídia dos tenants que dependem dela;
- release candidate com gate final completo;
- primeiro tenant novo provisionado pelo fluxo padrão;
- preço final validado por mercado real.

## 7. Gate de mudança de status

Uma task só muda para `Concluída` quando o critério de conclusão está atendido e há evidência proporcional ao risco. Documentação produzida pode concluir tarefas documentais; não conclui automaticamente implementação, integração, compliance, publicação ou venda.
