export interface TenantBrand {
  name: string;
  tagline?: string;
  logo?: string;
  logoAlt?: string;
  favicon?: string;
  accentLogo?: string;
}

export interface TenantTheme {
  headingFont?: string;
  bodyFont?: string;
}

export interface TenantPalette {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  surface?: string;
    foreground?: string;
  paper?: string;
  line?: string;
  espresso?: string;
  caramel?: string;
  dim?: string;
  success?: string;
  warning?: string;
  danger?: string;
}

export interface TenantSettings {
  whatsapp?: string;
  delivery?: boolean;
  pickup?: boolean;
  address?: string;
  schedule?: string;
  social?: Record<string, string>;
  integrations?: {
    whatsapp?: { enabled?: boolean; number?: string };
    ifood?: { enabled?: boolean; url?: string };
    keeta?: { enabled?: boolean };
    food99?: { enabled?: boolean };
  };
}

export interface Tenant {
  id: string;
  slug: string;
  vertical: string;
  status: "active" | "disabled" | "demo";
  brand: TenantBrand;
  theme: TenantTheme;
  palette: TenantPalette;
  settings: TenantSettings;
  createdAt: string;
}

export function isDemo(t: Tenant): boolean {
  return t.status === "demo";
}
