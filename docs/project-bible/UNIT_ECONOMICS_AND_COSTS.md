# Economia Unitária, Custos e Break-even

**Checkpoint:** 2026-09-22  
**Importante:** cenários abaixo são premissas de planejamento; substituir por custos contábeis reais assim que houver tenants pagantes.

## 1. Benchmark de infraestrutura

### Supabase

A página oficial consultada neste checkpoint informa:

- Free: US$ 0/mês, até 2 projetos ativos, recursos reduzidos e pausa por inatividade;
- Pro: a partir de US$ 25/mês, primeiro projeto incluído, 100k MAU, 8 GB de disco e backups diários, entre outros limites.

Para produção comercial, planejar orçamento no mínimo na faixa Pro quando os requisitos de disponibilidade/backup/volume justificarem.

### Vercel — referência opcional

Embora a estratégia atual dos sites esteja usando Cloudflare, Vercel permanece benchmark/opção de hosting:

- Hobby: US$ 0/mês e indicado para uso pessoal/não comercial;
- Pro: US$ 20/mês, com US$ 20 de crédito de uso incluído e recursos profissionais.

### Conversão de referência

Câmbio consultado em 22/09/2026: **US$ 1 = R$ 5,1235**.

Apenas como orçamento:

- Supabase Pro US$ 25 ≈ R$ 128,09/mês antes de impostos/câmbio do cartão;
- Vercel Pro US$ 20 ≈ R$ 102,47/mês;
- combinação de referência US$ 45 ≈ R$ 230,56/mês.

A arquitetura compartilhada deve diluir custo fixo entre tenants. Cloudflare, e-mail, WhatsApp, observabilidade, IA, storage extra e providers transacionais devem ser adicionados conforme uso real.

## 2. Categorias de COGS

Separar custo de serviço em:

### Fixos de plataforma
- database/compute base;
- hosting/control plane;
- observabilidade;
- CI/tooling comercial quando pago;
- backup/monitoramento.

### Variáveis por tenant
- storage/egress;
- e-mail/SMS/WhatsApp;
- IA/tokens;
- chamadas de APIs pagas;
- suporte humano;
- domínio gerenciado quando incluso;
- payment processing quando a plataforma absorver alguma tarifa.

### Não-COGS / OPEX
- desenvolvimento de produto;
- vendas/marketing;
- administrativo/contábil;
- pesquisa/desenvolvimento;
- equipamentos.

## 3. Cenário de margem por plano Salon

Premissa inicial de COGS variável mensal por tenant — **hipótese**, incluindo pequena reserva de infra e suporte:

| Plano | Receita/mês | COGS hipótese | Contribuição | Margem bruta hipótese |
|---|---:|---:|---:|---:|
| Essencial | R$ 129 | R$ 25 | R$ 104 | 80,6% |
| Crescimento | R$ 219 | R$ 35 | R$ 184 | 84,0% |
| Profissional | R$ 349 | R$ 55 | R$ 294 | 84,2% |
| Performance | R$ 549 | R$ 90 | R$ 459 | 83,6% |

A meta de 75–85% serve como envelope inicial de produto SaaS; custos reais de suporte e providers podem reduzir isso.

## 4. CAC e payback

Usar contribuição, não receita bruta, para payback.

Se a meta inicial for **CAC payback ≤ 3 meses**, o CAC máximo teórico sob as premissas acima seria aproximadamente:

| Plano | Contribuição/mês | CAC máximo para payback de 3 meses |
|---|---:|---:|
| Essencial | R$ 104 | R$ 312 |
| Crescimento | R$ 184 | R$ 552 |
| Profissional | R$ 294 | R$ 882 |
| Performance | R$ 459 | R$ 1.377 |

Isso não é meta automática de gasto. No começo, aquisição orgânica/outbound deve buscar CAC bem menor enquanto churn e suporte ainda não são conhecidos.

## 5. LTV — cenário, não previsão

Fórmula operacional simples:

`LTV de contribuição ≈ contribuição mensal / churn mensal`

Se — apenas como cenário — churn de logo fosse 3% ao mês:

- Essencial: ~R$ 3.467;
- Crescimento: ~R$ 6.133;
- Profissional: ~R$ 9.800;
- Performance: ~R$ 15.300.

Não usar esses números em apresentação comercial até existir histórico real. Registrar churn real por coorte e recalcular.

## 6. LTV:CAC

Meta saudável de planejamento: **LTV:CAC ≥ 3:1** depois de existir histórico confiável.

Se LTV:CAC estiver alto demais junto de crescimento lento, pode haver subinvestimento em aquisição. Se estiver abaixo de 3:1, rever preço, churn, CAC ou custo de servir.

## 7. Setup e recuperação do custo de onboarding

O setup existe para impedir que horas humanas de implantação destruam a economia da mensalidade.

Modelo:

`setup mínimo = horas humanas x custo/hora interno + custos externos + margem de risco`

O preço comercial pode ser superior ao custo, isento em contrato anual ou convertido em crédito promocional, desde que a decisão seja consciente e rastreável.

Exemplo: 6h de implantação a custo interno de R$ 100/h = R$ 600 antes de risco. Um setup de R$ 590 praticamente apenas recupera custo; R$ 1.490 permite absorver trabalho adicional e margem.

## 8. Desenvolvimento customizado

Para proposta sob medida, usar temporariamente blended rate comercial de **R$ 220/h**, revisável após dados próprios.

Esse valor não é custo interno; é taxa de venda de capacidade multidisciplinar. Precisa cobrir desenvolvimento, QA, produto, gestão, revisão, documentação, risco, retrabalho e margem.

## 9. Payment processing

Taxa de adquirência/provider é custo transacional do negócio do tenant, não deve ser confundida com mensalidade SaaS.

No benchmark Mercado Pago Link de Pagamento consultado:

- Pix: 0,99%;
- cartão: 3,99–4,98% conforme prazo de recebimento;
- parcelamento adiciona custo.

Para pagamentos integrados por API, confirmar a tarifa real da conta/produto antes de configurar qualquer repasse ou margem.

## 10. Break-even da plataforma

Fórmula simples:

`tenants para break-even = custos fixos mensais / contribuição média por tenant`

Exemplo exclusivamente ilustrativo:

- custo fixo operacional: R$ 2.000/mês;
- contribuição média: R$ 200/tenant;
- break-even operacional: 10 tenants.

O projeto deve manter planilha/dashboard com valores reais assim que houver despesas e clientes ativos.

## 11. Métricas financeiras obrigatórias

- MRR e ARR;
- new MRR, expansion MRR e churned MRR;
- ARPA;
- margem bruta;
- COGS por tenant e plano;
- CAC por canal;
- payback;
- LTV e LTV:CAC;
- churn de logo e receita;
- setup revenue e horas gastas;
- receita de add-ons;
- inadimplência/refunds;
- custo de suporte por tenant.

## 12. Regras para decisão de escala

Não aumentar mídia paga de forma relevante até haver:

- onboarding repetível;
- preço validado;
- medição de CAC;
- suporte dimensionado;
- churn inicial conhecido;
- billing e cobrança confiáveis;
- margem bruta minimamente observável.

Antes disso, aquisição deve servir principalmente para descoberta de mercado e validação de oferta.
