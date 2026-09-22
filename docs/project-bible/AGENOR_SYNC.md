# Agenor — Sincronização da Wave 01

**Checkpoint:** 2026-09-22

## Função

Agenor é o protocolo operacional responsável por manter o backlog e o estado do projeto coerentes entre GitHub, Notion, Miro e chat.

## Ordem da verdade

`GitHub/evidência técnica → Notion numerado → Miro visual → resposta no chat`

## Status canônicos

- `Caixa de Entrada`
- `A Fazer`
- `Em Andamento`
- `Aguardando`
- `Bloqueada`
- `Concluída`

## Prioridades

`Crítica → Alta → Média → Baixa`

## Regras

- `#N` significa `Sequência` dentro do projeto, não ID global do Notion;
- não renumerar silenciosamente tarefas antigas;
- novas tasks recebem o próximo número disponível;
- não inventar prazo;
- não marcar conclusão técnica sem evidência quando houver código/CI/testes;
- se Notion e Miro divergirem, reconciliar pela evidência mais recente;
- sincronização é fail-closed: se um sistema falhar, registrar explicitamente o pendente.

## Checkpoint Wave 01

| # | Task | Status | Prioridade |
|---:|---|---|---|
| 1 | Fechar vertical bakery ponta a ponta no SaaS Core | Em Andamento | Crítica |
| 2 | Localizar repositório canônico do vertical LED | Bloqueada | Alta |
| 3 | Validar contratos compartilhados do SaaS Core e isolamento multi-tenant | Concluída | Crítica |
| 4 | Consolidar contratos dos verticais pet, restaurante, máquinas e casa religiosa | Em Andamento | Alta |
| 5 | Construir Site Builder / Preview Studio multi-tenant | A Fazer | Crítica |
| 6 | Importar Terreiro como vertical religious-house no monorepo | A Fazer | Alta |
| 7 | Integrar Vanessa Braz em apps/salon no SaaS Core | A Fazer | Crítica |
| 8 | Fechar matriz de deploys duráveis Cloudflare e smoke tests | A Fazer | Crítica |
| 9 | Implementar onboarding comercial de tenant sem fork | A Fazer | Crítica |
| 10 | Implementar billing e ciclo de assinatura | A Fazer | Alta |
| 11 | Automatizar domínio customizado e SSL no Cloudflare | A Fazer | Alta |
| 12 | Executar gates finais E2E, a11y, Lighthouse, segurança e regressão | A Fazer | Alta |
| 13 | Fechar pacote comercial e primeiro onboarding | A Fazer | Alta |
| 14 | Validar pricing com clientes piloto e fechar tabela comercial | A Fazer | Alta |

## Mudanças deste ciclo documental

- criada Bíblia canônica do projeto;
- pricing e unit economics formalizados como hipótese de mercado;
- task #14 adicionada para impedir que benchmark seja confundido com preço validado;
- tarefas documentais de pricing/economia/oferta podem ser concluídas quando a documentação correspondente estiver publicada e referenciada;
- task #13 permanece aberta porque exige primeiro onboarding real, não apenas documentação;
- Miro deve refletir o mesmo backlog e preços de referência.

## Checklist de sincronização

Ao atualizar uma task:

1. validar GitHub se houver componente técnico;
2. atualizar status/notas no Notion;
3. atualizar linha/card no Miro;
4. registrar blocker/dependência;
5. atualizar a Bíblia se a mudança alterar fase, escopo, risco, preço ou DoD;
6. responder no chat usando a mesma numeração.
