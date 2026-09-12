/* ============================================================
   MOTOR DE TEMA — Design System dinâmico por segmento
   Nenhum componente usa cor hardcoded: tudo vem de CSS vars
   aplicadas aqui a partir do preset escolhido na config.
   ============================================================ */
import type { ThemePreset } from "../business/types";

export const THEME_PRESETS: Record<string, ThemePreset> = {
  bakery: {
    label: "Padaria artesanal",
    segments: "Padaria · Café · Confeitaria",
    tokens: {
      "--bg": "#171009", "--bg-soft": "#201610", "--surface": "#2B1E14",
      "--line": "rgba(217,178,107,0.16)",
      "--paper-text": "#F4EAD8", "--paper-dim": "#AC9278",
      "--cream": "#F3E9D6", "--flour": "#FBF6EA",
      "--ink": "#241A13", "--ink-soft": "#6E5B4E",
      "--wheat": "#D9B26B", "--caramel": "#B8793E", "--bread": "#A96332",
      "--terra": "#8E4F2C", "--coffee": "#4A2F22", "--espresso": "#241712",
      "--accent": "#D9B26B", "--accent-ink": "#211307",
    },
    headingFont: '"Fraunces", Georgia, serif',
    bodyFont: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    radius: "14px",
  },
  barbershop: {
    label: "Barbearia",
    segments: "Barbearia · Estúdio de tatuagem",
    tokens: {
      "--bg": "#121316", "--bg-soft": "#1A1C20", "--surface": "#22252B",
      "--line": "rgba(197,152,107,0.16)",
      "--paper-text": "#EDE7DC", "--paper-dim": "#9AA0A8",
      "--cream": "#EDE7DC", "--flour": "#F6F2EA",
      "--ink": "#17181C", "--ink-soft": "#5D6067",
      "--wheat": "#C5986B", "--caramel": "#9C6B3F", "--bread": "#7E5433",
      "--terra": "#B0532F", "--coffee": "#2E2A26", "--espresso": "#191714",
      "--accent": "#C5986B", "--accent-ink": "#171109",
    },
    headingFont: '"Fraunces", Georgia, serif',
    bodyFont: '"Manrope", ui-sans-serif, sans-serif',
    radius: "8px",
  },
  clinic: {
    label: "Clínica",
    segments: "Clínica · Odontologia · Fisioterapia",
    tokens: {
      "--bg": "#0E1B1E", "--bg-soft": "#14262A", "--surface": "#1B3237",
      "--line": "rgba(126,196,182,0.16)",
      "--paper-text": "#E9F4F1", "--paper-dim": "#8FB0AB",
      "--cream": "#EFF7F4", "--flour": "#F8FCFA",
      "--ink": "#12211F", "--ink-soft": "#557370",
      "--wheat": "#7EC4B6", "--caramel": "#4E9E90", "--bread": "#3B8377",
      "--terra": "#2E6B61", "--coffee": "#1C3A38", "--espresso": "#10201F",
      "--accent": "#7EC4B6", "--accent-ink": "#0B1D1A",
    },
    headingFont: '"Fraunces", Georgia, serif',
    bodyFont: '"Manrope", ui-sans-serif, sans-serif',
    radius: "16px",
  },
  restaurant: {
    label: "Restaurante",
    segments: "Restaurante · Trattoria · Bistrô",
    tokens: {
      "--bg": "#1A0F12", "--bg-soft": "#241519", "--surface": "#311C21",
      "--line": "rgba(214,164,120,0.16)",
      "--paper-text": "#F5E9DE", "--paper-dim": "#B29389",
      "--cream": "#F2E6D8", "--flour": "#FAF3E9",
      "--ink": "#26131A", "--ink-soft": "#7C5F62",
      "--wheat": "#D6A478", "--caramel": "#A4552F", "--bread": "#7E3B26",
      "--terra": "#5E2430", "--coffee": "#3A1F24", "--espresso": "#201014",
      "--accent": "#D6A478", "--accent-ink": "#200F08",
    },
    headingFont: '"Fraunces", Georgia, serif',
    bodyFont: '"Manrope", ui-sans-serif, sans-serif',
    radius: "12px",
  },
  sushi: {
    label: "Sushi",
    segments: "Sushi · Japonesa · Asiática",
    tokens: {
      "--bg": "#101012", "--bg-soft": "#17171A", "--surface": "#1F1F23",
      "--line": "rgba(232,225,210,0.12)",
      "--paper-text": "#F0EDE6", "--paper-dim": "#98958D",
      "--cream": "#F0EDE6", "--flour": "#F8F6F0",
      "--ink": "#151416", "--ink-soft": "#6B6761",
      "--wheat": "#E8E1D2", "--caramel": "#C0392B", "--bread": "#8E2A20",
      "--terra": "#5C1F18", "--coffee": "#2A2622", "--espresso": "#161413",
      "--accent": "#C0392B", "--accent-ink": "#FFF8F0",
    },
    headingFont: '"Fraunces", Georgia, serif',
    bodyFont: '"Manrope", ui-sans-serif, sans-serif',
    radius: "6px",
  },
  petshop: {
    label: "Pet shop",
    segments: "Pet shop · Banho e tosa · Vet",
    tokens: {
      "--bg": "#14201A", "--bg-soft": "#1B2C23", "--surface": "#243A2E",
      "--line": "rgba(240,180,90,0.18)",
      "--paper-text": "#F3EFE4", "--paper-dim": "#9DB3A4",
      "--cream": "#F5F0E2", "--flour": "#FBF8EF",
      "--ink": "#1B2A21", "--ink-soft": "#5C7263",
      "--wheat": "#F0B45A", "--caramel": "#E07B3C", "--bread": "#C05E2E",
      "--terra": "#8C4A28", "--coffee": "#33463A", "--espresso": "#1A261F",
      "--accent": "#F0B45A", "--accent-ink": "#221605",
    },
    headingFont: '"Fraunces", Georgia, serif',
    bodyFont: '"Manrope", ui-sans-serif, sans-serif',
    radius: "20px",
  },
};

const DEFAULT_PRESET = THEME_PRESETS.bakery;

export function applyTheme(presetKey: string, fonts?: { headingFont?: string; bodyFont?: string; radius?: string }) {
  const preset = THEME_PRESETS[presetKey] ?? DEFAULT_PRESET;
  const root = document.documentElement;
  Object.entries(preset.tokens).forEach(([k, v]) => root.style.setProperty(k, v));
  root.style.setProperty("--font-display", fonts?.headingFont || preset.headingFont);
  root.style.setProperty("--font-body", fonts?.bodyFont || preset.bodyFont);
  root.style.setProperty("--radius", preset.radius);
  root.style.setProperty("--accent", preset.tokens["--accent"]);
  root.style.setProperty("--accent-ink", preset.tokens["--accent-ink"]);
  root.dataset.theme = presetKey;
}

export function themeFonts(presetKey: string) {
  const p = THEME_PRESETS[presetKey] ?? DEFAULT_PRESET;
  return { headingFont: p.headingFont, bodyFont: p.bodyFont, radius: p.radius };
}
