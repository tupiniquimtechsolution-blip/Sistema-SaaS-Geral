import type { ReactNode } from "react";

/** Badges de estado — semântica única em todo o painel (§14). */
export type BadgeTone = "ok" | "warn" | "blocked" | "muted";

const TONE_CLS: Record<BadgeTone, string> = {
  ok: "badge-state ok",
  warn: "badge-state warn",
  blocked: "badge-state blocked",
  muted: "badge-state muted",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={TONE_CLS[tone]}>{children}</span>;
}

export function maturityTone(m: string): BadgeTone {
  if (m === "IMPLEMENTED") return "ok";
  if (m === "FOUNDATION") return "warn";
  return "muted";
}

export function gateTone(s: string): BadgeTone {
  if (s === "PASS") return "ok";
  if (s === "NOT RUN") return "warn";
  return "blocked";
}
