/**
 * ============================================================
 * WHATSAPP — gerador central de links e mensagens
 * ------------------------------------------------------------
 * NUNCA espalhe URLs wa.me pelos componentes: use estas funções.
 * O número vem de src/config/business.ts.
 * ============================================================
 */
import { business } from "../config/business";
import { formatBRLPlain } from "./format";
import type { CartLine } from "../context/CartContext";
import { getItemById, getExtrasPrice } from "../config/menu";

export function createWhatsAppUrl(message?: string, number: string = business.contact.whatsapp): string {
  const url = `https://wa.me/${number}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

/** Mensagem contextual simples — ex.: "quero saber mais sobre [serviço]" */
export function interestMessage(topic: string): string {
  return `Olá! Vim pelo site do ${business.name} e gostaria de saber mais sobre ${topic}. 🔥`;
}

export interface CheckoutInfo {
  name: string;
  mode: "entrega" | "retirada";
  area: string;
  address: string;
  payment: string;
  change?: string;
  coupon?: string;
  note?: string;
}

export interface OrderTotals {
  subtotal: number;
  fee: number;
  total: number;
}

/** Monta a mensagem legível do pedido enviada ao WhatsApp do estabelecimento */
export function buildOrderMessage(lines: CartLine[], info: CheckoutInfo, totals: OrderTotals): string {
  const sep = "──────────────────";
  const itemLines = lines.map((line) => {
    const item = getItemById(line.itemId);
    if (!item) return "";
    const extrasTotal = getExtrasPrice(item, line.extras);
    const unit = item.price + extrasTotal;
    const parts: string[] = [`▪ ${line.qty}x ${item.name} — ${formatBRLPlain(unit * line.qty)}`];
    if (line.extras.length > 0) parts.push(`   + ${line.extras.join("  + ")}`);
    if (line.note) parts.push(`   Obs: ${line.note}`);
    return parts.join("\n");
  });

  const linesOut: string[] = [
    `*NOVO PEDIDO — ${business.name.toUpperCase()}*`,
    `(via site · demonstrativo)`,
    sep,
    ...itemLines,
    sep,
    `Subtotal: ${formatBRLPlain(totals.subtotal)}`,
  ];

  if (info.mode === "entrega") {
    linesOut.push(`Entrega (${info.area}): ${formatBRLPlain(totals.fee)}`);
  } else {
    linesOut.push("Retirada no balcão: sem taxa");
  }
  if (info.coupon) linesOut.push(`Cupom: ${info.coupon}`);
  linesOut.push(`*TOTAL ESTIMADO: ${formatBRLPlain(totals.total)}*`);
  linesOut.push(sep);
  linesOut.push(`*Cliente:* ${info.name}`);
  linesOut.push(`*Recebimento:* ${info.mode === "entrega" ? "Entrega" : "Retirada no balcão"}`);
  if (info.mode === "entrega") {
    linesOut.push(`*Endereço:* ${info.address} — ${info.area}`);
  }
  linesOut.push(`*Pagamento:* ${info.payment}${info.change ? ` (troco para ${info.change})` : ""}`);
  if (info.note) linesOut.push(`*Observações:* ${info.note}`);
  linesOut.push(sep);
  linesOut.push("Aguardo a confirmação. Obrigado! 🔥");

  return linesOut.join("\n");
}
