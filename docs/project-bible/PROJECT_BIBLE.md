# PROJECT BIBLE — Tupiniquim Vertical SaaS

**Versão:** 1.0  
**Data-base:** 2026-09-22  
**Estado:** execução da Wave 01; ainda não comercialmente concluído.

## 1. Resumo executivo

O Tupiniquim Vertical SaaS é uma plataforma multi-tenant para transformar sites/sistemas verticais em produtos white-label configuráveis. O objetivo é vender uma base única sem criar forks por cliente, preservando identidade visual, fluxos específicos de cada segmento e isolamento forte de dados.

O produto deve permitir que um novo cliente seja provisionado como **tenant + vertical + plano + branding + conteúdo + módulos**, com preview antes da publicação e operação auditável depois do go-live.

## 2. Problema que o produto resolve

Pequenos e médios negócios normalmente precisam combinar site, agenda, CRM, catálogo/comércio, pagamentos, mídia, domínio e operação em diversas ferramentas. Projetos sob medida resolvem isso, mas tendem a gerar alto custo de implantação e manutenção por cliente. A plataforma busca capturar o melhor dos dois modelos: apresentação premium e verticalizada com infraestrutura SaaS compartilhada.

## 3. Tese do produto

- **Um core, múltiplos verticais.** Contratos comuns de tenancy, Auth, RBAC, billing, CMS, mídia, CRM, booking e observabilidade são reutilizados.
- **Configuração, não fork.** Diferenças de cliente ordinárias entram em dados/tokens/configuração.
- **Preservação visual.** O SaaS adiciona engrenagem, não redesenha automaticamente projetos já validados.
- **Default deny.** O isolamento entre tenants é requisito de arquitetura, não convenção de frontend.
- **Preview antes de produção.** Configurações devem ser avaliadas antes de publicação.
- **Evidência antes de status.** GitHub/CI/testes são fonte técnica para conclusão.

## 4. Componentes do produto

### 4.1 Control Plane

`apps/platform` concentra visão de tenants, verticais, planos, entitlements, estado técnico, deploys e links de demonstração. Não deve ser confundido com editor visual de sites.

### 4.2 Site Builder / Preview Studio

Ambiente de edição/configuração a ser construído para:

- selecionar tenant/vertical;
- editar branding, tokens, logo, mídias, textos, seções e CTAs;
- configurar contatos, horários, localização e módulos;
- visualizar preview privado;
- validar e promover versão aprovada;
- manter histórico/auditoria da publicação.

### 4.3 SaaS Core

Contratos compartilhados mínimos:

- Tenant / Domain / Brand / Theme / Settings / Location;
- User / Profile / Membership / Role / Permission;
- Plan / Subscription / Feature / Entitlement;
- Page / Section / MediaAsset;
- Contact / Lead / AuditLog / Notification / UsageMetric;
- Booking / Availability / Service / Resource;
- commerce e integrações quando habilitadas.

### 4.4 Infraestrutura

- Supabase compartilhado como backend multi-tenant canônico (`mmykyzzkcugxunmekwew`, `sa-east-1`);
- Cloudflare como estratégia atual de publicação dos sites/control plane;
- GitHub como fonte de verdade de código, migrations, CI e histórico;
- Notion + Miro como operação sincronizada via Agenor.

## 5. Verticais

| Vertical | Estado do checkpoint | Regra |
|---|---|---|
| Bakery | Em fechamento ponta a ponta | preservar experiência premium e conectar integralmente ao Core |
| Pet | Contratos em consolidação | tenant-aware; commerce + booking + pets |
| Restaurant | Contratos em consolidação | commerce/menu/reservas |
| Heavy Machinery | Contratos em consolidação | CRM, quotes, inventory, projects/support |
| Religious House | fonte publicada, import canônico pendente | proteção reforçada a dados religiosos sensíveis |
| Salon | integração Vanessa Braz pendente | Vanessa vira tenant/template do `apps/salon`, não fork |
| LED | bloqueado | repositório canônico ainda precisa ser identificado |

## 6. Vertical Salon / Vanessa Braz

A decisão arquitetural é integrar `Vanessa-Braz` ao SaaS Geral como referência de UX/produto e tenant do vertical `salon`.

Reutilização esperada:

- profissionais → `staff_resources`;
- serviços → `services`;
- profissional x serviço → `service_resources`;
- disponibilidade → availability rules/overrides;
- agenda → `bookings`;
- clientes/leads → `contacts`/`leads`;
- marca/tema/config → tenant brand/theme/settings;
- mídia → media registry + Storage tenant-aware.

Antes de migrations, produzir matriz `REUSE / ADAPT / NEW / DROP`. Pagamentos, payment events, consentimentos e hold/deposito só podem ser adicionados como capacidades genéricas do Core quando o gap for comprovado.

