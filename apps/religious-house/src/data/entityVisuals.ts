import type { EntityVisual } from "../types";
import { driveUrl } from "./media";

/**
 * Registro de artes oficiais por entidade/linha de trabalho.
 *
 * REGRA DE COMPOSIÇÃO: todas as artes oficiais foram produzidas com a figura
 * concentrada à ESQUERDA e uma área clara/livre à DIREITA — por isso
 * textPosition é sempre "right" no desktop (focalDesktop: "left center").
 *
 * As artes oficiais do templo (Google Drive) estão plugadas abaixo via
 * driveUrl("<ID do arquivo>"). Para migrar para arquivos locais, basta salvar
 * em /public/brand/entities/ e trocar por "/brand/entities/<slug>.png" —
 * nenhum componente precisa ser alterado.
 */

const BASE = {
  textPosition: "right",
  focalDesktop: "left center",
  focalMobile: "20% center",
  tone: "dark",
  overlay: 0.12,
} as const;

export const ENTITY_VISUALS: EntityVisual[] = [
  {
    slug: "baianos",
    name: "Baianos",
    ...BASE,
    accent: "#c29635",
    image: driveUrl("1IlWhU8jmmArMP1IfYhqccRhfLMH63ky5"),
  },
  {
    slug: "boiadeiros",
    name: "Boiadeiros",
    ...BASE,
    accent: "#a77c28",
    image: driveUrl("1J5i-H8cSgcveXM_KTJ1ft9F8mOAjFMUr"),
  },
  {
    slug: "caboclos",
    name: "Caboclos",
    ...BASE,
    accent: "#235f3f",
    image: driveUrl("1NbcqYlH1Zdj_KZ9BuycRvv5NJQ-c8o6y"),
  },
  {
    slug: "eres",
    name: "Erês",
    ...BASE,
    accent: "#19aa9e",
    image: driveUrl("1CoUzjfaOg0krB55-9ZBHe7QTYdR-LwoG"),
  },
  {
    slug: "exu",
    name: "Exu e Pombagira",
    label: "Linha de trabalho",
    ...BASE,
    accent: "#a33b2b",
    image: driveUrl("1fFwHmR4G6CAJ-dgdBfx-bVWx_3gbc7zc"),
  },
  {
    slug: "exu-mirim",
    name: "Exu Mirim",
    ...BASE,
    accent: "#a33b2b",
    image: driveUrl("1XyRwpsA1sZ3iIOc-sv8jC--h_4em-ibY"),
  },
  {
    slug: "iansa",
    name: "Iansã",
    ...BASE,
    accent: "#c2603b",
    image: driveUrl("1GCtw5sOb_cgcnf7zQbBE1mFq8vzY1Znp"),
  },
  {
    slug: "malandros",
    name: "Malandros",
    ...BASE,
    accent: "#52695b",
    image: driveUrl("1Pjo3VESWjuEm3fVK_2gETMR66AvH_vVV"),
  },
  {
    slug: "maria-mulambo",
    name: "Maria Mulambo",
    label: "Consulta às quartas",
    ...BASE,
    accent: "#7a5aa6",
    image: driveUrl("1Xy1IT1nAOnazwp5GStwkc3hpTJE3SDQJ"),
  },
  {
    slug: "marujos",
    name: "Marujos",
    ...BASE,
    accent: "#1e5f7a",
    image: driveUrl("1ZzCOkGy7WCJi3Lxb9PaWwHysLQhlw6A9"),
  },
  {
    slug: "nana",
    name: "Nanã",
    ...BASE,
    accent: "#7a5aa6",
    image: driveUrl("1El8zPMhZncaZVOFi1acSJs1Q6baTI81K"),
  },
  {
    slug: "obaluae",
    name: "Obaluaê",
    ...BASE,
    accent: "#52695b",
    image: driveUrl("1P0hEeo7DwX9jWjvJ7M1jyIqw5RfC2uZ1"),
  },
  {
    slug: "ogum",
    name: "Ogum",
    ...BASE,
    accent: "#235f3f",
    image: driveUrl("1OHksIqyigtCRR3ojwqLn9JXgaIRdrZou"),
  },
  {
    slug: "oxala",
    name: "Oxalá",
    ...BASE,
    accent: "#5f926d",
    image: driveUrl("1plp1qamMBdBh8J6QwpE6k-OJ9FU-Gu0p"),
  },
  {
    slug: "oxum",
    name: "Oxum",
    ...BASE,
    accent: "#d4a017",
    image: driveUrl("15UfSH5IR9CnNc1KEz5iVAbXbQbyLVIA0"),
  },
  {
    slug: "pretos-velhos",
    name: "Pretos Velhos",
    ...BASE,
    accent: "#52695b",
    image: driveUrl("14n1W43oXsbCKxN-yqnje7hvxZ1ht4oHX"),
  },
  {
    slug: "xango",
    name: "Xangô",
    ...BASE,
    accent: "#a33b2b",
    image: driveUrl("1goXAghDf1ycMhHmCY1etESR1v_Mam02H"),
  },
  {
    slug: "iemanja",
    name: "Yemanjá",
    ...BASE,
    accent: "#2a7f9e",
    image: driveUrl("1zMIOQm-weJolNpHhN9BGdI_6hBypFV4l"),
  },

  /**
   * Desenvolvimento da corrente (Documento Central de Correções, §13):
   * identidade própria PENDENTE — a arte oficial será fornecida pelo templo.
   * Enquanto `image` for undefined, todos os lugares que exibem
   * Desenvolvimento usam o fallback institucional automaticamente; quando o
   * arquivo for plugado aqui, passam a usá-lo sem alterar nenhum componente.
   */
  {
    slug: "desenvolvimento",
    name: "Desenvolvimento da corrente",
    label: "Atividade interna · sextas-feiras",
    textPosition: "center",
    focalDesktop: "center",
    focalMobile: "center",
    tone: "dark",
    overlay: 0,
    accent: "#5f926d",
    image: undefined,
  },
];

/** Fallback elegante quando a entidade ainda não tem arte oficial. */
export const institutionalVisual: EntityVisual = {
  slug: "institucional",
  name: "Templo de Umbanda",
  label: "Caboclo Tupinambá & Flecha Dourada",
  textPosition: "center",
  focalDesktop: "center",
  focalMobile: "center",
  tone: "dark",
  overlay: 0,
  accent: "#c29635",
};

export function getEntityVisual(slug?: string): EntityVisual | null {
  if (!slug) return null;
  return ENTITY_VISUALS.find((v) => v.slug === slug) ?? null;
}

export function entityName(slug?: string): string {
  return getEntityVisual(slug)?.name ?? "";
}

export const entityOptions = ENTITY_VISUALS.map((v) => ({
  value: v.slug,
  label: v.name,
}));
