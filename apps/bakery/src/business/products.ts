/* ============================================================
   CATÁLOGO DO TENANT — produtos, categorias
   Cadastro puro em dados: sem código, só conteúdo.
   ============================================================ */
import type { Category, Product } from "./types";
import { IMG } from "./config";

export const categories: Category[] = [
  { slug: "paes", name: "Pães", image: IMG.sourdough, tagline: "Fermentação natural, forno de lastro" },
  { slug: "folhados", name: "Folhados", image: IMG.croissant, tagline: "Manteiga francesa, 27 camadas" },
  { slug: "salgados", name: "Salgados", image: IMG.paoQueijo, tagline: "Quentinhos, de hora em hora" },
  { slug: "doces", name: "Doces & Bolos", image: IMG.cake, tagline: "Confeitaria de balcão" },
  { slug: "cafe", name: "Cafés", image: IMG.coffee, tagline: "Origem única, torra fresca" },
  { slug: "sanduiches", name: "Sanduíches", image: IMG.sandwich, tagline: "Montados na hora, no nosso pão" },
  { slug: "combos", name: "Combos & Cestas", image: IMG.counter, tagline: "Para a mesa cheia" },
];

export const products: Product[] = [
  {
    id: "p01", slug: "sourdough-da-casa", name: "Sourdough da Casa",
    category: "paes", images: [IMG.sourdough, IMG.counter],
    shortDescription: "Nosso pão-assinatura: fermentação de 48h, casca grossa e miolo úmido.",
    description:
      "Assado duas vezes ao dia em forno de lastro, o Sourdough da Casa nasce de um levain alimentado desde 2016. Farinha orgânica, água, sal marinho e 48 horas de fermentação lenta. Casca caramelizada, acidez equilibrada e aquele aroma que fica na cozinha.",
    price: 28, available: true, featured: true, bestseller: true,
    ingredients: ["Farinha orgânica", "Água filtrada", "Levain", "Sal marinho"],
    allergens: ["Glúten"],
    variations: [
      { id: "peso", name: "Peso", options: [
        { id: "500", label: "500g", delta: 0 },
        { id: "1kg", label: "1kg", delta: 14 },
      ] },
    ],
    preparationTime: "Fornadas às 6h e 16h",
    tags: ["vegano", "fermentação natural"],
    unit: "unidade",
    pairsWith: ["manteiga-da-casa", "cappuccino-da-casa"],
  },
  {
    id: "p02", slug: "pao-fermentacao-48h", name: "Pão de Fermentação Lenta",
    category: "paes", images: [IMG.sourdough, IMG.baguette],
    shortDescription: "Integral de fermentação longa, com sementes tostadas na casca.",
    description:
      "Farinha integral moída em pedra, linhaça e girassol tostados, 48 horas de levain. Densos, nutritivo e perfeito para torradas generosas com manteiga.",
    price: 32, promotionalPrice: 26, available: true, featured: true, isNew: true,
    ingredients: ["Farinha integral", "Levain", "Sementes", "Sal marinho"],
    allergens: ["Glúten"],
    preparationTime: "Fornada única às 7h",
    tags: ["vegano", "integral", "promoção"],
    unit: "unidade 700g",
    pairsWith: ["manteiga-da-casa"],
  },
  {
    id: "p03", slug: "baguete-classica", name: "Baguete Clássica",
    category: "paes", images: [IMG.baguette],
    shortDescription: "Casca que estala, miolo aberto. Assada a cada duas horas.",
    description:
      "Trigo francês, poolish de 12 horas e vapor no forno. A baguete que os franceses do bairro aprovam — crocante por fora, alveolada por dentro.",
    price: 14, available: true, bestseller: true,
    allergens: ["Glúten"],
    preparationTime: "Assada a cada 2 horas",
    tags: ["vegano"],
    unit: "unidade 300g",
  },
  {
    id: "p04", slug: "pao-de-queijo-mineiro", name: "Pão de Queijo Mineiro",
    category: "salgados", images: [IMG.paoQueijo],
    shortDescription: "Polvilho de Minas, queijo canastra curado. Caixa com 6.",
    description:
      "Receita de família: polvilho azedo escaldado, queijo canastra curado por 60 dias e ovos caipiras. Assamos de hora em hora — saem estalando.",
    price: 18, available: true, featured: true, bestseller: true,
    ingredients: ["Polvilho", "Queijo canastra", "Ovos caipiras", "Leite", "Manteiga"],
    allergens: ["Leite", "Ovos"],
    preparationTime: "Assado de hora em hora",
    tags: ["sem glúten"],
    unit: "caixa com 6",
    pairsWith: ["cappuccino-da-casa", "espresso-duplo"],
  },
  {
    id: "p05", slug: "croissant-de-manteiga", name: "Croissant de Manteiga",
    category: "folhados", images: [IMG.croissant],
    shortDescription: "27 camadas de manteiga francesa. O favorito da casa.",
    description:
      "Laminado à mão com manteiga AOP de Isigny, fermenta 16 horas na câmara fria. Quando sai do forno, a cozinha inteira para. Sirva morno, sempre.",
    price: 12, available: true, featured: true, bestseller: true,
    ingredients: ["Farinha", "Manteiga AOP", "Levain", "Leite", "Açúcar", "Sal"],
    allergens: ["Glúten", "Leite"],
    preparationTime: "Fornada às 6h30 e 15h",
    unit: "unidade",
    pairsWith: ["cappuccino-da-casa", "cafe-coado-v60"],
  },
  {
    id: "p06", slug: "croissant-de-amendoas", name: "Croissant de Amêndoas",
    category: "folhados", images: [IMG.croissant, IMG.cake],
    shortDescription: "Recheado com creme de amêndoas, coberto com lâminas tostadas.",
    description:
      "O croissant do dia anterior ganha segunda vida: banhado em calda, recheado com frangipane de amêndoas e assado de novo. Doçura na medida.",
    price: 16, available: true, isNew: true,
    allergens: ["Glúten", "Leite", "Amêndoas", "Ovos"],
    unit: "unidade",
  },
  {
    id: "p07", slug: "bolo-chocolate-70", name: "Bolo de Chocolate 70%",
    category: "doces", images: [IMG.cake],
    shortDescription: "Chocolate 70% de origem baiana, ganache brilhante.",
    description:
      "Massa úmida de cacau de origem, ganache de chocolate 70% e pitada de flor de sal. Na fatia para agora, ou inteiro para a sua comemoração — neste caso, encomende com 24h de antecedência.",
    price: 15, available: true, featured: true,
    ingredients: ["Chocolate 70%", "Ovos", "Manteiga", "Farinha", "Flor de sal"],
    allergens: ["Glúten", "Leite", "Ovos"],
    variations: [
      { id: "formato", name: "Formato", options: [
        { id: "fatia", label: "Fatia", delta: 0 },
        { id: "inteiro", label: "Inteiro (12 fatias)", delta: 89 },
      ] },
    ],
    preparationTime: "Pronto para retirada",
    unit: "fatia",
    pairsWith: ["cappuccino-da-casa"],
  },
  {
    id: "p08", slug: "bolo-cenoura-brigadeiro", name: "Bolo de Cenoura com Brigadeiro",
    category: "doces", images: [IMG.cake],
    shortDescription: "O clássico brasileiro, com brigadeiro de cacau 50%.",
    description:
      "Cenoura orgânica batida na hora, massa fofa e cobertura generosa de brigadeiro feito com cacau 50%. Memória afetiva em forma de fatia.",
    price: 13, available: true, bestseller: true,
    allergens: ["Glúten", "Leite", "Ovos"],
    unit: "fatia",
  },
  {
    id: "p09", slug: "cappuccino-da-casa", name: "Cappuccino da Casa",
    category: "cafe", images: [IMG.coffee],
    shortDescription: "Espresso duplo, leite vaporizado e canela fresca.",
    description:
      "Blend exclusivo torrado semanalmente, extraído em espresso duplo e finalizado com leite vaporizado na textura de veludo. Finaliza com canela moída na hora.",
    price: 11, available: true, featured: true, bestseller: true,
    variations: [
      { id: "tamanho", name: "Tamanho", options: [
        { id: "200", label: "200ml", delta: 0 },
        { id: "300", label: "300ml", delta: 3 },
      ] },
    ],
    preparationTime: "Feito na hora · 3 min",
    allergens: ["Leite"],
    unit: "xícara",
    pairsWith: ["croissant-de-manteiga", "bolo-chocolate-70"],
  },
  {
    id: "p10", slug: "espresso-duplo", name: "Espresso Duplo",
    category: "cafe", images: [IMG.coffee],
    shortDescription: "18g de café, extração de 27 segundos.",
    description:
      "Nosso blend da semana, moído na hora e extraído em 27 segundos. Corpo cheio, doçura de caramelo e finalização longa.",
    price: 8, available: true,
    preparationTime: "Feito na hora · 1 min",
    unit: "xícara 60ml",
    tags: ["vegano"],
  },
  {
    id: "p11", slug: "cafe-coado-v60", name: "Café Coado na V60",
    category: "cafe", images: [IMG.coffee],
    shortDescription: "Origem única do Cerrado Mineiro, moído na hora.",
    description:
      "Microlote do Cerrado Mineiro, torra clara, coado na V60 com água a 92°C. Notas de rapadura, laranja e floral. Para beber devagar.",
    price: 10, available: true, isNew: true,
    preparationTime: "Coado na hora · 5 min",
    tags: ["vegano", "origem única"],
    unit: "xícara 200ml",
    pairsWith: ["croissant-de-amendoas"],
  },
  {
    id: "p12", slug: "sanduiche-da-fornalha", name: "Sanduíche da Fornalha",
    category: "sanduiches", images: [IMG.sandwich],
    shortDescription: "Pernil desfiado 12h, queijo derretido e rúcula no sourdough.",
    description:
      "Pernil assado por 12 horas em baixa temperatura, desfiado na hora, com queijo meia-cura derretido, rúcula e maionese de alho assado. No sourdough ou na baguete — você escolhe.",
    price: 26, available: true, featured: true, bestseller: true,
    ingredients: ["Pernil", "Queijo meia-cura", "Rúcula", "Maionese de alho", "Pão da casa"],
    allergens: ["Glúten", "Leite", "Ovos"],
    variations: [
      { id: "pao", name: "Pão", options: [
        { id: "sourdough", label: "Sourdough", delta: 0 },
        { id: "baguete", label: "Baguete", delta: 0 },
      ] },
    ],
    extras: [
      { id: "queijo", name: "Queijo extra", price: 5 },
      { id: "bacon", name: "Bacon crocante", price: 6 },
      { id: "ovo", name: "Ovo caipira", price: 4 },
    ],
    preparationTime: "Montado na hora · 12 min",
    unit: "unidade",
    pairsWith: ["espresso-duplo", "cafe-coado-v60"],
  },
  {
    id: "p13", slug: "manteiga-da-casa", name: "Manteiga Artesanal",
    category: "paes", images: [IMG.counter],
    shortDescription: "Batida na casa, com flor de sal. Pote de 200g.",
    description:
      "Creme de leite fresco batido até o ponto de manteiga, finalizada com flor de sal. A companhia oficial do nosso sourdough.",
    price: 22, available: true,
    allergens: ["Leite"],
    tags: ["sem glúten"],
    unit: "pote 200g",
  },
  {
    id: "p14", slug: "combo-manha-fornalha", name: "Combo Manhã da Fornalha",
    category: "combos", images: [IMG.croissant, IMG.coffee],
    shortDescription: "Croissant de manteiga + cappuccino 200ml. O par perfeito.",
    description:
      "O encontro que a casa recomenda: croissant de manteiga ainda morno com o cappuccino da casa em 200ml. Juntos, saem por menos.",
    price: 19.9, available: true, featured: true,
    comboItems: ["1 Croissant de Manteiga", "1 Cappuccino da Casa 200ml"],
    preparationTime: "10 min",
    unit: "combo",
  },
  {
    id: "p15", slug: "combo-duplo", name: "Combo Duplo",
    category: "combos", images: [IMG.coffee, IMG.paoQueijo],
    shortDescription: "2 cappuccinos + 2 caixas de pão de queijo. Para dividir.",
    description:
      "Dois cappuccinos da casa e duas caixas de pão de queijo mineiro saindo do forno. Para a mesa de dois — ou para um só, sem julgamentos.",
    price: 44.9, available: true,
    comboItems: ["2 Cappuccinos da Casa", "2 Pães de Queijo Mineiro (12 un)"],
    preparationTime: "12 min",
    unit: "combo",
  },
  {
    id: "p16", slug: "cesta-de-cafe-da-manha", name: "Cesta de Café da Manhã",
    category: "combos", images: [IMG.counter, IMG.croissant],
    shortDescription: "Pães, folhados, geleias, frutas e café para 2 pessoas.",
    description:
      "A mesa completa da Fornalha na sua casa: mini sourdough, 2 croissants, 2 pães de queijo, geleia artesanal, manteiga da casa, frutas da estação e 500ml de café coado. Encomende com 24h de antecedência.",
    price: 89, available: true, featured: true,
    comboItems: ["Mini sourdough", "2 Croissants", "2 Pães de queijo", "Geleia da estação", "Manteiga artesanal", "Frutas", "Café coado 500ml"],
    preparationTime: "Encomendar com 24h",
    unit: "cesta para 2",
  },
];

export const ORDER_TYPES = [
  { id: "bolo", label: "Bolo confeitado", hint: "Aniversário, casamento, celebrações" },
  { id: "coffeebreak", label: "Coffee break", hint: "Empresas e eventos, a partir de 10 pessoas" },
  { id: "cesta", label: "Cestas & kits", hint: "Café da manhã, presente, datas especiais" },
  { id: "festa", label: "Mesa de festa", hint: "Salgados e doces por cento" },
  { id: "grande", label: "Grande quantidade", hint: "Pães e folhados em volume" },
] as const;
