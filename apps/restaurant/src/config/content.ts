/**
 * ============================================================
 * CONTEÚDO EDITORIAL — Chez Amis Bistrô
 * ------------------------------------------------------------
 * Promos, storytelling, avaliações, equipe, Instagram e FAQ.
 * Textos inspirados no perfil oficial (@chezamis.bistro) e na
 * ficha do Google. Avaliações e equipe são demonstrativas.
 * ============================================================
 */
import { images } from "./images";

export interface Promo {
  id: string;
  badge: string;
  title: string;
  description: string;
  detail: string;
  code?: string;
  image: string;
}

export const promos: Promo[] = [
  {
    id: "sabores-da-franca",
    badge: "Menu degustação",
    title: "Sabores da França",
    description: "O espírito do bistrô francês em cinco tempos: uma entrada, três principais e uma sobremesa para fechar com Kir da Borgonha.",
    detail: "R$ 129,90 por pessoa · almoço e jantar · todos os dias",
    image: images.cover,
  },
  {
    id: "menu-executivo",
    badge: "Seg a Sex · 12h–16h",
    title: "Menu Executivo",
    description: "Almoço descomplicado no coração dos Jardins: entrada + principal (ou principal + sobremesa) servidos com a leveza da casa.",
    detail: "R$ 69,90 · de segunda a sexta, das 12h às 16h",
    code: "ALMOCO",
    image: images.interior2,
  },
  {
    id: "tartare-do-dia",
    badge: "Finalizado na mesa",
    title: "Steak Tartare na ponta da faca",
    description: "Filé mignon cru cortado na hora, temperado ao seu gosto e servido com salada verde e fritas. O clássico que a rua inteira comenta.",
    detail: "R$ 75,90 · todos os dias, das 12h às 23h",
    image: images.steakTartare,
  },
  {
    id: "kir-hour",
    badge: "Para brindar",
    title: "Kir da Borgonha em boa companhia",
    description: "Crème de cassis e espumante no fim de tarde da Haddock Lobo. Seja para brindar ou para aquecer a alma — a mesa é sua.",
    detail: "R$ 42,90 a taça · happy hour de terça a sexta",
    code: "SANTE",
    image: images.kirRoyale,
  },
];

export interface StoryStep {
  id: string;
  kicker: string;
  title: string;
  text: string;
  image: string;
  stat: string;
}

export const storySteps: StoryStep[] = [
  {
    id: "mercado",
    kicker: "Capítulo 01",
    title: "O mercado manda na cozinha",
    text: "Legumes da estação, ervas frescas e carnes selecionadas de fornecedores próximos. O cardápio muda quando a estação muda — e é assim que tem que ser.",
    image: images.storyMarket,
    stat: "ingredientes de estação",
  },
  {
    id: "tecnica",
    kicker: "Capítulo 02",
    title: "Técnica francesa, alma brasileira",
    text: "Fundos reduzidos por horas, massas folhadas na casa, caramelização no ponto. A base clássica da França com o tempero que só São Paulo entende.",
    image: images.storyTechnique,
    stat: "fundos de 8 horas",
  },
  {
    id: "montagem",
    kicker: "Capítulo 03",
    title: "Leveza, cor e sabor",
    text: "Cada prato sai da cozinha como a gente gosta de descrever a casa: um refúgio onde a gastronomia francesa ganha leveza, cor e sabor.",
    image: images.storyPlating,
    stat: "5 tempos no degustação",
  },
  {
    id: "mesa",
    kicker: "Capítulo 04",
    title: "A mesa posta, a casa cheia",
    text: "Do almoço executivo ao jantar com Kir na mão: atendimento próximo, valet na porta e pratos que aquecem a alma. Chez Amis é, literalmente, a casa dos amigos.",
    image: images.storyTable,
    stat: "aberto todos os dias",
  },
];

export interface Testimonial {
  name: string;
  area: string;
  text: string;
  rating: number;
  item: string;
}

