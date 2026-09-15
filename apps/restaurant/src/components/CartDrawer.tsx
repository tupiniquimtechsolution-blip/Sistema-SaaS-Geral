import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import type { CartLine } from "../context/CartContext";
import { getItemById, getExtrasPrice } from "../config/menu";
import { business } from "../config/business";
import { formatBRL } from "../lib/format";
import { buildOrderMessage, createWhatsAppUrl } from "../lib/whatsapp";
import type { CheckoutInfo } from "../lib/whatsapp";
import { usePrefersReducedMotion } from "./ui";

/* ============================================================
   CARRINHO — drawer lateral + checkout via WhatsApp
   (animações CSS nativas, sem framer-motion)
   ============================================================ */

export function CartDrawer() {
  const { lines, isOpen, setOpen, setQty, remove, clear } = useCart();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const reduce = usePrefersReducedMotion();
  const subtotal = useCartSubtotal(lines);

  useEffect(() => {
    if (!isOpen) setStep("cart");
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-[84] bg-bg/70 backdrop-blur-sm ${reduce ? "" : "anim-fade"}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 right-0 z-[85] flex w-full max-w-md flex-col border-l border-line bg-panel ${reduce ? "" : "anim-drawer"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Seu pedido"
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <div className="flex items-center gap-3">
            {step === "checkout" && (
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="grid h-9 w-9 place-items-center border border-line text-sand hover:border-ember hover:text-ember"
                aria-label="Voltar para o pedido"
              >
                <ArrowLeft aria-hidden size={16} />
              </button>
            )}
            <h2 className="font-display text-2xl text-cream">{step === "cart" ? "Seu pedido" : "Finalizar"}</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center border border-line text-sand hover:border-ember hover:text-ember"
            aria-label="Fechar pedido"
          >
            <X aria-hidden size={16} />
          </button>
        </header>

        {lines.length === 0 ? (
          <EmptyCart onClose={() => setOpen(false)} />
        ) : step === "cart" ? (
          <CartStep lines={lines} subtotal={subtotal} setQty={setQty} remove={remove} clear={clear} onNext={() => setStep("checkout")} />
        ) : (
          <CheckoutStep lines={lines} subtotal={subtotal} />
        )}
      </aside>
    </>
  );
}

function useCartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => {
    const item = getItemById(l.itemId);
    return item ? sum + (item.price + getExtrasPrice(item, l.extras)) * l.qty : sum;
  }, 0);
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full border border-dashed border-line text-sand">
        <ShoppingBag aria-hidden size={24} />
      </span>
      <p className="font-display text-2xl text-cream">A mesa ainda está vazia</p>
      <p className="text-sm leading-relaxed text-sand">Que tal começar com um Steak Tartare ou uma Soupe à l'Oignon?</p>
      <Link
        to="/cardapio"
        onClick={onClose}
        className="mt-2 border border-ember bg-ember px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-bg transition-all hover:bg-transparent hover:text-ember"
      >
        Ver a carta
      </Link>
    </div>
  );
}

