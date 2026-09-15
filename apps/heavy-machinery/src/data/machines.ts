/**
 * CATÁLOGO — LUSOMAQ
 * ------------------------------------------------------------------
 * Os nomes de exportação (Machine, MACHINES…) foram mantidos para
 * compatibilidade da arquitetura, mas a semântica agora é de PEÇAS
 * para rolos compactadores.
 *
 * ⚠ Os itens abaixo são um CATÁLOGO-EXEMPLO montado com as famílias
 * reais que a Lusomaq distribui (site oficial). Substitua códigos,
 * aplicações e preços pelo estoque real — veja CLIENT_REPLACEMENT_GUIDE.md.
 * As FOTOS são reais, servidas do site oficial da empresa.
 */

export type Category =
  | "bombas"
  | "rolamentos"
  | "filtros"
  | "vedacoes"
  | "transmissao"
  | "motorpecas"
  | "rodado"
  | "tanques";

export interface SpecRow {
  label: string;
  value: string;
}
export interface SpecGroup {
  title: string;
  rows: SpecRow[];
}

export interface Machine {
  id: string;
  slug: string;
  code: string;
  /** Marca do ROLO a que a peça se aplica */
  brand: string;
  /** Marca/fabricante da peça */
  oem: string;
  model: string;
  category: Category;
  condition: "original" | "compativel";
  status: "disponivel" | "reservada" | "vendida";
  price: number | null;
  priceWas?: number;
  weightKg?: number;
  application: string;
  description: string;
  specGroups: SpecGroup[];
  images: string[];
  badges: string[];
  featured?: boolean;
  location: string;
}

export interface Implement {
  id: string;
  brand: string;
  model: string;
  type: string;
  glyph: "motor" | "bomba" | "filtro" | "engrenagem" | "rodado" | "tanque" | "vedacao" | "transmissao";
  compat: string;
  condition: string;
  price: number | null;
  description: string;
}

/* ---------- imagens (reais, do site oficial + 1 gerada p/ hotspot) ---------- */
const A = "https://www.lusomaq.com.br/assets";
export const IMG = {
  logo: `${A}/logo-Ck6vucEm.png`,
  road: `${A}/road-background-Bob74QJe.jpg`,
  predio: `${A}/predio-Dm1lldnl.jpg`,
  hero1: `${A}/hero-1-DvT7Ydhf.png`,
  hero2: `${A}/hero-2-BZlGxdRH.png`,
  hero3: `${A}/hero-3-cxJApPb9.png`,
  hero4: `${A}/hero-4-C1RBZU4T.png`,
  hero5: `${A}/hero-5-PtPh9hy2.png`,
  hero6: `${A}/hero-6-C_OXp637.png`,
  p1: `${A}/1-C58fN39r.jpg`,
  p2: `${A}/2-MFxvpRl5.png`,
  p3: `${A}/3-BHJZ7aca.png`,
  p4: `${A}/4-QCk9Pd6D.jpg`,
  p5: `${A}/5-DNDvUUgZ.webp`,
  p6: `${A}/6-DO2M7PTm.jpg`,
  p7: `${A}/7-2oRO_xYG.webp`,
  p8: `${A}/8-ezgFEYIa.webp`,
  p9: `${A}/9-BA-2aaKu.png`,
  p10: `${A}/10-DKA2yT4C.webp`,
  p11: `${A}/11-BORu3z45.jpg`,
  p12: `${A}/12-D-Bv-W6w.png`,
  p13: `${A}/13-Bh7MqQI8.png`,
  p14: `${A}/14-BIdLG7rz.jpg`,
  p15: `${A}/15-D4DkJqm1.png`,
  p16: `${A}/16-D4feJTF0.jpg`,
  p17: `${A}/17-A69A-Izg.png`,
  p18: `${A}/18-CCsX5lxm.png`,
  p19: `${A}/19-lHoLP7B1.jpg`,
  p20: `${A}/20-BZ6A-Ab2.jpg`,
  p21: `${A}/21-y6fY6DnA.png`,
  p22: `${A}/22-BkxzQ147.jpg`,
  p23: `${A}/23-BBivjG3Z.jpg`,
  p24: `${A}/24-AvaEqN2H.png`,
  rolo: "https://image.qwenlm.ai/generated-images/39c090ff-ca75-4848-8317-90b99bdcc0e2/_result.png",
};

