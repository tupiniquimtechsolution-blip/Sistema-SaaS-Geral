/**
 * CONFIGURAÇÃO CENTRAL DO NEGÓCIO — LUSOMAQ
 * ------------------------------------------------------------------
 * Dados extraídos do site oficial (lusomaq.com.br) em 2026.
 * Todos os WhatsApp usam formato internacional (55 + DDD + número).
 * Checklist de atualização em CLIENT_REPLACEMENT_GUIDE.md.
 */

export interface Salesperson {
  name: string;
  role: string;
  phoneDisplay: string;
  whatsapp: string;
}

export const BUSINESS = {
  name: "Lusomaq",
  legalName: "Lusomaq Peças para Tratores",
  slogan: "Líder em peças para rolos compactadores",
  tagline:
    "Peças novas originais e compatíveis para rolos compactadores e equipamentos de pavimentação, terraplanagem e construção.",
  founded: 1988,
  yearsInMarket: 38,
  cnpj: "", // confirmar com a empresa

  phoneDisplay: "(11) 2914-6213",
  phoneRaw: "551129146213",
  whatsapp: "5511932173836",
  whatsappDisplay: "(11) 93217-3836",
  email: "contato@lusomaq.com.br",

  address: {
    street: "Rua Sapucaia, nº 26 — Alto da Mooca",
    complement: "Sede com estoque próprio e balcão de atendimento",
    city: "São Paulo",
    state: "SP",
    zip: "03170-050",
  },
  geo: { lat: -23.548194, lng: -46.596889 },
  mapsLink: "https://www.google.com/maps/search/?api=1&query=-23.548194,-46.596889",
  mapsEmbed:
    "https://maps.google.com/maps?q=-23.548194,-46.596889&z=16&output=embed",

  hours: [
    { days: "Segunda a sexta", time: "08h00 — 18h00" },
    { days: "Sábado e domingo", time: "Fechado" },
  ],

  siteUrl: "https://www.lusomaq.com.br/",
  logoUrl: "https://www.lusomaq.com.br/assets/logo-Ck6vucEm.png",

  instagram: "@lusomaq.tratores",
  instagramUrl: "https://www.instagram.com/lusomaq.tratores/",
  facebookUrl: "https://www.facebook.com/lusomaqpecastratores",
  linkedinUrl: "https://www.linkedin.com/company/lusomaq-pe%C3%A7as-tratores/",

  team: [
    { name: "Atendimento Principal", role: "Orçamentos & pedidos", phoneDisplay: "(11) 93217-3836", whatsapp: "5511932173836" },
    { name: "João Victor", role: "Vendas — peças de rolo", phoneDisplay: "(11) 96913-9923", whatsapp: "5511969139923" },
    { name: "João Pires", role: "Vendas — motores & hidráulica", phoneDisplay: "(11) 97012-2776", whatsapp: "5511970122776" },
    { name: "Camila", role: "Vendas & logística", phoneDisplay: "(11) 98542-2741", whatsapp: "5511985422741" },
  ] as Salesperson[],

  stats: [
    { label: "Anos de mercado", value: 38, suffix: "" },
    { label: "Itens em estoque", value: 30000, suffix: "+" },
    { label: "Fundada em", value: 1988, suffix: "" },
    { label: "Entrega", value: 100, suffix: "% Brasil" },
  ],

  mission:
    "Atendimento com excelência para entregar produtos com qualidade, preço justo e agilidade que superem as expectativas e necessidades dos nossos clientes.",
  vision:
    "Ser referência em qualidade e excelência no atendimento ao cliente, promovendo soluções com agilidade e preço justo. Expandir nossa atuação no mercado internacional.",
  values: ["Foco no cliente", "Respeito", "Ética", "Qualidade", "Integridade"],

  /** Marcas de rolos compactadores atendidas (site oficial) */
  rollerBrands: [
    "Dynapac",
    "Muller",
    "Hamm",
    "Tema-Terra",
    "Caterpillar",
    "Bomag",
    "Volvo",
    "Sany",
    "XCMG",
    "Bobcat",
    "Komatsu",
    "Case",
  ],

  /** Marcas de peças e motores distribuídas (site oficial) */
  partBrands: [
    "Perkins",
    "MWM",
    "Mercedes-Benz",
    "Kubota",
    "Deutz",
    "Cummins",
    "Eaton",
    "Sundstrand",
    "Sauer Danfoss",
    "Parker",
    "SKF",
    "Timken",
    "FAG",
    "NTN",
    "Sabó",
    "Donaldson",
    "Fleetguard",
    "Mann-Filter",
    "Gates",
    "Goodyear",
    "Continental",
    "Corpas",
    "Silenmak",
  ],
} as const;
