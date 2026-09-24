# Vanessa Braz — Beleza & Autoestima

> Aplicação web profissional para gestão de beleza e autoestima com agendamento online, área do cliente e painel administrativo.

## Objetivo

Fornecer uma experiência digital completa para clientes e administradores, incluindo site público, motor de agendamento, área do cliente, painel administrativo, LGPD e integrações de pagamento.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Routing | React Router 6 |
| Auth / Database | Supabase |
| Payments | Mercado Pago / modo demo |
| Hosting | Cloudflare Workers + Static Assets |

## Execução local

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

## Cloudflare Workers

O repositório possui `wrangler.jsonc` como configuração de deploy. O frontend é uma SPA e o Worker publica `./dist` com fallback de navegação para `index.html`.

Configuração recomendada em Workers Builds:

```text
Production branch: arena/01a0a695-vanessa-braz
Root directory: /
Build command: npm run build
Deploy command: npx wrangler deploy
```

Também existe o comando reprodutível:

```bash
npm run deploy:cloudflare
```

que executa o build antes do deploy.

## Variáveis de ambiente

Variáveis browser-safe usadas pelo Vite:

```env
VITE_APP_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PAYMENT_PROVIDER=demo
VITE_DEMO_CATALOG=false
```

Segredos de servidor/Edge Functions **não** devem receber prefixo `VITE_` e não devem ser expostos no bundle do navegador:

```env
SUPABASE_SERVICE_ROLE_KEY=
PAYMENT_PROVIDER=demo
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
```

## Segurança

- Service Role Key permanece server-side only.
- A aplicação rejeita exposição de chaves com identificação `service-role` no ambiente cliente.
- RLS, autenticação e isolamento devem continuar validados pelos testes Postgres/segurança antes de alterações de produção.
- `.wrangler/`, `.dev.vars*` e arquivos `.env*` locais ficam fora do Git.

## Rotas SPA

O frontend utiliza `BrowserRouter`, portanto o deploy Cloudflare usa `not_found_handling: "single-page-application"`. Isso permite abrir e atualizar diretamente rotas como `/agendar`, `/login`, `/minha-conta` e `/admin` sem retornar 404 do host.

## CI

A branch de produção deve manter verdes os gates de typecheck, lint, testes e build antes de ser considerada pronta para publicação.

---

Projeto desenvolvido seguindo padrões Tupiniquim de arquitetura, segurança e governança.
