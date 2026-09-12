import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../business/types";
import { useApp } from "../core/store";
import { formatBRL, productUnitPrice, track } from "../core/utils";
import { IPlus } from "./icons";

export default function ProductCard({ product, eager = false }: { product: Product; eager?: boolean }) {
  const { addToCart, registerFly } = useApp();
  const navigate = useNavigate();
  const price = productUnitPrice(product);
  const hasOptions = Boolean(product.variations?.length || product.extras?.length);
  const off = product.promotionalPrice
    ? Math.round((1 - product.promotionalPrice / product.price) * 100)
    : 0;

  const onAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.available) return;
    if (hasOptions) {
      navigate(`/produto/${product.slug}`);
      return;
    }
    registerFly(e.currentTarget.getBoundingClientRect());
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      unitBase: price,
      qty: 1,
      variations: [],
      extras: [],
      isCombo: Boolean(product.comboItems),
      comboItems: product.comboItems,
    });
    track("add_to_cart", { product: product.slug, via: "card" });
  };

  return (
    <article className="group relative">
      <Link
        to={`/produto/${product.slug}`}
        className="block overflow-hidden rounded-[var(--radius)] border border-line bg-surface transition-all duration-500 hover:-translate-y-1.5 hover:border-caramel/50 hover:shadow-[0_30px_60px_-24px_rgba(0,0,0,0.75)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            loading={eager ? "eager" : "lazy"}
            className={`h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] ${!product.available ? "opacity-50 saturate-50" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-transparent opacity-60" />

          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {off > 0 && product.available && (
              <span className="rounded-full bg-terra px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-flour">−{off}%</span>
            )}
            {product.isNew && product.available && (
              <span className="rounded-full bg-olive px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-flour" style={{ background: "var(--olive, #646343)" }}>Novo</span>
            )}
            {product.bestseller && product.available && (
              <span className="rounded-full bg-accent px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-accent-ink">Mais vendido</span>
            )}
            {!product.available && (
              <span className="rounded-full bg-espresso/90 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-dim">Esgotado hoje</span>
            )}
          </div>

          <button
            onClick={onAdd}
            disabled={!product.available}
            aria-label={product.available ? `Adicionar ${product.name} ao carrinho` : `${product.name} esgotado`}
            className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-ink shadow-[0_10px_24px_-8px_rgba(0,0,0,0.7)] transition-all duration-300 hover:scale-110 hover:bg-flour active:scale-95 disabled:cursor-not-allowed disabled:bg-espresso/80 disabled:text-dim"
          >
            <IPlus size={20} />
          </button>
        </div>

        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-[19px] font-semibold leading-snug text-paper">{product.name}</h3>
          </div>
          <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-dim">{product.shortDescription}</p>

          <div className="mt-3.5 flex items-end justify-between gap-2">
            <div>
              {product.promotionalPrice ? (
                <p className="flex items-baseline gap-2">
                  <span className="text-[17px] font-extrabold text-accent">{formatBRL(price)}</span>
                  <span className="text-[12.5px] font-semibold text-dim/70 line-through">{formatBRL(product.price)}</span>
                </p>
              ) : (
                <p className="text-[17px] font-extrabold text-paper">{formatBRL(price)}</p>
              )}
              {product.unit && <p className="mt-0.5 text-[11.5px] font-semibold uppercase tracking-wider text-dim/70">{product.unit}</p>}
            </div>
            {(hasOptions || product.comboItems) && (
              <span className="rounded-full border border-line px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-dim">
                {product.comboItems ? "combo" : "personalizar"}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