export const CATEGORY_META: Record<Category, { label: string; plural: string; image: string; blurb: string }> = {
  bombas: {
    label: "Bomba hidráulica",
    plural: "Bombas & motores hidráulicos",
    image: IMG.p1,
    blurb: "Bombas de vibração, direção e transmissão. Sundstrand, Sauer Danfoss e Eaton.",
  },
  rolamentos: {
    label: "Rolamento",
    plural: "Rolamentos & duocones",
    image: IMG.p3,
    blurb: "Rolamentos de tambor, eixo e roda. SKF, Timken, FAG e NTN.",
  },
  filtros: {
    label: "Filtro",
    plural: "Filtros & filtragem",
    image: IMG.p16,
    blurb: "Ar, óleo, hidráulico e combustível. Donaldson, Fleetguard e Mann-Filter.",
  },
  vedacoes: {
    label: "Vedação",
    plural: "Vedações & retentores",
    image: IMG.p5,
    blurb: "Retentores, O-rings, coxins e jogos de juntas. Sabó e Corpas.",
  },
  transmissao: {
    label: "Transmissão",
    plural: "Caixas, engrenagens & redutores",
    image: IMG.p8,
    blurb: "Caixas de câmbio, engrenagens, PTOs, diferenciais e redutores finais.",
  },
  motorpecas: {
    label: "Peça de motor",
    plural: "Peças de motor",
    image: IMG.p17,
    blurb: "Bombas d'água, juntas, correias e componentes para Perkins, MWM, Deutz e mais.",
  },
  rodado: {
    label: "Rodado",
    plural: "Rodas, pneus & cubos",
    image: IMG.p10,
    blurb: "Pneus, rodas, cubos, roletes e material rodante. Goodyear e Continental.",
  },
  tanques: {
    label: "Tanque & mangueira",
    plural: "Tanques, mangueiras & bicos",
    image: IMG.p14,
    blurb: "Tanques hidráulicos e de água, mangueiras, mangotes e bicos espargidores.",
  },
};

const SP = "São Paulo/SP";

const spec = (
  code: string,
  oem: string,
  brand: string,
  application: string,
  system: string,
  extra: SpecRow[] = [],
): SpecGroup[] => [
  {
    title: "Identificação",
    rows: [
      { label: "Código Lusomaq", value: code },
      { label: "Marca da peça", value: oem },
      { label: "Procedência", value: "Estoque próprio Lusomaq" },
    ],
  },
  {
    title: "Aplicação",
    rows: [
      { label: "Marca do rolo", value: brand },
      { label: "Modelos", value: application },
      { label: "Sistema", value: system },
    ],
  },
  ...(extra.length ? [{ title: "Detalhes", rows: extra }] : []),
];

