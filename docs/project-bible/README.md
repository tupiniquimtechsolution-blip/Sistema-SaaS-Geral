# Bíblia do Projeto — Tupiniquim Vertical SaaS

**Projeto:** `tupiniquimtechsolution-blip/Sistema-SaaS-Geral`  
**Branch operacional:** `freebuff/big-master-wave-01-monorepo`  
**Atualização:** 22/09/2026  
**Governança:** GitHub/evidência → Notion/Agenor → Miro → chat/handoff.

Esta pasta é o **dossiê canônico do produto**, cobrindo estratégia, arquitetura, segurança, operação, roadmap, preço, riscos e Definition of Done. Documentos históricos fora desta pasta continuam válidos como evidência, mas qualquer conflito de estado atual deve ser reconciliado aqui com GitHub real.

## 1. Visão do produto

O Tupiniquim Vertical SaaS é uma plataforma multi-tenant para lançar e operar sites/aplicações verticais premium, reutilizando um SaaS Core compartilhado.

Princípio central:

> **Novo cliente = tenant + configuração. Nunca fork por padrão.**

Componentes principais:
- `apps/platform`: control plane interno;
- `apps/builder`: Site Builder / Preview Studio;
- `apps/<vertical>`: experiências públicas/operacionais por nicho;
- `packages/*`: contratos compartilhados;
- Supabase: auth/database/storage/RLS;
- Cloudflare: hosting alvo;
- Vercel: rollback temporário durante migração.

## 2. Índice canônico

### Produto, arquitetura e estrutura
- [`ARCHITECTURE_AND_STRUCTURE.md`](./ARCHITECTURE_AND_STRUCTURE.md)
- [`VERTICAL_SOURCE_MATRIX.md`](./VERTICAL_SOURCE_MATRIX.md)
- [`TOOLBOX_AUDIT_2026-09-22.md`](./TOOLBOX_AUDIT_2026-09-22.md)

### Roadmap e execução
- [`ROADMAP_AND_TASKS.md`](./ROADMAP_AND_TASKS.md)
- [`STATUS_AND_WAVE_LEDGER.md`](./STATUS_AND_WAVE_LEDGER.md)
- [`DEFINITION_OF_DONE.md`](./DEFINITION_OF_DONE.md)

### Segurança, LGPD e riscos
- [`QUALITY_SECURITY_LGPD.md`](./QUALITY_SECURITY_LGPD.md)
- [`RISK_DECISION_REGISTER.md`](./RISK_DECISION_REGISTER.md)

### Operação e release
- [`OPERATIONS_AND_RELEASE.md`](./OPERATIONS_AND_RELEASE.md)
- documentos Cloudflare em `docs/CLOUDFLARE_*`
- evidências RLS/storage nos documentos de segurança existentes.

### Comercial
- [`COMMERCIAL_PRICING.md`](./COMMERCIAL_PRICING.md)
- [`COMMERCIAL_OFFER_CATALOG.md`](./COMMERCIAL_OFFER_CATALOG.md)

### Prompt operacional
- [`../prompts/PROJECT_BIBLE_MASTER_EXECUTION_PROMPT.md`](../prompts/PROJECT_BIBLE_MASTER_EXECUTION_PROMPT.md)

## 3. Estado técnico comprovado

| Gate | Estado |
|---|---|
| SaaS Core unit | PASS 86/86 |
| Database package | PASS 3/3 |
| Auth package | PASS 3/3 |
| Tenancy package | PASS 13/13 |
| Cross-tenant DB | PASS 58/58 |
| Storage | PASS 42/42 |
| Bakery live read | PASS |
| Secret scan documentado | PASS |
| E2E comercial final | NOT RUN |
| Builder funcional | IN PROGRESS |
| Onboarding tenant sem fork | NOT RUN |
| Billing de produção | BLOCKED/NOT RUN |
| Domínio real | NOT RUN / owner-gated |
| Release comercial completo | NOT READY |

## 4. Estado dos verticais

- Bakery: implementação presente; fechamento ponta a ponta em andamento.
- Pet: implementação presente; validações de release devem ser consolidadas.
- Restaurant: implementação presente; validações de release devem ser consolidadas.
- Heavy Machinery: implementação presente; validações de release devem ser consolidadas.
- MetalArt: implementação presente; validação Cloudflare/mídia/release em fechamento.
- Salon: Vanessa Braz é tenant/template; integração Core ainda em andamento.
- Religious House: fonte/site real existem; importação Core ainda pendente.
- LED: repo canônico identificado em `tupiniquimtechsolution-blip/LED`, mas fonte executável versionada está ausente; importação bloqueada sem inventar implementação.

## 5. Sequência executiva aprovada

1. Site Builder / Preview Studio.
2. Onboarding de tenant sem fork.
3. Salon / Vanessa.
4. Religious House.
5. Matriz de deploy/smoke Cloudflare.
6. Billing.
7. Domínio/SSL.
8. E2E/a11y/performance/security.
9. Pacote comercial + primeiro tenant pago.

## 6. Dados Vanessa confirmados pelo owner

- Instagram: `https://www.instagram.com/vanessabraz_belezaeautoestima/`
- WhatsApp/telefone: `(11) 98814-9152`
- E.164: `5511988149152`
- Endereço: `Rua Redenção 88`
- Cidade/UF/CEP: não fornecidos; não inferir.

A mídia visual deve preservar e mesclar o acervo legítimo disponível. Proveniência de imagens “geradas por IA” precisa estar registrada antes de rotulá-las como tal.

## 7. Release comercial

O produto só está pronto para venda repetível quando um tenant novo puder atravessar, sem fork:

`criação → vertical → plano/entitlements → branding/conteúdo/mídia → preview → aprovação → publicação → domínio → cobrança → suporte → auditoria`.

Até essa prova existir, `COMMERCIAL_RELEASE = NOT READY`.

## 8. Regra de documentação

Toda mudança que altere arquitetura, preço, risco, status de wave, source de vertical ou gate de release deve atualizar a Bíblia na mesma wave. Estados antigos não devem ser apagados quando forem evidência histórica; devem ser marcados como superseded/obsolete quando necessário.