/** AVALIAÇÕES DEMONSTRATIVAS — não representam clientes reais. A nota média real é 4,4★ no Google (1.148 avaliações). */
export const testimonials: Testimonial[] = [
  {
    name: "Mariana C.",
    area: "Cerqueira César",
    text: "O steak tartare finalizado na mesa é um espetáculo à parte — tempero na medida, do jeito que o garçom sugeriu. Virei cliente do almoço.",
    rating: 5,
    item: "Steak Tartare",
  },
  {
    name: "Rafael T.",
    area: "Jardins",
    text: "Fui no Sabores da França com a minha esposa e saímos impressionados: cinco tempos muito bem executados por um preço justo na região.",
    rating: 5,
    item: "Menu Sabores da França",
  },
  {
    name: "Juliana P.",
    area: "Pinheiros",
    text: "Menu executivo de qualidade rara em São Paulo. A sopa de cebola gratinada chegou borbulhando — e o crème brûlée foi disputado na mesa.",
    rating: 4.5,
    item: "Menu Executivo",
  },
  {
    name: "Diego A.",
    area: "Bela Vista",
    text: "Ambiente acolhedor, atendimento impecável e um Wellington que vale a travessia da cidade. O valet na porta facilita demais.",
    rating: 5,
    item: "Beef Wellington",
  },
  {
    name: "Camila R.",
    area: "Consolação",
    text: "O Kir da Borgonha no fim de tarde virou ritual de sexta. Casa charmosa, descomplicada e com alma — exatamente como promete.",
    rating: 4.8,
    item: "Kir da Borgonha",
  },
];

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
}

/** Equipe demonstrativa — substituir pelos nomes e fotos reais. */
export const team: TeamMember[] = [
  {
    name: "Chef da casa",
    role: "Cozinha & criação",
    bio: "Comanda os clássicos franceses com técnica rigorosa e o toque descomplicado que define o Chez Amis.",
    image: images.chef,
  },
  {
    name: "Sommelière",
    role: "Cave & bar",
    bio: "Assina a rotação de vinhos em taça e os brindes da casa — do Kir da Borgonha aos achados da semana.",
    image: images.kirRoyale,
  },
  {
    name: "Chef pâtissier",
    role: "Sobremesas",
    bio: "Responsável pelo crème brûlée quebrado na hora, pelo sorbet de jabuticaba e pelos petits fours do café.",
    image: images.cremeBrulee,
  },
];

export interface InstaTile {
  id: string;
  image: string;
  caption: string;
  likes: string;
}

export const instagramTiles: InstaTile[] = [
  { id: "i1", image: images.steakTartare, caption: "Steak tartare cortado na ponta da faca", likes: "1,3 mil" },
  { id: "i2", image: images.interior1, caption: "O refúgio da Haddock Lobo, 74", likes: "986" },
  { id: "i3", image: images.kirRoyale, caption: "Kir da Borgonha para brindar a semana", likes: "754" },
  { id: "i4", image: images.cremeBrulee, caption: "Crème brûlée quebrado na sua mesa", likes: "1,5 mil" },
  { id: "i5", image: images.chef, caption: "Bastidores da cozinha do Chef", likes: "2,1 mil" },
  { id: "i6", image: images.interior2, caption: "Mesa posta, casa cheia, alma aquecida", likes: "890" },
];

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: "Preciso reservar para jantar?",
    a: "Recomendamos, principalmente de quinta a sábado. A reserva é feita pelo WhatsApp (11) 94504-4541 com nome, data, horário e número de pessoas.",
  },
  {
    q: "Como funciona o Menu Executivo?",
    a: "De segunda a sexta, das 12h às 16h: entrada + principal (ou principal + sobremesa) por R$ 69,90. O cardápio muda com as estações.",
  },
  {
    q: "O que é o menu Sabores da França?",
    a: "Nosso menu degustação: uma entrada, três principais e uma sobremesa por R$ 129,90 por pessoa — servido no almoço e no jantar, todos os dias.",
  },
  {
    q: "Vocês têm valet?",
    a: "Sim! Valet na porta da Haddock Lobo, 74. Para quem prefere, há estacionamentos na região e a estação Trianon-Masp fica a poucos minutos a pé.",
  },
  {
    q: "Fazem eventos e grupos grandes?",
    a: "Fazemos. Aniversários, confraternizações e mesas longas com o menu degustação são a nossa especialidade — chame no WhatsApp para montar a proposta.",
  },
  {
    q: "Quais as formas de pagamento?",
    a: "Pix, cartões de crédito e débito. Pedidos de retirada e encomendas pelo WhatsApp seguem as mesmas condições.",
  },
];

export const philosophy = [
  {
    n: "01",
    title: "Francês descomplicado",
    text: "Clássicos de verdade, sem cerimônia desnecessária. A técnica é rigorosa; a experiência, leve.",
  },
  {
    n: "02",
    title: "Leveza, cor e sabor",
    text: "A frase que define a casa: gastronomia francesa que ganha vida no prato e na mesa.",
  },
  {
    n: "03",
    title: "Pratos que aquecem a alma",
    text: "Sopa borbulhando, massa folhada dourada, caramelo quebrando. Conforto com sotaque.",
  },
  {
    n: "04",
    title: "Chez Amis é na casa dos amigos",
    text: "Do almoço de terça ao brinde de sábado: atendimento próximo, valet na porta e todo mundo bem-vindo.",
  },
];
