# Sistema SaaS Geral — Tupiniquim Vertical SaaS

Monorepo canônico para consolidar o núcleo SaaS multi-tenant e os verticais premium existentes, preservando os layouts, mídias, apresentações comerciais e identidade visual de cada projeto.

> Estado: migração inicial em andamento. Os repositórios de origem permanecem preservados até que cada vertical seja importado, validado e aprovado neste monorepo.

## Verticais previstos

- Padaria — PadocaAppPremium
- Pet Shop — SitePetPremium
- Restaurante — RestauranteSite
- Painéis de LED — repositório de origem ainda precisa ser confirmado
- Máquinas Pesadas — BigMachines
- Templo/Casa Religiosa — TemploCabocloTupinamba-FlechaDourada

## Princípios

- um único SaaS Core;
- tenants, não forks por cliente;
- layouts atuais preservados por vertical;
- Brand Studio e Media Manager para personalização de logo, paleta, tipografia e mídias;
- autenticação, RBAC e isolamento multi-tenant server-side;
- módulos habilitados por entitlements;
- segurança, LGPD, qualidade e observabilidade como requisitos de plataforma;
- apresentações PDF preservadas para documentação e portfólio.

A arquitetura detalhada, o manifesto de migração e os gates do Tupiniquim Toolbox ficam em `docs/` e `.agents/`.
