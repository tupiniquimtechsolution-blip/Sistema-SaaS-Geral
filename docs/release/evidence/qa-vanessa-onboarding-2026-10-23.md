# QA Vanessa Braz — onboarding com publicação bloqueada

**Data:** 23/10/2026  
**Projeto Supabase QA exclusivamente:** `ynqbnimlpxlokrxlucdm` (`https://ynqbnimlpxlokrxlucdm.supabase.co`)  
**Tenant:** `vanessa-braz` / `d7c34143-c044-4ad6-ac44-75e54118a857`  
**Ambiente:** branch `qa/tenant-isolation-staging-20261010` (PR #23, draft). **Não é lançamento comercial.**

## Estado confirmado no Supabase

- Tenant `vanessa-braz`, vertical `salon`, status `demo`, sem proprietário ou membership automático
- Marca `Vanessa Braz`, tagline `Beleza & Autoestima`; nenhum hero/media URL ou dado de contato foi publicado
- `tenant_settings.public_settings`: `bookingEnabled=false`, `mediaPublicationAuthorized=false`
- Página `inicio`: somente `draft`, com `robots=noindex,nofollow` no metadado (isso NÃO substitui controle de acesso)
- Zero `media_assets`, zero `page_sections`, zero memberships no tenant Vanessa
- **QA-A e QA-B inalterados**: seus usuários continuam com a associação dos tenants de isolamento; não reutilizar usuário A/B como editor Vanessa
- Políticas RLS existentes em `pages`, `page_sections`, `media_assets` e Supabase Storage; novas permissões devem ser exercidas por identidade QA separada

## Origem do acervo (não importado)

Repositório original: [Vanessa-Braz](https://github.com/tupiniquimtechsolution-blip/Vanessa-Braz), commit `74dd4b81964b92dd8e5730f55c04bbbc0d2314ea`. Os caminhos de origem estão fixados no componente `apps/salon/src/VanessaShowcase.tsx`. O preview isolado com as fotografias passou no [workflow #39998698511](https://github.com/tupiniquimtechsolution-blip/Sistema-SaaS-Geral/actions/runs/39998698511), mas **isso não autoriza publicação comercial nem implica consentimento de todas as pessoas fotografadas**.

**Regra de migração:** somente após aprovação/regularização da mídia e indicação de conta editorial legítima, armazenar arquivos com caminho `{tenant_uuid}/salon/{filename}.webp` sob política de Storage. Enquanto não houver autorização, não transferir imagens identificáveis para `tenant-public` nem inserir `media_assets.visibility=public`.

## Próximos gates sem atalhos

1. Identificar/invitar **conta editorial QA separada**, aprovada pelo responsável; conceder somente os papéis necessários e validar `cms.write`/`media.write` por RLS. Não emprestar credenciais dos Viewers A/B nem vincular os membros de isolamento ao novo tenant.
2. Aprovação de titularidade e uso de cada fotografia (identificáveis, antes/depois, créditos, direitos).
3. Importação governada de mídias aprovadas para o tenant correto com `media_assets`, MIME, bytes, alt e visibilidade. Verificar RLS com token real e negativa A↔B.
4. Fluxo de escrita **por usuário autenticado**: revisão `draft → in_review → approved → published` pelo Builder; testar publicação somente após autorização expressa, e rollback verificado.
5. Preview HTTP público do Salon com `VITE_DEMO_MODE=false`, `VITE_TENANT_SLUG=vanessa-braz`, chave publishable QA e sem Worker/rotas/segredos de produção. Conferir marca, imagens aprovadas e CMS publicado.
6. Aceite visual do responsável, testes de responsividade/acessibilidade, hostname/TLS QA e rollback antes de qualquer deploy durável Salon.
7. Stripe Test Mode, agendamentos reais somente após dados comerciais confirmados, Release GREEN same-SHA; produção permanece NO-GO.

## Evidência automática

- `.github/workflows/qa-salon-media-builder-readiness.yml` é **somente leitura**, faz checks públicos sem chave privilegiada e não interpreta um job PASS como liberação comercial.
- `scripts/qa-salon-launch-readiness.mjs` verifica projeto aprovado, marca do tenant, modo `demo`, agendamento desativado e pré-requisitos públicos (mídia autorizada e página publicada).
- Durante o onboarding atual, é **esperado e correto** que o relatório indique marca/tenant confirmados, e mídia/Builder publicado pendentes.
