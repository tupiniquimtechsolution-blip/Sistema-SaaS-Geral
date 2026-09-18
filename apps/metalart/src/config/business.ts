/**
 * ============================================================
 *  METAL & ART SERRALHERIA — CONFIGURAÇÃO CENTRAL DA EMPRESA
 * ============================================================
 *  Fontes verificadas:
 *  — Site oficial: metaleartserralheria.com.br (coletado em 22/08/2026)
 *  — Widget oficial de avaliações (Google/Trustindex) no próprio site
 *  — Ficha pública do Google (endereço no mapa incorporado)
 *  — Instagram oficial: @serralheriametaleart (legendas públicas)
 *
 *  Campos marcados com `// CONFIRMAR` precisam de validação
 *  direta com o cliente antes da publicação definitiva.
 * ============================================================
 */

export type Review = {
  name: string;
  rating: number;
  text: string;
  source: string;
  provisional?: boolean;
};

export type InstagramPost = {
  url: string;
  type: "REEL" | "POST";
  date: string;
  caption: string;
  tag: string;
  image: string;
};

export const business = {
  name: "Metal & Art Serralheria",
  shortName: "Metal & Art",
  // Slogan oficial exibido no site institucional
  slogan: "Cuidando da sua estrutura com precisão.",
  // Conceito criativo deste projeto (storytelling do site)
  conceptTagline: "Do metal à solução.",
  description:
    "Serralheria sob medida em São Paulo: reformas e reparos em portões, automação, travas eletromagnéticas, fechaduras, grades, corrimãos, guarda-corpos, portas de enrolar e estruturas metálicas para residências, condomínios e empresas.",

  // ---- Contato (confirmado no site oficial) ----
  phoneDisplay: "(11) 94937-1578",
  whatsappDigits: "5511949371578",
  email: "serralheria.metaleart@gmail.com",
  website: "https://metaleartserralheria.com.br/",

  // ---- Redes sociais (confirmadas) ----
  instagram: {
    handle: "@serralheriametaleart",
    url: "https://www.instagram.com/serralheriametaleart/",
  },
  facebook: {
    url: "https://www.facebook.com/serralheriametaleart/",
  },

  // ---- Endereço ----
  // Validação: o mapa incorporado no site oficial aponta
  // "R. Serra do Ouro Branco, 267 — Vila Carmosina, São Paulo/SP,
  // 08270-330". O rodapé do site abrevia para "Rua Serra do Ouro, 267".
  address: {
    street: "Rua Serra do Ouro Branco, 267",
    neighborhood: "Vila Carmosina",
    city: "São Paulo",
    state: "SP",
    zip: "08270-330",
    region: "Zona Leste",
  },

  get mapsEmbedUrl() {
    const q = encodeURIComponent(
      "Metal Art Serralheria — Rua Serra do Ouro Branco, 267, Vila Carmosina, São Paulo"
    );
    return `https://www.google.com/maps?q=${q}&output=embed`;
  },
  get mapsDirectionsUrl() {
    const q = encodeURIComponent(
      "Rua Serra do Ouro Branco, 267 - Vila Carmosina, São Paulo - SP, 08270-330"
    );
    return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  },
  get mapsReviewsUrl() {
    const q = encodeURIComponent(
      "Metal Art Serralheria Rua Serra do Ouro Branco 267 São Paulo"
    );
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  },

  // ---- Horários ---- // CONFIRMAR horários oficiais com o cliente
  hours: [
    { days: "Segunda a sexta", time: "consulte pelo WhatsApp" },
    { days: "Sábado", time: "consulte pelo WhatsApp" },
    { days: "Domingo", time: "fechado" },
  ],
  hoursNote:
    "Atendimento e visitas técnicas com hora marcada. Fale com a gente antes de ir até a oficina.",

  // ---- Áreas atendidas ----
  // Zona Leste confirmada no site; Centro de SP confirmado por
  // publicação oficial no Instagram (grades instaladas no centro).
  serviceAreas: ["Zona Leste de São Paulo", "Centro de São Paulo", "Grande São Paulo (sob consulta)"],
  serviceAreasNote:
    "Demais regiões da capital e Grande SP: consulte disponibilidade pelo WhatsApp.",

  // ---- Prova social (Google) ----
  // Regra: nota e quantidade NUNCA ficam congeladas sem data de coleta.
  // Coletado do widget oficial de avaliações (Google) exibido no site
  // da própria empresa em 22/08/2026. Recoletar antes de publicar e
  // periodicamente após a publicação.
  google: {
    rating: "5,0",
    ratingLabel: "EXCELENTE",
    reviewCount: 41,
    lastUpdated: "22/08/2026",
    source: "Widget oficial de avaliações (Google) no site metaleartserralheria.com.br",
  },

  /**
   * Avaliações públicas coletadas do widget oficial (Google) exibido
   * no site da empresa em 22/08/2026. Textos e nomes conforme
   * publicados. Recoletar a ficha periodicamente para atualizar.
   */
  googleReviews: [
    {
      name: "Rosangela Fracaro",
      rating: 5,
      text: "Muito atencioso. Prestam serviço de qualidade. Recomendo.",
      source: "Avaliação pública · Google",
    },
    {
      name: "Juliana Menezes",
      rating: 5,
      text: "Atendimento dentro do prazo, atenciosos e respeitosos. Preço justo. Recomendo.",
      source: "Avaliação pública · Google",
    },
    {
      name: "Vinicius Lopss",
      rating: 5,
      text: "O serviço ficou excelente. O portão ficou muito bem feito, resistente e com ótimo acabamento. Atendimento rápido, capricho em cada detalhe e tudo entregue certinho. Recomendo de verdade!",
      source: "Avaliação pública · Google",
    },
    {
      name: "Viviane Trudes",
      rating: 5,
      text: "Profissional extremamente competente. O serviço foi executado com excelente qualidade, preço justo e entregue dentro do prazo combinado. Recomendo com total confiança!",
      source: "Avaliação pública · Google",
    },
    {
      name: "Caio Brandao",
      rating: 5,
      text: "Atendimento nota 1.000, recomendo o serviço de qualidade e garantia. Agradeço, até o próximo serviço com certeza.",
      source: "Avaliação pública · Google",
    },
    {
      name: "Jackeline Rocha",
      rating: 5,
      text: "Atendimento impecável. Pontualidade na entrega. Fiz uma adega em metalon, fiquei impressionada com o acabamento. Recomendo.",
      source: "Avaliação pública · Google",
    },
    {
      name: "mii",
      rating: 5,
      text: "Atendimento excelente e um serviço muito bom!",
      source: "Avaliação pública · Google",
    },
  ] as Review[],

  // Alias de compatibilidade com componentes antigos do protótipo
  get provisionalReviews() {
    return this.googleReviews;
  },

  /**
   * Conteúdo público catalogado do Instagram oficial
   * (@serralheriametaleart) — legendas e datas verificadas.
   * As imagens exibidas no site são referências ilustrativas do
   * tipo de conteúdo; os cards linkam para as publicações originais.
   * >> SOLICITAR ARQUIVOS ORIGINAIS EM HD AO CLIENTE <<
   */
  instagramPosts: [] as InstagramPost[],
} as const;