export const MACHINES: Machine[] = [
  {
    id: "bomba-vibracao-ca250",
    slug: "bomba-hidraulica-vibracao-dynapac-ca250",
    code: "LM-0143",
    brand: "Dynapac",
    oem: "Sauer Danfoss",
    model: "Bomba hidráulica de vibração",
    category: "bombas",
    condition: "original",
    status: "disponivel",
    price: 4890,
    weightKg: 14.2,
    application: "CA150 · CA250 · CA300",
    description:
      "Bomba de pistões para circuito de vibração, revisada em bancada com laudo de vazão e pressão. Pronta para despacho no mesmo dia.",
    specGroups: spec("LM-0143", "Sauer Danfoss", "Dynapac", "CA150 / CA250 / CA300", "Vibração", [
      { label: "Peso", value: "14,2 kg" },
      { label: "Teste", value: "Bancada com laudo de vazão" },
    ]),
    images: [IMG.p1, IMG.p18, IMG.p6],
    badges: ["Pronta entrega", "Testada em bancada"],
    featured: true,
    location: SP,
  },
  {
    id: "duocone-dynapac",
    slug: "duocone-dynapac",
    code: "LM-0310",
    brand: "Dynapac",
    oem: "Lusomaq selecionado",
    model: "Duocone de vedação do tambor",
    category: "rolamentos",
    condition: "compativel",
    status: "disponivel",
    price: 860,
    weightKg: 2.8,
    application: "CA150 · CA250",
    description:
      "Duocone com anéis de vedação dupla para tambor vibratório. A peça que mais sai do balcão — sempre em estoque.",
    specGroups: spec("LM-0310", "Lusomaq selecionado", "Dynapac", "CA150 / CA250", "Tambor / vedação", [
      { label: "Peso", value: "2,8 kg" },
    ]),
    images: [IMG.p3, IMG.p2, IMG.p12],
    badges: ["Mais vendido"],
    featured: true,
    location: SP,
  },
  {
    id: "rolamento-hamm-3410",
    slug: "kit-rolamentos-hamm-3410",
    code: "LM-0522",
    brand: "Hamm",
    oem: "SKF",
    model: "Kit de rolamentos do eixo",
    category: "rolamentos",
    condition: "original",
    status: "disponivel",
    price: 1290,
    weightKg: 6.4,
    application: "3410 · 3412",
    description:
      "Kit completo com rolamentos, capas e travas para eixo de rolo Hamm. Linha SKF com nota e garantia de fábrica.",
    specGroups: spec("LM-0522", "SKF", "Hamm", "3410 / 3412", "Eixo / transmissão", [
      { label: "Peso", value: "6,4 kg" },
      { label: "Conteúdo", value: "2 rolamentos + capas + travas" },
    ]),
    images: [IMG.p2, IMG.p3, IMG.p12],
    badges: ["Pronta entrega"],
    location: SP,
  },
  {
    id: "filtro-ar-ca150",
    slug: "filtro-ar-dynapac-ca150",
    code: "LM-0780",
    brand: "Dynapac",
    oem: "Donaldson",
    model: "Filtro de ar primário + segurança",
    category: "filtros",
    condition: "original",
    status: "disponivel",
    price: 340,
    weightKg: 1.6,
    application: "CA130 · CA150 · CA250",
    description:
      "Conjunto primário + elemento de segurança Donaldson. A troca em dia é o que salva o motor Perkins do seu rolo.",
    specGroups: spec("LM-0780", "Donaldson", "Dynapac", "CA130 / CA150 / CA250", "Admissão de ar", [
      { label: "Peso", value: "1,6 kg" },
      { label: "Kit", value: "Primário + segurança" },
    ]),
    images: [IMG.p16, IMG.p4, IMG.p6],
    badges: ["Pronta entrega"],
    location: SP,
  },
  {
    id: "kit-vedacao-240",
    slug: "kit-o-rings-retentores-240",
    code: "LM-0911",
    brand: "Multi-marcas",
    oem: "Sabó",
    model: "Kit de O-rings e retentores (240 pçs)",
    category: "vedacoes",
    condition: "compativel",
    status: "disponivel",
    price: 490,
    weightKg: 3.1,
    application: "Rolos e equipamentos de terraplanagem",
    description:
      "Caixa organizadora com 240 vedações nas medidas mais usadas em rolos compactadores. Resolve a maioria dos vazamentos na hora.",
    specGroups: spec("LM-0911", "Sabó", "Multi-marcas", "Uso geral em pavimentação", "Vedação", [
      { label: "Peso", value: "3,1 kg" },
      { label: "Conteúdo", value: "240 peças em 24 medidas" },
    ]),
    images: [IMG.p5, IMG.p21, IMG.p19],
    badges: ["Mais vendido"],
    location: SP,
  },
  {
    id: "bomba-agua-12v",
    slug: "bomba-dagua-pressurizada-12v",
    code: "LM-1027",
    brand: "Multi-marcas",
    oem: "Lusomaq selecionado",
    model: "Bomba d'água pressurizada 12V",
    category: "motorpecas",
    condition: "compativel",
    status: "disponivel",
    price: 780,
    weightKg: 2.2,
    application: "Sistema de aspersão de rolos",
    description:
      "Bomba 12V para sistema de água do rolo pneumático e liso. Pressão constante nos bicos, sem falha de molhagem.",
    specGroups: spec("LM-1027", "Lusomaq selecionado", "Multi-marcas", "Aspersão de água", "Sistema de água", [
      { label: "Tensão", value: "12 V" },
      { label: "Peso", value: "2,2 kg" },
    ]),
    images: [IMG.p6, IMG.p15, IMG.p24],
    badges: ["Pronta entrega"],
    location: SP,
  },
  {
    id: "caixa-transmissao-ca250",
    slug: "caixa-transmissao-dynapac-ca250",
    code: "LM-1180",
    brand: "Dynapac",
    oem: "Dynapac",
    model: "Caixa de transmissão",
    category: "transmissao",
    condition: "original",
    status: "disponivel",
    price: null,
    weightKg: 96,
    application: "CA250",
    description:
      "Caixa de transmissão original com engrenagens e eixos conferidos. Peça de grande porte — orçamento sob consulta com prazo de despacho.",
    specGroups: spec("LM-1180", "Dynapac", "Dynapac", "CA250", "Transmissão", [
      { label: "Peso", value: "96 kg" },
    ]),
    images: [IMG.p7, IMG.p8, IMG.p13],
    badges: ["Peça de grande porte"],
    featured: true,
    location: SP,
  },
  {
    id: "engrenagens-tracao",
    slug: "jogo-engrenagens-tracao-dynapac",
    code: "LM-1245",
    brand: "Dynapac",
    oem: "Lusomaq selecionado",
    model: "Jogo de engrenagens de tração",
    category: "transmissao",
    condition: "compativel",
    status: "disponivel",
    price: 1650,
    weightKg: 11.8,
    application: "CA250 · CA300",
    description:
      "Jogo completo de engrenagens do conjunto de tração, com tratamento térmico conferido peça a peça.",
    specGroups: spec("LM-1245", "Lusomaq selecionado", "Dynapac", "CA250 / CA300", "Tração", [
      { label: "Peso", value: "11,8 kg" },
    ]),
    images: [IMG.p8, IMG.p13, IMG.p7],
    badges: ["Pronta entrega"],
    location: SP,
  },
  {
    id: "pto-muller",
    slug: "tomada-forca-pto-muller-ap4000",
    code: "LM-1330",
    brand: "Muller",
    oem: "Muller",
    model: "Tomada de força (PTO)",
    category: "transmissao",
    condition: "original",
    status: "reservada",
    price: null,
    application: "AP4000",
    description:
      "PTO original Muller. Unidade reservada para cliente — entre na lista de espera ou consulte similar em estoque.",
    specGroups: spec("LM-1330", "Muller", "Muller", "AP4000", "Transmissão"),
    images: [IMG.p9, IMG.p7, IMG.p8],
    badges: [],
    location: SP,
  },
  {
    id: "pneu-rolo-231-26",
    slug: "pneu-rolo-compactador-231-26",
    code: "LM-1418",
    brand: "Multi-marcas",
    oem: "Goodyear",
    model: "Pneu 23.1-26 para rolo pneumático",
    category: "rodado",
    condition: "compativel",
    status: "disponivel",
    price: 3980,
    weightKg: 118,
    application: "Rolos pneumáticos em geral",
    description:
      "Pneu industrial com lona reforçada para trabalho contínuo em base e sub-base. Par ou jogo completo com desconto.",
    specGroups: spec("LM-1418", "Goodyear", "Multi-marcas", "Rolos pneumáticos", "Rodado", [
      { label: "Medida", value: "23.1-26" },
      { label: "Peso", value: "118 kg" },
    ]),
    images: [IMG.p10, IMG.p11, IMG.p20],
    badges: ["Pronta entrega"],
    location: SP,
  },
  {
    id: "roda-aco-pneumatico",
    slug: "roda-aco-rolo-pneumatico",
    code: "LM-1502",
    brand: "Multi-marcas",
    oem: "Lusomaq selecionado",
    model: "Roda de aço com cubo montado",
    category: "rodado",
    condition: "compativel",
    status: "disponivel",
    price: 2150,
    weightKg: 42,
    application: "Rolos pneumáticos",
    description: "Roda com cubo, rolamentos e retentores montados — chega pronta para instalar.",
    specGroups: spec("LM-1502", "Lusomaq selecionado", "Multi-marcas", "Rolos pneumáticos", "Rodado", [
      { label: "Peso", value: "42 kg" },
    ]),
    images: [IMG.p11, IMG.p12, IMG.p10],
    badges: [],
    location: SP,
  },
  {
    id: "cubo-bw211",
    slug: "cubo-rolamento-bomag-bw211",
    code: "LM-1590",
    brand: "Bomag",
    oem: "Bomag",
    model: "Cubo com rolamento",
    category: "rodado",
    condition: "original",
    status: "disponivel",
    price: 1480,
    weightKg: 9.5,
    application: "BW211 · BW213",
    description: "Cubo original Bomag com rolamento de alta capacidade já prensado.",
    specGroups: spec("LM-1590", "Bomag", "Bomag", "BW211 / BW213", "Rodado", [
      { label: "Peso", value: "9,5 kg" },
    ]),
    images: [IMG.p12, IMG.p2, IMG.p11],
    badges: ["Pronta entrega"],
    location: SP,
  },
  {
    id: "tanque-hidraulico-120",
    slug: "tanque-hidraulico-120l",
    code: "LM-1664",
    brand: "Multi-marcas",
    oem: "Lusomaq selecionado",
    model: "Tanque hidráulico 120 L",
    category: "tanques",
    condition: "compativel",
    status: "disponivel",
    price: null,
    weightKg: 38,
    application: "Adaptação para rolos e pavimentadoras",
    description:
      "Tanque em chapa com tampa, respiro e conexões sob medida. Fabricação conforme aplicação — informe o modelo do seu equipamento.",
    specGroups: spec("LM-1664", "Lusomaq selecionado", "Multi-marcas", "Sob consulta", "Hidráulica", [
      { label: "Capacidade", value: "120 L" },
    ]),
    images: [IMG.p13, IMG.p14, IMG.p18],
    badges: [],
    location: SP,
  },
  {
    id: "mangueiras-alta",
    slug: "kit-mangueiras-alta-pressao",
    code: "LM-1731",
    brand: "Multi-marcas",
    oem: "Gates",
    model: "Kit de mangueiras alta pressão 1/2\"",
    category: "tanques",
    condition: "compativel",
    status: "disponivel",
    price: 260,
    weightKg: 2.4,
    application: "Circuitos de vibração e direção",
    description: "Kit com 4 mangueiras Gates prensadas nas medidas padrão de rolos Dynapac e Hamm.",
    specGroups: spec("LM-1731", "Gates", "Multi-marcas", "Vibração / direção", "Hidráulica", [
      { label: "Bitola", value: "1/2\"" },
      { label: "Kit", value: "4 mangueiras prensadas" },
    ]),
    images: [IMG.p14, IMG.p15, IMG.p13],
    badges: ["Pronta entrega"],
    location: SP,
  },
  {
    id: "bicos-espargidores",
    slug: "kit-bicos-espargidores-asfalto",
    code: "LM-1815",
    brand: "Multi-marcas",
    oem: "Lusomaq selecionado",
    model: "Kit de bicos espargidores",
    category: "tanques",
    condition: "compativel",
    status: "disponivel",
    price: 190,
    weightKg: 0.9,
    application: "Sistema de água de rolos",
    description: "Kit com 10 bicos e conexões para barra de aspersão. Jato uniforme, sem entupir com impureza.",
    specGroups: spec("LM-1815", "Lusomaq selecionado", "Multi-marcas", "Barra de aspersão", "Sistema de água", [
      { label: "Kit", value: "10 bicos + conexões" },
    ]),
    images: [IMG.p15, IMG.p24, IMG.p6],
    badges: ["Mais vendido"],
    location: SP,
  },
  {
    id: "filtro-combustivel-ca300",
    slug: "filtro-combustivel-dynapac-ca300",
    code: "LM-1902",
    brand: "Dynapac",
    oem: "Fleetguard",
    model: "Filtro de combustível + separador",
    category: "filtros",
    condition: "original",
    status: "disponivel",
    price: 96,
    application: "CA250 · CA300 (motor Cummins)",
    description: "Filtro com separador de água Fleetguard para motores Cummins dos rolos Dynapac linha pesada.",
    specGroups: spec("LM-1902", "Fleetguard", "Dynapac", "CA250 / CA300", "Combustível"),
    images: [IMG.p16, IMG.p4, IMG.p17],
    badges: ["Pronta entrega"],
    location: SP,
  },
  {
    id: "juntas-mwm",
    slug: "jogo-juntas-motor-mwm-410",
    code: "LM-2010",
    brand: "Multi-marcas",
    oem: "MWM",
    model: "Jogo de juntas do motor",
    category: "motorpecas",
    condition: "original",
    status: "disponivel",
    price: 420,
    application: "MWM 4.10 (CA150 / CA250)",
    description: "Jogo completo de juntas superior e inferior para motor MWM 4.10 dos rolos compactadores.",
    specGroups: spec("LM-2010", "MWM", "Multi-marcas", "Motor MWM 4.10", "Motor", [
      { label: "Conteúdo", value: "Juntas superior + inferior" },
    ]),
    images: [IMG.p17, IMG.p5, IMG.p19],
    badges: ["Pronta entrega"],
    location: SP,
  },
  {
    id: "motor-vibracao-sundstrand",
    slug: "motor-hidraulico-vibracao-sundstrand",
    code: "LM-2133",
    brand: "Multi-marcas",
    oem: "Sundstrand",
    model: "Motor hidráulico de vibração",
    category: "bombas",
    condition: "original",
    status: "disponivel",
    price: null,
    weightKg: 21,
    application: "Rolos vibratórios diversos",
    description:
      "Motor de vibração Sundstrand revisado, com laudo. A dupla perfeita com a bomba LM-0143 para restaurar a vibração original.",
    specGroups: spec("LM-2133", "Sundstrand", "Multi-marcas", "Rolos vibratórios", "Vibração", [
      { label: "Peso", value: "21 kg" },
      { label: "Teste", value: "Bancada com laudo" },
    ]),
    images: [IMG.p18, IMG.p1, IMG.p9],
    badges: ["Testada em bancada"],
    featured: true,
    location: SP,
  },
  {
    id: "coxins-amortecedores",
    slug: "coxins-amortecedores-dynapac-ca250",
    code: "LM-2208",
    brand: "Dynapac",
    oem: "Lusomaq selecionado",
    model: "Jogo de coxins amortecedores",
    category: "vedacoes",
    condition: "compativel",
    status: "disponivel",
    price: 375,
    application: "CA250",
    description: "Jogo com 8 coxins para isolamento do módulo vibratório. Borracha com dureza original.",
    specGroups: spec("LM-2208", "Lusomaq selecionado", "Dynapac", "CA250", "Estrutura / vibração", [
      { label: "Jogo", value: "8 coxins" },
    ]),
    images: [IMG.p19, IMG.p5, IMG.p21],
    badges: ["Mais vendido"],
    location: SP,
  },
  {
    id: "correias-gates",
    slug: "jogo-correias-motor-gates",
    code: "LM-2311",
    brand: "Multi-marcas",
    oem: "Gates",
    model: "Jogo de correias do motor",
    category: "motorpecas",
    condition: "compativel",
    status: "disponivel",
    price: 210,
    application: "Perkins · MWM · Deutz",
    description: "Correias Gates nas medidas dos motores mais comuns em rolos. Kit com as 3 do conjunto.",
    specGroups: spec("LM-2311", "Gates", "Multi-marcas", "Perkins / MWM / Deutz", "Motor", [
      { label: "Kit", value: "3 correias" },
    ]),
    images: [IMG.p20, IMG.p16, IMG.p17],
    badges: ["Pronta entrega"],
    location: SP,
  },
  {
    id: "roletes-material-rodante",
    slug: "roletes-material-rodante",
    code: "LM-2415",
    brand: "Multi-marcas",
    oem: "Lusomaq selecionado",
    model: "Roletes para material rodante",
    category: "rodado",
    condition: "compativel",
    status: "disponivel",
    price: 640,
    application: "Equipamentos de esteira",
    description:
      "Estoque completo de roletes superiores e inferiores para material rodante — disponibilidade e variedade para quem não pode parar.",
    specGroups: spec("LM-2415", "Lusomaq selecionado", "Multi-marcas", "Equipamentos de esteira", "Material rodante"),
    images: [IMG.p21, IMG.p10, IMG.p11],
    badges: ["Pronta entrega"],
    location: SP,
  },
  {
    id: "redutor-final-hamm",
    slug: "redutor-final-hamm",
    code: "LM-2519",
    brand: "Hamm",
    oem: "Hamm",
    model: "Redutor / transmissão final",
    category: "transmissao",
    condition: "original",
    status: "disponivel",
    price: null,
    weightKg: 84,
    application: "Hamm linha 3400",
    description: "Redutor final original com planetária conferida. Orçamento sob consulta, despacho programado.",
    specGroups: spec("LM-2519", "Hamm", "Hamm", "Linha 3400", "Transmissão final", [
      { label: "Peso", value: "84 kg" },
    ]),
    images: [IMG.p22, IMG.p9, IMG.p7],
    badges: ["Peça de grande porte"],
    location: SP,
  },
  {
    id: "cabos-comando",
    slug: "cabos-comando-rolo",
    code: "LM-2630",
    brand: "Multi-marcas",
    oem: "Lusomaq selecionado",
    model: "Cabos de comando e aceleração",
    category: "motorpecas",
    condition: "compativel",
    status: "disponivel",
    price: 180,
    application: "Rolos em geral",
    description: "Cabos com terminais prensados nas medidas originais. Acabamento com proteção antiabrasão.",
    specGroups: spec("LM-2630", "Lusomaq selecionado", "Multi-marcas", "Uso geral", "Comandos"),
    images: [IMG.p23, IMG.p15, IMG.p14],
    badges: [],
    location: SP,
  },
  {
    id: "sistema-aspersao",
    slug: "sistema-aspersao-agua-completo",
    code: "LM-2704",
    brand: "Multi-marcas",
    oem: "Lusomaq selecionado",
    model: "Sistema de aspersão de água completo",
    category: "tanques",
    condition: "compativel",
    status: "disponivel",
    price: 720,
    application: "Rolos lisos e pneumáticos",
    description:
      "Kit completo: bomba, tanque, barra, bicos e mangueiras para remontar o sistema de água do rolo por inteiro.",
    specGroups: spec("LM-2704", "Lusomaq selecionado", "Multi-marcas", "Rolos lisos / pneumáticos", "Sistema de água", [
      { label: "Kit", value: "Bomba + tanque + barra + bicos" },
    ]),
    images: [IMG.p24, IMG.p6, IMG.p15],
    badges: ["Pronta entrega"],
    location: SP,
  },
];

