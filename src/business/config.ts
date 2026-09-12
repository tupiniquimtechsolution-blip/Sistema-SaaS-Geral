/* ============================================================
   TENANT: FORNALHA — Padaria Artesanal
   ----------------------------------------------------------
   Este é o ÚNICO arquivo que define o estabelecimento.
   Para criar outra padaria: altere nome, fotos, produtos,
   endereço, horários, WhatsApp e links de delivery aqui.
   Para outro segmento: troque `businessType`, `branding.palette`,
   `features` e os CTAs — o core se adapta automaticamente.
   ============================================================ */
import type { BusinessConfig } from "./types";

const IMG = {
  hero: "https://image.qwenlm.ai/generated-images/ec13fccd-aa3f-4994-b3bb-3305f276edbf/_result.png",
  sourdough: "https://image.qwenlm.ai/generated-images/967feb77-f559-45ce-894a-264f32f24bba/_result.png",
  croissant: "https://image.qwenlm.ai/generated-images/28b0c361-e8bc-4eba-a7d9-9d85c32d4b5c/_result.png",
  paoQueijo: "https://image.qwenlm.ai/generated-images/642da1b2-c15e-4c86-a61d-38dca99dfe52/_result.png",
  coffee: "https://image.qwenlm.ai/generated-images/70214df8-3329-4ca1-aaef-b1b7af238a3a/_result.png",
  cake: "https://image.qwenlm.ai/generated-images/62ad234c-87db-4368-92a3-226ae286f68e/_result.png",
  sandwich: "https://image.qwenlm.ai/generated-images/b7cb12fe-3db3-409a-a861-18d8150ad9b5/_result.png",
  hands: "https://image.qwenlm.ai/generated-images/fc8fedde-6c29-4b9b-9f84-09c3197a21f9/_result.png",
  baguette: "https://image.qwenlm.ai/generated-images/76c954a6-077a-4f01-adab-2e386d665e51/_result.png",
  counter: "https://image.qwenlm.ai/generated-images/0c99200b-0577-4eb6-ba58-1cc917158cdb/_result.png",
};

export { IMG };

export const businessConfig: BusinessConfig = {
  tenantId: "tnt_fornalha_01",
  businessId: "bsn_fornalha_matriz",
  businessType: "bakery",

  name: "Fornalha",
  tagline: "Padaria artesanal",
  slogan: "Do forno para a sua mesa.",
  description:
    "Padaria de fermentação natural em Pinheiros, São Paulo. Pães de levain assados em forno de lastro, café de origem e uma vitrine que muda com o dia.",
  founded: 2016,
  announcement: "Fornada de sourdough sai às 6h e às 16h — reserve o seu.",

  branding: {
    palette: "bakery",
    headingFont: '"Fraunces", Georgia, serif',
    bodyFont: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    logoText: "Fornalha",
  },

  contact: {
    phone: "+55 11 3456-7890",
    whatsapp: "+55 11 98765-4321",
    email: "ola@fornalha.com.br",
  },

  address: {
    street: "Rua dos Pinheiros",
    number: "428",
    district: "Pinheiros",
    city: "São Paulo",
    state: "SP",
    zip: "05422-000",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rua+dos+Pinheiros+428+S%C3%A3o+Paulo",
    lat: -23.5673,
    lng: -46.6886,
  },

  social: {
    instagram: "https://instagram.com/fornalha.paes",
    facebook: "https://facebook.com/fornalha.paes",
  },

  integrations: {
    whatsapp: { enabled: true, number: "+55 11 98765-4321" },
    ifood: { enabled: true, url: "https://www.ifood.com.br/delivery/sao-paulo-sp" },
    keeta: { enabled: false, url: "" },
    food99: { enabled: false, url: "" },
    phone: { enabled: true, number: "+55 11 3456-7890" },
  },

  features: {
    ecommerce: true,
    cart: true,
    checkout: true,
    scheduledOrders: true,
    customOrders: true,
    delivery: true,
    pickup: true,
    externalDeliveryApps: true,
    reviews: true,
    gallery: true,
    instagram: true,
    loyalty: false,
    booking: false,
  },

  openingHours: [
    { open: "06:30", close: "13:00" }, // domingo
    { open: "06:00", close: "20:00" },
    { open: "06:00", close: "20:00" },
    { open: "06:00", close: "20:00" },
    { open: "06:00", close: "20:00" },
    { open: "06:00", close: "20:00" },
    { open: "06:00", close: "20:00" }, // sábado
  ],

  delivery: {
    enabled: true,
    fee: 8.9,
    freeAbove: 79,
    time: "35–50 min",
  },

  pickup: {
    enabled: true,
    units: [
      { id: "matriz", name: "Fornalha Pinheiros", address: "Rua dos Pinheiros, 428" },
      { id: "vila", name: "Fornalha Vila Madalena", address: "Rua Harmonia, 1120" },
    ],
  },

  payment: {
    pix: { enabled: true, key: "pix@fornalha.com.br" },
    card: true,
    cash: true,
    onDelivery: true,
    onPickup: true,
  },

  coupons: [
    { code: "BEMVINDO10", type: "percent", value: 10, description: "10% off no primeiro pedido" },
    { code: "FORNOFRETE", type: "fixed", value: 8.9, description: "Frete grátis no pedido" },
  ],

  homeSections: [
    "hero", "experience3d", "featured", "categories", "bestSellers", "story",
    "orders", "combos", "coffee", "reviews", "delivery", "instagram", "location", "finalCta",
  ],

  /* Avaliações de exemplo do template — substitua pelas avaliações
     reais do Google antes de publicar. */
  reviews: [
    { author: "Marina C.", rating: 5, source: "Google", text: "O sourdough da Fornalha virou ritual de sábado. Casca grossa, miolo úmido — o melhor de Pinheiros, sem discussão." },
    { author: "Rafael T.", rating: 5, source: "Google", text: "Pedi pelo site e chegou quentinho em 40 minutos. O croissant de manteiga é absurdo de bom." },
    { author: "Juliana M.", rating: 5, source: "iFood", text: "Encomendei a cesta de café da manhã para minha mãe. Ela ligou emocionada. Virou cliente fiel." },
    { author: "Pedro A.", rating: 4, source: "Google", text: "Café coado na V60 impecável e atendimento que lembra o seu nome. Fila aos domingos vale cada minuto." },
  ],

  instagramPosts: [IMG.hero, IMG.croissant, IMG.hands, IMG.cake, IMG.coffee, IMG.baguette],

  stats: [
    { value: "48h", label: "de fermentação natural" },
    { value: "6", label: "fornadas por dia" },
    { value: "100%", label: "levain, zero pressa" },
  ],

  cta: {
    primary: "Pedir agora",
    secondary: "Ver cardápio",
    product: "Adicionar ao carrinho",
    cart: "Continuar pedido",
    checkout: "Finalizar pedido",
    order: "Solicitar encomenda",
    location: "Traçar rota",
  },

  media: {
    hero: IMG.hero,
    story: IMG.hands,
    counter: IMG.counter,
    scenes: [IMG.hero, IMG.counter, IMG.hands],
  },
};

export default businessConfig;
