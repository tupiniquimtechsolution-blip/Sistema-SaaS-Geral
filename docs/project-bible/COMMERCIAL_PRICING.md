# Modelo Comercial e Precificação

**Checkpoint de mercado:** 2026-09-22  
**Moeda principal:** BRL  
**Natureza:** benchmark + hipótese comercial a validar; não é tabela contratual final.

## 1. Princípios

A precificação precisa separar quatro coisas:

1. **recorrência SaaS** — acesso contínuo à plataforma;
2. **implantação/onboarding** — trabalho humano inicial;
3. **add-ons/consumo** — WhatsApp, IA, pagamentos, storage, integrações etc.;
4. **customização sob medida** — desenvolvimento fora do produto padrão.

Não subsidiar desenvolvimento customizado dentro de mensalidade baixa. Não cobrar por cada pequena alteração de conteúdo que deveria ser resolvida pelo Builder.

## 2. Benchmark — vertical Salon

Referências públicas consultadas em 22/09/2026:

- **Trinks:** plano público para 1–2 profissionais a R$ 76/mês no anual; informa teste grátis, sem taxa de adesão e onboarding/treinamento. Faixas maiores são majoritariamente sob consulta na página atual.
- **Avec:** plano 1–2 profissionais a R$ 88,90/mês; 3–5, 6–10, 11–20 e rede sob consulta. Agenda, clientes, financeiro e gestão fazem parte da proposta; WhatsApp/IA/pagamentos/split/NF/BI aparecem como add-ons conforme plano.

Leitura estratégica: o mercado de gestão pura para micro salões tem entrada pública abaixo de R$ 100/mês. O Tupiniquim só deve cobrar prêmio quando entregar valor adicional visível: site premium/white-label, branding, conteúdo, preview, domínio, automação e experiência integrada.

## 3. Posicionamento sugerido — Salon

### Tabela de preço de lista para teste comercial

| Plano | Perfil | Limite orientativo | Mensal | Anual — equivalente mensal | Setup assistido sugerido |
|---|---|---:|---:|---:|---:|
| Essencial | autônomo / micro salão | até 2 profissionais | **R$ 129** | **R$ 109** | R$ 590 |
| Crescimento | equipe pequena | até 5 profissionais | **R$ 219** | **R$ 179** | R$ 1.490 |
| Profissional | operação estruturada | até 10 profissionais | **R$ 349** | **R$ 289** | R$ 2.490 |
| Performance | salão maior / multiunidade inicial | até 20 profissionais | **R$ 549** | **R$ 449** | R$ 3.900 |
| Rede | redes/franquias/escopo avançado | 21+ / custom | **a partir de R$ 899** | proposta | proposta |

Esses preços são uma **hipótese de posicionamento premium acessível**. O preço final deve passar pela task de validação com 3–5 clientes/propostas reais.

### Estratégia de setup

Concorrentes podem não cobrar adesão. Por isso, posicionar setup como **implantação premium opcional/assistida**, não como pedágio obrigatório. Alternativas:

- self-service: R$ 0 quando Builder/onboarding estiver maduro;
- implantação básica: branding + cadastro inicial;
- implantação assistida: importação de catálogo/serviços/mídia + domínio + treinamento;
- migração avançada: dados/integrations/customização, sob proposta;
- campanha comercial: isentar setup em contrato anual quando CAC e margem permitirem.

## 4. Framework de preço para outros verticais

O Core pode usar uma lógica de planos semelhante, mas o valor não precisa ser idêntico em todos os setores.

### Faixa sugerida por complexidade de vertical

| Classe | Exemplos | Faixa recorrente inicial sugerida |
|---|---|---:|
| Operação simples | site + CMS + catálogo + contato | R$ 99–249/mês |
| Operação transacional | booking/orders/CRM | R$ 179–549/mês |
| B2B operacional | quotes/projects/inventory/support | R$ 349–1.490/mês |
| Rede/multiunidade | multi-location, BI, integrações | R$ 899+/mês ou proposta |

Sempre usar planos/entitlements para controlar capacidade, nunca forks.

## 5. Add-ons precificáveis

Valores sugeridos para teste — custos de providers ficam separados quando houver consumo variável.

