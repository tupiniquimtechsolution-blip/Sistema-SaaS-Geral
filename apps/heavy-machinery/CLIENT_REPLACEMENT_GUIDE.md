# Guia de Publicação — proposta LUSOMAQ

Checklist para transformar esta proposta no site oficial. Quase tudo se resolve
editando **2 arquivos** (`src/config/business.ts` e `src/data/machines.ts`).

## 1. Dados da empresa — `src/config/business.ts` (já preenchido com dados reais)

- [ ] Confirmar/atualizar: `cnpj`, `phoneRaw`, WhatsApps da equipe, `hours`
- [ ] Redes: `instagramUrl`, `facebookUrl`, `linkedinUrl` (já apontam para as reais)
- [ ] `stats[]` — só números confirmados (hoje: 38 anos, 30.000+ itens, 1988, entrega Brasil)
- [ ] `rollerBrands[]` / `partBrands[]` — listas extraídas do site oficial

## 2. Estoque real — `src/data/machines.ts` ⚠ PRIORIDADE MÁXIMA

O catálogo atual é um **exemplo** com as famílias reais que a Lusomaq distribui.
Para publicar:

- [ ] Substituir os 24 itens pelos itens reais (nome, código interno, aplicação, preço)
- [ ] Cada item: `code` (código interno), `brand` (marca do rolo), `oem` (marca da peça),
      `application` (modelos compatíveis), `price` (null = "sob consulta"),
      `condition` ("original" | "compativel"), `status` ("disponivel" | "reservada" | "vendida")
- [ ] `badges[]`: use apenas selos verdadeiros (Pronta entrega, Mais vendido, Testada em bancada)
- [ ] `specGroups[]`: campos ausentes simplesmente não aparecem — nunca invente valores
- [ ] Fotos: trocar URLs de hotlink por arquivos locais em `public/client-assets/machines/`
- [ ] Motores (`IMPLEMENTS[]`): Perkins, MWM, Cummins, Deutz, Kubota, Mercedes (já reais)

## 3. Imagens — constante `IMG` em `src/data/machines.ts`

Hoje: hotlink do site oficial (P4). Para produção:

- [ ] Baixar `logo`, `road`, `predio`, `hero1–6`, `p1–p24` para `public/client-assets/`
- [ ] Substituir `rolo` (placeholder IA) por foto real de rolo em vista lateral

## 4. Formulários & WhatsApp

Todos abrem o WhatsApp real com mensagem estruturada (nada de envio falso).

- [ ] `src/lib/utils.ts`: ajustar tom das mensagens (`machineMessage`, `quoteMessage`, etc.)
- [ ] Para CRM/e-mail: conectar o `submit` de `QuoteModal` (overlays.tsx), `/orcamento` e
      `/busca` (Forms.tsx) ao endpoint real
- [ ] Upload de fotos em `/busca`: hoje o usuário anexa no próprio WhatsApp (honesto, sem backend)

## 5. SEO

- [x] `index.html`: title/description/JSON-LD (AutoPartsStore) com dados reais
- [x] JSON-LD Product dinâmico por peça (só entra preço/estoque quando verdadeiros)
- [ ] Registrar domínio e apontar para a hospedagem
- [ ] Google Business Profile já existe (coordenadas -23.548194, -46.596889)

## 6. Evolução para painel administrativo

A arquitetura separa dados (`src/data/machines.ts`) da interface:
1. Criar tabela `parts` (Supabase/Postgres) com os mesmos campos do tipo `Machine`
2. Trocar o import estático por fetch/cache (tipo TypeScript já definido)
3. Catálogo, filtros, comparador e favoritos seguem funcionando sem mudança

## 7. Checklist final

- [ ] `npm run build` passando
- [ ] Testar em 360 / 390 / 430 / 768 / 1024 / 1440 / 1920 px
- [ ] WhatsApp abrindo com mensagem correta em cada contexto
- [ ] Peça "esgotada" sem CTA de compra (status `vendida`)
- [ ] Nenhum dado inventado: preços, prazos e especificações confirmados
