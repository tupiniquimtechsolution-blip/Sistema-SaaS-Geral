# BÍBLIA DO PROJETO — TUPINIQUIM VERTICAL SAAS

**Data-base:** 22/09/2026  
**Repositório canônico:** `tupiniquimtechsolution-blip/Sistema-SaaS-Geral`  
**Branch ativa:** `freebuff/big-master-wave-01-monorepo`  
**Fonte de verdade técnica:** GitHub + evidência executada; Notion e Miro espelham o estado operacional.

## 1. Missão

Construir uma plataforma SaaS white-label multi-tenant para transformar verticais de negócio em produtos configuráveis e comercializáveis sem fork por cliente. O cliente nasce como **tenant + configuração**, reutilizando o mesmo SaaS Core.

## 2. Taxonomia canônica

- **Sistema-SaaS-Geral / Tupiniquim Vertical SaaS:** produto completo.
- **SaaS Core:** contratos compartilhados de tenant, auth, membership, RBAC, RLS, planos, entitlements, CMS, mídia, integrações, auditoria e operação.
- **Control Plane (`apps/platform`):** painel interno de gestão/status. Não é editor visual para clientes.
- **Site Builder / Preview Studio (`apps/builder`, em construção):** edição de branding, conteúdo, mídia, seções e configurações por tenant; preview privado; aprovação; publicação.
- **Vertical:** produto-base por segmento (Bakery, Pet, Restaurant, MetalArt, Heavy Machinery, Religious House, Salon, LED etc.).
- **Tenant:** cliente final configurado dentro de um vertical.
- **CRM Tupiniquim:** aplicação horizontal, não vertical.

## 3. Princípios imutáveis

1. Novo cliente = tenant/configuração, nunca fork ordinário.
2. Layout premium de cada vertical é preservado; SaaS adiciona engrenagem, não redesign arbitrário.
3. Default deny; isolamento server-side; RLS e testes cross-tenant obrigatórios.
4. Dados demonstrativos nunca podem se passar por dados reais.
5. Segredos ficam server-side e fora do Git.
6. Supabase canônico permanece compartilhado salvo decisão explícita de isolamento dedicado.
7. Vercel permanece rollback enquanto a migração Cloudflare não estiver encerrada.
8. DNS/nameserver/domínio real só muda com autorização explícita do owner.
9. Sem force-push, reset destrutivo, migração destrutiva ou enfraquecimento de teste para obter verde.

## 4. Estado comprovado

### Core
- `saas-core`: **86/86 PASS**.
- `database`: **3/3 PASS**.
- `auth`: **3/3 PASS**.
- `tenancy`: **13/13 PASS**.
- banco cross-tenant: **58/58 PASS**.
- storage: **42/42 PASS**.
- secret scan: **PASS**.

Esses gates comprovam a fundação multi-tenant, mas **não significam conclusão comercial total**.

### Verticais
- Bakery: código/preview/integração avançados; fechamento ponta a ponta ainda em andamento.
- Pet: código disponível e deploy previamente validado pelo owner; smoke final consolidado ainda precisa entrar na matriz durável.
- Restaurant: código pronto; validação durável consolidada pendente.
- MetalArt: vertical principal; código pronto; deploy durável informado pelo owner nesta wave, porém matriz final precisa registrar URL/gates.
- Heavy Machinery: código pronto; deploy final/smoke consolidado pendente.
- Religious House: site standalone já publicado; importação/reconciliação como `apps/religious-house` pendente.
- Salon: Vanessa Braz é tenant/template de referência; Issue #4 + PR draft #5 existentes; integração real em `apps/salon` pendente.
- LED: repositório canônico localizado em `https://github.com/tupiniquimtechsolution-blip/LED`; **repo existe, mas está vazio (size=0)**. Bloqueio antigo de localização foi resolvido e substituído por `BLOCKED_LED_SOURCE_CONTENT_EMPTY`.

## 5. Sequência executiva aprovada

`#5 Builder → #9 onboarding → #7 Salon → #6 Religious House → #8 deploy matrix final`.

O Builder é prioridade porque reduz trabalho repetitivo em todos os verticais: branding, conteúdo, mídia, contatos, integrações e publicação passam a ser configurações de tenant.

## 6. Definition of Done comercial

O produto só será declarado comercializável quando:
- onboarding criar tenant sem fork;
- branding/conteúdo/mídia forem editáveis por configuração;
- preview privado e aprovação funcionarem;
- publicação Cloudflare for repetível e auditável;
- planos/entitlements/billing estiverem operacionais;
- domínio/SSL tiverem fluxo operacional;
- smoke/E2E/a11y/performance/security passarem nos verticais vendidos;
- LGPD/termos/privacidade/onboarding/suporte estiverem documentados;
- existir pelo menos um tenant novo provisionado pelo fluxo padrão, sem edição manual de código específica para o cliente.

## 7. Índice documental

- `ARCHITECTURE_AND_STRUCTURE.md` — arquitetura e organização de pastas.
- `ROADMAP_AND_TASKS.md` — fases, waves, concluído, pendente e bloqueios.
- `COMMERCIAL_PRICING.md` — benchmark e hipótese comercial precificável.
- `QUALITY_SECURITY_LGPD.md` — Toolbox, segurança, privacidade e gates.
- `OPERATIONS_AND_RELEASE.md` — onboarding, deploy, rollback, suporte e release.
- `../prompts/SAAS_PROGRAM_MASTER_EXECUTION_PROMPT.md` — prompt operacional master.

## 8. Regra de atualização

Qualquer mudança de estado técnico deve seguir: **GitHub/evidência → Notion/Agenor → Miro → resposta no chat**. PASS sem execução é proibido.
