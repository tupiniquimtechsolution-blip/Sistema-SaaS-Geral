# Ponto de retomada — Vanessa Braz — 50 melhorias UX (29/10/2026)

> **LEIA PRIMEIRO AO RETOMAR O TENANT VANESSA.** Checklist canônico de 50 itens: [QA_VANESSA_50_UX_20261029.md](../salon/QA_VANESSA_50_UX_20261029.md). Este handoff é o registro operacional de **continuidade e correção**, não uma ordem de publicar em produção.

## 1. Onde continuar sem perder trabalho

| Campo | Estado confirmado em 29/10/2026 |
|---|---|
| Repositório | `tupiniquimtechsolution-blip/Sistema-SaaS-Geral` |
| App / tenant | `apps/salon` · `vanessa-braz` · tenant QA `d7c34143-c044-4ad6-ac44-75e54118a857` |
| Branch canônica de QA | `qa/tenant-isolation-staging-20261010` |
| **Baseline de código funcional validado** | `2db887a0c5a7e2aa71b199ebbde0062bffdd99cc` |
| PRs de implementação | [#28 — 50 melhorias](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/pull/28) e [#29 — acabamento visual](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/pull/29) |
| Preview **imutável** validado | https://2d9a6e47-tupiniquim-salon-qa.tupiniquim-techsolution.workers.dev |
| Preview nomeado | https://vanessa-visual-2db887a0c5-tupiniquim-salon-qa.tupiniquim-techsolution.workers.dev |
| QA Supabase | `ynqbnimlpxlokrxlucdm` — **não é produção** |
| QA estável | **NÃO promovido** |
| `main`, produção, Vercel do terreiro, Stripe, DNS | **NÃO alterados** |

**Atenção a SHAs:** este checkpoint documenta a última versão **da aplicação** testada. Um commit posterior contendo somente documentação terá SHA diferente; não confundir isso com um novo build ou preview validado.

## 2. Estado de execução das 50 melhorias

- **Implementadas em código QA:** itens 01–50 listados na íntegra e com arquivos de origem no checklist acima, nas áreas **visual (01–14), navegação (15–24), solicitação de agendamento (25–36), galeria (37–44) e técnica (45–50)**.
- **Validadas por testes integrados:** os cenários do navegador passaram, mas **17 cenários não correspondem a 50 testes individuais**. A conferência editorial, visual e comercial final continua separada.
- **Polimentos adicionais ao checklist:** formulário no tema escuro alinhado às cores da marca; vídeos em trilho horizontal no celular; screenshots com imagens carregadas; contraste do botão WhatsApp desabilitado.
- **Não houve:** cadastro de novos serviços, preços, profissionais, slots reais, upload de mídia ao tenant, mudança no Auth/RLS ou deploy do Worker estável.
- **Fonte da lista:** `docs/salon/QA_VANESSA_50_UX_20261029.md`. **Não criar uma segunda lista divergente**; em novas correções, atualizar o status do item correspondente na lista original, com arquivo, teste e novo SHA.

## 3. Gates já executados e comprovados — mesmo SHA da aplicação

| Gate | Resultado | Evidência |
|---|---|---|
| Monorepo Quality Gates | **PASS** | [GitHub Actions #40901134203](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/actions/runs/40901134203) |
| QA Salon + Builder Readonly Browser Gate | **PASS** | [GitHub Actions #40901134631](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/actions/runs/40901134631) |
| QA Vanessa Photos + WhatsApp Booking | **PASS — 17/17 Chromium Playwright** | [GitHub Actions #40901134174](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/actions/runs/40901134174) |
| Capturas da abertura, desktop claro e celular escuro | **Geradas** | Artefato Actions `qa-vanessa-visual-2db887a0c5a7e2aa71b199ebbde0062bffdd99cc`, ID `12909682444` |
| Verificação editorial humana final | **PENDENTE** | Confirmar com o responsável pelas imagens, textos e identidade |
| Promoção QA estável e rollback | **NÃO EXECUTADOS** | Executar somente após aceite e revisão do procedimento |

**Estado do Supabase QA na leitura de 29/10/2026:** 0 serviços, 0 `media_assets`, 1 página e 0 `memberships` vinculados ao tenant. Esses contadores são uma fotografia no tempo, **não usar como estado imutável**: reconsultar antes da próxima intervenção. O acervo fotográfico do preview é externo e **não** representa mídias aprovadas e vinculadas no banco.

## 4. Próximas correções e prioridades — ordem exata de retomada

1. **P0 — Proteger baseline:** conferir `git rev-parse HEAD` da branch QA e os três gates acima. Se a branch avançou, comparar diffs com `2db887a...`, não resetar nem sobrescrever outros trabalhos.
2. **P0 — Inspeção visual anônima:** acessar o preview sem login e sem `?curadoria=1` em telas 390 px e desktop; conferir boas-vindas por **2,5 s** sem botão, texto somente “Bem-Vindo!”, “Vanessa Braz”, “Beleza e Autoestima”, marca/logo, imagens, cores e tema claro/escuro. Registrar capturas e observações; corrigir regressões na branch isolada.
3. **P0 — Interação pública:** testar “Conheça nossos serviços” → `#salon-service-label`; “Agende seu horário” → `#salon-calendar`; FAQ, menu móvel, galeria ampliada, trilho de vídeos, mapa sob demanda, acessibilidade teclado/touch e formulário WhatsApp. Horários são **preferências**, não disponibilidade confirmada.
4. **P1 — Revisão fotográfica semântica:** os 19 arquivos públicos foram escolhidos com espaçamento de captura para evitar repetição óbvia, mas hashes distintos não provam variedade visual. Examinar conteúdo/duplicidade perceptual e aprovar seleção com o proprietário. Preservar os 155 arquivos originais e os 28 vídeos na curadoria QA; não publicar pessoas sem direitos adequados.
5. **P1 — Fidelidade de marca:** conferir junto ao logo original a fonte efetiva do lettering, alinhamentos e paleta; a fonte atual é uma aproximação (`Playfair Display`) e não foi identificada como fonte oficial. Evitar adivinhar/falsificar a tipografia.
6. **P1 — Configuração real do tenant:** obter e aprovar serviços, durações, preços, profissionais, horários, regras e contatos; cadastrar pelo SaaS Core com validações tenant-aware. **Não inventar** informações comerciais nem transformar as 7 áreas de interesse do formulário em catálogo confirmado.
7. **P1 — Owner/Auth:** validar vínculo da pessoa proprietária via memberships/RBAC compartilhados, políticas RLS e isolamento A↔B. **Não** criar autenticação ou Supabase exclusivos do salão. Fazer alterações de autorização somente com identidade/escopo confirmados.
8. **P1 — Mídia comercial:** revisar consentimentos/licenças; migrar somente fotos/vídeos autorizados a `media_assets`/Storage tenant-aware, com proveniência e política de publicação. QA editorial e link público temporário não equivalem a permissão comercial.
9. **P2 — Gate de lançamento:** após aceite visual e catálogo real, validar performance mobile/Lighthouse, WCAG 2.2 AA, responsividade, segurança/CSP, RLS, fluxos públicos, mesma SHA e documentação de rollback. Registre falhas e corrija na ordem de impacto.
10. **P2 — Promover apenas o Worker QA estável:** preparar baseline, deploy controlado, smoke HTTPS, Playwright same-SHA e reversão testada conforme workflow vigente. **Jamais** promover `main`/produção, Vercel do terreiro, DNS ou Stripe por inferência desta documentação.

## 5. Arquivos principais de correção

- `apps/salon/src/VanessaShowcase.tsx` — home, navegação, temas, FAQ, espaço, contato, mapa.
- `apps/salon/src/VanessaOfficialArchive.tsx` — galeria pública/curadoria, vídeos, lightbox.
- `apps/salon/src/SalonBooking.tsx` e `apps/salon/src/booking/whatsapp-request.ts` — seleção e mensagem WhatsApp.
- `apps/salon/src/SalonWelcome.tsx`, `salon-welcome.css` e `vanessa-premium-theme.css` — abertura e identidade.
- `apps/salon/src/vanessa-50-ux.css` — conjunto de refinamentos/responsividade/contraste (inclui polimento final).
- `apps/salon/src/SalonInstallPrompt.tsx` e `apps/salon/src/App.tsx` — PWA/metadata.
- `apps/salon/e2e/vanessa-visual.qa.spec.ts`, `vanessa-official-archive.qa.spec.ts`, `whatsapp-booking.qa.spec.ts` — regressões.
- `.github/workflows/qa-vanessa-visual-preview.yml` — build, Cloudflare preview isolado, 17 E2E e capturas.

## 6. Restrições de continuidade e critérios de aceite

- **Não alterar:** produção, `main`, Vercel do terreiro, Stripe Live, domínio/DNS, segredos, consentimentos, RLS ou membros sem procedimento aprovado.
- **Não criar alegações comerciais falsas:** fotos sem consentimento, vagas supostamente disponíveis, preços/serviços fictícios, reserva confirmada por WhatsApp.
- **Curadoria `?curadoria=1`:** é apenas UI local do QA para selecionar/exportar lista de mídias; **não é autenticação nem autorização de publicação**.
- **A cada novo ajuste:** abrir branch a partir do QA atual, associar item 01–50 ou criar pendência adicional documentada, executar gates no **novo SHA**, produzir preview imutável, revisar em mobile e desktop, registrar PASS/FAIL/BLOCKED, mergear somente no destino QA aprovado.
- **Conclusão do pacote visual:** implementação já comprovada; **conclusão comercial = NÃO** até catálogo, Auth, mídias autorizadas, aceite humano e gates de release.

## 7. Próximo comando de retomada, pronto para agente

> Leia `docs/handoffs/VANESSA_50_UX_CHECKPOINT_20261029.md` e `docs/salon/QA_VANESSA_50_UX_20261029.md`. Verifique HEAD real do QA e gates; retome da **prioridade P0, itens 1–3** da seção 4. Corrija apenas regressões verificadas em branch isolada e registre evidência por SHA. Não faça deploy estável nem altere dados/mídia/prod sem autorização e requisitos confirmados.
