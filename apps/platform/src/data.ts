/**
 * CATÁLOGO CANÔNICO DO CONTROL PLANE — dados reais, sem inventar métricas.
 *
 * Regras (BIG MASTER WAVE §13/§14):
 * - Todo módulo declara maturidade: IMPLEMENTED | FOUNDATION | COMING_SOON.
 *   Ausência NUNCA é mascarada como implementação.
 * - Todo vertical bloqueado carrega o blocker real (mesmos códigos dos docs).
 * - Demo URLs vêm exclusivamente de VITE_VERTICAL_PREVIEW_URLS (público, sem
 *   secrets); sem URL configurada não existe ação "Ver demonstração".
 * - Estados de gates refletem execução real registrada (nunca PASS sem prova).
 */

export type Maturity = "IMPLEMENTED" | "FOUNDATION" | "COMING_SOON";
export type VerticalState = "ready" | "not-ready" | "blocked";
export type GateState = "PASS" | "NOT RUN" | "BLOCKED" | "MISSING";

export interface Vertical {
  name: string;
  slug: string;
  state: VerticalState;
  /** Source no monorepo (ou blocker externo). */
  source: string;
  app: "EXISTS" | "MISSING_APP";
  build: "PASS" | "MISSING";
  typecheck: "PASS" | "MISSING";
  test: "PASS" | "NOT RUN" | "—";
  router: string;
  /** Variáveis VITE_* consumidas pelo app (auditoria real do código). */
  env: string;
  supabase: string;
  /** Clientes reais — nunca número inventado. */
  clients: string;
  demo: string;
  commercial: string;
  /** Projeto/Worker Cloudflare correspondente e seu estado real. */
  project: string;
  blocker?: string;
  note: string;
}

