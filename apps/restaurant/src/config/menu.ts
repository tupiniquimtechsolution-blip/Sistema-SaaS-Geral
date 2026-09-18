/**
 * ============================================================
 * CARDÁPIO — Chez Amis Bistrô (dados configuráveis)
 * ------------------------------------------------------------
 * Itens e preços reais identificados no Instagram/Google estão
 * marcados; os demais valores são demonstrativos (faixa R$ 80–180
 * informada no Google) e devem ser confirmados. Imagens vêm de
 * src/config/images.ts.
 * ============================================================
 */
import { images } from "./images";

export interface Extra {
  name: string;
  price: number;
}

export type MenuTag = "mais-pedido" | "novo" | "vegetariano" | "picante" | "da-casa";

export interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  image: string;
  tags?: MenuTag[];
  extras?: Extra[];
  featured?: boolean;
}

export const menuCategories = [
  { id: "destaques", label: "Sugestões" },
  { id: "entradas", label: "Entradas" },
  { id: "principais", label: "Principais" },
  { id: "sobremesas", label: "Sobremesas" },
  { id: "bebidas", label: "Bar & Cave" },
] as const;

export const menuItems: MenuItem[] = [
  /* ------------------------------ SUGESTÕES ------------------------------ */
  {
    id: "steak-tartare",
    category: "principais",
    name: "Steak Tartare",
    description: "Clássico é clássico: filé mignon cru cortado na ponta da faca, finalizado na mesa.",
    ingredients: ["filé mignon", "gema caipira", "cornichons", "alcaparras", "salada verde", "fritas"],
    price: 75.9,
    image: images.steakTartare,
    tags: ["mais-pedido", "da-casa"],
    featured: true,
    extras: [
      { name: "Fritas extras", price: 12 },
      { name: "Pão da casa", price: 8 },
      { name: "Gema adicional", price: 5 },
    ],
  },
  {
    id: "beef-wellington",
    category: "principais",
    name: "Beef Wellington",
    description: "Filé envolto em massa folhada dourada com duxelles de cogumelos e redução de vinho.",
    ingredients: ["filé mignon", "massa folhada", "duxelles", "presunto cru", "jus de vinho tinto"],
    price: 138,
    image: images.beefWellington,
    tags: ["da-casa"],
    featured: true,
    extras: [
      { name: "Jus extra", price: 9 },
      { name: "Legumes glaceados", price: 14 },
    ],
  },
  {
    id: "sabores-da-franca",
    category: "destaques",
    name: "Menu Sabores da França",
    description: "O menu degustação da casa: uma entrada, três principais e uma sobremesa. Cinco tempos para brindar.",
    ingredients: ["1 entrada", "3 principais", "1 sobremesa", "por pessoa"],
    price: 129.9,
    image: images.cover,
    tags: ["mais-pedido"],
    featured: true,
  },
  {
    id: "menu-executivo",
    category: "destaques",
    name: "Menu Executivo",
    description: "De segunda a sexta, das 12h às 16h: entrada + principal (ou principal + sobremesa) no almoço.",
    ingredients: ["seg a sex", "12h — 16h", "entrada + principal"],
    price: 69.9,
    image: images.interior2,
    tags: ["novo"],
    featured: true,
  },

  /* ------------------------------ ENTRADAS ------------------------------ */
  {
    id: "sopa-de-cebola",
    category: "entradas",
    name: "Soupe à l'Oignon",
    description: "Sopa de cebola caramelizada gratinada com gruyère e pão tostado, direto do forno.",
    ingredients: ["cebolas caramelizadas", "caldo da casa", "gruyère", "baguete tostada"],
    price: 44.9,
    image: images.soupeOignon,
    tags: ["mais-pedido", "vegetariano"],
    extras: [{ name: "Gruyère extra", price: 9 }],
  },
  {
    id: "burrata-da-casa",
    category: "entradas",
    name: "Burrata da Casa",
    description: "Burrata cremosa com tomates confit, pesto e pão da casa ainda morno. (preço demonstrativo)",
    ingredients: ["burrata", "tomate confit", "pesto", "pão da casa"],
    price: 58.9,
    image: images.interior3,
    tags: ["vegetariano"],
    extras: [{ name: "Focaccia extra", price: 10 }],
  },
  {
    id: "salada-verde",
    category: "entradas",
    name: "Salada Verde da Estação",
    description: "Folhas frescas do dia com vinagrete de mostarda Dijon e nozes. (preço demonstrativo)",
    ingredients: ["folhas da estação", "mostarda dijon", "nozes", "vinagrete"],
    price: 36.9,
    image: images.interior4,
    tags: ["vegetariano"],
  },

  /* ------------------------------ PRINCIPAIS ------------------------------ */
  {
    id: "file-perigueux",
    category: "principais",
    name: "Filé ao Périgueux",
    description: "Filé mignon ao molho Périgueux de trufas negras com pommes purée. (preço demonstrativo)",
    ingredients: ["filé mignon", "molho périgueux", "trufas negras", "purê de batata"],
    price: 128.9,
    image: images.beefWellington,
    tags: ["da-casa"],
    extras: [{ name: "Purê extra", price: 12 }],
  },
  {
    id: "entrecote-fritas",
    category: "principais",
    name: "Entrecôte & Fritas",
    description: "Entrecôte grelhado com manteiga de ervas e as fritas mais pedidas da Haddock Lobo.",
    ingredients: ["entrecôte 300g", "manteiga de ervas", "fritas crocantes", "agrião"],
    price: 119.9,
    image: images.entrecote,
    tags: ["mais-pedido"],
    extras: [
      { name: "Fritas extras", price: 12 },
      { name: "Manteiga de ervas extra", price: 6 },
    ],
  },
  {
    id: "risoto-do-dia",
    category: "principais",
    name: "Risoto do Dia",
    description: "Arroz carnaroli mantecado na hora — pergunte o sabor do dia ao garçom. (preço demonstrativo)",
    ingredients: ["arroz carnaroli", "parmesão", "sabor do dia"],
    price: 79.9,
    image: images.interior3,
    tags: ["vegetariano"],
  },
  {
    id: "coq-au-vin",
    category: "principais",
    name: "Coq au Vin",
    description: "Frango caipira braseado lentamente no vinho tinto com legumes e cogumelos. (preço demonstrativo)",
    ingredients: ["frango caipira", "vinho tinto", "cogumelos", "legumes"],
    price: 89.9,
    image: images.interior2,
  },

  /* ------------------------------ SOBREMESAS ------------------------------ */
  {
    id: "creme-brulee",
    category: "sobremesas",
    name: "Crème Brûlée",
    description: "Creme de baunilha com a casquinha de caramelo quebrada na hora, na sua mesa.",
    ingredients: ["baunilha de verdade", "creme fresco", "caramelo crocante"],
    price: 38.9,
    image: images.cremeBrulee,
    tags: ["mais-pedido"],
    extras: [{ name: "Sorvete de creme", price: 10 }],
  },
  {
    id: "brulee-doce-de-leite",
    category: "sobremesas",
    name: "Crème Brûlée de Doce de Leite",
    description: "A versão brasileira do clássico — doce de leite queimado na medida.",
    ingredients: ["doce de leite", "creme fresco", "caramelo"],
    price: 40.9,
    image: images.cremeBrulee,
    tags: ["da-casa"],
  },
  {
    id: "sorbet-jabuticaba",
    category: "sobremesas",
    name: "Sorbet de Jabuticaba",
    description: "Fruta brasileira em sorbet leve e refrescante, feito na casa. (preço demonstrativo)",
    ingredients: ["jabuticaba", "base artesanal", "sem lactose"],
    price: 32.9,
    image: images.interior4,
    tags: ["vegetariano", "novo"],
  },

  /* ------------------------------ BAR & CAVE ------------------------------ */
  {
    id: "kir-borgonha",
    category: "bebidas",
    name: "Kir da Borgonha",
    description: "Crème de cassis com espumante brut — o brinde oficial da casa.",
    ingredients: ["crème de cassis", "espumante brut", "taça 150ml"],
    price: 42.9,
    image: images.kirRoyale,
    tags: ["da-casa"],
    featured: true,
  },
  {
    id: "taca-vinho",
    category: "bebidas",
    name: "Vinho em Taça (roteação)",
    description: "Taça da semana da nossa cave — Borgonha, Bordeaux e achados. Pergunte a sugestão.",
    ingredients: ["150ml", "tinto ou branco", "seleção da sommelier"],
    price: 39.9,
    image: images.kirRoyale,
  },
  {
    id: "french-75",
    category: "bebidas",
    name: "French 75",
    description: "Gin, limão-siciliano e espumante — elegante como o bistrô. (preço demonstrativo)",
    ingredients: ["gin london dry", "limão-siciliano", "espumante"],
    price: 44.9,
    image: images.kirRoyale,
    tags: ["novo"],
  },
  {
    id: "cafe-petits-fours",
    category: "bebidas",
    name: "Café & Petits Fours",
    description: "Espresso de torra média acompanhado de docinhos da casa. (preço demonstrativo)",
    ingredients: ["espresso", "petits fours do dia"],
    price: 18.9,
    image: images.interior1,
    tags: ["vegetariano"],
  },
];

export function getItemById(id: string): MenuItem | undefined {
  return menuItems.find((i) => i.id === id);
}

export function getExtrasPrice(item: MenuItem, extras: string[]): number {
  if (!item.extras) return 0;
  return extras.reduce((sum, name) => sum + (item.extras?.find((e) => e.name === name)?.price ?? 0), 0);
}
