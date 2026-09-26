import { useCallback, useEffect, useRef, useState } from "react";
import type { Machine } from "../data/machines";
import { BUSINESS } from "../config/business";

export function cx(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function formatNum(n: number) {
  return n.toLocaleString("pt-BR");
}

export function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function waLink(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/* ---------------- mensagens estruturadas (abrem o WhatsApp real) ---------------- */

export function generalMessage() {
  return `Olá! Vim pelo site da ${BUSINESS.name} e gostaria de atendimento.`;
}

export function machineMessage(m: Machine) {
  return [
    `Olá! Gostaria de um orçamento da seguinte peça:`,
    ``,
    `• Peça: ${m.model}`,
    `• Código: ${m.code}`,
    `• Aplicação: ${m.brand} — ${m.application}`,
    `• Tipo: ${m.condition === "original" ? "Original" : "Compatível"} (${m.oem})`,
    m.price ? `• Valor no site: ${formatBRL(m.price)}` : `• Valor: a consultar`,
    ``,
    `Encontrei no site da ${BUSINESS.name} e gostaria de confirmar disponibilidade e prazo de entrega.`,
  ].join("\n");
}

export function quoteMessage(f: {
  nome: string;
  empresa: string;
  telefone: string;
  email: string;
  cidade: string;
  item: string;
  mensagem: string;
}) {
  return [
    `*SOLICITAÇÃO DE ORÇAMENTO — site ${BUSINESS.name}*`,
    ``,
    `*Nome:* ${f.nome}`,
    f.empresa ? `*Empresa:* ${f.empresa}` : ``,
    `*Telefone/WhatsApp:* ${f.telefone}`,
    f.email ? `*E-mail:* ${f.email}` : ``,
    `*Cidade/UF:* ${f.cidade}`,
    ``,
    `*Peça(s) / rolo:*`,
    f.item,
    ``,
    f.mensagem ? `*Observações:* ${f.mensagem}` : ``,
    ``,
    `Enviado pelo site — aguardo retorno.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function financeMessage(f: {
  nome: string;
  telefone: string;
  rolo: string;
  pecas: string;
  cidade: string;
  mensagem: string;
}) {
  return [
    `*ORÇAMENTO PARA FROTA / PEDIDO MAIOR — site ${BUSINESS.name}*`,
    ``,
    `*Nome:* ${f.nome}`,
    `*Telefone/WhatsApp:* ${f.telefone}`,
    `*Cidade/UF:* ${f.cidade}`,
    `*Rolos na frota:* ${f.rolo}`,
    ``,
    `*Peças necessárias:*`,
    f.pecas,
    ``,
    f.mensagem ? `*Detalhes:* ${f.mensagem}` : ``,
    ``,
    `Gostaria de condição para pedido fechado. Enviado pelo site.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function tradeMessage(f: {
  nome: string;
  telefone: string;
  codigo: string;
  rolo: string;
  descricao: string;
  fotos: number;
}) {
  return [
    `*NÃO ACHEI A PEÇA — site ${BUSINESS.name}*`,
    ``,
    `*Nome:* ${f.nome}`,
    `*Telefone/WhatsApp:* ${f.telefone}`,
    f.codigo ? `*Código OEM / referência:* ${f.codigo}` : ``,
    `*Rolo / equipamento:* ${f.rolo}`,
    `*Descrição:* ${f.descricao}`,
    ``,
    f.fotos > 0
      ? `Tenho ${f.fotos} foto(s) da peça — estou enviando aqui em seguida.`
      : `Não tenho fotos no momento.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/* ---------------- hooks ---------------- */

export function useInView<T extends HTMLElement>(threshold = 0.16) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, inView]);
  return { ref, inView };
}

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, [title, description]);
}

/** Injeta JSON-LD dinâmico (Product/Part) na página da peça */
export function useJsonLd(id: string, data: Record<string, unknown> | null) {
  const inject = useCallback(() => {
    const prev = document.getElementById(id);
    if (prev) prev.remove();
    if (!data) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }, [id, data]);

  useEffect(() => {
    inject();
    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [inject, id]);
}