function CartStep({
  lines,
  subtotal,
  setQty,
  remove,
  clear,
  onNext,
}: {
  lines: CartLine[];
  subtotal: number;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  onNext: () => void;
}) {
  const belowMin = subtotal < business.delivery.minOrder;
  return (
    <>
      <ul className="flex-1 divide-y divide-linesoft overflow-y-auto px-6" aria-label="Itens do pedido">
        {lines.map((line) => {
          const item = getItemById(line.itemId);
          if (!item) return null;
          const unit = item.price + getExtrasPrice(item, line.extras);
          return (
            <li key={line.key} className="flex gap-4 py-5">
              <img src={item.image} alt="" className="h-16 w-16 shrink-0 border border-line object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-base leading-tight text-cream">{item.name}</p>
                  <button
                    type="button"
                    onClick={() => remove(line.key)}
                    className="text-sand transition-colors hover:text-chili"
                    aria-label={`Remover ${item.name}`}
                  >
                    <Trash2 aria-hidden size={15} />
                  </button>
                </div>
                {line.extras.length > 0 && <p className="mt-1 text-xs text-sand">+ {line.extras.join(" · ")}</p>}
                {line.note && <p className="mt-1 text-xs italic text-sand/70">“{line.note}”</p>}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center border border-line" role="group" aria-label={`Quantidade de ${item.name}`}>
                    <button
                      type="button"
                      onClick={() => setQty(line.key, line.qty - 1)}
                      className="grid h-8 w-8 place-items-center text-sand hover:text-ember"
                      aria-label="Diminuir"
                    >
                      <Minus aria-hidden size={12} />
                    </button>
                    <span className="w-8 text-center font-mono text-xs text-cream">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(line.key, line.qty + 1)}
                      className="grid h-8 w-8 place-items-center text-sand hover:text-ember"
                      aria-label="Aumentar"
                    >
                      <Plus aria-hidden size={12} />
                    </button>
                  </div>
                  <p className="font-display text-base text-gold">{formatBRL(unit * line.qty)}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <footer className="border-t border-line bg-panel2 px-6 py-5">
        {belowMin && (
          <p className="mb-3 border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-gold">
            Pedido mínimo de {formatBRL(business.delivery.minOrder)} — faltam {formatBRL(business.delivery.minOrder - subtotal)}.
          </p>
        )}
        <div className="flex items-center justify-between">
          <button type="button" onClick={clear} className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand/70 hover:text-chili">
            Esvaziar
          </button>
          <p className="text-sm text-sand">
            Subtotal <span className="ml-2 font-display text-xl text-cream">{formatBRL(subtotal)}</span>
          </p>
        </div>
        <p className="mt-1 text-right text-[11px] text-sand/60">Taxa de entrega calculada na próxima etapa</p>
        <button
          type="button"
          onClick={onNext}
          className="mt-4 w-full border border-ember bg-ember py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-bg transition-all hover:bg-transparent hover:text-ember"
        >
          Continuar
        </button>
      </footer>
    </>
  );
}

function CheckoutStep({ lines, subtotal }: { lines: CartLine[]; subtotal: number }) {
  const { clear, setOpen } = useCart();
  const [info, setInfo] = useState<CheckoutInfo>({
    name: "",
    mode: "retirada",
    area: business.delivery.areas[0].name,
    address: "",
    payment: "Pix",
    change: "",
    coupon: "",
    note: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const area = business.delivery.areas.find((a) => a.name === info.area) ?? business.delivery.areas[0];
  const fee = info.mode === "entrega" ? area.fee : 0;
  const total = subtotal + fee;

  const set = <K extends keyof CheckoutInfo>(key: K, value: CheckoutInfo[K]) => setInfo((p) => ({ ...p, [key]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!info.name.trim()) next.name = "Informe seu nome";
    if (info.mode === "entrega" && info.address.trim().length < 8) next.address = "Endereço completo com número";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const message = buildOrderMessage(lines, info, { subtotal, fee, total });
    window.open(createWhatsAppUrl(message), "_blank", "noopener,noreferrer");
    clear();
    setOpen(false);
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto" noValidate>
      <div className="flex-1 space-y-6 px-6 py-6">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-sand">Seu nome *</span>
          <input
            type="text"
            value={info.name}
            onChange={(e) => set("name", e.target.value)}
            className={`field ${errors.name ? "field-error" : ""}`}
            placeholder="Como podemos te chamar?"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <span className="mt-1 block text-xs text-chili">{errors.name}</span>}
        </label>

        <fieldset>
          <legend className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-sand">Como quer receber?</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["retirada", "entrega"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set("mode", m)}
                aria-pressed={info.mode === m}
                className={`border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-all ${
                  info.mode === m ? "border-ember bg-ember/10 text-ember" : "border-line text-sand hover:border-sand/50"
                }`}
              >
                {m === "retirada" ? "Retirada" : "Entrega"}
              </button>
            ))}
          </div>
        </fieldset>

        {info.mode === "entrega" && (
          <>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-sand">Bairro</span>
              <select value={info.area} onChange={(e) => set("area", e.target.value)} className="field">
                {business.delivery.areas.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name} — {formatBRL(a.fee)} · {a.time}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-sand">Endereço completo *</span>
              <input
                type="text"
                value={info.address}
                onChange={(e) => set("address", e.target.value)}
                className={`field ${errors.address ? "field-error" : ""}`}
                placeholder="Rua, número, complemento"
                aria-invalid={Boolean(errors.address)}
              />
              {errors.address && <span className="mt-1 block text-xs text-chili">{errors.address}</span>}
            </label>
          </>
        )}

        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-sand">Pagamento</span>
          <select value={info.payment} onChange={(e) => set("payment", e.target.value)} className="field">
            <option>Pix</option>
            <option>Cartão na entrega/retirada</option>
            <option>Dinheiro</option>
            <option>Vale-refeição (Alelo, Sodexo, Ticket, VR)</option>
          </select>
        </label>

        {info.payment === "Dinheiro" && (
          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-sand">Troco para quanto?</span>
            <input type="text" value={info.change} onChange={(e) => set("change", e.target.value)} className="field" placeholder="Ex.: R$ 100" />
          </label>
        )}

        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-sand">Observações gerais</span>
          <textarea rows={2} value={info.note} onChange={(e) => set("note", e.target.value)} className="field resize-none" placeholder="Alergias, portaria, horário de retirada…" />
        </label>
      </div>

      <footer className="border-t border-line bg-panel2 px-6 py-5">
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between text-sand">
            <dt>Subtotal</dt>
            <dd>{formatBRL(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-sand">
            <dt>{info.mode === "entrega" ? `Entrega · ${info.area}` : "Retirada no balcão"}</dt>
            <dd>{fee > 0 ? formatBRL(fee) : "sem taxa"}</dd>
          </div>
          <div className="flex justify-between border-t border-linesoft pt-2 text-base">
            <dt className="font-semibold text-cream">Total estimado</dt>
            <dd className="font-display text-xl text-ember">{formatBRL(total)}</dd>
          </div>
        </dl>
        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2.5 border border-ember bg-ember py-4 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-bg transition-all hover:bg-transparent hover:text-ember"
        >
          Enviar pedido no WhatsApp <ExternalLink aria-hidden size={14} />
        </button>
        <p className="mt-2.5 text-center text-[10px] leading-relaxed text-sand/70">
          Demonstração: o pedido abre pronto no WhatsApp oficial — sem pagamento online.
        </p>
      </footer>
    </form>
  );
}

/** CTA persistente no mobile — "Ver pedido — R$ XX" */
export function MobileOrderBar() {
  const { count, subtotal, setOpen } = useCart();
  const reduce = usePrefersReducedMotion();
  if (count === 0) return null;

  return (
    <div className={`fixed inset-x-0 bottom-0 z-[62] border-t border-line bg-panel2/95 p-3 backdrop-blur-md md:hidden ${reduce ? "" : "anim-fade-up"}`}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between border border-ember bg-ember px-5 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-bg transition-colors active:bg-emberdeep"
      >
        <span className="flex items-center gap-2.5">
          <span className="grid h-6 w-6 place-items-center bg-bg/15 font-display text-sm">{count}</span>
          Ver pedido
        </span>
        <span className="font-display text-base normal-case tracking-normal">{formatBRL(subtotal)}</span>
      </button>
    </div>
  );
}