## 7. Segurança e privacidade

### Obrigatório

- RLS/default deny em dados tenant-owned;
- autorização server-side em consultas/mutações privadas;
- testes cross-tenant negativos A→B e B→A;
- service-role e provider secrets somente server-side;
- webhooks autenticados e idempotentes;
- validação de schema nas fronteiras;
- proteção contra IDOR/BOLA, XSS, SSRF, open redirect, mass assignment e privilege escalation;
- Storage tenant-aware;
- logs sem secrets e sem PII desnecessária;
- dependências e CI sem mascarar falhas.

### LGPD

A plataforma deve suportar minimização, finalidade, retenção, correção/exportação/exclusão quando aplicável e consentimento versionado quando necessário. Dados religiosos e imagens de pessoas exigem tratamento reforçado. Nunca declarar compliance legal automático apenas por existirem controles técnicos.

## 8. Mídia

A estratégia combina:

- originais privados/ingest;
- derivados web otimizados;
- versões responsivas;
- registro de metadados/hashes;
- Storage tenant-aware para mídia administrável;
- publicação condicionada a autorização separada do gate visual.

No caso Vanessa, o pipeline técnico foi validado, mas presença no repositório ou qualidade visual não significa consentimento para publicação.

## 9. Booking

Fluxo-alvo verticalizado:

`serviço → recurso/profissional → data → slot → identidade → revisão → pagamento opcional → confirmação`.

Critérios mínimos:

- conflito bloqueado no banco;
- disponibilidade tenant-aware;
- histórico de status;
- preço/regras validados no servidor;
- testes PostgreSQL reais nos fluxos críticos;
- nenhum vazamento de slot/cliente entre tenants.

## 10. Billing e pagamentos

Há duas camadas diferentes:

1. **billing da plataforma SaaS**: assinatura do tenant, plano, entitlements, upgrade/downgrade/cancelamento;
2. **pagamento do cliente final do tenant**: ex. depósito/agendamento em Salon.

Ambas devem usar provider abstraction, secrets server-side, webhook como autoridade quando aplicável, assinatura, idempotência, reconciliação e audit trail.

## 11. Site Builder e publicação

Fluxo comercial alvo:

`criar tenant → escolher vertical → plano/entitlements → branding/conteúdo/mídia → preview → aprovação → domínio → publicação → observabilidade`.

O Builder deve consumir contratos do Core e produzir configuração versionável/auditável. Não pode introduzir lógica `if tenant === X` para personalização comum.

## 12. Definition of Done técnico

Uma capacidade é considerada concluída somente quando, conforme aplicável:

- implementação integrada;
- lint/typecheck verdes;
- unit/integration verdes;
- segurança e cross-tenant testados;
- build verde;
- CI remoto verde;
- migrations reconciliadas;
- docs/handoff atualizados;
- sem secrets/dados demo indevidos;
- rollback/risco conhecido.

## 13. Definition of Done comercial

O SaaS só deve ser tratado como comercializável quando:

- onboarding sem fork funciona;
- Builder/Preview Studio permite customização real;
- pelo menos os verticais priorizados estão integrados;
- billing/entitlements estão operacionais;
- domínio/SSL têm fluxo repetível;
- deploys são duráveis e auditáveis;
- pacote de preço/oferta/onboarding/suporte está validado;
- termos/privacidade/LGPD têm versão operacional aprovada;
- primeiro tenant novo foi provisionado e publicado pelo fluxo padrão;
- gates finais de E2E, a11y, performance e segurança passaram.

## 14. Não-objetivos / proibições

- não criar um repositório por cliente;
- não criar Supabase isolado para cada tenant sem justificativa arquitetural;
- não duplicar contratos Core por vertical;
- não publicar dados demo como reais;
- não inventar preços/claims/endereço/contatos;
- não considerar mídia autorizada só porque está disponível tecnicamente;
- não force-push/rewrite de histórico como rotina;
- não mergear `main` sem gates e autorização apropriada.

## 15. Métricas de produto e operação

Métricas mínimas para instrumentação progressiva:

- tempo de onboarding de tenant;
- tempo até preview e tempo até publicação;
- taxa de ativação (tenant configurado e publicado);
- conversão trial/demo → pagante;
- MRR/ARR, ARPA e expansão;
- churn de logo e receita;
- CAC, payback e LTV;
- margem bruta por plano;
- tickets de suporte por tenant;
- uptime/erros;
- Core Web Vitals;
- falhas de deploy/rollback;
- incidentes de segurança/isolamento (meta: zero).

## 16. Cadência recomendada

- execução diária: task numerada + evidência;
- checkpoint por milestone: docs + Notion + Miro;
- semanal: risco, custos, blockers e próxima sequência;
- pré-release: checklist completo e evidência reproduzível;
- pós-release: monitoramento, incident review e atualização de backlog.
