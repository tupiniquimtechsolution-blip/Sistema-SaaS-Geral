# Vanessa Braz — auditoria e execução de 50 melhorias UX
**Atualizado:** 29/10/2026 | **Branch canônica de QA:** `qa/tenant-isolation-staging-20261010`

**Status:** 50 melhorias **implementadas em código QA** e fluxo integrado **PASS — 17/17 Chromium**, no baseline funcional `2db887a0c5a7e2aa71b199ebbde0062bffdd99cc`. A lista é de **melhorias técnicas, funcionais e visuais**, não 50 testes isolados nem a liberação comercial do tenant.

**PONTO DE RETOMADA / CONTINUIDADE E CORREÇÕES:** [VANESSA_50_UX_CHECKPOINT_20261029.md](../handoffs/VANESSA_50_UX_CHECKPOINT_20261029.md). Leia-o **antes** de continuar, alterar QA ou criar outra lista.

## Fonte e limites
- **Tenant QA** `d7c34143-c044-4ad6-ac44-75e54118a857`; diagnóstico de leitura em `ynqbnimlpxlokrxlucdm`: 0 serviços, 0 mídias vinculadas, 1 página registrada e 0 memberships; nenhum registro foi modificado.
- **Código**: apps/salon, CSS, Booking, Archive, Welcome, PWA e E2E; estágio inicial PR #27 e commit `7e7dd535cefefed3758f1cecc71c890565552bef`.
- **Preview atual auditado por código e evidências de browser CI**, porque esta execução não dispõe de controle visual direto sobre a sessão de navegador privada do usuário. Capturas desktop/mobile passam a ser arquivadas pelo workflow.
- **Ambiente alvo**: Cloudflare QA preview imutável. Nada foi publicado no Worker QA estável, na main nem em produção.
- **Aviso de conteúdo**: o acervo de demonstração externo não é acervo publicado no tenant; WhatsApp inicia solicitação, não garante disponibilidade. Este pacote não cria serviços, preços, proprietários, credenciais nem mídia autorizada.
- **Verificação**: itens implementados e testados conjuntamente no SHA funcional `2db887a0c5a7e2aa71b199ebbde0062bffdd99cc`; o aceite visual humano e a configuração comercial permanecem pendentes.

## 50 melhorias técnicas, funcionais e visuais
| # | Área | Correção implementada no código QA | Arquivo principal |
|---:|---|---|---|
| 1 | Visual | Paleta consistente da marca na apresentação | `apps/salon/src/vanessa-50-ux.css` |
| 2 | Visual | Cores legíveis também no tema escuro | `apps/salon/src/vanessa-50-ux.css` |
| 3 | Visual | Títulos com quebra equilibrada | `apps/salon/src/vanessa-50-ux.css` |
| 4 | Visual | Comprimento de linha confortável nos textos do hero | `apps/salon/src/vanessa-50-ux.css` |
| 5 | Visual | Abertura principal proporcional ao tamanho da tela | `apps/salon/src/vanessa-50-ux.css` |
| 6 | Visual | Botões principais com altura adequada ao toque | `apps/salon/src/vanessa-50-ux.css` |
| 7 | Visual | Chamadas principais empilhadas no celular | `apps/salon/src/vanessa-50-ux.css` |
| 8 | Visual | Vista superior sem cortes agressivos | `apps/salon/src/vanessa-50-ux.css` |
| 9 | Visual | Legenda da imagem com contraste verificável | `apps/salon/src/vanessa-50-ux.css` |
| 10 | Visual | Ritmo de espaçamentos entre seções | `apps/salon/src/vanessa-50-ux.css` |
| 11 | Visual | Rodapé adaptável a telas pequenas | `apps/salon/src/vanessa-50-ux.css` |
| 12 | Visual | Seleção de cuidados com destaque coerente | `apps/salon/src/vanessa-50-ux.css` |
| 13 | Visual | Sombras e contornos visuais mais discretos | `apps/salon/src/vanessa-50-ux.css` |
| 14 | Visual | Suporte a cores forçadas de acessibilidade | `apps/salon/src/vanessa-50-ux.css` |
| 15 | Navegação | Item atual indicado na navegação desktop | `apps/salon/src/VanessaShowcase.tsx` |
| 16 | Navegação | Rastreamento do scroll com requestAnimationFrame | `apps/salon/src/VanessaShowcase.tsx` |
| 17 | Navegação | Menu do celular fecha após escolher destino | `apps/salon/src/VanessaShowcase.tsx` |
| 18 | Navegação | Links do menu com área de toque confortável | `apps/salon/src/vanessa-50-ux.css` |
| 19 | Navegação | Atalho Ir para o conteúdo bem visível via teclado | `apps/salon/src/vanessa-50-ux.css` |
| 20 | Navegação | Botão contextual Voltar ao início | `apps/salon/src/VanessaShowcase.tsx` |
| 21 | Navegação | Mapa só carregado após ação do visitante | `apps/salon/src/VanessaShowcase.tsx` |
| 22 | Navegação | Botão de copiar endereço | `apps/salon/src/VanessaShowcase.tsx` |
| 23 | Navegação | Contato com mensagem humana e endereço semântico | `apps/salon/src/VanessaShowcase.tsx` |
| 24 | Navegação | FAQ conciso sem dados comerciais inventados | `apps/salon/src/VanessaShowcase.tsx` |
| 25 | Agendamento | Indicador de progresso de três etapas | `apps/salon/src/SalonBooking.tsx` |
| 26 | Agendamento | Feedback imediato do cuidado escolhido | `apps/salon/src/SalonBooking.tsx` |
| 27 | Agendamento | Limpeza do campo Outro ao trocar serviço | `apps/salon/src/SalonBooking.tsx` |
| 28 | Agendamento | Troca de mês limpa data e horário anteriores | `apps/salon/src/SalonBooking.tsx` |
| 29 | Agendamento | Confirmação visível da data selecionada | `apps/salon/src/SalonBooking.tsx` |
| 30 | Agendamento | Confirmação visível do horário selecionado | `apps/salon/src/SalonBooking.tsx` |
| 31 | Agendamento | Etapas rotuladas e fuso de Brasília explícito | `apps/salon/src/SalonBooking.tsx` |
| 32 | Agendamento | Horários e datas com alvo mínimo de 44 px | `apps/salon/src/vanessa-50-ux.css` |
| 33 | Agendamento | Resumo revisável antes de abrir o WhatsApp | `apps/salon/src/SalonBooking.tsx` |
| 34 | Agendamento | Botão Limpar minha seleção sem armazenar dados | `apps/salon/src/SalonBooking.tsx` |
| 35 | Agendamento | CTA transparente: Revisar e enviar pelo WhatsApp | `apps/salon/src/SalonBooking.tsx` |
| 36 | Agendamento | Orientação quando faltam dados ou descrição de serviço | `apps/salon/src/SalonBooking.tsx` |
| 37 | Galeria | Contagem das fotografias públicas visualizadas | `apps/salon/src/VanessaOfficialArchive.tsx` |
| 38 | Galeria | Fallback legível para imagens indisponíveis | `apps/salon/src/VanessaOfficialArchive.tsx` |
| 39 | Galeria | Foco permanece dentro do visualizador ao usar Tab | `apps/salon/src/VanessaOfficialArchive.tsx` |
| 40 | Galeria | Foco retorna à miniatura após fechar | `apps/salon/src/VanessaOfficialArchive.tsx` |
| 41 | Galeria | Rolagem do fundo bloqueada no visualizador | `apps/salon/src/VanessaOfficialArchive.tsx` |
| 42 | Galeria | Escape e setas funcionam com foco de teclado | `apps/salon/src/VanessaOfficialArchive.tsx` |
| 43 | Galeria | Contador de foto anunciado de modo acessível | `apps/salon/src/VanessaOfficialArchive.tsx` |
| 44 | Galeria | Legendas de vídeo simplificadas para visitantes | `apps/salon/src/VanessaOfficialArchive.tsx` |
| 45 | Técnica | Título de navegador específico para o tenant | `apps/salon/src/App.tsx` |
| 46 | Técnica | Descrição de busca própria e não white-label | `apps/salon/src/App.tsx` |
| 47 | Técnica | Open Graph com marca, descrição e idioma corretos | `apps/salon/src/App.tsx` |
| 48 | Técnica | Noindex aplicado às visualizações QA | `apps/salon/src/App.tsx` |
| 49 | Técnica | Barra de navegador acompanha o tema claro/escuro | `apps/salon/src/VanessaShowcase.tsx` |
| 50 | Técnica | Convite PWA adiado para evitar interrupção na entrada | `apps/salon/src/SalonInstallPrompt.tsx` |

