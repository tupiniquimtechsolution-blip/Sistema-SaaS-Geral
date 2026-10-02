/**
 * Control Plane: data and evidence catalog.
 * Current runtime/code contracts and reconciled release/security records are the
 * source of status. Historical documents are never promoted to current PASS
 * without traceable evidence; unknown values stay NOT RUN / BLOCKED.
 */

export type Maturity = "IMPLEMENTED" | "FOUNDATION" | "COMING_SOON";
export type VerticalState = "ready" | "not-ready" | "blocked";
export type GateState = "PASS" | "NOT RUN" | "BLOCKED" | "MISSING";

export interface Vertical {
  name: string;
  slug: string;
  state: VerticalState;
  source: string;
  app: "EXISTS" | "MISSING_APP";
  build: "PASS" | "MISSING";
  typecheck: "PASS" | "MISSING";
  test: "PASS" | "NOT RUN" | "—";
  router: string;
  env: string;
  supabase: string;
  clients: string;
  demo: string;
  commercial: string;
  project: string;
  blocker?: string;
  note: string;
}

export const VERTICALS: Vertical[] = [
  {
    name: "Padaria (Bakery)", slug: "bakery", state: "ready",
    source: "apps/bakery (subtree PadocaAppPremium)", app: "EXISTS", build: "PASS", typecheck: "PASS", test: "NOT RUN",
    router: "HashRouter", env: "VITE_DEMO_MODE · VITE_SUPABASE_URL · VITE_SUPABASE_PUBLISHABLE_KEY",
    supabase: "Integração de leitura registrada; validação live não reexecutada nesta sessão",
    clients: "Provisionamento QA A/B registrado; número atual de clientes comerciais não validado",
    demo: "Prévia local/build; evidência Cloudflare anterior não equivale a deploy durável atual",
    commercial: "Vertical com integração SaaS Core; gates comerciais/deploy durável seguem o Release GREEN",
    project: "Cloudflare Worker / Static Assets; estado de deploy durável requer validação atual",
    note: "Vertical com fluxo SaaS Core; não inferir produção ou estado live a partir da prévia local.",
  },
  {
    name: "MetalArt", slug: "metalart", state: "ready",
    source: "apps/metalart (subtree premium PR#1)", app: "EXISTS", build: "PASS", typecheck: "PASS", test: "NOT RUN",
    router: "HashRouter", env: "Nenhuma VITE_* consumida",
    supabase: "Não integrado; implementação standalone preservada", clients: "Não revalidado",
    demo: "Build local disponível; deploy/smoke Cloudflare durável pendente",
    commercial: "Integração SaaS Core incremental; estado comercial atual não validado",
    project: "Cloudflare Worker / Static Assets; deploy/smoke durável pendente",
    note: "Vertical principal; UI premium preservada. Estado de publicação não inferido do build local.",
  },
  {
    name: "Pet Shop", slug: "pet", state: "ready",
    source: "apps/pet (subtree SitePetPremium)", app: "EXISTS", build: "PASS", typecheck: "PASS", test: "NOT RUN",
    router: "HashRouter", env: "Nenhuma VITE_* consumida",
    supabase: "Não integrado (app legado/demo)", clients: "Não revalidado",
    demo: "Build local disponível; deploy/smoke Cloudflare durável pendente",
    commercial: "Integração SaaS Core e release atual precisam de validação",
    project: "Cloudflare Worker / Static Assets; deploy/smoke durável pendente",
    note: "App importado; prontidão local não implica publicação durável.",
  },
  {
    name: "Restaurante", slug: "restaurant", state: "ready",
    source: "apps/restaurant (subtree RestauranteSite)", app: "EXISTS", build: "PASS", typecheck: "PASS", test: "NOT RUN",
    router: "HashRouter", env: "Nenhuma VITE_* consumida",
    supabase: "Não integrado (app legado/demo)", clients: "Não revalidado",
    demo: "Build local disponível; deploy/smoke Cloudflare durável pendente",
    commercial: "Integração SaaS Core e release atual precisam de validação",
    project: "Cloudflare Worker / Static Assets; deploy/smoke durável pendente",
    note: "App importado; prontidão local não implica publicação durável.",
  },
  {
    name: "Máquinas Pesadas", slug: "heavy-machinery", state: "ready",
    source: "apps/heavy-machinery (subtree BigMachines)", app: "EXISTS", build: "PASS", typecheck: "PASS", test: "NOT RUN",
    router: "HashRouter", env: "Nenhuma VITE_* consumida",
    supabase: "Não integrado (app legado/demo)", clients: "Não revalidado",
    demo: "Build local disponível; deploy/smoke Cloudflare durável pendente",
    commercial: "Integração SaaS Core e release atual precisam de validação",
    project: "Cloudflare Worker / Static Assets; deploy/smoke durável pendente",
    note: "App importado; prontidão local não implica publicação durável.",
  },
  {
    name: "Templo Caboclo Tupinambá e Flecha Dourada", slug: "religious-house", state: "not-ready",
    source: "apps/religious-house (fonte TemploCabocloTupinamba-FlechaDourada)", app: "EXISTS", build: "PASS", typecheck: "PASS", test: "NOT RUN",
    router: "React Router", env: "Tenant slug/runtime bootstrap via Supabase; sem secrets no cliente",
    supabase: "Tenant bootstrap/CMS wiring existe; estado live não revalidado nesta execução",
    clients: "Provisionamento SaaS Core reportado no Release GREEN; contagem live atual não revalidada",
    demo: "Build local disponível; smoke Cloudflare durável pendente",
    commercial: "Fonte importada e provisionamento SaaS Core reportado; validação externa pendente",
    project: "Cloudflare Worker / Static Assets; deploy/smoke durável pendente",
    note: "App importado, buildável e typecheckável; conteúdo sensível continua default-deny. Nenhum PASS de Cloudflare durável é inferido.",
  },
  {
    name: "Salão", slug: "salon", state: "ready",
    source: "apps/salon (Vanessa Braz tenant/template)", app: "EXISTS", build: "PASS", typecheck: "PASS", test: "PASS",
    router: "React app", env: "Supabase publishable configuration; secrets server-side only",
    supabase: "Integração tenant/RLS/booking documentada; estado live não revalidado nesta execução",
    clients: "Vanessa RC tenant/template; contagem comercial não aplicável/revalidada",
    demo: "Evidência específica registrada em docs/salon/SALON_RC1_EVIDENCE.md; gates gerais do Release GREEN não substituídos",
    commercial: "Dados e mídia não autorizados permanecem fail-closed; release global não promovido",
    project: "Cloudflare Worker / Static Assets; consultar evidência RC1 e gates globais",
    note: "Vanessa é tenant/template, não fork. Claims de release permanecem condicionados aos gates globais.",
  },
];

