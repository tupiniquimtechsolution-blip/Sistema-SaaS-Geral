export interface SalonPublicConfig {
  tenantId: string;
  slug: string;
  brandName: string;
  tagline: string;
  instagramHandle: string;
  instagramUrl: string;
  whatsapp: string;
  phoneDisplay: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  schedule?: string;
  email?: string;
  bookingEnabled: boolean;
  mediaPublicationAuthorized: boolean;
}

/**
 * Template de referência do tenant Vanessa Braz.
 * Dados ausentes permanecem ausentes: não inferir cidade, UF, CEP, horários,
 * e-mail, serviços, preços ou claims comerciais.
 */
export const vanessaPreviewConfig: SalonPublicConfig = {
  tenantId: "preview-vanessa-braz",
  slug: "vanessa-braz",
  brandName: "Vanessa Braz",
  tagline: "Beleza & Autoestima",
  instagramHandle: "@vanessabraz_belezaeautoestima",
  instagramUrl: "https://www.instagram.com/vanessabraz_belezaeautoestima/",
  whatsapp: "5511988149152",
  phoneDisplay: "(11) 98814-9152",
  address: "Rua Redenção 88",
  bookingEnabled: false,
  mediaPublicationAuthorized: false,
};

export const salonTemplateDefaults: SalonPublicConfig = {
  tenantId: "demo-salon",
  slug: "salon-demo",
  brandName: "Salão / Beleza & Estética",
  tagline: "Seu espaço, sua marca, sua experiência.",
  instagramHandle: "",
  instagramUrl: "",
  whatsapp: "",
  phoneDisplay: "",
  address: "",
  bookingEnabled: false,
  mediaPublicationAuthorized: false,
};

export function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function whatsappUrl(config: SalonPublicConfig, message = "Olá! Gostaria de agendar um horário."): string {
  return config.whatsapp ? `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}` : "#contato";
}
