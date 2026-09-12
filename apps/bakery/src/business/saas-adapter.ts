import type { Tenant, TenantSettings } from "tupiniquim-saas-core";

export interface BakeryConfig {
  tenant: Tenant;
  settings: TenantSettings;
}

const DEMO_TENANT: Tenant = {
  id: "demo-fornalha",
  slug: "fornalha",
  vertical: "bakery",
  status: "demo",
  brand: {
    name: "Fornalha Premium",
    tagline: "Pão, bolos e doces frescos todos os dias",
    logo: "/logo.svg",
    logoAlt: "Fornalha Premium",
    favicon: "/favicon.svg",
  },
  theme: {
    headingFont: "var(--font-heading)",
    bodyFont: "var(--font-body)",
  },
  palette: {
    primary: "var(--primary)",
    secondary: "var(--secondary)",
    accent: "var(--accent)",
    background: "var(--bg)",
    surface: "var(--surface)",
    foreground: "var(--fg)",
    paper: "var(--paper)",
    line: "var(--line)",
    espresso: "var(--espresso)",
    caramel: "var(--caramel)",
    dim: "var(--dim)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
  },
  settings: {
    whatsapp: "5511999999999",
    delivery: true,
    pickup: true,
    address: "Rua Exemplo, 999 - São Paulo, SP",
    schedule: "Seg-Sex 7h-18h | Sáb 8h-14h",
    social: { instagram: "@fornalha" },
    integrations: {
      whatsapp: { enabled: true, number: "5511999999999" },
      ifood: { enabled: false, url: "" },
      keeta: { enabled: false },
      food99: { enabled: false },
    },
  },
  createdAt: new Date().toISOString(),
};

export function getDemoTenant(): Tenant {
  return DEMO_TENANT;
}

export function asBakeryConfig(tenant: Tenant): BakeryConfig {
  return {
    tenant,
    settings: tenant.settings,
  };
}

export const currentTenant = DEMO_TENANT;