export interface CoreModule { name: string; maturity: Maturity; evidence: string; }

export const CORE_MODULES: CoreModule[] = [
  { name: "Autenticação", maturity: "IMPLEMENTED", evidence: "packages/auth — sessão Supabase (getSession/onAuthStateChange/signIn/signOut); não é autorização." },
  { name: "Tenancy", maturity: "IMPLEMENTED", evidence: "packages/tenancy — resolução de contexto por membership, fail-closed; RLS permanece autoridade." },
  { name: "RBAC / permissões", maturity: "IMPLEMENTED", evidence: "42 permissões no mirror documentado; autorização do usuário é distinta dos entitlements do tenant." },
  { name: "Entitlements", maturity: "IMPLEMENTED", evidence: "SaaS Core espelha 24 feature keys (14 base + 10 AI) em entitlement.ts/testes. Contagem remota não reconsultada nesta execução. Entitlements definem recursos do plano; não substituem RBAC. Enforcement server-side/default-deny." },
  { name: "Armazenamento", maturity: "IMPLEMENTED", evidence: "Contratos e políticas tenant-aware existem; prova quantitativa citada nos docs é evidência registrada, não reexecutada nesta sessão." },
  { name: "Planos e cobrança", maturity: "FOUNDATION", evidence: "StripeBillingProvider, stripe-webhook, billing_webhook_events e process_stripe_subscription_event implementados server-side. Stripe Test Mode E2E checkout→webhook→entitlements pendente; não declarar Stripe GREEN." },
  { name: "Marca e tema", maturity: "FOUNDATION", evidence: "tenant_brands/tenant_themes e adapter existem; edição/admin UI completa continua pendente." },
  { name: "Domínios", maturity: "FOUNDATION", evidence: "Arquitetura e resolver fail-closed hostname→tenant implementados; hostname QA real, TLS e smoke durável pendentes conforme TENANT_DOMAIN_ARCHITECTURE e RELEASE_GREEN_DOD." },
];