| Add-on | Preço sugerido | Observação |
|---|---:|---|
| Domínio customizado gerenciado | R$ 19–39/mês | registro do domínio pode ser cobrado à parte |
| Unidade adicional | R$ 99–199/mês | depende de volume/vertical |
| Pacote de storage/mídia adicional | R$ 29–99/mês | calibrar por GB e egress real |
| WhatsApp automação | R$ 49–149/mês + provider | respeitar cobrança oficial do canal/provider |
| IA recepção/copiloto | R$ 99–299/mês + consumo | limites por créditos/tokens |
| Relatórios/BI avançados | R$ 79–249/mês | conforme maturidade do módulo |
| Integração premium | R$ 49–199/mês + setup | ex.: ERP/provider externo |
| Suporte prioritário | R$ 99–399/mês | SLA deve ser explicitamente definido |
| Migração de dados | a partir de R$ 790 | cobrar por volume/qualidade da origem |

## 6. Pagamentos de cliente final

Mercado Pago informa publicamente para Link de Pagamento, no checkpoint consultado:

- Pix: 0,99% com recebimento na hora;
- cartão: 4,98% na hora, 4,48% em 14 dias, 3,99% em 30 dias;
- parcelamento pode adicionar tarifas.

Essas taxas são referência do produto Link de Pagamento e podem diferir da integração/conta/condição contratada. O sistema deve mostrar custo do provider como pass-through ou regra transparente — não embutir silenciosamente em margem SaaS.

## 7. Desenvolvimento/customização fora do produto

Benchmarks brasileiros consultados em 2026 apontam grande dispersão: software houses e profissionais sênior podem ficar aproximadamente na faixa de R$ 180–380/h para desenvolvimento sênior/arquitetura, dependendo de escopo e responsabilidade. Fontes secundárias de mercado também colocam MVPs SaaS profissionais em dezenas de milhares de reais.

Para padronizar proposta interna, usar **blended rate de planejamento de R$ 220/h** para trabalho customizado. Esse número fica dentro das faixas de mercado observadas e pode ser alterado por risco/senioridade.

### Pacotes customizados

| Tipo | Esforço orientativo | Faixa comercial a R$ 220/h |
|---|---:|---:|
| Ajuste pequeno | 8–16h | R$ 1.760–3.520 |
| Integração simples | 20–40h | R$ 4.400–8.800 |
| Módulo médio | 40–80h | R$ 8.800–17.600 |
| Feature/integração complexa | 80–160h | R$ 17.600–35.200 |
| Vertical custom completo | 160–320h | R$ 35.200–70.400 |

Regras:

- vender por milestone/entregável quando possível;
- incluir discovery, arquitetura, QA, documentação e gestão no esforço;
- customização que beneficie todos os tenants deve ser avaliada como roadmap de produto, não necessariamente cobrada 100% a um cliente;
- propriedade intelectual/core permanece da plataforma salvo contrato explícito em contrário.

## 8. Descontos

- anual: alvo de 15–20% de desconto sobre mensal;
- descontos adicionais só com contrapartida clara (prazo, case, pagamento antecipado ou baixa carga de suporte);
- evitar desconto perpétuo por negociação informal;
- registrar cupom/condição no billing.

## 9. Política de preço mínimo

Não vender recorrência abaixo do custo incremental + suporte + taxas + margem-alvo. Para planos padronizados, buscar margem bruta operacional de **75–85%** antes de CAC e despesas corporativas, ajustando após dados reais.

## 10. Processo de validação antes da tabela final

1. apresentar a oferta para 3–5 leads/negócios reais;
2. registrar preço apresentado, objeção, percepção de valor e concorrente citado;
3. testar setup pago versus setup isento no anual;
4. medir custo real de onboarding e suporte;
5. recalcular margem e payback;
6. aprovar tabela v1 e congelar por ciclo comercial definido.

## 11. Fontes de benchmark

- Trinks — página oficial de planos, consultada 22/09/2026.
- Avec — página oficial de planos, consultada 22/09/2026.
- Mercado Pago — páginas oficiais de Link de Pagamento e tarifas, consultadas 22/09/2026.
- Revin, CodeCortex, Forja de Sistemas e benchmarks brasileiros de freelancers/software houses — usados apenas como referências secundárias de valor-hora; não são índice oficial.

Toda proposta deve indicar data da referência, pois preços externos mudam.
