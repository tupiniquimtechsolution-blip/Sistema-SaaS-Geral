# Bíblia do Projeto — Tupiniquim Vertical SaaS

**Status documental:** canônico para gestão, produto, arquitetura, comercial e operação  
**Checkpoint:** 2026-09-22  
**Branch documental:** `docs/project-bible-wave-01`  
**Base auditada:** `freebuff/big-master-wave-01-monorepo` @ `01ff06b2a20e1dab9a477e06ba3a500b8ad06183`

## Propósito

Esta pasta consolida a visão executiva e operacional do `Sistema-SaaS-Geral`: produto, arquitetura, fases, backlog, critérios de aceite, preço, economia unitária, vendas, onboarding, segurança, qualidade, risco e governança. Ela complementa — não substitui — `AGENTS.md`, Tupiniquim Toolbox, ADRs, migrations, código e testes.

## Hierarquia de verdade

1. código + migrations + testes executados;
2. `AGENTS.md` e regras do repositório;
3. planejamento mestre e ADRs;
4. esta Bíblia do Projeto;
5. Notion/Agenor e Miro como espelho operacional;
6. materiais comerciais e benchmarks externos.

Quando documentos conflitarem com código/testes atuais, registrar o conflito e atualizar o documento — nunca mascarar a evidência técnica.

## Índice

- [`PROJECT_BIBLE.md`](PROJECT_BIBLE.md) — visão integral do produto, escopo, arquitetura, verticais e Definition of Done.
- [`WAVE_01_ROADMAP.md`](WAVE_01_ROADMAP.md) — fases, etapas, tasks #1–#14, concluídas, em andamento, bloqueadas e pendentes.
- [`COMMERCIAL_PRICING.md`](COMMERCIAL_PRICING.md) — benchmark de mercado, planos sugeridos, implantação, add-ons e customizações precificáveis.
- [`UNIT_ECONOMICS_AND_COSTS.md`](UNIT_ECONOMICS_AND_COSTS.md) — infraestrutura, margem, CAC, LTV, break-even e cenários.
- [`GO_TO_MARKET_ONBOARDING.md`](GO_TO_MARKET_ONBOARDING.md) — ICP, proposta, vendas, onboarding, implantação, suporte e primeira venda.
- [`GOVERNANCE_SECURITY_RELEASE.md`](GOVERNANCE_SECURITY_RELEASE.md) — RACI, riscos, LGPD, segurança, qualidade, gates e release.
- [`AGENOR_SYNC.md`](AGENOR_SYNC.md) — contrato de sincronização GitHub → Notion → Miro e checkpoint da Wave.
- [`PROMPT_PROJECT_DIRECTOR_10Y.md`](PROMPT_PROJECT_DIRECTOR_10Y.md) — prompt operacional de diretor de projeto com 10+ anos de experiência usado para estruturar esta documentação.

## Regra de atualização

Ao final de cada ciclo relevante:

- atualizar o estado da task e a evidência GitHub;
- atualizar `WAVE_01_ROADMAP.md` quando houver mudança de fase/DoD;
- registrar decisões arquiteturais em ADR quando alterarem contratos de longo prazo;
- atualizar Notion e Miro pelo protocolo Agenor;
- não declarar tarefa técnica `Concluída` sem evidência real de CI/teste quando aplicável;
- não inventar prazo, receita, cliente, autorização de mídia ou compliance legal.

## Estado executivo neste checkpoint

O SaaS Core e o isolamento multi-tenant possuem evidências executadas; o control plane já está publicado. A Wave continua aberta porque ainda faltam fechamento de verticais, Site Builder/Preview Studio, Salon/Vanessa, deploy matrix, onboarding sem fork, billing, domínio/SSL, gates finais e primeiro onboarding comercial.

A documentação comercial desta pasta define **hipóteses de preço e posicionamento**, não uma promessa contratual. A tabela final deve ser validada com clientes piloto e custos reais antes de escalar aquisição paga.
