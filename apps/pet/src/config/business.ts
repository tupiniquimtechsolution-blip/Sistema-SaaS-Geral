/* =====================================================================
   CORE WHITE-LABEL — Amora Pet Platform
   ---------------------------------------------------------------------
   Para lançar outro pet shop, duplique este objeto e altere:
   nome, logo, cores, fotos, produtos, preços, serviços, endereço,
   WhatsApp, horários e links. O resto da plataforma se adapta.
   ===================================================================== */

export type Species = "caes" | "gatos";

export interface Variation {
  id: string;
  label: string;
  price: number;
  promotionalPrice?: number;
  stock: number;
}

export type ArtKind =
  | "kibble-bag" | "cat-bag" | "treat-jar" | "biscuit"
  | "ball" | "rope" | "mouse" | "shampoo" | "conditioner"
  | "perfume" | "brush" | "bed" | "collar" | "harness"
  | "litter" | "pads";

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  details: string[];
  art: ArtKind;
  artTint: string; // token de cor de fundo do card
  price: number;
  promotionalPrice?: number;
  available: boolean;
  stock: number;
  species: Species[];
  lifeStage?: string;
  weight?: string;
  size?: string;
  flavors?: string[];
  variations?: Variation[];
  subscriptionEligible?: boolean;
  tags: string[];
  rating?: number;
  reviewsCount?: number;
  crossSell?: string[]; // slugs relacionados
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  tint: string;
}

export interface ServiceSizePrice { P: number; M: number; G: number }

export interface Service {
  id: string;
  slug: string;
  name: string;
  description: string;
  duration: number; // minutos
  basePrice: number; // "a partir de"
  priceBySize: ServiceSizePrice;
  petTypes: Species[];
  includes: string[];
  popular?: boolean;
  requiresEvaluation?: boolean;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  since: string;
}

export interface DayHours { open: string; close: string }

export interface Location {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  whatsapp: string;
  hours: (DayHours | null)[]; // índice 0 = domingo
  mapsUrl: string;
  pickup: boolean;
}

export interface Review {
  name: string;
  pet: string;
  text: string;
  rating: number;
  service: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  minutes: number;
  image: string;
}

export interface Coupon {
  code: string;
  label: string;
  kind: "percent" | "freeship" | "amount";
  value: number;
}

export interface BusinessConfig {
  businessType: "petshop";
  name: string;
  tagline: string;
  headline: string;
  headlineAccent: string;
  subheadline: string;
  branding: {
    logo: string;
    colors: {
      brand: string; brandDeep: string; coral: string;
      leaf: string; leafDeep: string; mint: string; sea: string;
      cream: string; sand: string; sandDeep: string;
      bark: string; ink: string; fog: string;
    };
    fonts: { display: string; body: string; accent: string };
    photos: Record<string, string>;
  };
  contact: { phone: string; whatsapp: string; email: string; instagram: string };
  locations: Location[];
  categories: Category[];
  products: Product[];
  services: Service[];
  professionals: Professional[];
  coupons: Coupon[];
  reviews: Review[];
  articles: Article[];
  delivery: { fee: number; freeAbove: number; note: string };
  booking: { slotMinutes: number; blockedRanges: string[]; chooseProfessional: boolean; horizonDays: number };
  integrations: {
    whatsapp: { enabled: boolean };
    delivery: { enabled: boolean };
    marketplace: { enabled: boolean };
    ownCheckout: { enabled: boolean };
  };
  features: {
    ecommerce: boolean;
    cart: boolean;
    checkout: boolean;
    booking: boolean;
    grooming: boolean;
    petProfiles: boolean;
    loyalty: boolean;
    veterinary: boolean;
    recurringOrders: boolean;
    delivery: boolean;
  };
}

