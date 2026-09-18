# Tupiniquim Toolbox — SaaS Monorepo

## Objetivo

Aplicar um baseline único de boas práticas, segurança, UX, qualidade e governança a todos os verticais sem apagar sua identidade visual.

## 1. Reconhecimento antes da alteração

Antes de editar:

- confirmar branch/HEAD/working tree;
- identificar stack, package manager, lockfile, CI e deploy;
- localizar contratos, configs, migrations, env examples e integrações;
- mapear arquivos do vertical afetado;
- identificar dados demo, reais e sensíveis;
- verificar documentação canônica;
- não assumir que um layout/fluxo deve ser refeito.

## 2. Preservação visual

A migração SaaS impõe **engrenagem**, não redesign obrigatório.

Preservar por vertical:

- composição visual;
- tipografia quando licenciada/adequada;
- paleta inicial;
- movimentos/parallax/reduced-motion existentes;
- páginas e narrativa;
- componentes diferenciadores;
- mídia legítima;
- responsive behavior.

Mudanças visuais só quando necessárias por acessibilidade, performance, bug, responsividade ou requisito explícito.

## 3. White-label

Transformar hard-code em configuração por tenant:

- logo/favicons;
- cores semânticas;
- tipografia;
- imagens/vídeos;
- contatos;
- endereços/horários;
- CTAs;
- páginas/seções;
- integrações;
- módulos/entitlements.

Evitar `if tenant === ...` para personalização ordinária.

## 4. SaaS Core

Contratos compartilhados mínimos:

- Tenant / Domain / Brand / Theme / Settings;
- User / Membership / Role / Permission;
- Plan / Subscription / Feature / Entitlement;
- Page / Section / MediaAsset;
- IntegrationConnection / Webhook;
- Contact / Lead;
- AuditLog / UsageMetric / Notification.

## 5. Segurança

Obrigatório:

- default deny;
- isolamento server-side por tenant;
- autorização em toda mutação/consulta privada;
- RLS ou mecanismo equivalente testado;
- cross-tenant negative tests;
- validação de schema na fronteira;
- queries parametrizadas/ORM seguro;
- uploads com MIME/extensão/tamanho/ownership e magic bytes quando possível;
- proteção contra XSS, IDOR/BOLA, SSRF, open redirect, mass assignment e privilege escalation;
- rate limit/anti-abuse;
- secrets server-side;
- webhook signature e idempotência;
- logs sem secrets/PII desnecessária;
- CSP/headers seguros quando compatíveis;
- dependências auditadas sem `audit fix --force` automático.

## 6. LGPD

- minimização;
- finalidade;
- retenção;
- exportação/correção/exclusão quando aplicável;
- consentimento quando a base exigir;
- privacidade por padrão;
- dados religiosos e outros sensíveis recebem gate reforçado;
- analytics nunca recebe dados sensíveis desnecessários.

## 7. Qualidade

Quando stack permitir:

- lint;
- typecheck;
- unit;
- integration;
- E2E;
- cross-tenant;
- build;
- dependency audit;
- a11y;
- performance.

Não enfraquecer regra ou teste apenas para obter CI verde.

## 8. Performance

- code split;
- lazy loading;
- imagens responsivas e otimizadas;
- evitar SDK admin no bundle público;
- preservar LCP/INP/CLS aceitáveis;
- reduzir animação em mobile/reduced motion;
- não sacrificar CTA/conversão por efeitos.

## 9. Acessibilidade

Meta: WCAG 2.2 AA.

Verificar:

- teclado;
- foco;
- landmarks;
- labels;
- contraste;
- headings;
- alt text;
- reduced motion;
- target size;
- mensagens de erro.

## 10. Git e mudanças

- branch por wave;
- commits pequenos por vertical slice;
- PR antes de `main`;
- preservar repositórios de origem até validação;
- sem force-push;
- sem reset destrutivo;
- sem migrations destrutivas não planejadas.

## 11. Dados e claims

Separar:

- verificado;
- fornecido pelo tenant;
- demo;
- histórico;
- inferido.

Nunca publicar reviews, números, preços, certificações ou serviços demonstrativos como fatos reais.

## 12. Gate de release SaaS

Antes de produção paga:

- auth real;
- RBAC real;
- tenant isolation comprovada;
- storage tenant-aware;
- admin protegido;
- audit log;
- backup/restore;
- CI com gates;
- E2E crítico;
- observabilidade;
- billing/entitlements coerentes;
- onboarding sem fork;
- customização por tenant;
- documentação operacional;
- nenhum secret ou dado demo indevido.
