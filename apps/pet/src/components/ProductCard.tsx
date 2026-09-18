import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../config/business";
import { priceOf } from "../config/business";
import { brl, track, useStore } from "../lib/core";
import { Btn, Modal, Price, ProductArt, Rating, Stepper } from "./ui";
import { ICart, ICheck, IRefresh, ITag } from "./icons";

const TINTS: Record<string, string> = {
  sand: "bg-[linear-gradient(160deg,#F6E7D4_0%,#EFDBBF_100%)]",
  mint: "bg-[linear-gradient(160deg,#DCEAE2_0%,#C4DED2_100%)]",
};

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addToCart } = useStore();
  const [varOpen, setVarOpen] = useState(false);
  const [variationId, setVariationId] = useState<string | undefined>(product.variations?.[product.variations.length - 1]?.id);
  const [qty, setQtyLocal] = useState(1);
  const [added, setAdded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const hasDiscount = Boolean(product.promotionalPrice || product.variations?.some((v) => v.promotionalPrice));
  const minPrice = priceOf(product, variationId);
  const hasVariations = Boolean(product.variations?.length);

  const quickAdd = () => {
    if (hasVariations) {
      setVarOpen(true);
      return;
    }
    addToCart(product, undefined, 1, btnRef.current);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="group relative flex flex-col bg-white border border-line rounded-[22px] rounded-bl-[6px] overflow-hidden transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-20px_rgba(91,64,52,0.35)] hover:border-bark/25">
      {/* selos */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {hasDiscount && (
          <span className="inline-flex items-center gap-1 bg-coral text-white text-[10.5px] font-display font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            <ITag size={11} /> Oferta
          </span>
        )}
        {product.subscriptionEligible && (
          <span className="inline-flex items-center gap-1 bg-leaf text-white text-[10.5px] font-display font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
            <IRefresh size={11} /> Assine
          </span>
        )}
      </div>

      <Link
        to={`/produtos/${product.slug}`}
        className={`${TINTS[product.artTint] ?? TINTS.sand} relative block ${compact ? "pt-4" : "pt-6"}`}
        onClick={() => track("view_product", { product: product.slug })}
        aria-label={`Ver ${product.name}`}
      >
        <ProductArt kind={product.art} className={`w-full px-8 transition-transform duration-500 group-hover:scale-[1.07] group-hover:-rotate-1 ${compact ? "max-w-[190px] mx-auto" : ""}`} />
        {product.stock <= 10 && product.available && (
          <span className="absolute bottom-3 right-3 text-[10.5px] font-display font-bold text-bark/70 bg-cream/85 px-2 py-1 rounded-full">
            Últimas {product.stock} un.
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <p className="text-[10.5px] font-display font-bold uppercase tracking-[0.18em] text-fog">{product.brand}</p>
        <Link to={`/produtos/${product.slug}`} className="mt-1 font-display font-semibold text-ink text-[15px] leading-snug hover:text-brand-deep transition-colors">
          {product.name}
        </Link>
        <p className="text-[12px] text-fog mt-0.5">{product.weight ?? product.size ?? ""}</p>
        {product.rating !== undefined && (
          <div className="mt-2"><Rating value={product.rating} count={product.reviewsCount} /></div>
        )}

        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <Price value={minPrice} old={hasVariations ? undefined : product.promotionalPrice ? product.price : undefined} />
          <button
            ref={btnRef}
            type="button"
            onClick={quickAdd}
            disabled={!product.available}
            aria-label={hasVariations ? `Escolher variação de ${product.name}` : `Adicionar ${product.name} ao carrinho`}
            className={`shrink-0 h-11 px-4 rounded-full font-display font-bold text-[13px] inline-flex items-center gap-2 transition-all duration-300 active:scale-95 ${
              added
                ? "bg-leaf text-white"
                : "bg-bark text-cream hover:bg-brand hover:shadow-[0_10px_24px_-8px_rgba(231,136,74,0.7)]"
            }`}
          >
            {added ? <ICheck size={15} /> : <ICart size={15} />}
            {added ? "Pronto!" : "Adicionar"}
          </button>
        </div>
      </div>

      {/* modal de variação */}
      <Modal open={varOpen} onClose={() => setVarOpen(false)} title={product.name}>
        <div className="flex gap-4 items-center bg-sand/60 rounded-[18px] p-3">
          <div className={`w-20 h-20 shrink-0 rounded-[14px] grid place-items-center ${TINTS[product.artTint] ?? TINTS.sand}`}>
            <ProductArt kind={product.art} className="w-16" />
          </div>
          <div>
            <p className="font-display font-semibold text-ink text-[15px]">{product.name}</p>
            <p className="text-[12.5px] text-fog">{product.brand} · escolha o tamanho</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Variações">
          {product.variations?.map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={variationId === v.id}
              onClick={() => setVariationId(v.id)}
              className={`flex items-center justify-between px-4 py-3 rounded-[14px] border-[1.5px] transition-all ${
                variationId === v.id ? "border-brand bg-brand/8" : "border-line bg-white hover:border-bark/30"
              }`}
            >
              <span className="font-display font-semibold text-ink text-sm">{v.label}</span>
              <span className="text-sm">
                {v.promotionalPrice && <span className="text-fog line-through text-xs mr-2">{brl(v.price)}</span>}
                <span className="font-display font-bold text-ink">{brl(v.promotionalPrice ?? v.price)}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <Stepper value={qty} onChange={(v) => setQtyLocal(Math.max(1, v))} />
          <Btn
            className="flex-1"
            onClick={() => {
              addToCart(product, variationId, qty, btnRef.current);
              setVarOpen(false);
              setQtyLocal(1);
            }}
          >
            Adicionar · {brl(priceOf(product, variationId) * qty)}
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
