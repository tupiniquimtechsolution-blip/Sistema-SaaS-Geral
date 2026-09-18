import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp, useCartTotals } from "../core/store";
import { buildCartWhatsAppMessage, cartItemTotal, cartItemUnit, formatBRL, track, waLink } from "../core/utils";
import { IBasket, IClose, ILoaf, IMinus, IPlus, ITrash, IWhatsApp } from "./icons";

export default function CartDrawer() {
  const {
    business, cart, cartOpen, setCartOpen, updateQty, removeItem, setItemNote,
    clearCart, subtotal, coupon, applyCoupon, removeCoupon,
  } = useApp();
  const { discount, total } = useCartTotals();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState(false);
  const [noteKey, setNoteKey] = useState<string | null>(null);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [setCartOpen]);

  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  const freeAbove = business.delivery.freeAbove;
  const missing = Math.max(0, freeAbove - subtotal);
  const progress = Math.min(100, (subtotal / freeAbove) * 100);

  const sendWhatsApp = () => {
    const msg = buildCartWhatsAppMessage(business, cart, total, null);
    track("click_whatsapp", { from: "cart" });
    window.open(waLink(business.integrations.whatsapp.number || business.contact.whatsapp, msg), "_blank");
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Carrinho de compras">
          <motion.button
            aria-label="Fechar carrinho"
            className="absolute inset-0 bg-espresso/70 backdrop-blur-[3px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            initial={{ x: 60, y: 60, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ x: 40, y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-[calc(var(--radius)*1.6)] border-t border-line bg-bg sm:inset-y-0 sm:left-auto sm:right-0 sm:h-full sm:max-h-none sm:w-[440px] sm:rounded-none sm:border-l sm:border-t-0"
          >
            {/* cabeçalho */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
              <h2 className="font-display flex items-center gap-2.5 text-2xl font-semibold text-paper">
                <IBasket size={22} className="text-accent" /> Seu pedido
              </h2>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button onClick={() => { clearCart(); }} className="text-[12px] font-bold uppercase tracking-wider text-dim transition-colors hover:text-terra">
                    limpar
                  </button>
                )}
                <button onClick={() => setCartOpen(false)} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full border border-line text-dim transition-colors hover:border-accent hover:text-accent">
                  <IClose size={17} />
                </button>
              </div>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-16 text-center">
                <span className="grid h-20 w-20 place-items-center rounded-full border border-line bg-surface text-caramel">
                  <ILoaf size={38} />
                </span>
                <div>
                  <p className="font-display text-2xl text-paper">A cesta está vazia</p>
                  <p className="mt-1.5 text-[14px] text-dim">O forno está aceso. Escolha algo que acabou de sair dele.</p>
                </div>
                <button onClick={() => { setCartOpen(false); navigate("/produtos"); }} className="btn btn-primary">
                  Ver cardápio
                </button>
              </div>
            ) : (
              <>
                {/* frete grátis */}
                {business.delivery.enabled && (
                  <div className="border-b border-line px-5 py-3.5 sm:px-6">
                    <p className="text-[12.5px] font-semibold text-dim">
                      {missing > 0 ? (
                        <>Faltam <strong className="text-accent">{formatBRL(missing)}</strong> para entrega grátis</>
                      ) : (
                        <span className="text-accent">Entrega grátis desbloqueada 🎉</span>
                      )}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                      <div className="h-full rounded-full bg-gradient-to-r from-caramel to-accent transition-all duration-700" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {/* itens */}
                <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                  <ul className="space-y-4">
                    {cart.map((item) => (
                      <li key={item.key} className="flex gap-3.5 rounded-[calc(var(--radius)*0.8)] border border-line bg-surface/60 p-3">
                        <img src={item.image} alt="" className="h-[72px] w-[72px] shrink-0 rounded-[calc(var(--radius)*0.55)] object-cover" loading="lazy" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[14.5px] font-bold leading-snug text-paper">{item.name}</p>
                            <button onClick={() => removeItem(item.key)} aria-label={`Remover ${item.name}`} className="text-dim transition-colors hover:text-terra">
                              <ITrash size={16} />
                            </button>
                          </div>
                          {(item.variations.length > 0 || item.extras.length > 0) && (
                            <p className="mt-0.5 text-[12px] leading-relaxed text-dim">
                              {item.variations.map((v) => `${v.label}`).join(" · ")}
                              {item.extras.length > 0 && ` · +${item.extras.map((e) => e.name).join(", +")}`}
                            </p>
                          )}
                          {item.comboItems && (
                            <p className="mt-0.5 text-[12px] text-dim/80">{item.comboItems.join(" + ")}</p>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1 rounded-full border border-line">
                              <button onClick={() => updateQty(item.key, item.qty - 1)} aria-label="Diminuir quantidade" className="grid h-8 w-8 place-items-center text-dim transition-colors hover:text-accent">
                                <IMinus size={14} />
                              </button>
                              <span className="w-5 text-center text-[13.5px] font-extrabold text-paper">{item.qty}</span>
                              <button onClick={() => updateQty(item.key, item.qty + 1)} aria-label="Aumentar quantidade" className="grid h-8 w-8 place-items-center text-dim transition-colors hover:text-accent">
                                <IPlus size={14} />
                              </button>
                            </div>
                            <p className="text-[14.5px] font-extrabold text-accent">{formatBRL(cartItemTotal(item))}</p>
                          </div>

                          {noteKey === item.key ? (
                            <input
                              autoFocus
                              defaultValue={item.note ?? ""}
                              onBlur={(e) => { setItemNote(item.key, e.target.value); setNoteKey(null); }}
                              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                              placeholder="Ex.: sem cebola, ponto da manteiga…"
                              className="field mt-2 !py-1.5 text-[12.5px]"
                            />
                          ) : (
                            <button onClick={() => setNoteKey(item.key)} className="mt-1.5 text-[11.5px] font-bold uppercase tracking-wider text-dim/80 transition-colors hover:text-accent">
                              {item.note ? `Obs: ${item.note}` : "+ adicionar observação"}
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* cupom + totais */}
                <div className="border-t border-line px-5 py-4 sm:px-6">
                  {coupon ? (
                    <div className="flex items-center justify-between rounded-[calc(var(--radius)*0.7)] border border-accent/40 bg-accent/10 px-3.5 py-2.5">
                      <p className="text-[13px] font-bold text-accent">Cupom {coupon.code} aplicado</p>
                      <button onClick={removeCoupon} className="text-[12px] font-bold text-dim hover:text-terra">remover</button>
                    </div>
                  ) : (
                    <form
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const ok = applyCoupon(code);
                        setCouponError(!ok);
                        if (ok) setCode("");
                      }}
                    >
                      <input
                        value={code}
                        onChange={(e) => { setCode(e.target.value); setCouponError(false); }}
                        placeholder="Cupom (ex.: BEMVINDO10)"
                        className="field !py-2.5 text-[13px] uppercase"
                        aria-label="Código do cupom"
                      />
                      <button type="submit" className="btn btn-ghost !px-5 !py-2.5 text-[12.5px]">Aplicar</button>
                    </form>
                  )}
                  {couponError && <p className="mt-2 text-[12px] font-semibold text-terra">Cupom inválido ou expirado.</p>}

                  <dl className="mt-4 space-y-1.5 text-[14px]">
                    <div className="flex justify-between text-dim"><dt>Subtotal</dt><dd className="font-semibold text-paper">{formatBRL(subtotal)}</dd></div>
                    {discount > 0 && (
                      <div className="flex justify-between text-accent"><dt>Desconto</dt><dd className="font-semibold">−{formatBRL(discount)}</dd></div>
                    )}
                    <div className="flex justify-between text-dim">
                      <dt>Entrega</dt>
                      <dd className="font-semibold text-dim">no checkout</dd>
                    </div>
                    <div className="flex justify-between border-t border-line pt-2.5 text-[17px] font-extrabold text-paper">
                      <dt>Total</dt><dd className="text-accent">{formatBRL(total)}</dd>
                    </div>
                  </dl>

                  <button
                    onClick={() => { track("begin_checkout"); setCartOpen(false); navigate("/checkout"); }}
                    className="btn btn-primary mt-4 w-full !py-4 text-[15px]"
                  >
                    {business.cta.cart}
                  </button>
                  {business.integrations.whatsapp.enabled && (
                    <button onClick={sendWhatsApp} className="btn btn-ghost mt-2.5 w-full !py-3.5 text-[13.5px]">
                      <IWhatsApp size={18} className="text-accent" /> Preferir pedir no WhatsApp
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
