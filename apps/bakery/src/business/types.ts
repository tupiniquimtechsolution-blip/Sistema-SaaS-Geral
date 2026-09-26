/* ============================================================
   CORE WHITE-LABEL — Tipagens da plataforma
   Todo estabelecimento (tenant) é descrito por BusinessConfig.
   Trocar `businessType` + config adapta identidade, copy e módulos.
   ============================================================ */

export type BusinessType =
  | "bakery" | "restaurant" | "cafeteria" | "pizzeria"
  | "barbershop" | "salon" | "petshop" | "clinic"
  | "gym" | "hotel" | "market" | "store";

export interface VariationOption { id: string; label: string; delta: number }
export interface Variation { id: string; name: string; options: VariationOption[] }
export interface ExtraOption { id: string; name: string; price: number }

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  images: string[];
  price: number;
  promotionalPrice?: number;
  available: boolean;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  ingredients?: string[];
  allergens?: string[];
  variations?: Variation[];
  extras?: ExtraOption[];
  preparationTime?: string;
  tags?: string[];
  unit?: string;
  /** Combos: descrição dos itens inclusos */
  comboItems?: string[];
  /** Cross-sell configurável (slugs) */
  pairsWith?: string[];
}

export interface Category { slug: string; name: string; image: string; tagline: string }

export interface Review { author: string; text: string; rating: number; source: string }

export interface ChannelIntegration { enabled: boolean; url?: string; number?: string }

export interface DayHours { open: string | null; close: string | null }

export interface Features {
  ecommerce: boolean;
  cart: boolean;
  checkout: boolean;
  scheduledOrders: boolean;
  customOrders: boolean;
  delivery: boolean;
  pickup: boolean;
  externalDeliveryApps: boolean;
  reviews: boolean;
  gallery: boolean;
  instagram: boolean;
  loyalty: boolean;
  booking: boolean;
}

export interface Coupon { code: string; type: "percent" | "fixed"; value: number; description: string }

export interface BusinessConfig {
  /** Identidade multi-tenant */
  tenantId: string;
  businessId: string;
  businessType: BusinessType;

  name: string;
  tagline: string;
  slogan: string;
  description: string;
  founded: number;
  announcement: string;

  branding: {
    /** chave do preset de tema (ver core/theme.ts) */
    palette: string;
    headingFont: string;
    bodyFont: string;
    logoText: string;
  };

  contact: { phone: string; whatsapp: string; email: string };
  address: {
    street: string; number: string; district: string;
    city: string; state: string; zip: string;
    mapsUrl: string; lat: number; lng: number;
  };
  social: { instagram?: string; facebook?: string; tiktok?: string };

  /** Hub de canais — a UI mostra SOMENTE canais habilitados */
  integrations: {
    whatsapp: ChannelIntegration;
    ifood: ChannelIntegration;
    keeta: ChannelIntegration;
    food99: ChannelIntegration;
    phone: ChannelIntegration;
  };

  features: Features;

  /** 0 = domingo … 6 = sábado */
  openingHours: DayHours[];

  delivery: { enabled: boolean; fee: number; freeAbove: number; time: string };
  pickup: { enabled: boolean; units: { id: string; name: string; address: string }[] };

  payment: {
    pix: { enabled: boolean; key: string };
    card: boolean;
    cash: boolean;
    onDelivery: boolean;
    onPickup: boolean;
  };

  coupons: Coupon[];
  homeSections: string[];
  reviews: Review[];
  instagramPosts: string[];
  stats: { value: string; label: string }[];

  /** CTAs dinâmicos por segmento */
  cta: {
    primary: string; secondary: string; product: string;
    cart: string; checkout: string; order: string; location: string;
  };

  media: {
    hero: string;
    story: string;
    counter: string;
    scenes: string[];
  };
}

/* ---------------- Carrinho / Pedidos ---------------- */

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  image: string;
  unitBase: number;
  qty: number;
  variations: { name: string; label: string; delta: number }[];
  extras: { name: string; price: number }[];
  note?: string;
  isCombo?: boolean;
  comboItems?: string[];
}

export type OrderStatus =
  | "Novo" | "Confirmado" | "Preparando" | "Pronto"
  | "Saiu para entrega" | "Entregue" | "Cancelado";

export interface Order {
  code: string;
  createdAt: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  fulfillment: "delivery" | "pickup";
  schedule: string;
  payment: string;
  customer: {
    name: string; phone: string;
    address?: string; unit?: string; note?: string;
  };
  coupon?: string;
}

/** Overrides editáveis pelo painel admin (persistidos por tenant) */
export interface AdminOverrides {
  name?: string;
  tagline?: string;
  announcement?: string;
  whatsapp?: string;
  palette?: string;
  products?: Record<string, { available?: boolean; price?: number; promotionalPrice?: number | null }>;
  integrations?: {
    whatsapp?: boolean;
    ifood?: boolean; ifoodUrl?: string;
    keeta?: boolean; food99?: boolean;
  };
}

export interface ThemePreset {
  label: string;
  segments: string;
  tokens: Record<string, string>;
  headingFont: string;
  bodyFont: string;
  radius: string;
}