const IMG = {
  hero: "https://image.qwenlm.ai/generated-images/e9961647-3547-438b-90f0-73152d1a28e1/_result.png",
  bath: "https://image.qwenlm.ai/generated-images/8ad36909-cf28-4861-afe3-cc74fc22be21/_result.png",
  dry: "https://image.qwenlm.ai/generated-images/0b13bf55-ed58-4732-a60b-87e7ca986f67/_result.png",
  after: "https://image.qwenlm.ai/generated-images/3022affe-0225-46e0-ad8c-e2942e0d4577/_result.png",
  before: "https://image.qwenlm.ai/generated-images/71b4f2c1-70ec-4323-819b-7e058fc28042/_result.png",
  cat: "https://image.qwenlm.ai/generated-images/6785dbd4-7ea6-44d7-87ab-d435277bc335/_result.png",
  play: "https://image.qwenlm.ai/generated-images/8fbc8902-8ecc-4ac0-9394-c9d2b9232867/_result.png",
  store: "https://image.qwenlm.ai/generated-images/a4beb753-bdbc-4c96-84f9-3f32353027c2/_result.png",
  care: "https://image.qwenlm.ai/generated-images/15c10315-fe80-4c2e-a7a1-fe2e1e7199ed/_result.png",
};

export const business: BusinessConfig = {
  businessType: "petshop",
  name: "Amora Pet",
  tagline: "Casa de banho & lifestyle pet",
  headline: "Tudo para quem faz parte da",
  headlineAccent: "família.",
  subheadline: "Produtos, cuidados e carinho em um só lugar — com agendamento online, delivery no mesmo dia e gente que ama o que faz.",
  branding: {
    logo: "/icon.svg",
    colors: {
      brand: "#E7884A", brandDeep: "#C96A32", coral: "#EF796A",
      leaf: "#568C76", leafDeep: "#3F6E5B", mint: "#B8D9CD", sea: "#6799B5",
      cream: "#FFF8F0", sand: "#F1DFCA", sandDeep: "#E5CDAE",
      bark: "#5B4034", ink: "#2F2825", fog: "#71635D",
    },
    fonts: { display: "Sora", body: "DM Sans", accent: "Fraunces" },
    photos: IMG,
  },
  contact: {
    phone: "(11) 3456-7810",
    whatsapp: "5511976543210",
    email: "ola@amorapet.com.br",
    instagram: "@amorapet",
  },
  locations: [
    {
      id: "vila-madalena",
      name: "Amora Pet · Vila Madalena",
      address: "Rua Harmonia, 512",
      district: "Vila Madalena",
      city: "São Paulo · SP",
      phone: "(11) 3456-7810",
      whatsapp: "5511976543210",
      hours: [
        null, // domingo
        { open: "08:00", close: "19:00" },
        { open: "08:00", close: "19:00" },
        { open: "08:00", close: "19:00" },
        { open: "08:00", close: "19:00" },
        { open: "08:00", close: "19:00" },
        { open: "08:00", close: "18:00" }, // sábado
      ],
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Rua+Harmonia+512+Vila+Madalena+S%C3%A3o+Paulo",
      pickup: true,
    },
  ],
  categories: [
    { slug: "racao", name: "Ração", icon: "kibble", tint: "sand" },
    { slug: "petiscos", name: "Petiscos", icon: "treat", tint: "mint" },
    { slug: "brinquedos", name: "Brinquedos", icon: "ball", tint: "mint" },
    { slug: "higiene", name: "Banho & Higiene", icon: "drop", tint: "mint" },
    { slug: "camas", name: "Camas & Conforto", icon: "bed", tint: "sand" },
    { slug: "passeio", name: "Coleiras & Passeio", icon: "collar", tint: "sand" },
    { slug: "gatos", name: "Mundo Gato", icon: "cat", tint: "mint" },
  ],
  products: [
    {
      id: "p01", slug: "racao-primus-frango-arroz-15kg",
      name: "Ração Primus Frango & Arroz", brand: "Primus", category: "racao",
      description: "Receita premium para cães adultos de porte médio e grande, com frango como primeiro ingrediente.",
      details: ["Frango como 1º ingrediente", "Ômega 3 e 6 para pelagem", "Grão adaptado para portes médios e grandes"],
      art: "kibble-bag", artTint: "sand",
      price: 289.9, promotionalPrice: 249.9, available: true, stock: 18,
      species: ["caes"], lifeStage: "Adulto", weight: "15 kg",
      variations: [
        { id: "v3", label: "3 kg", price: 84.9, stock: 26 },
        { id: "v10", label: "10 kg", price: 199.9, stock: 14 },
        { id: "v15", label: "15 kg", price: 289.9, promotionalPrice: 249.9, stock: 18 },
      ],
      subscriptionEligible: true, tags: ["ofertas", "mais-vendidos"],
      rating: 4.9, reviewsCount: 212, crossSell: ["petisco-batata-doce", "tigela-elevada-bambu"],
    },
    {
      id: "p02", slug: "racao-gatos-castrados-salmao",
      name: "Ração Gatos Castrados Salmão", brand: "Miau Club", category: "racao",
      description: "Nutrição completa para gatos castrados, com salmão e controle de peso.",
      details: ["Proteína de salmão", "pH urinário equilibrado", "L-carnitina para controle de peso"],
      art: "cat-bag", artTint: "mint",
      price: 189.9, available: true, stock: 22,
      species: ["gatos"], lifeStage: "Adulto castrado", weight: "10 kg",
      variations: [
        { id: "v3", label: "3 kg", price: 69.9, stock: 30 },
        { id: "v10", label: "10 kg", price: 189.9, stock: 22 },
      ],
      subscriptionEligible: true, tags: ["mais-vendidos"],
      rating: 4.8, reviewsCount: 147, crossSell: ["areia-sanitaria-premium", "ratinho-catnip"],
    },
    {
      id: "p03", slug: "petisco-batata-doce",
      name: "Petisco Desidratado Batata-doce", brand: "Raiz Forte", category: "petiscos",
      description: "Palitos 100% batata-doce desidratada, um ingrediente só. Crocante e naturalmente doce.",
      details: ["Ingrediente único", "Sem conservantes", "Desidratado lentamente"],
      art: "treat-jar", artTint: "sand",
      price: 32.9, promotionalPrice: 27.9, available: true, stock: 40,
      species: ["caes", "gatos"], weight: "120 g",
      subscriptionEligible: true, tags: ["ofertas", "natural"],
      rating: 4.9, reviewsCount: 98, crossSell: ["racao-primus-frango-arroz-15kg"],
    },
    {
      id: "p04", slug: "biscoito-aveia-mel",
      name: "Biscoito Integral Aveia & Mel", brand: "Fornada Pet", category: "petiscos",
      description: "Assado artesanalmente em pequenos lotes, com aveia integral e mel.",
      details: ["Assado em pequenos lotes", "Sem corantes", "Crocância que ajuda na higiene bucal"],
      art: "biscuit", artTint: "sand",
      price: 24.9, available: true, stock: 35,
      species: ["caes"], weight: "200 g", tags: ["artesanal"],
      rating: 4.7, reviewsCount: 63, crossSell: ["petisco-batata-doce"],
    },
    {
      id: "p05", slug: "bolinha-borracha-amora",
      name: "Bolinha de Borracha Natural", brand: "Amora Basics", category: "brinquedos",
      description: "Borracha natural de alta resistência com quique imprevisível — a favorita da casa.",
      details: ["Borracha natural", "Quique errático", "Flutua na água"],
      art: "ball", artTint: "mint",
      price: 49.9, available: true, stock: 52,
      species: ["caes"], size: "Média · 6,5 cm", tags: ["mais-vendidos"],
      rating: 4.8, reviewsCount: 186, crossSell: ["corda-trancada", "peitoral-adventure"],
    },
    {
      id: "p06", slug: "corda-trancada",
      name: "Corda Trançada de Algodão", brand: "Amora Basics", category: "brinquedos",
      description: "Algodão trançado à mão, perfeita para cabo de guerra e brincadeiras de buscar.",
      details: ["Algodão 100%", "Trança reforçada", "Ajuda na limpeza dos dentes"],
      art: "rope", artTint: "sand",
      price: 39.9, available: true, stock: 28,
      species: ["caes"], size: "40 cm", tags: [],
      rating: 4.6, reviewsCount: 54, crossSell: ["bolinha-borracha-amora"],
    },
    {
      id: "p07", slug: "ratinho-catnip",
      name: "Ratinho de Catnip Orgânico", brand: "Miau Club", category: "brinquedos",
      description: "Feltro de lã com catnip orgânico costurado por dentro. Sucesso garantido entre felinos.",
      details: ["Catnip orgânico", "Lã natural", "Costura reforçada"],
      art: "mouse", artTint: "mint",
      price: 29.9, available: true, stock: 44,
      species: ["gatos"], size: "9 cm", tags: ["mais-vendidos"],
      rating: 4.9, reviewsCount: 121, crossSell: ["racao-gatos-castrados-salmao"],
    },
    {
      id: "p08", slug: "shampoo-neutro-aveia",
      name: "Shampoo Neutro de Aveia", brand: "Banho&Cia", category: "higiene",
      description: "Fórmula suave com extrato de aveia, desenvolvida para peles sensíveis.",
      details: ["pH balanceado para pets", "Extrato de aveia", "Fragrância leve de algodão"],
      art: "shampoo", artTint: "mint",
      price: 54.9, promotionalPrice: 44.9, available: true, stock: 30,
      species: ["caes", "gatos"], weight: "500 ml", tags: ["ofertas"],
      rating: 4.8, reviewsCount: 89, crossSell: ["condicionador-hidratante", "perfume-algodao"],
    },
    {
      id: "p09", slug: "condicionador-hidratante",
      name: "Condicionador Hidratante Manteiga de Karité", brand: "Banho&Cia", category: "higiene",
      description: "Hidratação profunda com manteiga de karité para pelagens ressecadas.",
      details: ["Manteiga de karité", "Desembaraça sem pesar", "Brilho natural"],
      art: "conditioner", artTint: "mint",
      price: 59.9, available: true, stock: 25,
      species: ["caes", "gatos"], weight: "500 ml", tags: [],
      rating: 4.7, reviewsCount: 41, crossSell: ["shampoo-neutro-aveia"],
    },
    {
      id: "p10", slug: "perfume-algodao",
      name: "Colônia Essência de Algodão", brand: "Banho&Cia", category: "higiene",
      description: "Colônia sem álcool com a assinatura olfativa da Amora: algodão fresco e fundo amadeirado.",
      details: ["Sem álcool", "Fixação prolongada", "Fragrância assinada Amora"],
      art: "perfume", artTint: "sand",
      price: 69.9, available: true, stock: 20,
      species: ["caes", "gatos"], weight: "120 ml", tags: ["assinatura"],
      rating: 4.9, reviewsCount: 76, crossSell: ["shampoo-neutro-aveia"],
    },
    {
      id: "p11", slug: "escova-removedora",
      name: "Escova Removedora de Pelos", brand: "Amora Basics", category: "higiene",
      description: "Cerdas flexíveis que removem o subpelo solto com conforto — sessão de carinho garantida.",
      details: ["Cerdas flexíveis", "Botão de limpeza rápida", "Cabo ergonômico"],
      art: "brush", artTint: "sand",
      price: 79.9, available: true, stock: 16,
      species: ["caes", "gatos"], tags: [],
      rating: 4.8, reviewsCount: 93, crossSell: ["shampoo-neutro-aveia"],
    },
    {
      id: "p12", slug: "cama-nuvem",
      name: "Cama Nuvem Ortopédica", brand: "Soneca", category: "camas",
      description: "Espuma viscoelástica que abraça o corpo e alivia pontos de pressão. Capa lavável.",
      details: ["Espuma viscoelástica", "Capa removível e lavável", "Base antiderrapante"],
      art: "bed", artTint: "sand",
      price: 259.9, promotionalPrice: 219.9, available: true, stock: 9,
      species: ["caes", "gatos"], size: "M · 70 cm", tags: ["ofertas"],
      rating: 4.9, reviewsCount: 58, crossSell: ["manta-tricô"],
    },
    {
      id: "p13", slug: "coleira-couro-caramelo",
      name: "Coleira de Couro Caramelo", brand: "Trilha", category: "passeio",
      description: "Couro legítimo curtido ao vegetal, ferragens em latão envelhecido. Envelhece bonito.",
      details: ["Couro curtido ao vegetal", "Ferragens em latão", "Ajuste fino de 5 furos"],
      art: "collar", artTint: "sand",
      price: 129.9, available: true, stock: 14,
      species: ["caes"], size: "P · M · G",
      variations: [
        { id: "vp", label: "P", price: 119.9, stock: 8 },
        { id: "vm", label: "M", price: 129.9, stock: 14 },
        { id: "vg", label: "G", price: 139.9, stock: 6 },
      ],
      tags: ["mais-vendidos"], rating: 4.9, reviewsCount: 132,
      crossSell: ["peitoral-adventure"],
    },
    {
      id: "p14", slug: "peitoral-adventure",
      name: "Peitoral Adventure Anti-puxão", brand: "Trilha", category: "passeio",
      description: "Peitoral em Y com ajuste em 4 pontos e alça de controle para caminhadas tranquilas.",
      details: ["Modelagem em Y", "4 pontos de ajuste", "Costuras refletivas"],
      art: "harness", artTint: "mint",
      price: 149.9, available: true, stock: 12,
      species: ["caes"], size: "P · M · G",
      variations: [
        { id: "vp", label: "P", price: 139.9, stock: 10 },
        { id: "vm", label: "M", price: 149.9, stock: 12 },
        { id: "vg", label: "G", price: 159.9, stock: 7 },
      ],
      tags: [], rating: 4.8, reviewsCount: 87, crossSell: ["coleira-couro-caramelo", "bolinha-borracha-amora"],
    },
    {
      id: "p15", slug: "areia-sanitaria-premium",
      name: "Areia Sanitária Grãos Finos", brand: "Miau Club", category: "gatos",
      description: "Grãos finos de alta absorção com torrão firme e baixo pó. A queridinha dos gatos exigentes.",
      details: ["Torrão firme", "Baixo pó", "Controle de odor por 7 dias"],
      art: "litter", artTint: "mint",
      price: 79.9, promotionalPrice: 69.9, available: true, stock: 33,
      species: ["gatos"], weight: "12 kg",
      subscriptionEligible: true, tags: ["ofertas", "mais-vendidos"],
      rating: 4.8, reviewsCount: 164, crossSell: ["racao-gatos-castrados-salmao"],
    },
    {
      id: "p16", slug: "tapete-higienico-80",
      name: "Tapete Higiênico Premium 80 un", brand: "Amora Basics", category: "higiene",
      description: "Camada de gel superabsorvente e bordas seladas. Seca rápido e neutraliza odores.",
      details: ["Gel superabsorvente", "Bordas seladas", "Atrativo canino"],
      art: "pads", artTint: "sand",
      price: 109.9, available: true, stock: 21,
      species: ["caes"], weight: "80 unidades · 80×60 cm",
      subscriptionEligible: true, tags: [],
      rating: 4.7, reviewsCount: 71, crossSell: ["shampoo-neutro-aveia"],
    },
  ],
  services: [
    {
      id: "s01", slug: "banho",
      name: "Banho",
      description: "Banho completo com produtos escolhidos para o tipo de pelagem, secagem e finalização com a colônia da casa.",
      duration: 90, basePrice: 69.9, priceBySize: { P: 69.9, M: 89.9, G: 119.9 },
      petTypes: ["caes", "gatos"],
      includes: ["Shampoo e condicionador", "Secagem completa", "Perfume da casa", "Laço ou gravatinha"],
      popular: true,
    },
    {
      id: "s02", slug: "banho-e-tosa",
      name: "Banho + Tosa",
      description: "O ritual completo: banho, tosa no estilo da raça ou tosa baixa, acabamento e muito carinho.",
      duration: 150, basePrice: 109.9, priceBySize: { P: 109.9, M: 139.9, G: 179.9 },
      petTypes: ["caes"],
      includes: ["Banho completo", "Tosa na máquina ou tesoura", "Acabamento de patas e rosto", "Perfume da casa"],
      popular: true,
    },
    {
      id: "s03", slug: "tosa-completa",
      name: "Tosa Completa",
      description: "Tosa estética ou funcional com acabamento de tesoura, respeitando o padrão e o conforto do pet.",
      duration: 90, basePrice: 89.9, priceBySize: { P: 89.9, M: 119.9, G: 149.9 },
      petTypes: ["caes"],
      includes: ["Tosa higiênica inclusa", "Acabamento de tesoura", "Escovação final"],
    },
    {
      id: "s04", slug: "hidratacao",
      name: "Hidratação de Pelos",
      description: "Máscara de hidratação profunda com massagem relaxante — para pelagens ressecadas ou longas.",
      duration: 45, basePrice: 59.9, priceBySize: { P: 59.9, M: 74.9, G: 89.9 },
      petTypes: ["caes", "gatos"],
      includes: ["Máscara de karité", "Massagem relaxante", "Enxágue morno"],
    },
    {
      id: "s05", slug: "corte-unhas",
      name: "Corte de Unhas",
      description: "Corte cuidadoso com alicate esterilizado e lixamento das pontas, no ritmo do seu pet.",
      duration: 20, basePrice: 29.9, priceBySize: { P: 29.9, M: 29.9, G: 34.9 },
      petTypes: ["caes", "gatos"],
      includes: ["Corte e lixamento", "Reforço positivo com petisco"],
    },
    {
      id: "s06", slug: "tosa-higienica",
      name: "Tosa Higiênica",
      description: "Aparo das regiões íntimas, patas e ao redor dos olhos para conforto e higiene no dia a dia.",
      duration: 40, basePrice: 49.9, priceBySize: { P: 49.9, M: 59.9, G: 69.9 },
      petTypes: ["caes", "gatos"],
      includes: ["Aparo de patas e regiões íntimas", "Limpeza de ouvidos"],
    },
  ],
  professionals: [
    { id: "pr01", name: "Bianca Duarte", role: "Groomer líder", since: "2016" },
    { id: "pr02", name: "Rafael Motta", role: "Groomer & tosador", since: "2019" },
    { id: "pr03", name: "Carol Mendes", role: "Banhista especialista em gatos", since: "2021" },
  ],
  coupons: [
    { code: "BEMVINDO10", label: "10% off no primeiro pedido", kind: "percent", value: 10 },
    { code: "FRETEGRATIS", label: "Entrega grátis", kind: "freeship", value: 0 },
    { code: "AMORA20", label: "R$ 20 off acima de R$ 150", kind: "amount", value: 20 },
  ],
  reviews: [
    { name: "Mariana R.", pet: "Thor · Golden", text: "O Thor entra abanando o rabo e sai cheiroso por uma semana. O agendamento pelo site acabou com a novela de ligar e esperar.", rating: 5, service: "Banho + Tosa" },
    { name: "Felipe A.", pet: "Mel · SRD", text: "Delivery chegou em menos de 2 horas e a ração veio com um petisco de brinde. Virou minha loja oficial.", rating: 5, service: "Delivery" },
    { name: "Camila S.", pet: "Mingau · Gato", text: "Único lugar em que o Mingau não volta estressado. A Carol tem um jeito único com gatos.", rating: 5, service: "Banho para gatos" },
    { name: "Rodrigo P.", pet: "Nina · Spitz", text: "Mandaram foto dela pronta antes mesmo de eu perguntar. Atendimento de outro nível.", rating: 5, service: "Tosa completa" },
    { name: "Juliana M.", pet: "Bob · Bulldog", text: "O Bob tem dermatite e só aqui usam o shampoo certo sem eu precisar pedir toda vez. Cuidado de verdade.", rating: 5, service: "Banho terapêutico" },
  ],
  articles: [
    { slug: "rotina-de-banho", title: "De quanto em quanto tempo dar banho?", excerpt: "A resposta depende da pelagem, da rotina e da pele do seu pet. Um guia simples para encontrar o ritmo certo.", tag: "Higiene", minutes: 4, image: IMG.bath },
    { slug: "brinquedo-certo", title: "Como escolher o brinquedo certo", excerpt: "Mastigador forte ou delicado? Veja como o estilo de brincadeira do seu cão define o brinquedo ideal.", tag: "Comportamento", minutes: 3, image: IMG.play },
    { slug: "adaptacao-gatos", title: "Adaptação de gatos: o guia da calma", excerpt: "Gatos precisam de tempo e território. Como apresentar a casa nova (e o pet shop) sem estresse.", tag: "Gatos", minutes: 5, image: IMG.cat },
    { slug: "checklist-passeio", title: "Checklist do passeio perfeito", excerpt: "Do peitoral certo à hidratação: o que levar para transformar o passeio no melhor momento do dia.", tag: "Rotina", minutes: 3, image: IMG.care },
  ],
  delivery: {
    fee: 12.9,
    freeAbove: 149,
    note: "Entregamos na Zona Oeste de São Paulo no mesmo dia para pedidos até 16h.",
  },
  booking: {
    slotMinutes: 60,
    blockedRanges: ["12:00-13:30"],
    chooseProfessional: true,
    horizonDays: 14,
  },
  integrations: {
    whatsapp: { enabled: true },
    delivery: { enabled: true },
    marketplace: { enabled: false },
    ownCheckout: { enabled: true },
  },
  features: {
    ecommerce: true,
    cart: true,
    checkout: true,
    booking: true,
    grooming: true,
    petProfiles: true,
    loyalty: true,
    veterinary: false,
    recurringOrders: true,
    delivery: true,
  },
};

