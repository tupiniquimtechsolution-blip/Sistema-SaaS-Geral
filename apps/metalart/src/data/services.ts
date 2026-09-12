import { assets } from "../config/assets";

export type Service = {
  id: string;
  slug: string;
  name: string;
  tag: string;
  shortDescription: string;
  description: string[];
  benefits: string[];
  applications: string[];
  images: string[];
  featured: boolean;
  storyChapter?: string;
  whatsappMessage: string;
};

export const services: Service[] = [
  {
    id: "s1",
    slug: "reforma-de-portoes",
    name: "Reformas e Reparos em Portões",
    tag: "Reforma",
    shortDescription:
      "Recuperação estrutural, alinhamento, pintura e troca de componentes de portões basculantes, deslizantes e pivotantes.",
    description: [
      "Muitas vezes não é preciso trocar o portão — é preciso reformar do jeito certo. A Metal & Art avalia a estrutura no local, identifica o que compromete o funcionamento (roldanas, molas, trilhos, dobradiças, soldas) e recupera o conjunto para voltar a operar com segurança.",
      "O serviço inclui tratamento contra ferrugem, reforço de pontos críticos, substituição de componentes desgastados e pintura de acabamento. Ao final, você recebe um portão alinhado, leve de abrir e com aparência de novo — sem o custo de uma substituição completa.",
    ],
    benefits: [
      "Diagnóstico feito no local",
      "Recuperação estrutural e estética",
      "Troca de roldanas, molas, trilhos e dobradiças",
      "Tratamento antiferrugem e pintura",
    ],
    applications: [
      "Portões basculantes",
      "Portões deslizantes",
      "Portões pivotantes",
      "Portões de condomínios",
    ],
    images: [assets.beforeAfter.after, assets.beforeAfter.before],
    featured: true,
    storyChapter: "Manutenção",
    whatsappMessage:
      "Olá, Metal & Art! Vim pelo site e gostaria de um orçamento para reforma/reparo de portão.",
  },
  {
    id: "s2",
    slug: "automacao-de-portoes",
    name: "Automação de Portões",
    tag: "Automação",
    shortDescription:
      "Instalação de motores, travas eletromagnéticas e acessórios para abrir e fechar seu portão com controle, segurança e sem esforço.",
    description: [
      "Automatizar é mais do que instalar um motor: é ajustar o portão para que o conjunto inteiro trabalhe leve e alinhado. Por isso, antes de qualquer automação, conferimos trilho, roldanas e balanceamento — um portão pesado ou torto queima motor e trava no meio do caminho.",
      "A Metal & Art instala motores para portões basculantes, deslizantes e pivotantes, com travas eletromagnéticas, controles e ajustes de fim de curso. E se o seu automatizador parou, fazemos o reparo e a revisão do conjunto.",
    ],
    benefits: [
      "Motor compatível com o peso do portão",
      "Travas eletromagnéticas e acessórios",
      "Ajuste de fim de curso e velocidade",
      "Reparo em automações existentes",
    ],
    applications: [
      "Garagens residenciais",
      "Entradas de condomínios",
      "Portões de empresas",
      "Portões deslizantes e basculantes",
    ],
    images: [assets.automation.motor, assets.gates.sliding],
    featured: true,
    storyChapter: "Automação",
    whatsappMessage:
      "Olá, Metal & Art! Vim pelo site e gostaria de um orçamento para automação de portão.",
  },
  {
    id: "s3",
    slug: "portoes-sob-medida",
    name: "Portões sob Medida",
    tag: "Fabricação",
    shortDescription:
      "Fabricação de portões de garagem e portões sociais em aço, no design que o seu projeto pede: deslizante, basculante ou pivotante.",
    description: [
      "O portão é o cartão de visita do imóvel — e também a primeira barreira de segurança. Fabricamos portões sob medida a partir da medição no local, respeitando vão, recuo, peso e estilo da fachada.",
      "Do desenho à instalação, o portão nasce na nossa oficina: estrutura soldada, acabamento escolhido por você (pintura, detalhes, ripados) e preparação para automação quando o projeto pedir.",
    ],
    benefits: [
      "Medição e conferência no local",
      "Projeto alinhado à fachada",
      "Preparado para automação",
      "Instalação completa pela equipe",
    ],
    applications: [
      "Portões de garagem",
      "Portões sociais",
      "Residências e condomínios",
      "Empresas e galpões",
    ],
    images: [assets.gates.sliding, assets.gates.social],
    featured: true,
    storyChapter: "Portões",
    whatsappMessage:
      "Olá, Metal & Art! Vim pelo site e gostaria de um orçamento para um portão sob medida.",
  },
  {
    id: "s4",
    slug: "grades-de-protecao",
    name: "Grades de Proteção",
    tag: "Proteção",
    shortDescription:
      "Grades para janelas, portas e muros que protegem de verdade sem transformar a fachada em prisão.",
    description: [
      "Segurança não precisa brigar com estética. Desenhamos grades com geometria limpa, fixação reforçada e pintura durável, que protegem o vão e valorizam a fachada.",
      "Cada grade é fabricada sob medida para o vão real — sem folgas, sem gambiarra de instalação — com opção de modelos fixos ou articulados para manutenção e rotas de fuga.",
    ],
    benefits: [
      "Fabricação sob medida para o vão",
      "Fixação reforçada na alvenaria",
      "Modelos fixos ou articulados",
      "Pintura de alta durabilidade",
    ],
    applications: [
      "Janelas de casas e apartamentos térreos",
      "Portas e vitrines",
      "Muros e áreas de serviço",
      "Comércios e escolas",
    ],
    images: [assets.grids.window, assets.gates.social],
    featured: true,
    storyChapter: "Proteção",
    whatsappMessage:
      "Olá, Metal & Art! Vim pelo site e gostaria de um orçamento para grades de proteção.",
  },
  {
    id: "s5",
    slug: "corrimaos",
    name: "Corrimãos",
    tag: "Segurança",
    shortDescription:
      "Corrimãos em aço para escadas internas e externas, com pega confortável, fixação firme e acabamento fino.",
    description: [
      "Corrimão bom é o que a mão encontra na hora certa. Projetamos a altura e a pega ergonômica, com fixação estrutural na parede ou na escada — nada de peça solta balançando.",
      "O acabamento acompanha o projeto: pintura em cores, combinação com madeira ou visual industrial. Atendemos casas, prédios, comércios e áreas comuns de condomínios.",
    ],
    benefits: [
      "Altura e pega ergonômicas",
      "Fixação estrutural segura",
      "Acabamento combinado ao projeto",
      "Escadas retas, curvas e caracóis",
    ],
    applications: [
      "Escadas internas e externas",
      "Áreas comuns de condomínios",
      "Comércios e clínicas",
      "Acessos e rampas",
    ],
    images: [assets.railings.handrail],
    featured: true,
    storyChapter: "Corrimãos",
    whatsappMessage:
      "Olá, Metal & Art! Vim pelo site e gostaria de um orçamento para corrimão.",
  },
  {
    id: "s6",
    slug: "guarda-corpos",
    name: "Guarda-corpos",
    tag: "Proteção",
    shortDescription:
      "Guarda-corpos para sacadas, mezaninos e escadas: proteção contra quedas com desenho que valoriza o ambiente.",
    description: [
      "Em desnível, a proteção precisa ser absoluta. Fabricamos guarda-corpos com estrutura rígida, espaçamento seguro entre perfis e altura adequada ao uso — residência, comércio ou área comum.",
      "O desenho é feito junto com você: linhas minimalistas, perfis verticais, combinações com vidro ou madeira, sempre com a resistência estrutural em primeiro lugar.",
    ],
    benefits: [
      "Estrutura rígida e bem ancorada",
      "Espaçamento seguro entre perfis",
      "Desenho personalizado",
      "Integração com vidro ou madeira",
    ],
    applications: [
      "Sacadas e varandas",
      "Mezaninos e pé-direito duplo",
      "Escadas e patamares",
      "Terraços de comércios",
    ],
    images: [assets.railings.handrail, assets.workshop.fabrication],
    featured: false,
    whatsappMessage:
      "Olá, Metal & Art! Vim pelo site e gostaria de um orçamento para guarda-corpo.",
  },
  {
    id: "s7",
    slug: "porta-de-enrolar",
    name: "Portas de Enrolar",
    tag: "Comércio",
    shortDescription:
      "Fabricação e manutenção de portas de enrolar, incluindo troca de molas, ajuste de guias e motorização.",
    description: [
      "Porta de enrolar que trava no sábado de manhã é prejuízo na certa. A Metal & Art atende comércios com manutenção completa: troca de molas, regulagem de guias e roldanas, reparo de réguas e lâminas danificadas.",
      "Também fabricamos portas de enrolar novas, manuais ou motorizadas, sob medida para a vitrine ou o vão do galpão — com acionamento leve e travamento seguro.",
    ],
    benefits: [
      "Troca de molas com regulagem fina",
      "Reparo de lâminas e guias",
      "Motorização com controle",
      "Fabricação sob medida",
    ],
    applications: [
      "Lojas e vitrines",
      "Garagens e depósitos",
      "Galpões e docas",
      "Quiosques e boxes",
    ],
    images: [assets.rollingDoors.storefront],
    featured: true,
    whatsappMessage:
      "Olá, Metal & Art! Vim pelo site e preciso de manutenção/troca de mola em porta de enrolar.",
  },
  {
    id: "s8",
    slug: "estruturas-metalicas",
    name: "Estruturas Metálicas",
    tag: "Estrutura",
    shortDescription:
      "Mezaninos, suportes, coberturas e reforços estruturais em aço, calculados e soldados para aguentar o serviço.",
    description: [
      "Estrutura não é lugar para improviso. Dimensionamos perfis, pontos de apoio e soldas de acordo com a carga que a estrutura vai receber — seja um mezanino para estoque, um suporte de equipamentos ou uma cobertura de área externa.",
      "Tudo sai da oficina com solda cheia, acabamento protegido contra corrosão e instalação feita pela nossa equipe, com o vão liberado e o nível conferido.",
    ],
    benefits: [
      "Dimensionamento para a carga real",
      "Soldas contínuas e reforçadas",
      "Proteção anticorrosiva",
      "Instalação com nivelamento",
    ],
    applications: [
      "Mezaninos para estoque e loja",
      "Suportes de caixas d'água e equipamentos",
      "Coberturas e pergolados",
      "Reforços estruturais",
    ],
    images: [assets.workshop.fabrication, assets.gates.sliding],
    featured: false,
    whatsappMessage:
      "Olá, Metal & Art! Vim pelo site e gostaria de um orçamento para estrutura metálica.",
  },
  {
    id: "s9",
    slug: "fechaduras-e-travas",
    name: "Fechaduras e Travas",
    tag: "Segurança",
    shortDescription:
      "Fechaduras, travas eletromagnéticas e soluções elétricas relacionadas para portões e portas funcionarem com segurança.",
    description: [
      "De que adianta um portão bonito que não trava? Instalamos e substituímos fechaduras de portões sociais e de garagem, travas eletromagnéticas para automações e pequenos complementos elétricos ligados ao acionamento.",
      "O ajuste é feito em conjunto com o portão: alinhamento da folha, regulagem do batente e teste de travamento repetido, para a trava pegar sempre — não 'quando dá sorte'.",
    ],
    benefits: [
      "Travas eletromagnéticas para automação",
      "Fechaduras para portão social e garagem",
      "Regulagem de batente e alinhamento",
      "Reparo em travas existentes",
    ],
    applications: [
      "Portões automatizados",
      "Portões sociais",
      "Portas de condomínios",
      "Acessos comerciais",
    ],
    images: [assets.automation.motor, assets.gates.social],
    featured: false,
    whatsappMessage:
      "Olá, Metal & Art! Vim pelo site e preciso de fechadura/trava para portão.",
  },
];

export const getService = (slug: string) =>
  services.find((s) => s.slug === slug);

export const featuredServices = services.filter((s) => s.featured);