export const VERTICALS: Vertical[] = [
  {
    name: "Padaria (Bakery)",
    slug: "bakery",
    state: "ready",
    source: "apps/bakery (subtree PadocaAppPremium)",
    app: "EXISTS",
    build: "PASS",
    typecheck: "PASS",
    test: "NOT RUN",
    router: "HashRouter",
    env: "VITE_DEMO_MODE · VITE_SUPABASE_URL · VITE_SUPABASE_PUBLISHABLE_KEY",
    supabase: "INTEGRADO — live read PASS (tenant/brand/theme/settings/entitlements)",
    clients: "2 tenants QA (A/B) provisionados via RPC canônica; nenhum cliente comercial ainda",
    demo: "LOCAL PREVIEW PASS · remote dedicado OPCIONAL (Cloudflare wave futura)",
    commercial: "PRIMEIRO VERTICAL END-TO-END — referência de integração",
    project: "OPCIONAL / NOT REQUIRED — publishing comercial definitivo na wave Cloudflare",
    note:
      "Primeiro vertical validado contra o Supabase canônico. Não recebe privilégio arquitetural — é a primeira referência end-to-end.",
  },
  {
    name: "MetalArt",
    slug: "metalart",
    state: "ready",
    source: "apps/metalart (subtree premium PR#1)",
    app: "EXISTS",
    build: "PASS",
    typecheck: "PASS",
    test: "NOT RUN",
    router: "HashRouter",
    env: "nenhuma (não consome VITE_*)",
    supabase: "NÃO INTEGRADO (legado standalone — preservado)",
    clients: "0",
    demo: "LOCAL PREVIEW PASS · remote dedicado OPCIONAL (Cloudflare wave futura)",
    commercial: "VERTICAL PRINCIPAL — implementação premium preservada; integração SaaS incremental (padrão bakery)",
    project: "OPCIONAL / NOT REQUIRED — projeto Vercel dedicado não é requisito",
    note:
      "Vertical principal. Implementação premium importada intacta; integração SaaS futura sem redesenho.",
  },
  {
    name: "Pet Shop",
    slug: "pet",
    state: "ready",
    source: "apps/pet (subtree SitePetPremium)",
    app: "EXISTS",
    build: "PASS",
    typecheck: "PASS",
    test: "NOT RUN",
    router: "HashRouter",
    env: "nenhuma",
    supabase: "NÃO INTEGRADO (legado demo)",
    clients: "0",
    demo: "LOCAL PREVIEW PASS · remote dedicado OPCIONAL (Cloudflare wave futura)",
    commercial: "PRONTO PARA DEPLOY — integração SaaS futura (padrão bakery)",
    project: "OPCIONAL / NOT REQUIRED — projeto Vercel dedicado não é requisito",
    note: "App importado e compilável; CODE_READY/DEPLOYMENT_READY provados.",
  },
  {
    name: "Restaurante",
    slug: "restaurant",
    state: "ready",
    source: "apps/restaurant (subtree RestauranteSite)",
    app: "EXISTS",
    build: "PASS",
    typecheck: "PASS",
    test: "NOT RUN",
    router: "HashRouter",
    env: "nenhuma",
    supabase: "NÃO INTEGRADO (legado demo)",
    clients: "0",
    demo: "LOCAL PREVIEW PASS · remote dedicado OPCIONAL (Cloudflare wave futura)",
    commercial: "PRONTO PARA DEPLOY — integração SaaS futura (padrão bakery)",
    project: "OPCIONAL / NOT REQUIRED — projeto Vercel dedicado não é requisito",
    note: "App importado e compilável; CODE_READY/DEPLOYMENT_READY provados.",
  },
  {
    name: "Máquinas Pesadas",
    slug: "heavy-machinery",
    state: "ready",
    source: "apps/heavy-machinery (subtree BigMachines)",
    app: "EXISTS",
    build: "PASS",
    typecheck: "PASS",
    test: "NOT RUN",
    router: "HashRouter",
    env: "nenhuma",
    supabase: "NÃO INTEGRADO (legado demo)",
    clients: "0",
    demo: "LOCAL PREVIEW PASS · remote dedicado OPCIONAL (Cloudflare wave futura)",
    commercial: "PRONTO PARA DEPLOY — integração SaaS futura (padrão bakery)",
    project: "OPCIONAL / NOT REQUIRED — projeto Vercel dedicado não é requisito",
    note: "App importado e compilável; CODE_READY/DEPLOYMENT_READY provados.",
  },
  {
    name: "Templo Caboclo Tupinambá e Flecha Dourada",
    slug: "religious-house",
    state: "not-ready",
    source: "apps/religious-house (fonte TemploCabocloTupinamba-FlechaDourada)",
    app: "EXISTS",
    build: "MISSING",
    typecheck: "MISSING",
    test: "NOT RUN",
    router: "HashRouter",
    env: "nenhuma obrigatória para conteúdo público importado",
    supabase: "INTEGRAÇÃO TENANT/CMS PENDENTE — conteúdo standalone preservado",
    clients: "0",
    demo: "SOURCE IMPORTADO · Cloudflare config presente · gate de build em execução",
    commercial: "IMPORTADO; falta adaptação SaaS Core e prova Cloudflare",
    project: "Cloudflare Worker tupiniquim-religious-house",
    note: "Fonte real importada sem interromper o site standalone; módulos religiosos sensíveis permanecem default-deny.",
  },
  {
    name: "Salão",
    slug: "salon",
    state: "ready",
    source: "apps/salon (Vanessa Braz tenant/template)",
    app: "EXISTS",
    build: "PASS",
    typecheck: "PASS",
    test: "PASS",
    router: "React app",
    env: "Supabase publishable configuration; secrets server-side only",
    supabase: "INTEGRADO — tenant/RLS/booking gates executados",
    clients: "Vanessa RC tenant/template",
    demo: "Cloudflare smoke previamente validado",
    commercial: "READY com dados comerciais não autorizados fail-closed",
    project: "Cloudflare Worker Vanessa Braz",
    note: "Salon foi integrado à Wave 01; Vanessa é tenant/template, nunca fork.",
  },

];

export interface CoreModule {
  name: string;
  maturity: Maturity;
  evidence: string;
}