/* ============ MOTOR DE TEMA ============ */
export function applyTheme(b: BusinessConfig) {
  const root = document.documentElement;
  const c = b.branding.colors;
  const map: Record<string, string> = {
    "--t-brand": c.brand, "--t-brand-deep": c.brandDeep, "--t-coral": c.coral,
    "--t-leaf": c.leaf, "--t-leaf-deep": c.leafDeep, "--t-mint": c.mint,
    "--t-sea": c.sea, "--t-cream": c.cream, "--t-sand": c.sand,
    "--t-sand-deep": c.sandDeep, "--t-bark": c.bark, "--t-ink": c.ink, "--t-fog": c.fog,
    "--font-display": `"${b.branding.fonts.display}", ui-sans-serif, sans-serif`,
    "--font-body": `"${b.branding.fonts.body}", ui-sans-serif, sans-serif`,
    "--font-accent": `"${b.branding.fonts.accent}", ui-serif, Georgia, serif`,
  };
  Object.entries(map).forEach(([k, v]) => root.style.setProperty(k, v));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", c.cream);
}

/* ============ HELPERS DE DOMÍNIO ============ */
export const SPECIES_LABEL: Record<Species, string> = { caes: "Cães", gatos: "Gatos" };

export function getProduct(slug: string) {
  return business.products.find((p) => p.slug === slug);
}
export function getService(slug: string) {
  return business.services.find((s) => s.slug === slug);
}
export function priceOf(p: Product, variationId?: string): number {
  if (variationId && p.variations) {
    const v = p.variations.find((x) => x.id === variationId);
    if (v) return v.promotionalPrice ?? v.price;
  }
  return p.promotionalPrice ?? p.price;
}
export function variationLabel(p: Product, variationId?: string): string | null {
  if (!variationId || !p.variations) return null;
  return p.variations.find((v) => v.id === variationId)?.label ?? null;
}
