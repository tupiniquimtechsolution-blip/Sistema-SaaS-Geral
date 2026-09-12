const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Formata valores em Real brasileiro (R$ 34,90) */
export function formatBRL(value: number): string {
  return brl.format(value);
}

/** Versão compacta p/ mensagem de WhatsApp (sem quebra fina de moeda) */
export function formatBRLPlain(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}
