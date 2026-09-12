import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Copy, UtensilsCrossed } from "lucide-react";
import { promos, storySteps } from "../config/content";
import { business } from "../config/business";
import { images } from "../config/images";
import { getItemById } from "../config/menu";
import { formatBRL } from "../lib/format";
import { AnimatedCounter, ClocheIcon, Kicker, Marquee, Parallax, ScrollReveal, SectionHeading, usePrefersReducedMotion } from "./ui";
import { useCart } from "../context/CartContext";

/* ============================================================
   SEÇÕES NARRATIVAS — destaque do chef, storytelling sticky,
   promoções e nossa história. Motion 100% nativo (sem framer).
   ============================================================ */

export function ChefSpotlight() {
  const { add } = useCart();
  const dish = getItemById("beef-wellington") ?? getItemById("steak-tartare");
  if (!dish) return null;

  return (
    <section className="relative overflow-hidden border-y border-line bg-panel py-24 sm:py-32" aria-label="Destaque do chef">
      <div className="shell grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
        <ScrollReveal>
          <div>
            <Kicker>Direto da cozinha</Kicker>
            <h2 className="display-tight mt-4 font-display text-5xl text-cream sm:text-6xl lg:text-7xl">
              O prato que a casa <em className="font-wordmark not-italic text-ember">não tira</em> da carta
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-sand sm:text-lg">{dish.description}</p>
            <ul className="mt-6 grid max-w-md gap-2.5">
              {dish.ingredients.slice(0, 4).map((ing) => (
                <li key={ing} className="flex items-center gap-2.5 text-sm text-sand">
                  <Check aria-hidden size={14} className="shrink-0 text-ember" /> {ing}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <p className="font-display text-4xl text-gold">{formatBRL(dish.price)}</p>
              <button
                type="button"
                onClick={() => add(dish.id)}
                className="flex items-center gap-2.5 border border-ember bg-ember px-7 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-bg transition-all duration-300 hover:bg-transparent hover:text-ember active:scale-95"
              >
                <UtensilsCrossed aria-hidden size={15} /> Adicionar ao pedido
              </button>
            </div>
          </div>
        </ScrollReveal>

        <div className="relative">
          <div className="absolute -inset-5 border border-gold/20" aria-hidden />
          <div className="overflow-hidden border border-line">
            <Parallax className="block scale-[1.12]" speed={0.08}>
              <img src={dish.image} alt={dish.name} loading="lazy" className="aspect-[4/5] w-full object-cover" />
            </Parallax>
          </div>
          <p className="absolute -bottom-4 left-6 border border-line bg-bg px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
            <ClocheIcon size={11} className="mr-2 inline" /> finalizado na mesa
          </p>
        </div>
      </div>
    </section>
  );
}

export function StorySticky() {
  const [step, setStep] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setStep(Number((entry.target as HTMLElement).dataset.step ?? 0));
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-bg py-24 sm:py-32" aria-label="Como fazemos">
      <div className="shell">
        <SectionHeading
          kicker="Da cozinha à mesa"
          title={
            <>
              O ritual do bistrô <em className="font-wordmark not-italic text-ember">em 4 atos</em>
            </>
          }
          description="Role e acompanhe: cada capítulo muda a cena. Técnica francesa clássica, executada sem pressa — como deve ser."
        />
      </div>

      <div className="shell mt-16 grid gap-10 lg:grid-cols-2 lg:gap-20">
        {/* imagem sticky */}
        <div className="relative hidden lg:block">
          <div className="sticky top-28 h-[70vh] overflow-hidden border border-line">
            <img
              key={step}
              src={storySteps[step].image}
              alt={storySteps[step].title}
              className="anim-fade absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/85 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 border border-gold/40 bg-bg/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-gold backdrop-blur-sm">
              {storySteps[step].stat}
            </p>
            <div className="absolute right-5 top-5 flex gap-1.5" aria-hidden>
              {storySteps.map((s, i) => (
                <span key={s.id} className={`h-1 w-8 transition-colors duration-500 ${i <= step ? "bg-ember" : "bg-line"}`} />
              ))}
            </div>
          </div>
        </div>

        {/* capítulos */}
        <div>
          {storySteps.map((s, i) => (
            <section
              key={s.id}
              data-step={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="min-h-[52vh] border-t border-linesoft py-12 first:border-t-0 lg:min-h-[46vh]"
              aria-label={s.title}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">{s.kicker}</p>
              <h3
                className={`display-tight mt-4 font-display text-4xl transition-all duration-500 sm:text-5xl ${
                  step === i ? "text-cream" : "text-cream/35"
                }`}
              >
                {s.title}
              </h3>
              <p className={`mt-5 max-w-md leading-relaxed transition-colors duration-500 ${step === i ? "text-sand" : "text-sand/45"}`}>
                {s.text}
              </p>
              <div className="mt-6 overflow-hidden border border-line lg:hidden">
                <img src={s.image} alt={s.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />
              </div>
              <p className="mt-5 inline-block border border-line bg-panel px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold lg:hidden">
                {s.stat}
              </p>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Promos() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const reduce = usePrefersReducedMotion();
  const count = promos.length;

  const go = (i: number) => setIndex(((i % count) + count) % count);

  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => window.clearInterval(id);
  }, [reduce, paused, count]);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  };

  const promo = promos[index];

  return (
    <section
      className="border-y border-line bg-panel py-24 sm:py-28"
      aria-label="Menus e promoções"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            kicker="Para brindar"
            title={
              <>
                Acontecendo <em className="font-wordmark not-italic text-ember">na casa</em>
              </>
            }
          />
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="grid h-11 w-11 place-items-center border border-line text-sand transition-all hover:border-ember hover:text-ember"
              aria-label="Anterior"
            >
              <ArrowLeft aria-hidden size={17} />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="grid h-11 w-11 place-items-center border border-line text-sand transition-all hover:border-ember hover:text-ember"
              aria-label="Próximo"
            >
              <ArrowRight aria-hidden size={17} />
            </button>
          </div>
        </div>

        <div className="relative mt-12 overflow-hidden border border-line bg-bg" aria-live="polite">
          <article key={promo.id} className={`grid md:grid-cols-2 ${reduce ? "" : "anim-fade-up"}`}>
            <div className="relative min-h-[240px] md:min-h-[400px]">
              <img src={promo.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-bg/50 md:to-bg" />
              <span className="absolute left-4 top-4 bg-ember px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-bg">
                {promo.badge}
              </span>
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <h3 className="display-tight font-display text-4xl text-cream sm:text-5xl">{promo.title}</h3>
              <p className="mt-4 max-w-md leading-relaxed text-sand">{promo.description}</p>
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-gold">{promo.detail}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {promo.code && (
                  <button
                    type="button"
                    onClick={() => copyCode(promo.code!)}
                    className="flex items-center gap-2.5 border border-dashed border-gold/60 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-gold transition-all hover:bg-gold/10"
                  >
                    {copied === promo.code ? (
                      <>
                        <Check aria-hidden size={13} /> copiado!
                      </>
                    ) : (
                      <>
                        <Copy aria-hidden size={13} /> mencionar {promo.code}
                      </>
                    )}
                  </button>
                )}
                <Link
                  to="/cardapio"
                  className="border border-ember bg-ember px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-bg transition-all hover:bg-transparent hover:text-ember"
                >
                  Ver a carta
                </Link>
              </div>
            </div>
          </article>

          <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
            <div className="flex gap-2">
              {promos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Ir para ${p.title}`}
                  className={`h-1.5 transition-all duration-500 ${i === index ? "w-10 bg-ember" : "w-5 bg-line hover:bg-sand/50"}`}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-sand">
              {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function OurStory() {
  return (
    <section className="relative overflow-hidden bg-bg py-24 sm:py-32" aria-label="Nossa história">
      <div className="shell grid items-center gap-14 lg:grid-cols-2">
        <div className="relative order-2 lg:order-1">
          <Parallax speed={0.06}>
            <img src={images.interior2} alt="Salão do Chez Amis Bistrô" loading="lazy" className="w-full border border-line object-cover" />
          </Parallax>
          <div className="absolute -bottom-6 -right-4 border border-line bg-panel p-5 sm:-right-8 sm:p-6">
            <p className="font-display text-4xl text-ember">
              <AnimatedCounter value={business.stats[0].value} decimals={business.stats[0].decimals ?? 0} />
              {business.stats[0].suffix}
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-sand">{business.stats[0].label}</p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading
            kicker="Nossa história"
            title={
              <>
                Um francês <em className="font-wordmark not-italic text-ember">descomplicado</em> na Haddock Lobo
              </>
            }
            description="O Chez Amis nasceu para provar que alta cozinha francesa não precisa de cerimônia — precisa de técnica, produto bom e uma mesa acolhedora. O resto é conversa boa e vinho na taça."
          />
          <ScrollReveal delay={0.2}>
            <Link
              to="/sobre"
              className="group mt-8 inline-flex items-center gap-3 border-b border-ember pb-1 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ember transition-colors hover:text-gold"
            >
              Conhecer a história completa
              <ArrowRight aria-hidden size={15} className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={0.28}>
            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-linesoft pt-8">
              {business.stats.slice(1).map((s) => (
                <div key={s.label}>
                  <dd className="font-display text-4xl text-cream">
                    <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
                  </dd>
                  <dt className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-sand">{s.label}</dt>
                </div>
              ))}
            </dl>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export function MarqueeStrip() {
  return (
    <Marquee
      items={[
        "Menu executivo seg–sex",
        "Steak Tartare na ponta da faca",
        "Adega com 60 rótulos",
        "Sabores da França · 5 tempos",
        "Reservas pelo WhatsApp",
      ]}
      className="bg-ember [&_span]:text-bg"
      speed={30}
    />
  );
}
