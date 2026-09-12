# Tupiniquim — Multi-LLM Project Baseline

Projeto: `PadocaAppPremium`

Estas instruções são persistentes e complementam requisitos específicos do projeto. A fonte central da empresa é `tupiniquimtechsolution-blip/Tupiniquim_AI_Dev_Studio`, pasta `docs/AI_TOOLBOX/`.

## Fluxo obrigatório
- Investigue o estado real do repositório antes de editar; não invente arquivos, dependências, testes ou infraestrutura.
- Respeite planejamento, arquitetura e critérios de aceite já existentes.
- Limite mudanças ao escopo solicitado. Não adicione funcionalidades fora do pedido sem justificativa e aprovação.
- Antes de excluir arquivos, alterar schema/dados reais, fazer migração irreversível, force-push, publicar externamente ou instalar dependência estrutural, peça aprovação.
- Após mudanças: execute os checks disponíveis e registre evidências.

## Baseline de segurança
- Nunca exponha ou versione secrets, tokens, cookies, senhas ou chaves privilegiadas.
- Autenticação/autorização sensíveis devem ser verificadas no servidor.
- Valide entradas e considere XSS, CSRF, SQL/command injection, SSRF, path traversal e abuso conforme a stack.
- Aplique rate limiting a login, recuperação, formulários públicos, webhooks e endpoints caros.
- Não vaze stack trace, segredo ou dado pessoal em produção/logs.
- Revise CORS, cookies, HTTPS, headers, firewall/WAF/CDN, portas expostas e variáveis de produção.
- Mantenha rollback e backup verificáveis quando houver banco ou deploy crítico.
- Pentest com Strix ou equivalente somente em sistemas próprios/autorizados.

## Toolbox
UI/UX → `nextlevelbuilder/ui-ux-pro-max-skill`
Prompts → `nidhinjs/prompt-master`
Pesquisa → `Panniantong/Agent-Reach`
Pentest → `usestrix/strix`
CLI agent-native → `HKUDS/CLI-Anything`
Agentes/RAG → `Shubhamsaboo/awesome-llm-apps`
Instagram → `diwenne/openreply`
TTS → `kyutai-labs/pocket-tts`
Mídia generativa → `Anil-matcha/Open-Generative-AI`
Kimi experimental → `FareedKhan-dev/kimi-k3-in-c`

Referências externas não são dependências automáticas; valide licença, compatibilidade, manutenção e risco.

## Gate web/pré-launch
- Validar conteúdo real, mobile, acessibilidade, contraste, texto, overlays e contatos clicáveis.
- Não indexar /admin nem publicar dados/credenciais de desenvolvimento.
- Quando aplicável: sitemap + Search Console, Bing Webmaster, PageSpeed, títulos/metas únicos, links internos, analytics com consentimento e presença local.

## Entrega
Finalize com arquivos alterados, checks, riscos restantes, referências usadas e próximo passo. Converta achados em GitHub Issues pequenas e verificáveis.


## Contrato Multi-LLM
Este `AGENTS.md` é a fonte canônica deste projeto.
- Skill universal: `.agents/skills/tupiniquim-toolbox/SKILL.md`.
- Fonte corporativa: `tupiniquimtechsolution-blip/Tupiniquim_AI_Dev_Studio` → `docs/AI_TOOLBOX/`.
- `.claude/CLAUDE.md`, `QWEN.md` e `GEMINI.md` são adaptadores finos.
- Claude, Qwen, Kimi, DeepSeek, Gemini, GPT, Grok e outros modelos recebem estas regras via harness/agente.