/** Módulos do SaaS Core — estados reais, nunca "implemented" disfarçado. */
export const CORE_MODULES: CoreModule[] = [
  {
    name: "Auth",
    maturity: "IMPLEMENTED",
    evidence: "packages/auth — sessão real Supabase (getSession/onAuthStateChange/signIn/signOut); auth A/B real provada em banco",
  },
  {
    name: "Tenancy",
    maturity: "IMPLEMENTED",
    evidence: "packages/tenancy — resolução membership-scoped fail-closed; tenants QA A/B provisionados via RPC canônica",
  },
  {
    name: "RBAC / Permissions",
    maturity: "IMPLEMENTED",
    evidence: "mirror 42 permissions validado contra live; RBAC server-side; RLS = autoridade final",
  },
  {
    name: "Entitlements",
    maturity: "IMPLEMENTED",
    evidence: "features=14 + plan/tenant entitlements; effective set default-deny; override precedence testada",
  },
  {
    name: "Storage",
    maturity: "IMPLEMENTED",
    evidence: "buckets tenant-public/private; isolamento 42/42; migration 20260918132842 aplicada",
  },
  {
    name: "Plans",
    maturity: "FOUNDATION",
    evidence: "contratos de plan/subscription no schema + saas-core; billing provider pendente de credencial",
  },
  {
    name: "Branding / Theme",
    maturity: "FOUNDATION",
    evidence: "tenant_brands/tenant_themes lidos live pelo adapter da Bakery; editor/config UI chega em wave futura",
  },
  {
    name: "Domains",
    maturity: "COMING_SOON",
    evidence: "arquitetura documentada (docs/TENANT_DOMAIN_ARCHITECTURE.md); resolução por hostname exigirá validação server-side",
  },
];

export interface Gate {
  name: string;
  state: GateState;
  evidence: string;
}

/** Gates com execução real registrada — nunca PASS sem prova. */
export const GATES: Gate[] = [
  { name: "Cross-tenant DB (RLS)", state: "PASS", evidence: "58/58 — leitura e escrita A↔B negadas; evidência em docs/CROSS_TENANT_RLS_EVIDENCE.md" },
  { name: "Storage isolation", state: "PASS", evidence: "42/42 — private 12/12, cross-write DENY, upsert público own ALLOW pós-migration" },
  { name: "Bakery live read", state: "PASS", evidence: "tenant/brand/theme/settings/entitlements reais com VITE_DEMO_MODE=false; zero fallback Fornalha" },
  { name: "Migration 20260918132842", state: "PASS", evidence: "fix_tenant_public_read_policy APLICADA pelo owner; local alinhada (byte-idêntico); REAPPLIED: NO" },
  { name: "QA storage residual", state: "PASS", evidence: "QA_STORAGE_RESIDUAL = 0 (varredura por list(), determinística)" },
  { name: "Unit/security tests", state: "PASS", evidence: "saas-core 86/86 · database 3/3 · auth 3/3 · tenancy 13/13" },
  { name: "Secret exposure (bundles)", state: "PASS", evidence: "0 segredos nos dists auditados — varredura automática por marcadores de segredo" },
  { name: "E2E", state: "NOT RUN", evidence: "ainda não implementado — não-bloqueante para preview (§16)" },
  { name: "Remote snapshot CLI", state: "BLOCKED", evidence: "BLOCKED_REMOTE_SNAPSHOT_CLI_ACCESS — 4 migrations REMOTE_ONLY pendentes de export (governança)" },
];

export interface PlatformProject {
  name: string;
  app: string;
  build: string;
  output: string;
  status: string;
}

/** Matriz de deployments canônicos em Cloudflare. */
export const PROJECTS: PlatformProject[] = [
  { name: "tupiniquim-saas", app: "apps/platform", build: "npm run build:platform", output: "apps/platform/dist", status: "Cloudflare Worker / Static Assets" },
  { name: "tupiniquim-bakery", app: "apps/bakery", build: "npm run build:bakery", output: "apps/bakery/dist", status: "Cloudflare Worker / Static Assets" },
  { name: "tupiniquim-pet · tupiniquim-restaurant · tupiniquim-metalart · tupiniquim-heavy-machinery", app: "apps/{pet,restaurant,metalart,heavy-machinery}", build: "npm run build:<app>", output: "apps/<app>/dist", status: "Cloudflare Workers / Static Assets" },
  { name: "tupiniquim-religious-house", app: "apps/religious-house", build: "npm run build --workspace=apps/religious-house", output: "apps/religious-house/dist", status: "config presente; deploy/smoke pendente" },
  { name: "salon / Vanessa Braz", app: "apps/salon", build: "vite build apps/salon", output: "apps/salon/dist", status: "Cloudflare validado; release gates próprios" },
];

export const HOSTING_POLICY = {
  canonicalHosting: "CLOUDFLARE WORKERS / STATIC ASSETS",
  dedicatedProjects: "Workers por vertical; tenant continua configuração, nunca fork",
  finalHosting: "CLOUDFLARE",
  releaseEvidence: "Durable Cloudflare Smoke Matrix + rollback runbook",
} as const;

/** URLs de preview públicas (sem secrets) — VITE_VERTICAL_PREVIEW_URLS. */
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
