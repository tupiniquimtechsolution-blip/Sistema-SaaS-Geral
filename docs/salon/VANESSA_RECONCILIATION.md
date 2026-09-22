# Vanessa Braz → Vertical Salon — Reconciliação Canônica

**Data:** 22/09/2026  
**Destino:** `tupiniquimtechsolution-blip/Sistema-SaaS-Geral`  
**Branch:** `chatgpt/integrate-salon-vanessa`  
**Fonte:** `tupiniquimtechsolution-blip/Vanessa-Braz` / `arena/01a0a695-vanessa-braz`  
**Supabase canônico:** `mmykyzzkcugxunmekwew`  
**Status:** FASE 0 — reconciliada documentalmente; nenhuma migration real aplicada nesta fase.

## Decisão

Vanessa Braz será tenant/template do vertical white-label `salon`. O backend e o banco permanecem compartilhados pelo SaaS Core. Não criar Supabase separado, tabelas `vanessa_*`, fork por cliente ou regras `if tenant === 'vanessa'`.

## Dados Vanessa confirmados pelo owner

- nome/template: Vanessa Braz — Beleza & Autoestima;
- Instagram: `@vanessabraz_belezaeautoestima`;
- URL Instagram: `https://www.instagram.com/vanessabraz_belezaeautoestima/`;
- WhatsApp: `5511988149152`;
- exibição: `(11) 98814-9152`;
- endereço: `Rua Redenção 88`;
- cidade/UF/CEP: **MISSING** — não inferir;
- horários: **MISSING** — não inventar;
- e-mail comercial: **MISSING** — não inventar.

## Matriz REUSE / ADAPT / NEW / DROP

| Capacidade Vanessa | Decisão | Contrato de destino | Observação |
|---|---|---|---|
| Tenant/branding/tema/config | REUSE | `tenants`, `tenant_brands`, `tenant_themes`, `tenant_settings`, `locations` | Vanessa vira configuração do tenant |
| Auth/contas | REUSE | Auth + `profiles` + `memberships` | Sem auth paralelo |
| RBAC | REUSE | roles/permissions compartilhados | Default deny |
| Serviços | REUSE | `services` | Sem duplicar catálogo |
| Profissionais | REUSE | `staff_resources` | Tenant-owned |
| Serviço x profissional | REUSE | `service_resources` | Tenant-aware |
| Regras de disponibilidade | REUSE | `availability_rules`, `availability_overrides` | Confirmar conflito no banco |
| Agendamentos | ADAPT | `bookings` + histórico | Preservar fluxo Vanessa sobre contrato compartilhado |
| Clientes | REUSE | `contacts` | Sem tabela específica Vanessa |
| Leads | REUSE | `leads` | Sem tabela específica Vanessa |
| Mídia | ADAPT | `media_assets` + Storage tenant-aware | Autorização de publicação é gate separado |
| Galeria/hero/backgrounds | ADAPT | tenant media/config | Biblioteca fonte preservada; produção só com autorização |
| Instagram/WhatsApp/Maps | ADAPT | `tenant_settings` / integrações | Dados confirmados disponíveis |
| Pagamentos de booking | NEW/ADAPT | capacidade genérica SaaS | Não copiar tabelas Vanessa literalmente |
| Eventos de pagamento/webhook | NEW/ADAPT | capacidade genérica SaaS | Assinatura + idempotência server-side |
| Consentimento LGPD versionado | NEW/ADAPT | capacidade genérica tenant-owned | Operacional/marketing/imagem separados |
| Slot hold/deposito | NEW somente se necessário | capacidade genérica | Não implementar por antecipação |
| Backend/Supabase Vanessa isolado | DROP | SaaS Core | Proibido no estado final |
| Tenant hard-coded | DROP | configuração por tenant | Proibido |

## UI/UX a preservar

Preservar, sem redesign arbitrário:

