import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../core/store";
import { categories } from "../business/products";
import { formatBRL, productUnitPrice, track, useSEO } from "../core/utils";
import ProductCard from "../components/ProductCard";
import { IBasket, IChevron, IClock, ILeaf, IMinus, INote, IPlus, IStar, IAlert } from "../components/icons";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { business, products, getProduct, addToCart, registerFly, setCartOpen } = useApp();
  const navigate = useNavigate();
  const product = getProduct(slug ?? "");

  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [selVar, setSelVar] = useState<Record<string, string>>({});
  const [selExtras, setSelExtras] = useState<string[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => { setImgIdx(0); setQty(1); setSelVar({}); setSelExtras([]); setNote(""); }, [slug]);

  useEffect(() => {
    if (product) track("view_product", { product: product.slug });
  }, [product]);

  useSEO(
    product ? `${product.name} | ${business.name}` : `Produto | ${business.name}`,
    product?.shortDescription
  );

  const variations = product?.variations ?? [];
  const extras = product?.extras ?? [];

  // default: primeira opção de cada variação
  const activeVar = useMemo(() => {
    const m: Record<string, string> = { ...selVar };
    variations.forEach((v) => { if (!m[v.id]) m[v.id] = v.options[0]?.id ?? ""; });
    return m;
  }, [selVar, variations]);

  if (!product) {
    return (
      <main className="light-section flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
        <IAlert size={40} className="text-terra" />
        <h1 className="font-display mt-5 text-4xl">Este pão já saiu da prateleira.</h1>
        <p className="mt-2 text-inksoft">O produto não existe ou foi removido do cardápio.</p>
        <Link to="/produtos" className="btn btn-dark mt-7">Voltar ao cardápio</Link>
      </main>
    );
  }

  const cat = categories.find((c) => c.slug === product.category);
  const unit = productUnitPrice(product);
  const varDelta = variations.reduce((s, v) => {
    const opt = v.options.find((o) => o.id === activeVar[v.id]);
    return s + (opt?.delta ?? 0);
  }, 0);
  const extraSum = extras.filter((e) => selExtras.includes(e.id)).reduce((s, e) => s + e.price, 0);
  const unitTotal = unit + varDelta + extraSum;
  const pairs = (product.pairsWith ?? []).map((s) => getProduct(s)).filter(Boolean).slice(0, 3);
  const off = product.promotionalPrice ? Math.round((1 - product.promotionalPrice / product.price) * 100) : 0;

  const add = (e: React.MouseEvent<HTMLButtonElement>) => {
    registerFly(e.currentTarget.getBoundingClientRect());
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      unitBase: unit,
      qty,
      variations: variations.map((v) => {
        const opt = v.options.find((o) => o.id === activeVar[v.id])!;
        return { name: v.name, label: opt.label, delta: opt.delta };
      }).filter((v) => v.delta !== 0 || variations.length > 1),
      extras: extras.filter((x) => selExtras.includes(x.id)).map((x) => ({ name: x.name, price: x.price })),
      note: note.trim() || undefined,
      isCombo: Boolean(product.comboItems),
      comboItems: product.comboItems,
    });
    track("add_to_cart", { product: product.slug, qty, via: "product_page" });
    setCartOpen(true);
  };

  const buyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    add(e);
    navigate("/checkout");
  };

  return (
    <main className="light-section min-h-screen pb-24 pt-28 md:pt-36">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* breadcrumb */}
        <nav aria-label="Trilha de navegação" className="flex flex-wrap items-center gap-1.5 text-[12.5px] font-semibold text-inksoft">
          <Link to="/" className="u-link hover:text-ink">Início</Link>
          <IChevron size={12} />
          <Link to={`/categoria/${product.category}`} className="u-link hover:text-ink">{cat?.name ?? "Cardápio"}</Link>
          <IChevron size={12} />
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-7 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* galeria */}
          <div>
            <div className="group relative overflow-hidden rounded-[calc(var(--radius)*1.2)] shadow-[0_36px_70px_-32px_rgba(60,35,15,0.55)]">
              <img
                src={product.images[imgIdx]}
                alt={product.name}
                className="aspect-square w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
              />
              <div className="absolute left-4 top-4 flex gap-2">
                {off > 0 && <span className="rounded-full bg-terra px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-flour">−{off}% hoje</span>}
                {product.bestseller && <span className="rounded-full bg-accent px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-accent-ink">Mais vendido</span>}
              </div>
              {!product.available && (
                <div className="absolute inset-0 grid place-items-center bg-espresso/70 backdrop-blur-[2px]">
                  <p className="font-display text-2xl italic text-flour">Esgotado por hoje — volta na próxima fornada.</p>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3.5 flex gap-3">
                {product.images.map((src, i) => (
                  <button key={src + i} onClick={() => setImgIdx(i)} aria-label={`Foto ${i + 1}`} className={`h-20 w-20 overflow-hidden rounded-[calc(var(--radius)*0.6)] ring-2 transition-all ${i === imgIdx ? "ring-terra" : "ring-transparent opacity-70 hover:opacity-100"}`}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* informações */}
          <div>
            <h1 className="font-display text-4xl font-medium leading-tight md:text-5xl">{product.name}</h1>
            <p className="mt-3 text-[15.5px] leading-relaxed text-inksoft">{product.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-[12.5px] font-bold">
              {product.preparationTime && (
                <span className="flex items-center gap-1.5 rounded-full border border-ink/12 px-3.5 py-1.5 text-inksoft"><IClock size={14} className="text-terra" /> {product.preparationTime}</span>
              )}
              {product.tags?.map((t) => (
                <span key={t} className="flex items-center gap-1.5 rounded-full border border-ink/12 px-3.5 py-1.5 text-inksoft"><ILeaf size={14} className="text-terra" /> {t}</span>
              ))}
              {product.unit && <span className="rounded-full bg-ink/6 px-3.5 py-1.5 text-inksoft">{product.unit}</span>}
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <p className="text-[32px] font-extrabold tracking-tight">{formatBRL(unitTotal)}</p>
              {product.promotionalPrice && <p className="text-[16px] font-semibold text-inksoft line-through">{formatBRL((product.price + varDelta + extraSum))}</p>}
            </div>

            {/* variações */}
            {variations.map((v) => (
              <fieldset key={v.id} className="mt-6">
                <legend className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-inksoft">{v.name}</legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {v.options.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSelVar((prev) => ({ ...prev, [v.id]: o.id }))}
                      className={`chip !border-ink/15 !text-ink hover:!border-terra ${activeVar[v.id] === o.id ? "!border-ink !bg-ink !text-flour" : "!text-inksoft"}`}
                    >
                      {o.label}{o.delta > 0 && <span className="opacity-70"> +{formatBRL(o.delta)}</span>}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}

            {/* adicionais */}
            {extras.length > 0 && (
              <fieldset className="mt-6">
                <legend className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-inksoft">Adicionais</legend>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {extras.map((x) => {
                    const on = selExtras.includes(x.id);
                    return (
                      <button
                        key={x.id}
                        onClick={() => setSelExtras((prev) => (on ? prev.filter((i) => i !== x.id) : [...prev, x.id]))}
                        aria-pressed={on}
                        className={`chip !border-ink/15 hover:!border-terra ${on ? "!border-terra !bg-terra !text-flour" : "!text-inksoft"}`}
                      >
                        {on ? "−" : "+"} {x.name} <span className="opacity-70">{formatBRL(x.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {/* observação */}
            <div className="relative mt-6">
              <INote size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inksoft" />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={120}
                placeholder="Alguma observação? (ex.: mais tostado, sem sal por cima…)"
                className="field field-light !py-3 !pl-10 text-[14px]"
                aria-label="Observação do produto"
              />
            </div>

            {/* qty + CTA */}
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <div className="flex items-center gap-1 rounded-full border border-ink/15 bg-flour">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir" className="grid h-12 w-12 place-items-center text-inksoft hover:text-terra"><IMinus size={16} /></button>
                <span className="w-8 text-center text-[16px] font-extrabold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} aria-label="Aumentar" className="grid h-12 w-12 place-items-center text-inksoft hover:text-terra"><IPlus size={16} /></button>
              </div>
              <button onClick={add} disabled={!product.available} className="btn btn-dark flex-1 !py-4 text-[14.5px] sm:flex-none sm:!px-9">
                <IBasket size={18} /> {business.cta.product}
              </button>
              <button onClick={buyNow} disabled={!product.available} className="btn btn-primary !py-4 text-[14.5px]">
                Pedir agora · {formatBRL(unitTotal * qty)}
              </button>
            </div>

            {/* ingredientes / alergênicos */}
            {(product.ingredients || product.allergens) && (
              <div className="mt-8 grid gap-5 rounded-[var(--radius)] border border-ink/10 bg-flour p-5 sm:grid-cols-2">
                {product.ingredients && (
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-terra">Ingredientes</p>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-inksoft">{product.ingredients.join(", ")}</p>
                  </div>
                )}
                {product.allergens && (
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-terra">Alergênicos</p>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-inksoft">Contém: {product.allergens.join(", ")}.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* cross-sell */}
        {pairs.length > 0 && (
          <section className="mt-20">
            <p className="flex items-center gap-2.5 text-[11.5px] font-extrabold uppercase tracking-[0.3em] text-terra">
              <span className="h-px w-8 bg-terra" /> combina com
            </p>
            <h2 className="font-display mt-3 text-3xl font-medium md:text-4xl">Complete a mesa.</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pairs.map((p) => p && <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}

        {/* prova social leve */}
        {business.reviews.length > 0 && (
          <p className="mt-16 flex items-center justify-center gap-2 text-[13.5px] font-semibold text-inksoft">
            <IStar size={15} className="text-caramel" /> Quem pediu, avaliou a casa com {business.reviews.length > 0 ? (business.reviews.reduce((s, r) => s + r.rating, 0) / business.reviews.length).toFixed(1).replace(".", ",") : "—"} de média.
          </p>
        )}
      </div>
    </main>
  );
}