## Evidências verificadas do último código funcional

| Verificação | Resultado | Evidência |
|---|---|---|
| Monorepo Quality Gates | **PASS** | [Action 40901134203](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/actions/runs/40901134203) |
| QA Salon + Builder Readonly | **PASS** | [Action 40901134631](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/actions/runs/40901134631) |
| QA Vanessa E2E | **17/17 PASS (Chromium)** | [Action 40901134174](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/actions/runs/40901134174) |
| Preview Cloudflare QA imutável | **Gerado e testado** | https://2d9a6e47-tupiniquim-salon-qa.tupiniquim-techsolution.workers.dev |
| Capturas de boas-vindas, desktop claro e celular escuro | **Geradas** | Artefato `qa-vanessa-visual-2db887a0c5a7e2aa71b199ebbde0062bffdd99cc` (ID `12909682444`) |
| Aceite editorial/fonte da marca/catálogo comercial | **PENDENTE** | [Handoff de continuidade](../handoffs/VANESSA_50_UX_CHECKPOINT_20261029.md) |
| Worker QA estável e produção | **NÃO PUBLICADOS** | Promoção futura com gate e rollback |

Os 50 itens foram implementados no QA; o **polimento complementar** inclui tema escuro rosewood no calendário, trilho de vídeos móvel, captura após carregar imagens e legibilidade do WhatsApp desabilitado. Os testes abrangem os fluxos de maior risco; não afirmar que houve auditoria manual individual de todas as 50 linhas.

## Dependências externas, fora das 50 correções de interface
1. Cadastrar catálogo/valores/duração apenas com informação confirmada pelo proprietário.
2. Registrar proprietários/roles no tenant pelo mecanismo de Auth oficial e RLS.
3. Vincular mídia autorizada ao Storage do tenant, com direitos de imagem/licenças.
4. Substituir acervo de QA por conteúdo validado do tenant antes de publicação comercial.
5. Auditar avisos do Security Advisor sem revogar RPCs públicas necessárias de maneira indiscriminada.
6. Confirmar comportamento visual humano desktop/mobile após screenshots; não inferir automaticamente aprovação comercial.
7. Promover ao Worker QA estável somente com baseline, rollback, mesmo SHA e autorização operacional.

## Protocolo de correção daqui em diante

Para qualquer regressão, registrar **número do item (01–50), sintoma reproduzível, arquivo modificado, SHA, teste e evidência antes/depois**. Corrigir numa branch QA isolada; não reabrir itens já validados sem falha demonstrada. A ordem de verificação, dependências de catálogo/owner/mídia e os limites de publicação estão no [ponto de retomada](../handoffs/VANESSA_50_UX_CHECKPOINT_20261029.md).