- linguagem premium/leve de beleza e autoestima;
- páginas Início, Serviços, Galeria, Agendar e Contato;
- CTA de agendamento;
- WhatsApp flutuante;
- Instagram;
- contato/endereço;
- estratégia de imagens responsivas;
- reduced-motion e mobile-first;
- fluxo de booking: serviço → profissional → data → horário → identificação → revisão → pagamento quando aplicável → confirmação.

## Mídia

A biblioteca otimizada foi restaurada no repo fonte no commit `74dd4b81964b92dd8e5730f55c04bbbc0d2314ea`.

O manifesto técnico encontrado registra `generative_ai=false` para o lote otimizado auditado; portanto essas variantes são processamento determinístico, não geração por IA. Eventuais imagens realmente geradas por IA precisam de proveniência separada.

Mídias com pessoas identificáveis continuam com autorização de publicação como gate independente. Preview controlado não equivale a autorização para produção pública.

## Booking

Antes de produção, provar:

1. conflito de horário bloqueado no banco;
2. nenhum slot de tenant A vaza para B;
3. leitura e mutação exigem tenant autorizado;
4. transições de status são auditáveis;
5. validação server-side existe nas mutações críticas.

Se o schema atual não der garantia suficiente, criar migration **genérica, append-only, tenant-aware**, com teste PostgreSQL real.

## Pagamentos

Reutilizar as regras auditadas no projeto Vanessa como referência funcional, mas implementar como capacidade reutilizável do SaaS:

- webhook como autoridade;
- assinatura HMAC Mercado Pago;
- lookup autoritativo do pagamento;
- idempotência concorrente;
- validação de valor/referência;
- timeout/payload limits;
- secrets exclusivamente server-side.

## LGPD

Separar no modelo genérico:

- consentimento operacional;
- marketing;
- uso/publicação de imagem.

Registrar finalidade, versão, timestamp, tenant e revogação quando aplicável. Não declarar conformidade jurídica automática.

## Gates da finalização Salon

| Gate | Estado nesta reconciliação |
|---|---|
| Branch reconciliada com base atual | PASS após commit de sync |
| `apps/salon` criado | NOT RUN |
| Tenant/config white-label | NOT RUN |
| UI Vanessa portada | NOT RUN |
| Supabase live read tenant-aware | NOT RUN |
| Booking compartilhado | NOT RUN |
| Conflito de agenda no banco | NOT RUN |
| Cross-tenant real A↔B | NOT RUN |
| Payments genérico | NOT RUN |
| Consentimentos genéricos | NOT RUN |
| Mídia tenant-aware | NOT RUN |
| Lint | NOT RUN |
| Typecheck | NOT RUN |
| Unit | NOT RUN |
| Integration | NOT RUN |
| Security | NOT RUN |
| PostgreSQL/RLS real | NOT RUN |
| Build | NOT RUN |
| CodeQL | NOT RUN |
| Dependency audit | NOT RUN |
| A11y/WCAG 2.2 AA | NOT RUN |
| Lighthouse | NOT RUN |
| Preview | NOT RUN |
| Production | BLOCKED até gates e dados/publicação confirmados |

## Ordem de execução

1. sincronizar branch de integração com a base atual;
2. criar `apps/salon` white-label;
3. registrar scripts/workspace/deploy;
4. implementar configuração Vanessa sem hard-code estrutural;
5. integrar tenant resolution + dados compartilhados;
6. integrar booking/staff/CRM;
7. fechar gaps genéricos de pagamento/consentimento se realmente necessários;
8. integrar mídia autorizada/preview;
9. executar gates completos;
10. preview Cloudflare/ambiente controlado;
11. aceite visual/funcional;
12. somente depois liberar produção.

## Proibições

- sem `main` durante desenvolvimento;
- sem force push/reset destrutivo;
- sem migration destrutiva;
- sem Supabase separado;
- sem secrets no frontend;
- sem publicar dados/mídia não confirmados;
- sem PASS sem evidência executada.
