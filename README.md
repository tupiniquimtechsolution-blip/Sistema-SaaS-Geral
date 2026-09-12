# Sistema SaaS Geral — Tupiniquim Vertical SaaS

Monorepo canônico para transformar experiências premium já existentes em uma **plataforma SaaS multi-tenant, modular e white-label**, preservando o layout, a identidade, as mídias e a narrativa comercial de cada vertical.

> **Estado atual:** Big Master Wave 01 em execução na branch `freebuff/big-master-wave-01-monorepo`. Quatro verticais confirmados importados para `apps/*`, SaaS Core básico e schema/supabase/seed preparados. Templo e LED permaneceram blocked por repositório não identificado.

## Visão

```text
                          TUPINIQUIM VERTICAL SaaS
                                    │
                             ┌──────▼──────┐
                             │  SaaS Core  │
                             └──────┬──────┘
                                    │
        ┌───────────┬───────────────┼──────────────┬─────────────┐
        │           │               │              │             │
     Tenancy      Identity       Brand/CMS      Billing      Operations
     RLS          RBAC           Theme/Media    Entitlements Audit/Usage
        └───────────┴───────────────┴──────────────┴─────────────┘
                                    │
                            Shared Business Modules
                                    │
          ┌──────────┬──────────┬─────────┬──────────┬──────────┐
          │ Commerce │ Booking  │ CRM     │ Quotes   │ Events   │
          └──────────┴──────────┴─────────┴──────────┴──────────┘
                                    │
                               Vertical Packs
```

## Verticais

| Vertical | Projeto de origem | Objetivo SaaS |
| --- | --- | --- |
| Padaria | `PadocaAppPremium` | catálogo, checkout, pedidos, delivery/pickup, encomendas e canais externos |
| Pet Shop | `SitePetPremium` | tutores, pets, serviços, profissionais, booking, commerce e loyalty |
| Restaurante | `RestauranteSite` | cardápio, reservas, pedidos, disponibilidade e eventos |
| Painéis de LED | repositório ainda não confirmado | catálogo B2B, configurador, vistoria, propostas, projetos e suporte |
| Máquinas Pesadas | `BigMachines` | showroom, inventory, leads, seller routing, quotes, trade-in e suporte |
| Templo/Casa Religiosa | `TemploCabocloTupinamba-FlechaDourada` | CMS, calendário/eventos, booking, galeria e módulos sensíveis opt-in |

## Princípio de produto

**Novo cliente = novo tenant.**

Não criar um fork de código por cliente. Cada tenant deve poder alterar, com permissões adequadas:

- logo e favicon;
- paleta de cores;
- tipografia;
- mídias;
- contatos e redes sociais;
- endereço e horários;
- páginas e seções;
- catálogo/serviços;
- integrações;
- módulos contratados.

## Preservação dos layouts

A plataforma **não** transforma os sites em um template SaaS genérico. O SaaS Core será acoplado por contratos, adapters, providers e APIs, mantendo o frontend premium de cada vertical.

São preservados, salvo correção justificada:

- composição e hierarquia visual;
- páginas e jornadas;
- motion/parallax/3D compatível com performance e reduced motion;
- identidade visual default;
- assets legítimos;
- responsividade;
- CTAs e copy verificados.

## Segurança e qualidade

A plataforma é desenhada com:

- tenant isolation server-side;
- RBAC/permissions;
- RLS/default deny;
- cross-tenant negative tests;
- storage tenant-aware;
- secure uploads;
- rate limiting;
- audit log;
- secrets server-side;
- LGPD/privacy by default;
- CI com lint/typecheck/tests/build/audit;
- E2E e security gates antes de release.

Consulte [`SECURITY.md`](SECURITY.md) e o [`Tupiniquim Toolbox`](.agents/skills/tupiniquim-toolbox/SKILL.md).

## Apresentações preservadas

Durante a Big Master Wave 01 foram encontradas as seguintes apresentações dentro dos apps importados:

- **Pet Shop — Amora Pet:** [`apps/pet/docs/AMORA_PET_PROPOSTA_COMERCIAL.pdf`](apps/pet/docs/AMORA_PET_PROPOSTA_COMERCIAL.pdf)
- **Restaurante — Chez Amis Bistrô:** [`apps/restaurant/docs/CHEZ_AMIS_BISTRO_PROPOSTA_COMERCIAL.pdf`](apps/restaurant/docs/CHEZ_AMIS_BISTRO_PROPOSTA_COMERCIAL.pdf)

PDF de Templo/Casa Religiosa não está no monorepo porque esse repositório não foi importável nesta sessão. O inventário canônico fica em [`docs/PRESENTATIONS_INDEX.md`](docs/PRESENTATIONS_INDEX.md).

## Estrutura alvo

```text
apps/                   # layouts e experiências dos verticais
packages/               # SaaS Core e módulos compartilhados
supabase/               # migrations, functions e seed
scripts/                 # tooling e automações de migração
infra/                   # configuração de infraestrutura/deploy quando necessária
docs/                    # arquitetura, segurança, runbooks, apresentações e handoffs
```

## Documentação principal

- [`AGENTS.md`](AGENTS.md)
- [`docs/MIGRATION_MANIFEST.md`](docs/MIGRATION_MANIFEST.md)
- [`docs/PLANEJAMENTO_MESTRE_TUPINIQUIM_VERTICAL_SAAS.md`](docs/PLANEJAMENTO_MESTRE_TUPINIQUIM_VERTICAL_SAAS.md)
- [`docs/PRESENTATIONS_INDEX.md`](docs/PRESENTATIONS_INDEX.md)
- [`docs/prompts/FREEBUFF_BIG_MASTER_WAVE_01.md`](docs/prompts/FREEBUFF_BIG_MASTER_WAVE_01.md)
- [`SECURITY.md`](SECURITY.md)

## Big Master Wave 01

A primeira grande wave executa:

1. importação dos verticais confirmados;
2. validação dos layouts existentes;
3. monorepo/workspaces;
4. banco e migrations;
5. tenancy/auth/RBAC/RLS;
6. Brand Studio/Theme/CMS/Media;
7. Padaria end-to-end sobre o novo backend;
8. plans/entitlements/billing abstraction;
9. audit/observability/integrations;
10. testes, CI, segurança e documentação;
11. contratos profundos para os demais verticais;
12. consolidação das apresentações PDF no README.

O prompt operacional completo está versionado no repositório para que Freebuff ou outro agente continue sem depender do histórico do chat.

## Regra de release

Nenhum vertical será rotulado como **SaaS production-ready** até existir evidência de isolamento multi-tenant, autorização server-side, storage seguro, testes relevantes, CI verde, observabilidade, backup/rollback e separação inequívoca entre dados demo e produção.
