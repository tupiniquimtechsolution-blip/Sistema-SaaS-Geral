/**
 * ============================================================
 * IDENTIDADE VISUAL — CHEZ AMIS BISTRÔ
 * ------------------------------------------------------------
 * Paleta derivada da identidade real do bistrô (fachada e salão
 * verde-garrafa, lettering creme, detalhes em latão/dourado e
 * toques de vinho). Tipografia: Fraunces (display) + Parisienne
 * (wordmark) + Karla (texto) + IBM Plex Mono (rótulos).
 * Para trocar a identidade de um cliente, edite APENAS os
 * tokens abaixo — os componentes leem as variáveis --t-*.
 * ============================================================
 */

export const theme = {
  colors: {
    /** fundo geral — verde-garrafa profundo (nunca preto puro) */
    bg: "#0f1712",
    /** superfícies / cards */
    panel: "#16211a",
    /** superfícies elevadas (hover, inputs) */
    panel2: "#1c2a21",
    /** linhas e bordas */
    line: "#2b3d31",
    linesoft: "#223128",
    /** texto principal — marfim */
    cream: "#f2ecdc",
    /** texto secundário — areia esverdeada */
    sand: "#a7b3a3",
    /** cor primária — latão (CTAs) */
    ember: "#d4a94f",
    /** primária em hover / profundidade */
    emberdeep: "#b98c39",
    /** acento — champanhe (preços, detalhes) */
    gold: "#e6cf9a",
    /** semânticas */
    leaf: "#7ea88b",
    /** vinho — bordô (tags, alertas quentes) */
    chili: "#b0554d",
  },
  radius: "0.375rem",
  shadows: {
    /** brilho quente de latão para CTAs e destaques */
    ember: "0 12px 40px -12px rgba(212,169,79,0.4)",
    /** elevação padrão de cards */
    lift: "0 24px 60px -24px rgba(0,0,0,0.75)",
  },
  fonts: {
    display: '"Fraunces", serif',
    wordmark: '"Parisienne", cursive',
    body: '"Karla", sans-serif',
    mono: '"IBM Plex Mono", monospace',
  },
} as const;

/** Gera o CSS injetado no <head> — variáveis consumidas pelo Tailwind e pelos componentes. */
export function themeCss(): string {
  const c = theme.colors;
  return `:root{
  --t-bg:${c.bg};--t-panel:${c.panel};--t-panel2:${c.panel2};
  --t-line:${c.line};--t-linesoft:${c.linesoft};
  --t-cream:${c.cream};--t-sand:${c.sand};
  --t-ember:${c.ember};--t-emberdeep:${c.emberdeep};--t-gold:${c.gold};
  --t-leaf:${c.leaf};--t-chili:${c.chili};
  --t-radius:${theme.radius};
  --t-shadow-ember:${theme.shadows.ember};
  --t-shadow-lift:${theme.shadows.lift};
}`;
}
