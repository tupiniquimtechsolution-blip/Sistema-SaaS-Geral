import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { business, priceOf, variationLabel } from "../config/business";
import { brl, Reveal, track, usePageMeta, useStore, whatsLink } from "../lib/core";
import { Btn, EmptyState, Price, ProductArt, Rating, Stepper, inputCls, labelCls } from "../components/ui";
import { ProductCard } from "../components/ProductCard";
import { BackLink } from "../components/chrome";
import { ICart, ICheck, IRefresh, IShield, ITruck, IStore, IWhatsApp, IPaw, IChevron, IBag } from "../components/icons";

const TINTS: Record<string, string> = {
  sand: "bg-[linear-gradient(160deg,#F6E7D4_0%,#EFDBBF_100%)]",
  mint: "bg-[linear-gradient(160deg,#DCEAE2_0%,#C4DED2_100%)]",
};

export default function ProductDetail() {
  const { slug } = useParams();
  const product = business.products.find((p) => p.slug === slug);
  const { addToCart, customer, saveCustomer } = useStore();
  const [variationId, setVariationId] = useState<string | undefined>(product?.variations?.[product.variations.length - 1]?.id);
  const [qty, setQty] = useState(1);
  const [subFreq, setSubFreq] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [cep, setCep] = useState(customer.cep);
  const [cepInfo, setCepInfo] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  usePageMeta(
    product ? `${product.name} ${product.weight ?? ""} | ${business.name}` : `Produto | ${business.name}`,
    product?.description
  );

  if (!product) {
    return (
      <main className="max-w-3xl mx-auto px-4 pt-32">
        <EmptyState icon={<IBag size={28} />} title="Produto não encontrado" desc="Esse item pode ter saído do catálogo. Dá uma olhada no que temos de novo." action={<Btn to="/produtos">Ver catálogo</Btn>} />
      </main>
    );
  }

  const unit = priceOf(product, variationId);
  const old = product.variations
    ? product.variations.find((v) => v.id === variationId && v.promotionalPrice)?.price
    : product.promotionalPrice ? product.price : undefined;
  const related = (product.crossSell ?? [])
    .map((s) => business.products.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const ecommerce = business.features.ecommerce;

  const handleAdd = () => {
    addToCart(product, variationId, qty, btnRef.current);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  const checkCep = () => {
    if (cep.replace(/\D/g, "").length !== 8) { setCepInfo("Digite um CEP com 8 dígitos."); return; }
    setCepInfo(`Entrega disponível para ${cep} · taxa ${brl(business.delivery.fee)} · grátis acima de ${brl(business.delivery.freeAbove)}`);
    saveCustomer({ cep });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-8">
      <nav className="text-[13px] text-fog flex items-center gap-1.5 flex-wrap" aria-label="Trilha de navegação">
        <Link to="/" className="hover:text-brand-deep">Início</Link> <IChevron size={11} />
        <Link to="/produtos" className="hover:text-brand-deep">Produtos</Link> <IChevron size={11} />
        <Link to={`/categoria/${product.category}`} className="hover:text-brand-deep capitalize">{business.categories.find((c) => c.slug === product.category)?.name}</Link> <IChevron size={11} />
        <span className="text-ink font-semibold">{product.name}</span>
      </nav>

      <div className="mt-7 grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* galeria */}
        <Reveal>
          <div className={`group relative rounded-[28px] rounded-bl-[8px] overflow-hidden ${TINTS[product.artTint] ?? TINTS.sand}`}>
            <div className="aspect-square grid place-items-center p-10 overflow-hidden">
              <ProductArt kind={product.art} className="w-full max-w-[420px] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-2" />
            </div>
            {product.promotionalPrice && (
              <span className="absolute top-5 left-5 bg-coral text-white text-[11px] font-display font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">Oferta</span>
            )}
            <span className="absolute bottom-5 right-5 bg-cream/85 text-bark text-[11px] font-display font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Passe o mouse para ver de perto</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {["sand", "mint", "sand"].map((t, i) => (
              <div key={i} className={`rounded-[16px] aspect-[4/3] grid place-items-center p-4 ${TINTS[t]} ${i === 0 ? "ring-2 ring-brand" : "opacity-80"}`}>
                <ProductArt kind={product.art} className="w-3/4" />
              </div>
            ))}
          </div>
        </Reveal>

        {/* info */}
        <Reveal delay={120}>
          <p className="text-[12px] font-display font-bold uppercase tracking-[0.2em] text-brand-deep">{product.brand}</p>
          <h1 className="font-display font-extrabold display-tight text-[clamp(1.7rem,3.6vw,2.6rem)] text-ink mt-2">{product.name}</h1>
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            {product.rating !== undefined && <Rating value={product.rating} count={product.reviewsCount} />}
            <span className="text-[12.5px] text-fog flex items-center gap-1.5"><IPaw size={13} className="text-brand" /> {product.species.map((s) => (s === "caes" ? "Cães" : "Gatos")).join(" e ")}</span>
          </div>

          <div className="mt-6"><Price big value={unit} old={old} /></div>
          <p className="text-[12.5px] text-fog mt-1">ou retire na loja hoje · pagamento na retirada</p>

          <p className="mt-5 text-fog text-[15.5px] leading-relaxed">{product.description}</p>

          {product.variations && (
            <fieldset className="mt-6">
              <legend className={labelCls}>Tamanho</legend>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => (
                  <button
                    key={v.id} type="button" aria-pressed={variationId === v.id}
                    onClick={() => setVariationId(v.id)}
                    className={`px-5 py-2.5 rounded-full font-display font-bold text-sm transition-all ${variationId === v.id ? "bg-bark text-cream shadow-md" : "bg-white border-[1.5px] border-bark/20 text-bark hover:border-bark"}`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* assinatura */}
          {product.subscriptionEligible && business.features.recurringOrders && (
            <div className="mt-6 bg-mint/40 border border-leaf/25 rounded-[18px] rounded-bl-[6px] p-4">
              <p className="font-display font-bold text-leaf-deep text-sm flex items-center gap-2"><IRefresh size={16} /> Entrega recorrente — nunca mais fique sem</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[null, "15", "30", "45"].map((f) => (
                  <button
                    key={String(f)} type="button" aria-pressed={subFreq === f}
                    onClick={() => setSubFreq(f)}
                    className={`px-4 py-2 rounded-full text-[13px] font-display font-bold transition-all ${subFreq === f ? "bg-leaf text-white" : "bg-white text-leaf-deep border border-leaf/30 hover:border-leaf"}`}
                  >
                    {f === null ? "Compra única" : `A cada ${f} dias`}
                  </button>
                ))}
              </div>
              {subFreq && <p className="mt-2.5 text-[12.5px] text-leaf-deep">Reposição automática a cada {subFreq} dias. Pause ou cancele pelo WhatsApp quando quiser.</p>}
            </div>
          )}

          {/* ações */}
          <div className="mt-7 flex items-center gap-4">
            <Stepper value={qty} onChange={(v) => setQty(Math.max(1, v))} />
            {ecommerce ? (
              <button
                ref={btnRef} type="button" onClick={handleAdd}
                className={`flex-1 sm:flex-none sm:min-w-[240px] inline-flex items-center justify-center gap-2.5 font-display font-bold text-[15px] px-8 py-4 rounded-full transition-all active:scale-[0.97] ${added ? "bg-leaf text-white" : "bg-brand text-white shadow-[0_14px_34px_-10px_rgba(231,136,74,0.75)] hover:bg-brand-deep hover:-translate-y-0.5"}`}
              >
                {added ? <ICheck size={18} /> : <ICart size={18} />}
                {added ? "Adicionado!" : `Adicionar · ${brl(unit * qty)}`}
              </button>
            ) : (
              <a
                href={whatsLink(business.contact.whatsapp, `Olá! Tenho interesse no produto "${product.name}" (${variationLabel(product, variationId) ?? ""}).`)}
                target="_blank" rel="noreferrer" onClick={() => track("click_whatsapp", { from: "product", product: product.slug })}
                className="flex-1 inline-flex items-center justify-center gap-2.5 font-display font-bold text-[15px] px-8 py-4 rounded-full bg-leaf text-white hover:bg-leaf-deep transition-colors"
              >
                <IWhatsApp size={18} /> Consultar pelo WhatsApp
              </a>
            )}
          </div>

          {/* entrega */}
          <div className="mt-7 bg-white border border-line rounded-[20px] rounded-bl-[6px] p-5 grid gap-4">
            <div>
              <p className="font-display font-bold text-[13px] text-bark flex items-center gap-2"><ITruck size={16} className="text-brand" /> Calcular entrega</p>
              <div className="mt-2.5 flex gap-2">
                <input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="Seu CEP" inputMode="numeric" className={inputCls + " max-w-[160px]"} aria-label="CEP para calcular entrega" />
                <Btn variant="bark" size="sm" onClick={checkCep}>Calcular</Btn>
              </div>
              {cepInfo && <p className="mt-2 text-[12.5px] text-leaf-deep font-semibold">{cepInfo}</p>}
            </div>
            <p className="flex items-center gap-2 text-[13px] text-fog"><IStore size={16} className="text-brand shrink-0" /> Retirada grátis em {business.locations[0].name.split("·")[1] ?? business.locations[0].district} — pronta em até 2h.</p>
            <p className="flex items-center gap-2 text-[13px] text-fog"><IShield size={16} className="text-brand shrink-0" /> Pagamento seguro via Pix ou cartão. Não armazenamos dados de cartão.</p>
          </div>

          {/* detalhes */}
          <div className="mt-7">
            <p className={labelCls}>Destaques do produto</p>
            <ul className="grid gap-2">
              {product.details.map((d) => (
                <li key={d} className="flex items-center gap-2.5 text-[14.5px] text-ink"><ICheck size={15} className="text-leaf shrink-0" /> {d}</li>
              ))}
            </ul>
            {product.weight && <p className="mt-4 text-[13px] text-fog">Conteúdo: {product.weight}{product.lifeStage ? ` · indicado para ${product.lifeStage.toLowerCase()}` : ""}</p>}
          </div>
        </Reveal>
      </div>

      {/* cross-sell */}
      {related.length > 0 && (
        <section className="mt-20">
          <Reveal>
            <h2 className="font-display font-extrabold display-tight text-[clamp(1.4rem,3vw,2rem)] text-ink">
              {product.category === "racao" ? "Talvez seu pet também goste de…" : "Complete o combo com…"}
            </h2>
          </Reveal>
          <div className="mt-7 grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}><ProductCard product={p} compact /></Reveal>
            ))}
          </div>
        </section>
      )}

      <div className="mt-16"><BackLink to="/produtos" label="Voltar ao catálogo" /></div>
    </main>
  );
}