export interface Gate { name: string; state: GateState; evidence: string; }
export const GATES: Gate[] = [
  { name: "Isolamento cross-tenant (RLS)", state: "PASS", evidence: "Release GREEN registra prova de ator tenant vendo apenas o próprio tenant e SELECT cross-tenant retornando zero, com RLS ativo; não reexecutado neste corrective pass." },
  { name: "Isolamento de Storage", state: "PASS", evidence: "42/42 é evidência histórica registrada; não reexecutada nesta sessão." },
  { name: "Leitura live Bakery", state: "PASS", evidence: "Leitura Supabase de tenant/brand/theme/settings/entitlements consta na documentação; não revalidada nesta sessão." },
  { name: "Migration 20260918132842", state: "PASS", evidence: "Aplicação/reconciliação registrada no ledger; nenhuma migration executada nesta wave." },
  { name: "Resíduo de Storage QA", state: "PASS", evidence: "Último resultado documentado: zero; varredura não reexecutada nesta sessão." },
  { name: "Testes unitários e de segurança", state: "PASS", evidence: "npm test: 155 testes passaram nos workspaces Builder/Auth/Database/SaaS Core/Tenancy neste corrective pass; não substitui RLS E2E live." },
  { name: "Varredura de secrets em bundles", state: "NOT RUN", evidence: "Não executada neste corrective pass." },
  { name: "Builder E2E", state: "BLOCKED", evidence: "3 Playwright specs existem em apps/builder/e2e; execução neste corrective pass não iniciou: Chromium ausente. Download anterior falhou com TLS/ECONNRESET." },
  { name: "Acessibilidade axe", state: "BLOCKED", evidence: "Axe está integrado aos specs Playwright; não executou porque o browser Chromium não está disponível." },
  { name: "Snapshot remoto Supabase", state: "BLOCKED", evidence: "Ledger registra migrations REMOTE_ONLY pendentes de export; esta wave não executa db push nem reconstrói SQL remoto." },
];

export interface PlatformProject { name: string; app: string; build: string; output: string; status: string; }
export const PROJECTS: PlatformProject[] = [
  { name: "Tupiniquim Control Plane", app: "apps/platform", build: "npm run build:platform", output: "apps/platform/dist", status: "Cloudflare Workers / Static Assets; deploy durável precisa de evidência atual" },
  { name: "Bakery", app: "apps/bakery", build: "npm run build:bakery", output: "apps/bakery/dist", status: "Cloudflare Workers / Static Assets; smoke histórico não equivale a release durável" },
  { name: "Pet · Restaurante · MetalArt · Máquinas", app: "apps/{pet,restaurant,metalart,heavy-machinery}", build: "npm run build:<app>", output: "apps/<app>/dist", status: "Cloudflare Workers / Static Assets; validar deploy/smoke por app" },
  { name: "Templo / Religious House", app: "apps/religious-house", build: "npm run build --workspace=@tupiniquim/religious-house", output: "apps/religious-house/dist", status: "Config/app presentes; deploy durável e smoke pendentes" },
  { name: "Salão / Vanessa RC", app: "apps/salon", build: "vite build apps/salon", output: "apps/salon/dist", status: "Consultar evidência RC1; gates gerais Release GREEN permanecem independentes" },
];

export const HOSTING_POLICY = {
  canonicalHosting: "CLOUDFLARE WORKERS / STATIC ASSETS",
  dedicatedProjects: "Workers por vertical; tenant é configuração, nunca fork",
  finalHosting: "CLOUDFLARE",
  releaseEvidence: "Durable Cloudflare Smoke Matrix + rollback runbook",
} as const;

export function readPreviewUrls(env: Record<string, string | undefined>): Record<string, string> {
  const raw = env["VITE_VERTICAL_PREVIEW_URLS"];
  if (!raw) return {};
  const out: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const idx = pair.indexOf("=");
    if (idx <= 0) continue;
    const name = pair.slice(0, idx).trim().toLowerCase();
    const url = pair.slice(idx + 1).trim();
    if (name && /^https:\/\//.test(url)) out[name] = url;
  }
  return out;
}
