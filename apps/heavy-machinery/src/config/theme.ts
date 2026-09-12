/**
 * Design System — LUSOMAQ (adaptação para peças de rolos compactadores)
 * Tokens centrais espelhados em src/index.css (@theme do Tailwind v4).
 * Identidade: asfalto + amarelo viário + vermelho obra.
 */
export const THEME = {
  colors: {
    coal: { 950: "#0b0c0e", 900: "#121316", 800: "#181a1e", 700: "#20232a", 600: "#2b2f38", 500: "#3a4049" },
    steel: { 500: "#5a616c", 400: "#737a86", 300: "#959ca8", 200: "#bcc2cc" },
    bone: { 100: "#f0eee8", 200: "#e3e0d7", 300: "#d2cfc3" },
    /** Amarelo viário (sinalização de obra) */
    hazard: { 300: "#ffc94d", 400: "#f7a800", 500: "#d18f00", 600: "#9e6c00" },
    /** Verde "liberado para despacho" */
    agri: { 300: "#8fd0a0", 400: "#4fae68", 500: "#358a4c", 600: "#28693a", 700: "#1d4d2b" },
    /** Vermelho obra */
    safety: { 400: "#f0564a", 500: "#dd3a2e" },
    lines: { dark: "#262a31", light: "#c9c5b8" },
  },
  fonts: {
    /** Títulos — condensado pesado, cara de chapa estampada */
    display: '"Anton", "Arial Narrow", sans-serif',
    /** Corpo e leitura */
    body: '"Barlow", "Segoe UI", sans-serif',
    /** Etiquetas técnicas, códigos e specs */
    condensed: '"Barlow Condensed", "Arial Narrow", sans-serif',
  },
  spacing: { page: "clamp(1.25rem, 4vw, 4rem)", section: "clamp(4.5rem, 10vw, 9rem)" },
  container: { max: "84rem" },
  radius: { none: "0", sm: "2px", md: "4px" },
  shadows: {
    plate: "0 24px 60px -24px rgba(0,0,0,.75)",
    card: "0 14px 40px -18px rgba(0,0,0,.65)",
  },
  breakpoints: { sm: 640, md: 768, lg: 1024, xl: 1280, "2xl": 1536 },
} as const;

export type Theme = typeof THEME;
