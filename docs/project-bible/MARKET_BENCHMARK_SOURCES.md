# Fontes de Benchmark — Mercado, Infra e Precificação

**Data de consulta:** 2026-09-22

Este documento separa fatos públicos de recomendações internas. Valores externos mudam; sempre revalidar antes de proposta relevante.

## Sistemas para salão / beleza

### Trinks — fonte oficial

Página: `negocios.trinks.com/planos/`

Fato observado no checkpoint:
- 1–2 profissionais: R$ 76/mês na visualização anual;
- teste de 5 dias;
- sem taxa de adesão;
- treinamento/onboarding divulgado;
- faixas maiores aparecem sob consulta na página atual.

Uso: benchmark de entrada do vertical Salon.

### Avec — fonte oficial

Página: `negocios.avec.app/avec-planos`

Fato observado:
- 1–2 profissionais: R$ 88,90/mês;
- operações maiores: valor sob consulta;
- agenda, histórico de clientes, caixa/financeiro, comissões/estoque/relatórios aparecem na proposta;
- WhatsApp, IA, pagamentos, split, NF e BI aparecem como add-ons/recursos adicionais conforme plano.

Uso: benchmark funcional e de preço de entrada.

## Infraestrutura

### Supabase — fonte oficial

Página: `supabase.com/pricing`

Fato observado:
- Free: US$ 0/mês, limite de 2 projetos ativos e recursos reduzidos;
- Pro: a partir de US$ 25/mês;
- primeiro projeto incluído no Pro;
- 100k MAU e 8 GB de disco incluídos na referência atual;
- backups diários no Pro.

Uso: orçamento de backend/DB para produção conforme crescimento.

### Vercel — fonte oficial / benchmark alternativo

Página: `vercel.com/pricing`

Fato observado:
- Hobby: US$ 0/mês; indicado pela Vercel para uso pessoal/não comercial;
- Pro: US$ 20/mês;
- US$ 20 de crédito de uso no Pro;
- CDN/recursos profissionais conforme tabela vigente.

Uso: benchmark de hosting; a estratégia atual do produto usa Cloudflare para os sites publicados.

### Câmbio

Fonte de cotação consultada no checkpoint: US$ 1 = R$ 5,1235 em 22/09/2026.

Uso: apenas conversão orçamentária. Cobrança real pode incluir spread, IOF/impostos e variação cambial.

## Pagamentos

### Mercado Pago — fontes oficiais

Páginas oficiais de Link de Pagamento/tarifas consultadas no checkpoint.

Valores observados:
- Pix: 0,99% na hora;
- cartão: 4,98% na hora;
- cartão: ~4,48% em 14 dias;
- cartão: 3,99% em 30 dias;
- parcelamento pode adicionar tarifas.

Uso: benchmark de custo transacional. Não presumir que as mesmas tarifas se aplicam a todas as APIs, contas ou condições negociadas.

## Desenvolvimento de software — fontes secundárias de mercado

As fontes abaixo não constituem índice oficial; servem para triangulação de valor-hora.

### Revin — 2026

Faixas divulgadas para desenvolvimento vendido a partir do Brasil:
- freelancer sênior: ~US$ 18–30/h;
- software house média: ~US$ 25–45/h;
- squad sênior com produto/review/QA: ~US$ 45–75/h.

### CodeCortex — referência 2026

Faixas divulgadas em BRL:
- full-stack sênior freelancer: R$ 120–160/h;
- software house nacional: R$ 180–250/h;
- Tech Lead: faixas superiores;
- UX/UI e QA com faixas próprias.

### Forja de Sistemas — 2026

Referência divulgada:
- software house: aproximadamente R$ 80–250/h conforme senioridade/especialização;
- sênior vendido ao cliente: aproximadamente R$ 180–250/h;
- Tech Lead/Arquiteto: aproximadamente R$ 250–400/h;
- MVP SaaS profissional: dezenas de milhares de reais conforme escopo.

## Decisão interna derivada

**RECOMENDAÇÃO, não fato de mercado:** utilizar R$ 220/h como blended rate inicial de planejamento para customizações fora do produto padrão. Ele fica dentro das faixas trianguladas e cobre não apenas codificação, mas produto, arquitetura, QA, documentação, gestão e risco.

## Política de atualização

Revalidar:
- preços de concorrentes antes de campanha/proposta comparativa;
- custos de cloud a cada trimestre ou mudança de plano;
- taxas de pagamentos antes de habilitar repasse;
- blended rate pelo menos semestralmente ou quando custos/equipe mudarem.
