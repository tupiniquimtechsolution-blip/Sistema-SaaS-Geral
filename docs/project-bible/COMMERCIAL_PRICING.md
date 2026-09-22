# Modelo comercial e precificação v1

**Snapshot de mercado:** 22/09/2026. Valores abaixo são hipótese comercial inicial da Tupiniquim, não tabela contábil definitiva. Validar impostos, gateway, domínio, suporte e margem antes da publicação.

## Benchmarks públicos

### Nuvemshop Brasil
Fonte oficial: `https://www.nuvemshop.com.br/planos-e-precos`
- Começo: R$0/mês.
- Essencial: ~R$59/mês no anual.
- Impulso: ~R$139/mês no anual.
- Escala: ~R$382/mês no anual.
- Next: a partir de R$1.399/mês / condições consultivas.

A comparação é útil como referência de SaaS de site/e-commerce, mas o Tupiniquim agrega implantação assistida, verticalização e white-label configurado.

### Supabase
Fonte oficial: `https://supabase.com/pricing`
- Free: US$0; 50k MAU, 500 MB DB, 1 GB storage entre as cotas publicadas.
- Pro: a partir de US$25/mês; 100k MAU, 8 GB disk/project e 250 GB egress incluídos na tabela vigente.

### Cloudflare Workers
Fonte oficial: `https://developers.cloudflare.com/workers/platform/pricing/`
- Workers Free disponível por padrão.
- Workers Paid: mínimo US$5/mês por conta.
- Requests de Static Assets: gratuitos e ilimitados segundo a documentação atual.
- Armazenamento dos Static Assets não possui cobrança adicional documentada.

## Posicionamento Tupiniquim

Não competir apenas por “site barato”. O produto vende: implantação vertical assistida + template premium + SaaS multi-tenant + editor/preview + hosting gerenciado + segurança/LGPD + evolução contínua.

## Tabela comercial proposta

| Plano | Mensalidade sugerida | Setup sugerido | Perfil | Escopo-base |
|---|---:|---:|---|---|
| **Start** | **R$149/mês** | **R$1.490** | micro/pequeno negócio | 1 tenant, 1 vertical, branding básico, contatos, mídia/conteúdo, hosting gerenciado, suporte assíncrono |
| **Pro** | **R$349/mês** | **R$2.490** | negócio em crescimento | Start + recursos verticais, múltiplos usuários limitados, analytics básico, integrações WhatsApp/Instagram/Maps, prioridade de suporte |
| **Business** | **R$699/mês** | **R$4.900** | operação profissional | Pro + RBAC ampliado, módulos premium/entitlements, integrações, SLA comercial, automações e onboarding assistido |
| **Scale** | **a partir de R$1.490/mês** | **projeto a partir de R$9.900** | multiunidade/custom | escopo dedicado, múltiplos tenants/unidades, integrações específicas, SLA customizado e governança ampliada |

## Serviços adicionais precificáveis

- Migração de conteúdo/catalogação: **R$800–R$2.500** conforme volume.
- Identidade/branding premium dentro do template: **R$900–R$3.000**.
- Produção/curadoria de mídia: **R$500–R$3.500** por pacote, conforme escopo/licenciamento.
- Integração externa simples: **R$600–R$1.500** por integração.
- Integração/API customizada: **R$2.500–R$8.000+**.
- Novo vertical genérico reutilizável: **a partir de R$9.900**, orçamento por discovery.
- Importação/migração assistida complexa: **R$3.900–R$7.900**.
- Suporte extra/consultoria: sugerido **R$180–R$300/h** ou pacote mensal.
- Domínio: repasse de custo do registrador + eventual taxa de gestão; não embutir custo variável sem declarar.
- Gateways de pagamento e serviços de terceiros: repasse conforme fornecedor.

## Política de margem

Antes da venda, calcular:
`MRR líquido = mensalidade - infra incremental - gateway - suporte esperado - impostos - terceiros`.

Setup deve cobrir discovery, configuração, conteúdo, QA, publicação e contingência. Desenvolvimento customizado que gere recurso reutilizável pode ser parcialmente absorvido como investimento de produto; customização exclusiva deve ser cobrada separadamente.

## Descontos

- Anual: alvo inicial **10%** sobre mensalidade, somente se fluxo de caixa justificar.
- Setup: evitar zerar; no máximo parcelar ou reduzir mediante contrato anual.
- Piloto: desconto deve ter prazo, escopo e autorização de uso como case claramente definidos.

## O que não está incluído automaticamente

Tráfego pago, produção contínua de conteúdo, fotografia presencial, domínio premium, gateway, WhatsApp API oficial paga, licenças de terceiros, integrações fora do plano, suporte 24/7 e desenvolvimento exclusivo.

## Gate de publicação comercial

Esta tabela é **RECOMENDAÇÃO/HIPÓTESE v1**. Só publicar ao cliente após validar custos reais, impostos, SLA, termos, política de cancelamento, limites de uso e provider de billing.
