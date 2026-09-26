import { useEffect, useState } from "react";
import { featured } from "../data/media";
import { useParallax, usePrefersReducedMotion, useReveal } from "../hooks";
import { useBooking } from "./BookingModal";
import { BotanicalDivider, GoldArrow, GoldStar, LeafSprig, LogoCircle } from "./Ornaments";
import { TempleButton } from "./ui";

/** Cena 1 — boas-vindas. Não bloqueia a navegação; some em ~2.4s, no scroll ou no toque. */
export function WelcomeScene() {
  const reduced = usePrefersReducedMotion();
  const [gone, setGone] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (reduced) {
      setGone(true);
      return;
    }
    const fade = () => setFading(true);
    const kill = () => setGone(true);
    const t1 = window.setTimeout(fade, 2000);
    const t2 = window.setTimeout(kill, 2700);
    const onUser = () => fade();
    window.addEventListener("scroll", onUser, { passive: true });
    window.addEventListener("pointerdown", onUser);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("scroll", onUser);
      window.removeEventListener("pointerdown", onUser);
    };
  }, [reduced]);

  useEffect(() => {
    if (fading) {
      const t = window.setTimeout(() => setGone(true), 700);
      return () => window.clearTimeout(t);
    }
  }, [fading]);

  if (gone) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] grid place-items-center overflow-hidden bg-cream transition-opacity duration-700 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={fading}
    >
      <img
        src={featured.welcomePhoto.thumb}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-cream/45" />
      <div className="anim-rise relative z-10 flex flex-col items-center px-6 text-center">
        <GoldStar size={22} className="mb-5 text-gold-500" />
        <p className="font-display text-6xl font-medium leading-none text-forest-950 sm:text-7xl">
          Seja
        </p>
        <p className="gold-shimmer font-display text-6xl font-semibold italic leading-tight sm:text-7xl">
          Bem-Vindo
        </p>
        <p className="mt-5 font-body text-[11px] font-semibold uppercase tracking-[0.4em] text-sage">
          Templo de Umbanda
        </p>
      </div>
    </div>
  );
}

export default function Hero() {
  const reduced = usePrefersReducedMotion();
  const bg = useParallax(0.16);
  const mid = useParallax(0.07);
  const title = useReveal<HTMLDivElement>(0.1);
  const { openBooking } = useBooking();

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
      {/* camada distante — folhagens suaves */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ transform: reduced ? undefined : `translateY(${bg * -0.4}px)` }}
        aria-hidden
      >
        <div className="absolute -left-24 top-16 opacity-30">
          <LeafSprig color="var(--color-forest-300)" className="h-72 w-72" />
        </div>
        <div className="absolute -right-28 top-40 opacity-25">
          <LeafSprig color="var(--color-gold-300)" className="h-80 w-80" flip />
        </div>
        <div className="absolute -bottom-24 left-1/3 opacity-20">
          <LeafSprig color="var(--color-teal)" className="h-64 w-64" flip />
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        {/* texto */}
        <div ref={title.ref} className="text-center lg:text-left">
          <p className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 font-body text-[10px] font-bold uppercase tracking-[0.3em] text-gold-700">
            <GoldStar size={10} />
            Templo de Umbanda
          </p>

          <div className={`mask-reveal ${title.inView ? "is-in" : ""}`}>
            <span>
              <h1 className="font-display text-[44px] font-semibold leading-[0.98] tracking-tight text-forest-950 sm:text-6xl lg:text-[64px]">
                Caboclo
                <br />
                Tupinambá
              </h1>
            </span>
          </div>
          <div
            className={`mask-reveal mt-1 ${title.inView ? "is-in" : ""}`}
            style={{ transitionDelay: "120ms" }}
          >
            <span>
              <p className="font-display text-3xl font-medium italic text-gold-700 sm:text-4xl lg:text-[38px]">
                &amp; Caboclo Flecha Dourada
              </p>
            </span>
          </div>

          <div
            className={`mt-6 transition-all duration-700 ${
              title.inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "260ms" }}
          >
            <BotanicalDivider className="lg:justify-start" />
          </div>

          <p
            className={`mx-auto mt-6 max-w-md font-body text-base leading-relaxed text-sage transition-all duration-700 sm:text-lg lg:mx-0 ${
              title.inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "340ms" }}
          >
            Um espaço de <strong className="font-semibold text-forest-950">fé</strong>,{" "}
            <strong className="font-semibold text-forest-950">acolhimento</strong>,{" "}
            <strong className="font-semibold text-forest-950">orientação</strong> e{" "}
            <strong className="font-semibold text-forest-950">axé</strong>.
          </p>

          <div
            className={`mt-8 flex flex-wrap items-center justify-center gap-4 transition-all duration-700 lg:justify-start ${
              title.inView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "420ms" }}
          >
            <TempleButton onClick={() => openBooking()} variant="primary" arrow>
              Agendar atendimento
            </TempleButton>
            <TempleButton href="#/calendario" variant="secondary" arrow>
              Ver próximas giras
            </TempleButton>
          </div>

          <button
            onClick={() =>
              document.getElementById("nossa-casa")?.scrollIntoView({
                behavior: reduced ? "auto" : "smooth",
                block: "start",
              })
            }
            className={`mt-12 inline-flex items-center gap-3 font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-sage transition-all duration-700 hover:text-gold-700 lg:mt-16 ${
              title.inView ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: "560ms" }}
          >
            Role para conhecer
            <GoldArrow dir="down" size={16} className="anim-arrow text-gold-500" />
          </button>
        </div>

        {/* imagem emoldurada */}
        <div
          className="relative mx-auto w-full max-w-[400px] lg:max-w-none"
          style={{ transform: reduced ? undefined : `translateY(${mid * -0.25}px)` }}
        >
          <div className="anim-floaty relative">
            <div className="absolute -inset-3 rounded-t-[999px] rounded-b-[28px] border border-gold-500/50" aria-hidden />
            <div className="relative overflow-hidden rounded-t-[999px] rounded-b-[24px] border-[3px] border-cream shadow-[0_36px_80px_-24px_rgba(23,79,50,0.45)]">
              <img
                src={featured.heroPhoto.src}
                alt="Foto oficial da casa — Templo de Umbanda Caboclo Tupinambá e Flecha Dourada"
                className="h-[440px] w-full object-cover sm:h-[520px]"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/30 via-transparent to-transparent" />
            </div>

            <div className="absolute -left-6 top-10 hidden sm:block">
              <LogoCircle size={84} />
            </div>
            <div className="absolute -right-4 bottom-16" aria-hidden>
              <GoldStar size={26} className="anim-sway text-gold-500" />
            </div>
            <div className="absolute -bottom-6 -left-8 opacity-70" aria-hidden>
              <LeafSprig color="var(--color-forest-600)" className="h-32 w-32" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
