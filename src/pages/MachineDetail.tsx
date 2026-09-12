import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BUSINESS } from "../config/business";
import { CATEGORY_META, MACHINES, machineBySlug } from "../data/machines";
import { cx, formatBRL, machineMessage, useJsonLd, usePageMeta, waLink } from "../lib/utils";
import { useApp } from "../store/AppStore";
import { MachineCard } from "../components/MachineCard";
import { Lightbox } from "../components/overlays";
import {
  Btn,
  HazardStrip,
  IcChevronL,
  IcChevronR,
  IcEngine,
  IcHeart,
  IcPhone,
  IcPin,
  IcScale,
  IcShield,
  IcTractor,
  IcWhatsApp,
  Reveal,
  StatusTag,
} from "../components/ui";

export default function MachineDetail() {
  const { slug } = useParams();
  const m = machineBySlug(slug ?? "");
  const { isFavorite, toggleFavorite, inCompare, toggleCompare, openQuote } = useApp();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [thumb, setThumb] = useState(0);

  usePageMeta(
    m ? `${m.model} ${m.condition === "original" ? "Original" : "Compatível"} (${m.code}) — ${BUSINESS.name}` : `Peça não encontrada — ${BUSINESS.name}`,
    m
      ? `${m.model} para ${m.brand} — ${m.application}. ${m.condition === "original" ? "Peça original" : "Peça compatível"} ${m.oem}. ${m.price ? `Por ${formatBRL(m.price)}.` : "Preço sob consulta."} Estoque em ${BUSINESS.address.city}/${BUSINESS.address.state}, envio para todo o Brasil.`
      : "A peça que você procura não está mais disponível. Veja o estoque completo.",
  );

  const jsonLd = useMemo(
    () =>
      m && m.status !== "vendida"
        ? {
            "@context": "https://schema.org",
            "@type": "Product",
            name: `${m.model} — ${m.brand}`,
            description: m.description,
            sku: m.code,
            brand: { "@type": "Brand", name: m.oem },
            image: m.images,
            ...(m.price
              ? {
                  offers: {
                    "@type": "Offer",
                    priceCurrency: "BRL",
                    price: m.price,
                    availability: m.status === "disponivel" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
                  },
                }
              : {}),
          }
        : null,
    [m],
  );
  useJsonLd("jsonld-product", jsonLd);

  useEffect(() => setThumb(0), [slug]);

  if (!m) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-6 pt-32 text-center">
        <div>
          <p className="font-cond text-[13px] font-bold uppercase tracking-[0.3em] text-safety-400">Peça não encontrada</p>
          <h1 className="mt-3 font-display text-4xl uppercase">Ela saiu do catálogo — mas o estoque continua cheio</h1>
          <p className="mx-auto mt-4 max-w-md text-steel-300">Mais de 30.000 itens no estoque físico. Fale com a gente ou navegue pelo catálogo.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Btn to="/pecas">Ver estoque</Btn>
            <Btn href={waLink(BUSINESS.whatsapp, `Olá! Procurei uma peça no site da ${BUSINESS.name} e não encontrei. Podem me ajudar?`)} tone="outline">
              <IcWhatsApp size={16} /> Falar com a Lusomaq
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  const sold = m.status === "vendida";
  const fav = isFavorite(m.id);
  const cmp = inCompare(m.id);
  const similar = MACHINES.filter((x) => x.id !== m.id && x.category === m.category).slice(0, 3);

  return (
    <div className="pt-[100px] lg:pt-[126px]">
      {/* breadcrumb */}
      <nav className="border-b border-line-dark bg-coal-900" aria-label="Você está aqui">
        <ol className="mx-auto flex max-w-(--container-site) flex-wrap items-center gap-2 px-6 py-3 font-cond text-[12px] font-semibold uppercase tracking-[0.18em] text-steel-400">
          <li><Link to="/" className="hover:text-hz-300">Início</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to="/pecas" className="hover:text-hz-300">Peças</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to={`/pecas?categoria=${m.category}`} className="hover:text-hz-300">{CATEGORY_META[m.category].plural}</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-bone-100" aria-current="page">{m.code}</li>
        </ol>
      </nav>

      <div className="mx-auto max-w-(--container-site) px-6 py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
          {/* galeria */}
          <Reveal variant="left">
            <div className="tick-corners relative overflow-hidden border border-line-dark bg-white">
              <button onClick={() => setLightbox(thumb)} className="block w-full cursor-zoom-in" aria-label="Ampliar foto">
                <img src={m.images[thumb]} alt={`${m.model} — foto principal`} className={cx("aspect-[4/3] w-full object-contain p-8", sold && "grayscale")} />
              </button>
              <div className="absolute left-4 top-4 z-10 flex gap-2">
                <span className={cx("clip-cut-sm px-3 py-1.5 font-cond text-[12px] font-bold uppercase tracking-[0.18em]", m.condition === "original" ? "bg-hz-400 text-coal-950" : "bg-coal-950/90 text-bone-100")}>
                  {m.condition === "original" ? "Original" : "Compatível"}
                </span>
                <StatusTag status={m.status} />
              </div>
              <span className="absolute bottom-4 left-4 z-10 bg-coal-950/90 px-3 py-1.5 font-cond text-[12px] font-bold uppercase tracking-[0.2em] text-steel-300">
                {thumb + 1} / {m.images.length} — clique p/ ampliar
              </span>
              {sold && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center bg-coal-950/40">
                  <span className="-rotate-6 border-2 border-safety-400 bg-coal-950/90 px-8 py-3 font-display text-3xl uppercase tracking-[0.14em] text-safety-400">Esgotada</span>
                </div>
              )}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3" data-lenis-prevent>
              {m.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setThumb(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  className={cx("overflow-hidden border bg-white transition-all duration-200", i === thumb ? "border-hz-400" : "border-line-dark opacity-70 hover:opacity-100")}
                >
                  <img src={img} alt="" className="aspect-[4/3] w-full object-contain p-2" />
                </button>
              ))}
              <div className="grid place-items-center border border-dashed border-steel-500 text-center">
                <span className="px-2 font-cond text-[10px] font-bold uppercase tracking-[0.14em] text-steel-500">Fotos reais do estoque</span>
              </div>
            </div>
          </Reveal>

          {/* resumo + CTA */}
          <Reveal variant="right" delay={120}>
            <div className="flex h-full flex-col border border-line-dark bg-coal-900 p-7 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-cond text-[12px] font-semibold uppercase tracking-[0.26em] text-steel-400">
                    {m.brand} · {m.oem}
                  </p>
                  <h1 className="mt-2 font-display text-[clamp(1.9rem,4vw,3rem)] uppercase leading-[0.95]">{m.model}</h1>
                </div>
                <span className="clip-cut-sm shrink-0 bg-coal-800 px-3 py-2 font-cond text-[13px] font-bold uppercase tracking-[0.2em] text-hz-300">{m.code}</span>
              </div>

              <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3 border-y border-line-dark py-5 text-[14px]">
                <div className="flex items-center gap-2.5">
                  <IcEngine size={17} className="text-hz-400" />
                  <div><dt className="font-cond text-[11px] font-bold uppercase tracking-[0.18em] text-steel-500">Aplica em</dt><dd className="font-cond font-semibold text-bone-100">{m.application}</dd></div>
                </div>
                <div className="flex items-center gap-2.5">
                  <IcTractor size={17} className="text-hz-400" />
                  <div><dt className="font-cond text-[11px] font-bold uppercase tracking-[0.18em] text-steel-500">Marca do rolo</dt><dd className="font-cond font-semibold text-bone-100">{m.brand}</dd></div>
                </div>
                <div className="flex items-center gap-2.5">
                  <IcShield size={17} className="text-hz-400" />
                  <div><dt className="font-cond text-[11px] font-bold uppercase tracking-[0.18em] text-steel-500">Fabricante</dt><dd className="font-cond font-semibold text-bone-100">{m.oem}</dd></div>
                </div>
                <div className="flex items-center gap-2.5">
                  <IcPin size={17} className="text-hz-400" />
                  <div><dt className="font-cond text-[11px] font-bold uppercase tracking-[0.18em] text-steel-500">Estoque</dt><dd className="font-cond font-semibold text-bone-100">{m.location}</dd></div>
                </div>
              </dl>

              <p className="mt-5 text-[15px] leading-relaxed text-steel-300">{m.description}</p>

              {m.badges.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {m.badges.map((b) => (
                    <li key={b} className="border border-agri-500/40 bg-agri-500/10 px-2.5 py-1 font-cond text-[11px] font-semibold uppercase tracking-[0.14em] text-agri-300">{b}</li>
                  ))}
                </ul>
              )}

              <div className="mt-6 flex items-end justify-between gap-4 border-t border-line-dark pt-5">
                <div>
                  <p className="font-cond text-[11px] font-bold uppercase tracking-[0.2em] text-steel-500">Valor</p>
                  {m.price ? (
                    <p className="font-cond text-4xl font-bold leading-none text-hz-300">{formatBRL(m.price)}</p>
                  ) : (
                    <p className="font-display text-2xl uppercase text-bone-100">Sob consulta</p>
                  )}
                </div>
                <p className="max-w-[180px] text-right font-cond text-[11px] font-semibold uppercase tracking-[0.14em] leading-snug text-steel-500">
                  Preço sujeito a confirmação no pedido
                </p>
              </div>

              <div className="mt-7 grid gap-3">
                {sold ? (
                  <Btn href={waLink(BUSINESS.whatsapp, `Olá! A peça ${m.model} (${m.code}) está esgotada no site. Me avisem quando reposicionar?`)} tone="dark">
                    <IcWhatsApp size={17} /> Avisar quando chegar
                  </Btn>
                ) : (
                  <>
                    <Btn href={waLink(BUSINESS.whatsapp, machineMessage(m))} tone="agri">
                      <IcWhatsApp size={17} /> Orçamento via WhatsApp
                    </Btn>
                    <div className="grid grid-cols-2 gap-3">
                      <Btn tone="outline" onClick={() => openQuote(m)}>
                        Solicitar orçamento
                      </Btn>
                      <Btn tone="outline" href={`tel:+${BUSINESS.phoneRaw}`}>
                        <IcPhone size={16} /> Ligar
                      </Btn>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => toggleFavorite(m.id)}
                    aria-pressed={fav}
                    className={cx(
                      "flex items-center justify-center gap-2 border px-4 py-3 font-cond text-[13px] font-bold uppercase tracking-[0.14em] transition-all",
                      fav ? "border-safety-500/60 bg-safety-500/10 text-safety-400" : "border-line-dark text-steel-300 hover:border-safety-400 hover:text-safety-400",
                    )}
                  >
                    <IcHeart size={15} filled={fav} /> {fav ? "Salva" : "Salvar"}
                  </button>
                  <button
                    onClick={() => toggleCompare(m.id)}
                    aria-pressed={cmp}
                    className={cx(
                      "flex items-center justify-center gap-2 border px-4 py-3 font-cond text-[13px] font-bold uppercase tracking-[0.14em] transition-all",
                      cmp ? "border-hz-400 bg-hz-400/10 text-hz-300" : "border-line-dark text-steel-300 hover:border-hz-400 hover:text-hz-300",
                    )}
                  >
                    <IcScale size={15} /> {cmp ? "Na comparação" : "Comparar"}
                  </button>
                </div>
              </div>

              <p className="mt-5 text-[12px] leading-relaxed text-steel-500">
                Pagamento e frete combinados no atendimento. Transporte próprio e parcerias com transportadoras para todo o Brasil.
              </p>
            </div>
          </Reveal>
        </div>

        {/* ficha técnica */}
        <Reveal className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-3xl uppercase md:text-4xl">
              Ficha técnica<span className="text-hz-400">.</span>
            </h2>
            <p className="font-cond text-[12px] font-semibold uppercase tracking-[0.22em] text-steel-500">Somente dados informados pelo estoque</p>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {m.specGroups.map((g) => (
              <div key={g.title} className="border border-line-dark bg-coal-900">
                <p className="border-b border-line-dark bg-coal-800 px-5 py-3 font-cond text-[13px] font-bold uppercase tracking-[0.22em] text-hz-300">{g.title}</p>
                <dl className="divide-y divide-line-dark">
                  {g.rows.map((r) => (
                    <div key={r.label} className="flex items-baseline justify-between gap-4 px-5 py-3">
                      <dt className="font-cond text-[12px] font-semibold uppercase tracking-[0.14em] text-steel-400">{r.label}</dt>
                      <dd className="text-right text-[14px] font-semibold text-bone-100">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </Reveal>

        {/* similares */}
        {similar.length > 0 && (
          <section className="mt-16" aria-label="Peças semelhantes">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-3xl uppercase">
                Na mesma família<span className="text-hz-400">.</span>
              </h2>
              <Link to={`/pecas?categoria=${m.category}`} className="font-cond text-[13px] font-bold uppercase tracking-[0.18em] text-hz-300 hover:underline">
                Ver todas →
              </Link>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s, i) => (
                <MachineCard key={s.id} m={s} delay={i * 80} />
              ))}
            </div>
          </section>
        )}
      </div>

      <HazardStrip className="opacity-60" />

      {/* barra fixa mobile */}
      {!sold && (
        <div className="fixed inset-x-0 bottom-0 z-[65] border-t border-line-dark bg-coal-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
          <div className="grid grid-cols-3">
            <a href={waLink(BUSINESS.whatsapp, machineMessage(m))} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 bg-[#1f9d44] py-3 font-cond text-[12px] font-bold uppercase tracking-[0.12em] text-bone-100">
              <IcWhatsApp size={18} /> WhatsApp
            </a>
            <a href={`tel:+${BUSINESS.phoneRaw}`} className="flex flex-col items-center gap-1 border-r border-line-dark py-3 font-cond text-[12px] font-bold uppercase tracking-[0.12em] text-bone-100">
              <IcPhone size={18} /> Ligar
            </a>
            <button onClick={() => openQuote(m)} className="flex flex-col items-center gap-1 bg-hz-400 py-3 font-cond text-[12px] font-bold uppercase tracking-[0.12em] text-coal-950">
              <IcChevronR size={18} className="rotate-[-90deg]" /> Orçamento
            </button>
          </div>
        </div>
      )}

      {lightbox !== null && <Lightbox images={m.images} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} title={`${m.model} — ${m.code}`} />}
    </div>
  );
}
