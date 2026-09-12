/**
 * ============================================================
 * DADOS DO ESTABELECIMENTO — Chez Amis Bistrô
 * ------------------------------------------------------------
 * Fonte única da verdade: contatos, endereço, horários, delivery
 * e links. Dados reais extraídos do Google (Maps/Busca) e do
 * Instagram oficial @chezamis.bistro. Itens marcados como
 * demonstrativos devem ser confirmados com o proprietário.
 * ============================================================
 */

export interface Stat {
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
}

export const business = {
  name: "Chez Amis Bistrô",
  shortName: "Chez Amis",
  legalName: "Chez Amis Bistrô, Café & Bar",
  slogan: "Um francês descomplicado na Haddock Lobo",
  tagline: "Francês descomplicado",
  description:
    "Bistrô francês em Cerqueira César, São Paulo. Clássicos como steak tartare na ponta da faca, beef Wellington e sopa de cebola, menu executivo no almoço e o menu degustação Sabores da França. Aberto todos os dias, das 12h às 23h. Reservas pelo WhatsApp.",
  /** Ano de abertura — confirmar com o proprietário (demonstrativo) */
  since: 2022,

  contact: {
    phoneDisplay: "(11) 3129-4930",
    phoneRaw: "+551131294930",
    /** DDI + DDD + número, apenas dígitos — usado em createWhatsAppUrl() */
    whatsapp: "5511945044541",
    whatsappDisplay: "(11) 94504-4541",
    email: "reservas@chezamisbistro.com.br",
  },

  social: {
    instagram: "https://www.instagram.com/chezamis.bistro/",
    instagramHandle: "@chezamis.bistro",
    facebook: "",
    tiktok: "",
  },

  address: {
    street: "Rua Haddock Lobo, 74",
    complement: "Com valet na porta",
    neighborhood: "Cerqueira César",
    city: "São Paulo",
    state: "SP",
    zip: "01414-000",
    full: "Rua Haddock Lobo, 74 — Cerqueira César, São Paulo/SP",
    /** coordenadas reais (Google Maps) */
    lat: -23.5545107,
    lng: -46.6581815,
    mapEmbedUrl:
      "https://www.openstreetmap.org/export/embed.html?bbox=-46.6672%2C-23.5590%2C-46.6492%2C-23.5500&layer=mapnik&marker=-23.5545107%2C-46.6581815",
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=Rua+Haddock+Lobo,+74+-+Cerqueira+C%C3%A9sar,+S%C3%A3o+Paulo",
    /** link oficial da ficha no Google */
    googleMapsUrl:
      "https://www.google.com/maps/place/Chez+Amis+Bistr%C3%B4/data=!4m2!3m1!1s0x94ce590b0e7a1df9:0xacb9edec9a5753c5",
  },

  hours: [
    { days: "Segunda a Domingo", time: "12h — 23h" },
    { days: "Menu executivo", time: "Seg a Sex · 12h — 16h" },
    { days: "Cozinha", time: "Almoço, tarde e jantar contínuos" },
  ],

  /** Avaliação real exibida no Google (1.148 avaliações) */
  rating: { value: 4.4, count: 1148, source: "Google" },

  delivery: {
    minOrder: 60,
    note: "Retirada na porta e encomendas pelo WhatsApp. Taxas demonstrativas — confirme o valor final na mensagem.",
    areas: [
      { name: "Cerqueira César", fee: 7.9, time: "30–40 min" },
      { name: "Jardins", fee: 7.9, time: "30–40 min" },
      { name: "Consolação", fee: 9.9, time: "35–45 min" },
      { name: "Bela Vista", fee: 9.9, time: "35–50 min" },
      { name: "Pinheiros", fee: 12.9, time: "40–55 min" },
      { name: "Itaim Bibi", fee: 14.9, time: "45–60 min" },
    ],
  },

  /** números exibidos nos contadores animados */
  stats: [
    { value: 4.4, suffix: "★", label: "nota no Google", decimals: 1 },
    { value: 1148, suffix: "", label: "avaliações reais" },
    { value: 11, suffix: "h", label: "aberto por dia" },
    { value: 5, suffix: " tempos", label: "menu Sabores da França" },
  ] as Stat[],

  whatsappGreeting: "Olá! Vim pelo site do Chez Amis Bistrô e gostaria de fazer uma reserva. 🍷",
};

export type Business = typeof business;
