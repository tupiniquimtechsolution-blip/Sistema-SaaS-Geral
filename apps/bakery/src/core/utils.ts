/* ============================================================
   UTILITÁRIOS DO CORE — moeda, horários, WhatsApp, analytics
   ============================================================ */
import { useEffect, useRef, useState } from "react";
import type { BusinessConfig, CartItem, DayHours, Product } from "../business/types";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
}

/* ---------------- Preços ---------------- */

export function productUnitPrice(p: Product) {
  return p.promotionalPrice ?? p.price;
}

export function cartItemUnit(item: CartItem) {
  const v = item.variations.reduce((s, x) => s + x.delta, 0);
  const e = item.extras.reduce((s, x) => s + x.price, 0);
  return item.unitBase + v + e;
}

export function cartItemTotal(item: CartItem) {
  return cartItemUnit(item) * item.qty;
}

/* ---------------- Horários de funcionamento ---------------- */

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function isOpenNow(hours: DayHours[], now = new Date()) {
  const day = hours[now.getDay()];
  if (!day?.open || !day?.close) return { open: false, label: "Fechado hoje" };
  const t = now.getHours() * 60 + now.getMinutes();
  if (t >= toMin(day.open) && t < toMin(day.close)) {
    return { open: true, label: `Aberto agora · até ${day.close}` };
  }
  if (t < toMin(day.open)) return { open: false, label: `Fechado · abre às ${day.open}` };
  // procura próximo dia
  for (let i = 1; i <= 7; i++) {
    const d = hours[(now.getDay() + i) % 7];
    if (d?.open) {
      const names = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
      const name = i === 1 ? "amanhã" : names[(now.getDay() + i) % 7];
      return { open: false, label: `Fechado · abre ${name} às ${d.open}` };
    }
  }
  return { open: false, label: "Fechado" };
}

/** Slots de agendamento (30 em 30 min) para hoje/amanhã/+2 dias */
export function buildScheduleOptions(hours: DayHours[], now = new Date()) {
  const days: { label: string; slots: string[] }[] = [];
  const names = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  for (let offset = 0; offset < 3; offset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    const day = hours[d.getDay()];
    if (!day?.open || !day?.close) continue;
    const slots: string[] = [];
    const start = toMin(day.open);
    const end = toMin(day.close) - 45;
    const minNow = now.getHours() * 60 + now.getMinutes() + 60;
    for (let t = start; t <= end; t += 30) {
      if (offset === 0 && t < minNow) continue;
      slots.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
    }
    if (slots.length === 0) continue;
    const label = offset === 0 ? "Hoje" : offset === 1 ? "Amanhã" : `${names[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    days.push({ label, slots });
  }
  return days;
}

/* ---------------- WhatsApp ---------------- */

export function waLink(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildCartWhatsAppMessage(
  cfg: BusinessConfig,
  items: CartItem[],
  total: number,
  fulfillment: "delivery" | "pickup" | null,
  note?: string
) {
  const lines = [`Olá, ${cfg.name}! Gostaria de fazer um pedido.`, "", "*Itens:*"];
  items.forEach((i) => {
    const unit = cartItemUnit(i);
    lines.push(`${i.qty}x ${i.name}${unit > i.unitBase ? ` (${formatBRL(unit)})` : ""}`);
    i.variations.forEach((v) => lines.push(`   • ${v.name}: ${v.label}`));
    i.extras.forEach((e) => lines.push(`   • + ${e.name}`));
    if (i.note) lines.push(`   • Obs: ${i.note}`);
  });
  lines.push("", `*Total estimado:* ${formatBRL(total)}`);
  if (fulfillment) lines.push(`*${fulfillment === "delivery" ? "Entrega" : "Retirada"}*`);
  if (note) lines.push(`*Observação:* ${note}`);
  lines.push("", "Nome:");
  return lines.join("\n");
}

/* ---------------- Analytics ---------------- */

export function track(event: string, payload?: Record<string, unknown>) {
  const w = window as unknown as { __analytics?: unknown[] };
  w.__analytics = w.__analytics ?? [];
  w.__analytics.push({ event, payload, ts: Date.now() });
}

/* ---------------- Hooks ---------------- */

export function useReveal<T extends HTMLElement>(threshold = 0.12) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

export function useSEO(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) {
        m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
      }
      m.setAttribute("content", description);
    }
  }, [title, description]);
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
