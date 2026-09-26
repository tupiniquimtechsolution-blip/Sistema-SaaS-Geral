import { assets } from "../config/assets";

export type ProjectCategory =
  | "portoes"
  | "automacao"
  | "reformas"
  | "protecao"
  | "corrimaos"
  | "enrolar"
  | "estruturas";

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  tags: ProjectCategory[];
  description: string;
  scope: string[];
  images: string[];
  beforeImage?: string;
  afterImage?: string;
  serviceSlug: string;
  featured: boolean;
  tall?: boolean;
  // Origem do asset — ver ASSET_SOURCES.md
  source: string;
  location: string;
};

export const categoryLabels: Record<ProjectCategory, string> = {
  portoes: "Portões",
  automacao: "Automação",
  reformas: "Reformas",
  protecao: "Proteção",
  corrimaos: "Corrimãos",
  enrolar: "Portas de enrolar",
  estruturas: "Estruturas",
};

// NOTA (protótipo): nenhum nome de cliente é inventado.
// As imagens são assets temporários — substituir por trabalhos reais
// do Instagram @serralheriametaleart antes da publicação.
const TEMP = "Asset temporário de protótipo — substituir por foto real do Instagram @serralheriametaleart";

export const projects: Project[] = [
  {
    id: "p1",
    slug: "portao-deslizante-sob-medida",
    title: "Portão deslizante sob medida",
    category: "portoes",
    tags: ["portoes"],
    description:
      "Fabricação e instalação de portão deslizante em aço carbono com pintura em tom grafite e detalhe ripado. O vão foi medido no local e o trilho nivelado para deslizamento leve, já preparado para automação.",
    scope: ["Medição no local", "Fabricação em oficina", "Pintura de acabamento", "Instalação e nivelamento do trilho"],
    images: [assets.gates.sliding],
    serviceSlug: "portoes-sob-medida",
    featured: true,
    tall: true,
    source: TEMP,
    location: "São Paulo — SP",
  },
  {
    id: "p2",
    slug: "automacao-com-trava-eletromagnetica",
    title: "Automação com trava eletromagnética",
    category: "automacao",
    tags: ["automacao", "portoes"],
    description:
      "Instalação de motor com cremalheira e trava eletromagnética em portão residencial. Antes da automação, o conjunto passou por revisão de roldanas e alinhamento para garantir fim de curso preciso.",
    scope: ["Revisão do portão existente", "Instalação de motor e cremalheira", "Trava eletromagnética", "Testes de fim de curso"],
    images: [assets.automation.motor],
    serviceSlug: "automacao-de-portoes",
    featured: true,
    source: TEMP,
    location: "São Paulo — SP",
  },
  {
    id: "p3",
    slug: "reforma-completa-de-portao",
    title: "Reforma completa de portão",
    category: "reformas",
    tags: ["reformas", "portoes"],
    description:
      "Portão antigo com ferrugem e pintura comprometida passou por reforma completa: lixamento, tratamento antiferrugem, reforço de soldas, troca de componentes e pintura nova em grafite.",
    scope: ["Tratamento antiferrugem", "Reforço de soldas", "Troca de roldanas e dobradiças", "Pintura completa"],
    images: [assets.beforeAfter.after, assets.beforeAfter.before],
    beforeImage: assets.beforeAfter.before,
    afterImage: assets.beforeAfter.after,
    serviceSlug: "reforma-de-portoes",
    featured: true,
    tall: true,
    source: TEMP,
    location: "São Paulo — SP",
  },
  {
    id: "p4",
    slug: "grades-de-protecao-geometricas",
    title: "Grades de proteção com desenho geométrico",
    category: "protecao",
    tags: ["protecao"],
    description:
      "Grades para janelas com geometria limpa que protege o vão sem pesar na fachada. Fixação reforçada na alvenaria e pintura eletrostática na cor da esquadria.",
    scope: ["Medição dos vãos", "Fabricação sob medida", "Fixação reforçada", "Pintura na cor da fachada"],
    images: [assets.grids.window],
    serviceSlug: "grades-de-protecao",
    featured: true,
    tall: true,
    source: TEMP,
    location: "São Paulo — SP",
  },
  {
    id: "p5",
    slug: "corrimao-e-guarda-corpo",
    title: "Corrimão e guarda-corpo de escada",
    category: "corrimaos",
    tags: ["corrimaos"],
    description:
      "Corrimão em aço com pega ergonômica e guarda-corpo de perfis verticais para escada interna. Fixação estrutural na parede e acabamento combinando com os degraus de madeira.",
    scope: ["Projeto da linha do corrimão", "Fixação estrutural", "Pintura em preto fosco", "Guarda-corpo integrado"],
    images: [assets.railings.handrail],
    serviceSlug: "corrimaos",
    featured: true,
    tall: true,
    source: TEMP,
    location: "São Paulo — SP",
  },
  {
    id: "p6",
    slug: "porta-de-enrolar-comercial",
    title: "Porta de enrolar para comércio",
    category: "enrolar",
    tags: ["enrolar"],
    description:
      "Porta de enrolar em aço galvanizado para vitrine de loja, com acionamento leve e travamento seguro. Guias reguladas e molas balanceadas para o peso exato da porta.",
    scope: ["Fabricação sob medida do vão", "Instalação de guias e eixo", "Balanceamento de molas", "Travamento de segurança"],
    images: [assets.rollingDoors.storefront],
    serviceSlug: "porta-de-enrolar",
    featured: true,
    source: TEMP,
    location: "São Paulo — SP",
  },
  {
    id: "p7",
    slug: "portao-social-com-interfone",
    title: "Portão social com interfone",
    category: "portoes",
    tags: ["portoes"],
    description:
      "Portão social em aço com barras verticais, preparado para interfone e trava elétrica. Altura e vão conferidos na medição para abrir leve e travar sempre.",
    scope: ["Medição e conferência do vão", "Fabricação sob medida", "Preparação para interfone", "Instalação com trava"],
    images: [assets.gates.social],
    serviceSlug: "portoes-sob-medida",
    featured: false,
    tall: true,
    source: TEMP,
    location: "São Paulo — SP",
  },
  {
    id: "p8",
    slug: "estrutura-metalica-em-fabricacao",
    title: "Estrutura metálica em fabricação",
    category: "estruturas",
    tags: ["estruturas"],
    description:
      "Perfil estrutural em corte e solda na oficina: cada peça sai dimensionada para a carga que vai receber, com solda contínua e proteção anticorrosiva antes da instalação.",
    scope: ["Dimensionamento dos perfis", "Corte e solda em oficina", "Proteção anticorrosiva", "Instalação no local"],
    images: [assets.workshop.fabrication],
    serviceSlug: "estruturas-metalicas",
    featured: false,
    source: TEMP,
    location: "Oficina Metal & Art — São Paulo",
  },
  {
    id: "p9",
    slug: "portao-reformado-e-pintado",
    title: "Portão reformado e repintado",
    category: "reformas",
    tags: ["reformas"],
    description:
      "Reforma estética e funcional: remoção da pintura antiga, correção de pontos de ferrugem, regulagem de abertura e pintura nova. O mesmo portão, operando como novo.",
    scope: ["Remoção da pintura antiga", "Tratamento de ferrugem", "Regulagem de abertura", "Pintura nova"],
    images: [assets.beforeAfter.after],
    serviceSlug: "reforma-de-portoes",
    featured: false,
    tall: true,
    source: TEMP,
    location: "São Paulo — SP",
  },
];

export const getProject = (slug: string) =>
  projects.find((p) => p.slug === slug);

export const filters: { id: ProjectCategory | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "portoes", label: "Portões" },
  { id: "automacao", label: "Automação" },
  { id: "reformas", label: "Reformas" },
  { id: "protecao", label: "Proteção" },
  { id: "corrimaos", label: "Corrimãos" },
  { id: "enrolar", label: "Enrolar" },
  { id: "estruturas", label: "Estruturas" },
];
