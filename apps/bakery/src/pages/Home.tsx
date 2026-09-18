import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useApp, useCartTotals } from "../core/store";
import { categories, ORDER_TYPES, products as catalog } from "../business/products";
import { formatBRL, isOpenNow, productUnitPrice, track, useSEO } from "../core/utils";
import ProductCard from "../components/ProductCard";
import ChannelHub from "../components/ChannelHub";
import { OpeningHours } from "../components/Footer";
import {
  IArrow, IBike, ICalendar, ICoffee, ICroissant, IFlame, IInstagram,
  ILoaf, IPin, IRoute, ISpark, IStar, IWheat,
} from "../components/icons";

const BreadExperience = lazy(() => import("../scenes/BreadScene"));

function R({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Kicker({ children, dark = true }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={`flex items-center gap-2.5 text-[11.5px] font-extrabold uppercase tracking-[0.3em] ${dark ? "text-accent" : "text-terra"}`}>
      <span className={`h-px w-8 ${dark ? "bg-accent" : "bg-terra"}`} /> {children}
    </p>
  );
}

export default function Home() {
  const { business, products, addToCart, registerFly } = useApp();
  const { total } = useCartTotals();
  void total;
  useSEO(
    `${business.name} — ${business.tagline} em ${business.address.district} · Pães de fermentação natural`,
    business.description
  );

  const open = isOpenNow(business.openingHours);
  const featured = products.filter((p) => p.featured && p.available).slice(0, 4);
  const best = products.filter((p) => p.bestseller && p.available).slice(0, 5);
  const combos = products.filter((p) => p.category === "combos" && p.available);
  const cafes = products.filter((p) => p.category === "cafe" && p.available).slice(0, 3);
  const avg = business.reviews.length
    ? (business.reviews.reduce((s, r) => s + r.rating, 0) / business.reviews.length).toFixed(1).replace(".", ",")
    : null;

  const sections: Record<string, ReactNode> = {
    hero: (
      <section key="hero" className="relative flex min-h-[100svh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={business.media.hero} alt={`Interior da ${business.name}, com forno a lenha aceso`} className="h-full w-full object-cover" {...({ fetchpriority: "high" } as Record<string, string>)} />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/55 to-bg/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg/70 via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-40 md:px-8 md:pb-28">
          <R>
            <p className="flex flex-wrap items-center gap-3 text-[12px] font-extrabold uppercase tracking-[0.3em] text-accent">
              <IWheat size={17} /> {business.tagline} · desde {business.founded}
            </p>
          </R>
          <h1 className="font-display mt-6 max-w-4xl text-[13.5vw] font-medium leading-[0.98] tracking-tight text-paper sm:text-7xl md:text-[92px]">
            <R delay={0.1}><span className="block">Feito hoje.</span></R>
            <R delay={0.22}>
              <span className="block italic text-accent">Do forno para</span>
            </R>
            <R delay={0.32}><span className="block">a sua mesa.</span></R>
          </h1>
          <R delay={0.42} className="mt-7 max-w-lg">
            <p className="text-[16px] leading-relaxed text-paper/80 md:text-[17px]">
              Fermentação natural de 48 horas, manteiga de verdade e café de origem.
              Peça online e receba ainda quente — ou passe aqui e sinta o cheiro.
            </p>
          </R>
          <R delay={0.52} className="mt-9 flex flex-wrap items-center gap-3.5">
            <Link to="/produtos" onClick={() => track("cta_primary_home")} className="btn btn-primary !px-8 !py-4 text-[15px]">
              {business.cta.primary} <IArrow size={18} />
            </Link>
            <Link to="/produtos" className="btn btn-ghost !px-7 !py-4 text-[14.5px]">{business.cta.secondary}</Link>
          </R>
          <R delay={0.62} className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] font-semibold text-paper/75">
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${open.open ? "bg-emerald-400 pulse-dot" : "bg-terra"}`} /> {open.label}
            </span>
            {business.delivery.enabled && (
              <span className="flex items-center gap-2"><IBike size={16} className="text-accent" /> entrega {business.delivery.time}</span>
            )}
            {avg && (
              <span className="flex items-center gap-2"><IStar size={15} className="text-accent" /> {avg} no Google</span>
            )}
          </R>
        </div>

        <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex" aria-hidden>
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-dim">role para assar</span>
          <span className="block h-10 w-px animate-pulse bg-gradient-to-b from-accent to-transparent" />
        </div>
      </section>
    ),

    experience3d: (
      <Suspense key="exp3d" fallback={<div className="h-screen bg-bg" />}>
        <BreadExperience />
      </Suspense>
    ),

    featured: (
      <section key="featured" id="destaques" className="dark-section relative bg-bg py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <R>
              <Kicker>Ainda quentes</Kicker>
              <h2 className="font-display mt-4 text-4xl font-medium text-paper md:text-6xl">Saiu do forno.</h2>
            </R>
            <R delay={0.15}>
              <Link to="/produtos" className="u-link flex items-center gap-2 text-[14px] font-bold text-accent">
                cardápio completo <IArrow size={17} />
              </Link>
            </R>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <R key={p.id} delay={i * 0.08}><ProductCard product={p} eager={i < 2} /></R>
            ))}
          </div>
        </div>
      </section>
    ),

    categories: (
      <section key="categories" className="light-section relative overflow-hidden py-24 md:py-32">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-wheat/25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <R>
            <Kicker dark={false}>O que a casa faz</Kicker>
            <h2 className="font-display mt-4 max-w-xl text-4xl font-medium md:text-6xl">Cada bancada,<br /><em className="text-terra">um ofício.</em></h2>
          </R>
          <div className="no-scrollbar -mx-4 mt-12 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-7">
            {categories.map((c, i) => (
              <R key={c.slug} delay={i * 0.05} className="w-[68vw] shrink-0 snap-start sm:w-56 md:w-auto">
                <Link
                  to={`/categoria/${c.slug}`}
                  className="group relative block h-72 overflow-hidden rounded-[var(--radius)] md:h-80"
                >
                  <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/95 via-espresso/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-display text-[21px] font-semibold text-flour">{c.name}</p>
                    <p className="mt-1 text-[12px] font-medium leading-snug text-flour/70">{c.tagline}</p>
                    <p className="mt-2.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-wheat opacity-0 transition-all duration-300 group-hover:opacity-100">
                      ver <IArrow size={13} />
                    </p>
                  </div>
                </Link>
              </R>
            ))}
          </div>
        </div>
      </section>
    ),

    bestSellers: (
      <section key="best" className="dark-section bg-bgsoft py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <R>
            <Kicker>Ranking da casa</Kicker>
            <h2 className="font-display mt-4 text-4xl font-medium text-paper md:text-6xl">Os favoritos <em className="text-accent">da casa.</em></h2>
          </R>
          <ol className="mt-12 divide-y divide-line border-y border-line">
            {best.map((p, i) => (
              <R key={p.id} delay={i * 0.06}>
                <li className="group flex items-center gap-5 py-5 md:gap-8">
                  <span className="font-display w-12 shrink-0 text-3xl font-light italic text-caramel/80 md:text-4xl">{String(i + 1).padStart(2, "0")}</span>
                  <Link to={`/produto/${p.slug}`} className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
                    <img src={p.images[0]} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-[calc(var(--radius)*0.7)] object-cover ring-1 ring-line transition-transform duration-500 group-hover:scale-105 md:h-20 md:w-20" />
                    <span className="min-w-0">
                      <span className="font-display block truncate text-[19px] font-semibold text-paper transition-colors group-hover:text-accent md:text-[22px]">{p.name}</span>
                      <span className="mt-0.5 block truncate text-[13px] text-dim">{p.shortDescription}</span>
                    </span>
                  </Link>
                  <span className="hidden shrink-0 text-[16px] font-extrabold text-paper md:block">{formatBRL(productUnitPrice(p))}</span>
                  <Link to={`/produto/${p.slug}`} aria-label={`Ver ${p.name}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-dim transition-all duration-300 hover:border-accent hover:bg-accent hover:text-accent-ink">
                    <IArrow size={17} />
                  </Link>
                </li>
              </R>
            ))}
          </ol>
        </div>
      </section>
    ),

    story: (
      <section key="story" className="dark-section relative overflow-hidden bg-bg py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2 md:gap-16 md:px-8">
          <div className="md:sticky md:top-28 md:self-start">
            <R>
              <div className="relative overflow-hidden rounded-[calc(var(--radius)*1.3)]">
                <img src={business.media.story} alt="Mãos do padeiro sovando massa com farinha" loading="lazy" className="aspect-[4/5] w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex gap-3">
                  {business.stats.map((s) => (
                    <div key={s.label} className="flex-1 rounded-[calc(var(--radius)*0.7)] border border-paper/15 bg-espresso/55 p-3 text-center backdrop-blur-sm">
                      <p className="font-display text-2xl font-semibold text-accent">{s.value}</p>
                      <p className="mt-0.5 text-[10.5px] font-bold uppercase tracking-wider text-paper/70">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </R>
          </div>
          <div className="flex flex-col justify-center">
            <R><Kicker>Nossa casa</Kicker></R>
            <R delay={0.1}>
              <h2 className="font-display mt-4 text-4xl font-medium leading-tight text-paper md:text-5xl">
                Fermentação lenta,<br /><em className="text-accent">como tem que ser.</em>
              </h2>
            </R>
            <R delay={0.2}>
              <p className="mt-6 text-[15.5px] leading-relaxed text-dim">
                A {business.name} nasceu em {business.founded} com um forno de lastro, um levain batizado de
                <strong className="text-paper"> Dona Clara</strong> e a teimosia de não acelerar nada que mereça espera.
                Cada pão descansa 48 horas antes de encontrar o vapor do forno.
              </p>
            </R>
            <R delay={0.28}>
              <p className="mt-4 text-[15.5px] leading-relaxed text-dim">
                A vitrine muda com o dia e com a estação. O café chega verde de microlotes parceiros e é torrado
                toda semana. Se está na prateleira, saiu daqui de dentro — nunca de uma caixa.
              </p>
            </R>
            <R delay={0.36} className="mt-8 flex flex-wrap gap-3.5">
              <Link to="/sobre" className="btn btn-ghost">Conhecer a história <IArrow size={17} /></Link>
            </R>
            <R delay={0.42} className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-7">
              {[
                { icon: <IFlame size={20} />, t: "Forno de lastro", d: "vapor e pedra" },
                { icon: <IWheat size={20} />, t: "Farinha orgânica", d: "moída em pedra" },
                { icon: <ICoffee size={20} />, t: "Torra semanal", d: "origem única" },
              ].map((x) => (
                <div key={x.t}>
                  <span className="text-accent">{x.icon}</span>
                  <p className="mt-2 text-[13.5px] font-extrabold text-paper">{x.t}</p>
                  <p className="text-[12px] text-dim">{x.d}</p>
                </div>
              ))}
            </R>
          </div>
        </div>
      </section>
    ),

    orders: (
      <section key="orders" className="light-section py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <R>
            <div className="relative overflow-hidden rounded-[calc(var(--radius)*1.4)] bg-espresso">
              <img src={business.media.counter} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/85 to-espresso/40" />
              <div className="relative grid gap-10 p-8 md:grid-cols-[1.2fr_1fr] md:p-14">
                <div>
                  <Kicker>Encomendas</Kicker>
                  <h2 className="font-display mt-4 text-4xl font-medium leading-tight text-paper md:text-5xl">
                    Encomende para<br /><em className="text-accent">o fim de semana.</em>
                  </h2>
                  <p className="mt-5 max-w-md text-[15px] leading-relaxed text-paper/75">
                    Bolos confeitados, coffee breaks, cestas de café e mesas de festa.
                    A casa prepara com antecedência — você só busca (ou a gente leva).
                  </p>
                  <Link to="/encomendas" className="btn btn-primary mt-8">{business.cta.order} <IArrow size={17} /></Link>
                </div>
                <ul className="space-y-2.5 self-center">
                  {ORDER_TYPES.map((o, i) => (
                    <R key={o.id} delay={0.1 + i * 0.07}>
                      <li className="flex items-center gap-4 rounded-[var(--radius)] border border-paper/12 bg-paper/5 px-5 py-3.5">
                        <ICalendar size={19} className="shrink-0 text-accent" />
                        <div>
                          <p className="text-[14.5px] font-extrabold text-paper">{o.label}</p>
                          <p className="text-[12px] text-paper/60">{o.hint}</p>
                        </div>
                      </li>
                    </R>
                  ))}
                </ul>
              </div>
            </div>
          </R>
        </div>
      </section>
    ),

    combos: (
      <section key="combos" className="dark-section bg-bg py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <R>
              <Kicker>Para a mesa cheia</Kicker>
              <h2 className="font-display mt-4 text-4xl font-medium text-paper md:text-6xl">Combos da casa.</h2>
            </R>
            <R delay={0.12}><p className="max-w-xs text-[13.5px] text-dim">Os pares que a bancada recomenda — juntos, saem por menos.</p></R>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {combos.map((c, i) => (
              <R key={c.id} delay={i * 0.08}>
                <article className="group h-full overflow-hidden rounded-[var(--radius)] border border-line bg-surface/70 transition-all duration-500 hover:-translate-y-1.5 hover:border-caramel/50">
                  <div className="relative h-44 overflow-hidden">
                    <img src={c.images[0]} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-widest text-accent-ink">combo</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-[21px] font-semibold text-paper">{c.name}</h3>
                    <ul className="mt-2.5 space-y-1">
                      {c.comboItems?.map((it) => (
                        <li key={it} className="flex items-center gap-2 text-[13px] text-dim">
                          <span className="h-1 w-1 rounded-full bg-caramel" /> {it}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-[19px] font-extrabold text-accent">{formatBRL(productUnitPrice(c))}</p>
                      <button
                        onClick={(e) => {
                          registerFly(e.currentTarget.getBoundingClientRect());
                          addToCart({
                            productId: c.id, name: c.name, image: c.images[0],
                            unitBase: productUnitPrice(c), qty: 1, variations: [], extras: [],
                            isCombo: true, comboItems: c.comboItems,
                          });
                        }}
                        className="btn btn-primary !px-5 !py-2.5 text-[13px]"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </article>
              </R>
            ))}
          </div>
        </div>
      </section>
    ),

    coffee: (
      <section key="coffee" className="relative overflow-hidden py-28 md:py-36">
        <img src={catalog.find((p) => p.slug === "cappuccino-da-casa")?.images[0] ?? business.media.counter} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-espresso/80" />
        <div className="pointer-events-none absolute left-1/2 top-10 h-40 w-1 -translate-x-1/2 opacity-40">
          <span className="steam absolute left-0 h-16 w-1 rounded-full bg-paper/50 blur-[2px]" />
          <span className="steam absolute left-3 h-12 w-1 rounded-full bg-paper/40 blur-[2px]" style={{ animationDelay: "1.2s" }} />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 text-center md:px-8">
          <R>
            <ICroissant size={34} className="mx-auto text-accent" />
            <h2 className="font-display mt-5 text-4xl font-medium leading-tight text-paper md:text-6xl">
              Seu café merece <em className="text-accent">companhia.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15.5px] text-paper/75">
              Torra da semana, extração calibrada todo dia às 5h40. Escolha o par — a casa sugere.
            </p>
          </R>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {cafes.map((p, i) => (
              <R key={p.id} delay={i * 0.1}>
                <Link to={`/produto/${p.slug}`} className="group flex items-center gap-4 rounded-[var(--radius)] border border-paper/15 bg-espresso/50 p-4 text-left backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-accent/60">
                  <img src={p.images[0]} alt="" loading="lazy" className="h-14 w-14 rounded-full object-cover ring-2 ring-accent/30" />
                  <span>
                    <span className="block text-[14.5px] font-extrabold text-paper group-hover:text-accent">{p.name}</span>
                    <span className="text-[12.5px] font-semibold text-paper/60">{formatBRL(productUnitPrice(p))}</span>
                  </span>
                </Link>
              </R>
            ))}
          </div>
          <R delay={0.3}>
            <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-paper/20 px-5 py-2 text-[13px] font-bold text-paper/80">
              <span className={`h-2 w-2 rounded-full ${open.open ? "bg-emerald-400 pulse-dot" : "bg-terra"}`} /> {open.label}
            </p>
          </R>
        </div>
      </section>
    ),

    reviews: (
      <section key="reviews" className="light-section py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.6fr]">
            <div>
              <R><Kicker dark={false}>Prova social</Kicker></R>
              <R delay={0.08}>
                <h2 className="font-display mt-4 text-4xl font-medium leading-tight md:text-6xl">Quem prova,<br /><em className="text-terra">volta.</em></h2>
              </R>
              {avg && (
                <R delay={0.16}>
                  <div className="mt-8 flex items-center gap-5">
                    <p className="font-display text-7xl font-semibold text-ink">{avg}</p>
                    <div>
                      <div className="flex gap-1 text-caramel">
                        {[...Array(5)].map((_, i) => <IStar key={i} size={18} />)}
                      </div>
                      <p className="mt-1.5 text-[13px] font-semibold text-inksoft">média das avaliações públicas</p>
                    </div>
                  </div>
                </R>
              )}
              <R delay={0.22}>
                <p className="mt-6 max-w-xs text-[13.5px] leading-relaxed text-inksoft">
                  Avaliações de exemplo do template — conecte o selo real do Google antes de publicar.
                </p>
              </R>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {business.reviews.map((r, i) => (
                <R key={r.author} delay={i * 0.08}>
                  <figure className="h-full rounded-[var(--radius)] border border-ink/10 bg-flour p-6 shadow-[0_18px_40px_-24px_rgba(60,35,15,0.35)] transition-transform duration-500 hover:-translate-y-1">
                    <div className="flex gap-0.5 text-caramel">
                      {[...Array(r.rating)].map((_, j) => <IStar key={j} size={15} />)}
                    </div>
                    <blockquote className="mt-3.5 text-[14.5px] leading-relaxed text-ink">“{r.text}”</blockquote>
                    <figcaption className="mt-4 flex items-center justify-between text-[12.5px] font-bold">
                      <span className="text-ink">{r.author}</span>
                      <span className="rounded-full bg-ink/6 px-2.5 py-1 text-[10.5px] uppercase tracking-wider text-inksoft">{r.source}</span>
                    </figcaption>
                  </figure>
                </R>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),

    delivery: (
      <section key="delivery" className="dark-section bg-bg py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
            <div>
              <R><Kicker>Entrega & retirada</Kicker></R>
              <R delay={0.08}>
                <h2 className="font-display mt-4 text-4xl font-medium leading-tight text-paper md:text-5xl">
                  Como você<br /><em className="text-accent">prefere pedir?</em>
                </h2>
              </R>
              <R delay={0.16}>
                <div className="mt-7 space-y-3 text-[14px] text-dim">
                  {business.delivery.enabled && (
                    <p className="flex items-center gap-3">
                      <IBike size={18} className="text-accent" />
                      Entrega {business.delivery.time} · {formatBRL(business.delivery.fee)} · grátis acima de {formatBRL(business.delivery.freeAbove)}
                    </p>
                  )}
                  {business.pickup.enabled && (
                    <p className="flex items-center gap-3">
                      <IPin size={18} className="text-accent" />
                      Retirada em {business.pickup.units.length} unidades · sai quentinho
                    </p>
                  )}
                  <p className="flex items-center gap-3">
                    <ISpark size={18} className="text-accent" /> Pix, cartão ou na entrega — você escolhe
                  </p>
                </div>
              </R>
            </div>
            <R delay={0.2}><ChannelHub /></R>
          </div>
        </div>
      </section>
    ),

    instagram: (
      <section key="insta" className="dark-section bg-bgsoft py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <R>
              <Kicker>@fornalha.paes</Kicker>
              <h2 className="font-display mt-4 text-4xl font-medium text-paper md:text-5xl">Direto do nosso forno.</h2>
            </R>
            {business.social.instagram && (
              <R delay={0.12}>
                <a href={business.social.instagram} target="_blank" rel="noreferrer" onClick={() => track("click_instagram")} className="btn btn-ghost !py-3 text-[13.5px]">
                  <IInstagram size={17} className="text-accent" /> seguir a casa
                </a>
              </R>
            )}
          </div>
          <div className="mt-10 grid grid-cols-3 gap-2.5 md:grid-cols-6 md:gap-3">
            {business.instagramPosts.map((src, i) => (
              <R key={src + i} delay={i * 0.05}>
                <a
                  href={business.social.instagram ?? "#"}
                  target="_blank" rel="noreferrer"
                  className="group relative block aspect-square overflow-hidden rounded-[calc(var(--radius)*0.7)]"
                  aria-label="Abrir publicação no Instagram"
                >
                  <img src={src} alt={`Publicação ${i + 1} da ${business.name} no Instagram`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-108 group-hover:scale-110" />
                  <span className="absolute inset-0 grid place-items-center bg-espresso/0 transition-colors duration-300 group-hover:bg-espresso/55">
                    <IInstagram size={24} className="text-flour opacity-0 transition-all duration-300 group-hover:opacity-100" />
                  </span>
                </a>
              </R>
            ))}
          </div>
        </div>
      </section>
    ),

    location: (
      <section key="location" className="light-section py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-2 md:px-8">
          <R>
            <div className="overflow-hidden rounded-[calc(var(--radius)*1.2)] border border-ink/10 shadow-[0_30px_60px_-30px_rgba(60,35,15,0.4)]">
              <iframe
                title={`Mapa — ${business.name}`}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${business.address.lng - 0.012},${business.address.lat - 0.008},${business.address.lng + 0.012},${business.address.lat + 0.008}&layer=mapnik&marker=${business.address.lat},${business.address.lng}`}
                className="h-[380px] w-full md:h-full md:min-h-[460px]"
                loading="lazy"
              />
            </div>
          </R>
          <div className="flex flex-col justify-center">
            <R><Kicker dark={false}>Onde estamos</Kicker></R>
            <R delay={0.08}>
              <h2 className="font-display mt-4 text-4xl font-medium leading-tight md:text-5xl">
                Passe aqui ou peça<br /><em className="text-terra">de onde estiver.</em>
              </h2>
            </R>
            <R delay={0.16}>
              <address className="mt-7 space-y-4 text-[15px] not-italic text-ink">
                <p className="flex gap-3"><IPin size={19} className="mt-0.5 shrink-0 text-terra" /> {business.address.street}, {business.address.number} — {business.address.district}, {business.address.city}/{business.address.state} · {business.address.zip}</p>
                <p className="flex gap-3"><IBike size={19} className="mt-0.5 shrink-0 text-terra" /> Delivery {business.delivery.time} para a região</p>
              </address>
            </R>
            <R delay={0.22} className="mt-8 rounded-[var(--radius)] border border-ink/10 bg-flour p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-terra">Horários da casa</p>
              <div className="mt-3"><OpeningHours light /></div>
            </R>
            <R delay={0.28} className="mt-8">
              <a href={business.address.mapsUrl} target="_blank" rel="noreferrer" onClick={() => track("view_location", { action: "route" })} className="btn btn-dark">
                <IRoute size={18} /> {business.cta.location}
              </a>
            </R>
          </div>
        </div>
      </section>
    ),

    finalCta: (
      <section key="final" className="relative overflow-hidden bg-espresso py-28 text-center md:py-36">
        <ILoaf size={280} className="pointer-events-none absolute -bottom-16 left-1/2 -translate-x-1/2 text-coffee/60 md:text-coffee/70" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4">
          <R>
            <p className="text-[11.5px] font-extrabold uppercase tracking-[0.35em] text-accent">{open.label}</p>
            <h2 className="font-display mt-5 text-5xl font-medium leading-[1.02] text-paper md:text-7xl">
              O forno já<br /><em className="text-accent">está aceso.</em>
            </h2>
          </R>
          <R delay={0.15}>
            <p className="mx-auto mt-6 max-w-md text-[15.5px] text-paper/70">
              Peça agora e receba ainda quente — ou reserve sua encomenda para o fim de semana.
            </p>
          </R>
          <R delay={0.25} className="mt-9 flex flex-wrap justify-center gap-3.5">
            <Link to="/produtos" className="btn btn-primary !px-9 !py-4 text-[15px]">{business.cta.primary} <IArrow size={18} /></Link>
            <Link to="/encomendas" className="btn btn-ghost !px-7 !py-4 text-[14px]">Encomendar</Link>
          </R>
        </div>
      </section>
    ),
  };

  return (
    <main>
      {business.homeSections.map((key) => sections[key] ?? null)}
    </main>
  );
}