/* ---------- motores distribuídos (rota /motores) ---------- */

export const IMPLEMENTS: Implement[] = [
  {
    id: "motor-perkins-4236",
    brand: "Perkins",
    model: "Motor 4.236",
    type: "Motor diesel",
    glyph: "motor",
    compat: "Rolos Dynapac CA250 / CA300",
    condition: "Novo",
    price: null,
    description: "Motor diesel 4 cilindros, o coração da linha Dynapac no Brasil. Peças e motor completo sob consulta.",
  },
  {
    id: "motor-mwm-410",
    brand: "MWM",
    model: "Motor 4.10",
    type: "Motor diesel",
    glyph: "motor",
    compat: "Rolos CA150 / CA250 nacionais",
    condition: "Novo",
    price: null,
    description: "Linha MWM com reposição nacional completa — do jogo de juntas à bomba injetora.",
  },
  {
    id: "motor-cummins-b33",
    brand: "Cummins",
    model: "Motor B3.3",
    type: "Motor diesel",
    glyph: "motor",
    compat: "Rolos compactos e mini-carregadeiras",
    condition: "Novo",
    price: null,
    description: "Compacto e econômico, equipa rolos de porte médio. Filtros Fleetguard sempre em estoque.",
  },
  {
    id: "motor-deutz-f3l912",
    brand: "Deutz",
    model: "Motor F3L 912",
    type: "Motor diesel",
    glyph: "motor",
    compat: "Rolos Muller e equipamentos antigos",
    condition: "Novo",
    price: null,
    description: "Refrigeração a ar, robustez alemã. Atendimento especializado na linha Deutz.",
  },
  {
    id: "motor-kubota-v2203",
    brand: "Kubota",
    model: "Motor V2203",
    type: "Motor diesel",
    glyph: "motor",
    compat: "Rolos compactos / sapo",
    condition: "Novo",
    price: null,
    description: "Para rolos compactos e equipamentos leves. Peças originais Kubota com pronta entrega.",
  },
  {
    id: "motor-mercedes-om352",
    brand: "Mercedes-Benz",
    model: "Motor OM 352",
    type: "Motor diesel",
    glyph: "motor",
    compat: "Equipamentos pesados e usinas",
    condition: "Novo",
    price: null,
    description: "O clássico 6 cilindros para aplicações pesadas. Peças de motor e periféricos.",
  },
];

/* ---------- helpers ---------- */

export function machineBySlug(slug: string) {
  return MACHINES.find((m) => m.slug === slug);
}

export function featuredMachines() {
  return MACHINES.filter((m) => m.featured && m.status === "disponivel");
}

export function availableCount() {
  return MACHINES.filter((m) => m.status === "disponivel").length;
}
