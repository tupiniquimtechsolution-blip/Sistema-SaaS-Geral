# Modelo comercial e precificação v2

**Snapshot de mercado:** 22/09/2026.  
**Status:** hipótese comercial inicial da Tupiniquim; não é tabela contábil definitiva.  
**Regra:** validar impostos, gateway, domínio, suporte, CAC e margem antes da publicação final.

## Benchmarks públicos consultados

### Nuvemshop Brasil
Fonte oficial: `https://www.nuvemshop.com.br/planos-e-precos`

Valores públicos observados no snapshot:
- Começo: R$0/mês.
- Essencial: aproximadamente R$59/mês no anual.
- Impulso: aproximadamente R$139/mês no anual.
- Escala: aproximadamente R$382/mês no anual.
- Next: a partir de aproximadamente R$1.399/mês / modalidade consultiva.

A Nuvemshop é benchmark de plataforma horizontal self-service. O Tupiniquim pretende agregar implantação assistida, verticalização e white-label configurado.

### Loja Integrada
Fonte oficial: `https://lojaintegrada.com.br/planos/`

Snapshot público 2026 mostra plano gratuito e tiers pagos de entrada abaixo de R$100/mês, crescendo por capacidade, visitas e recursos. É referência de piso self-service, não comparação direta com serviço gerenciado.

### Shopify Brasil
Fontes oficiais: `https://www.shopify.com/br/pricing` e materiais oficiais da Shopify Brasil 2026.

A Shopify trabalha com tiers self-service em USD e oferta empresarial Plus em faixa de milhares de USD/mês. A dispersão reforça que preço precisa acompanhar complexidade operacional, suporte e escala, não apenas hosting.

### Infra de referência
- Supabase: `https://supabase.com/pricing`
- Cloudflare Workers: `https://developers.cloudflare.com/workers/platform/pricing/`

Infra gratuita ajuda o MVP, mas **não** deve ser tratada como custo zero permanente: crescimento, egress, storage, observabilidade, e-mail, gateways e suporte podem gerar custo variável.

## Posicionamento Tupiniquim

Não competir apenas por “site barato”. A oferta é:

**implantação vertical assistida + template premium + SaaS multi-tenant + Builder/Preview + hosting gerenciado + segurança/LGPD + suporte + evolução contínua.**

## Tabela comercial proposta

| Plano | Mensalidade sugerida | Setup sugerido | Perfil | Escopo-base |
|---|---:|---:|---|---|
| **Start** | **R$149/mês** | **R$1.490** | micro/pequeno negócio | 1 tenant, 1 vertical, branding básico, contatos, mídia/conteúdo, hosting gerenciado, suporte assíncrono |
| **Pro** | **R$349/mês** | **R$2.490** | negócio em crescimento | Start + recursos verticais, usuários limitados, analytics básico, WhatsApp/Instagram/Maps e suporte prioritário |
| **Business** | **R$699/mês** | **R$4.900** | operação profissional | Pro + RBAC ampliado, módulos premium/entitlements, integrações, onboarding assistido e SLA comercial |
| **Scale** | **a partir de R$1.490/mês** | **projeto a partir de R$9.900** | multiunidade/custom | múltiplos tenants/unidades, integrações específicas, SLA customizado e governança ampliada |

### Leitura competitiva

- `Start` fica acima de plataformas self-service baratas porque inclui implantação/operação assistida.
- `Pro` se aproxima de tiers avançados de SaaS horizontal, mas adiciona verticalização e serviço gerenciado.
- `Business/Scale` devem ser vendidos por valor/escopo/SLA, não por comparação rasa com criadores de site.

## Serviços adicionais precificáveis

- Migração de conteúdo/catalogação: **R$800–R$2.500**.
- Identidade/branding premium dentro do template: **R$900–R$3.000**.
- Curadoria/otimização de mídia: **R$500–R$3.500** por pacote.
- Integração externa simples: **R$600–R$1.500** por integração.
- Integração/API customizada: **R$2.500–R$8.000+**.
- Novo vertical genérico reutilizável: **a partir de R$9.900** após discovery.
- Importação/migração assistida complexa: **R$3.900–R$7.900**.
- Consultoria/desenvolvimento extra: **R$180–R$300/h**.
- Suporte prioritário extra: **R$290–R$790/mês** conforme SLA.
- Multiunidade/tenant adicional: hipótese **R$99–R$349/mês por unidade**, dependendo de plano/uso.
- Landing/campanha adicional: **R$900–R$2.500**.
- SEO técnico avançado inicial: **R$900–R$2.500**.
- Analytics/pixels/conversões: **R$600–R$1.800**.
- Domínio: custo do registrador + taxa de gestão se contratada.
- Gateway/WhatsApp API/e-mail/SMS/IA/licenças: repasse conforme fornecedor quando não incluído.

## Política de margem

Antes da venda:

`MRR líquido = mensalidade - infra incremental - terceiros absorvidos - suporte esperado - impostos - CAC amortizado`

Setup deve cobrir discovery, configuração, conteúdo, QA, publicação e contingência.

Customização exclusiva deve ser cobrada separadamente. Recurso reutilizável para o produto pode receber investimento parcial da Tupiniquim, desde que a decisão seja explícita.

## Cohort de validação

Os **3 a 5 primeiros clientes pagos** devem ser usados para medir:
- horas reais de onboarding;
- tickets de suporte por tenant;
- custo infra incremental;
- CAC;
- ARPA;
- churn;
- margem bruta;
- frequência de customizações fora do Builder.

Depois do cohort, revisar preços e limites. Não congelar o preço inicial como verdade permanente.

## Descontos

- Anual: alvo inicial de até **10%**, se margem/caixa permitirem.
- Setup: preferir parcelamento a zerar.
- Piloto: desconto com prazo, escopo e contrapartida documentados.
- Customização: nunca gratuita sem decisão explícita de investimento de produto.

## Não incluído automaticamente

Tráfego pago, produção contínua de conteúdo, fotografia presencial, domínio premium, gateway, WhatsApp API paga, licenças de terceiros, integrações fora do plano, suporte 24/7 e desenvolvimento exclusivo.

## Gate de publicação comercial

`PRICING_READY = PARTIAL`.

Antes de publicar tabela definitiva:
1. fechar provider de billing;
2. definir impostos/faturamento;
3. fechar SLA e política de suporte;
4. definir limites por plano;
5. definir cancelamento/renovação;
6. simular margem por 3 perfis de uso;
7. validar juridicamente termos e LGPD.
