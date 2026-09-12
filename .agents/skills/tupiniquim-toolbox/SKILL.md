---
name: tupiniquim-toolbox
description: Contrato universal de execução da Tupiniquim para planejamento, implementação, auditoria, segurança, UI/UX, pesquisa, prompts e adoção segura de ferramentas, independente da LLM usada.
---

# Tupiniquim Toolbox — Universal

## Precedência
1. `AGENTS.md` e regras específicas do projeto.
2. Planejamento, ADRs e documentação canônica do projeto.
3. Esta skill e a baseline corporativa.
4. Adaptadores de fornecedor.

## Método
1. Confirme o estado real antes de editar.
2. Carregue apenas referências pertinentes.
3. Preserve arquitetura, escopo e decisões existentes.
4. Valide licença, dependências, manutenção, risco e compatibilidade antes de incorporar código externo.
5. Aplique segurança e execute os checks existentes.
6. Crie Issues apenas para achados reais e verificáveis.
7. Entregue arquivos alterados, checks, riscos, referências usadas e próximo passo.

## Roteamento
- UI/UX → UI UX Pro Max.
- Prompts → Prompt Master.
- Pesquisa/web/social → Agent Reach.
- Pentest autorizado → Strix.
- Software agent-native/CLI → CLI-Anything.
- Agentes/RAG → Awesome LLM Apps.
- Instagram → OpenReply.
- TTS local → Pocket TTS.
- Mídia generativa → Open Generative AI.
- Inferência Kimi experimental → kimi-k3-in-c.

## Segurança
Nunca exponha secrets. Nunca faça pentest em terceiros sem autorização. Peça aprovação antes de exclusões, migrações irreversíveis, alterações de dados/schema reais, force-push, publicação externa, compras ou ampliação material de escopo.
