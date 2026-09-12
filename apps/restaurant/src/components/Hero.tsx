import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { business } from "../config/business";
import { images } from "../config/images";
import { createWhatsAppUrl } from "../lib/whatsapp";
import { ClocheIcon, Parallax, usePrefersReducedMotion } from "./ui";

/**
 * HERO — composição em camadas com parallax nativo (rAF):
 * salão ao fundo (lento), prato protagonista (rápido), texto (médio).
 */
export default function Hero() {
  const reduce = usePrefersReducedMotion();

  const scrollToMenu = () => {
    document.getElementById("cardapio-home")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden bg-bg" aria-label="Destaque principal">
      {/* camada 1 — salão real do Chez Amis (parallax lento) */}
      <Parallax speed={0.16} className="absolute inset-[-8%]">
        <img src={images.heroBg} alt="" className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/70" />
      </Parallax>

      {/* camada 2 — marca d'água tipográfica */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[14%] select-none overflow-hidden">
        <p className="text-outline display-tight whitespace-nowrap text-center font-display text-[21vw] uppercase leading-none opacity-40 lg:text-[16vw]">
          À la carte
        </p>
      </div>

      {/* camada 3 — prato protagonista (parallax rápido) */}
      <Parallax speed={-0.1} className="absolute right-[-10%] top-[14%] z-10 hidden w-[42vw] max-w-[540px] md:block">
        <div className="animate-floaty relative">
          <div className="animate-ember absolute inset-[4%] rounded-full bg-ember/15 blur-3xl" />
          <svg viewBox="0 0 200 200" className="animate-spin-slow absolute inset-[-5%] text-gold/40" fill="none" aria-hidden>
            <circle cx="100" cy="100" r="96" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 10" />
          </svg>
          <div className="relative overflow-hidden rounded-full border-[6px] border-panel shadow-lift">
            <img src={images.heroDish} alt="Steak tartare finalizado na mesa" className="aspect-square w-full object-cover" />
          </div>
          <div className="absolute left-[-6%] top-[20%] border border-gold/40 bg-bg/85 px-3 py-2 backdrop-blur-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Na ponta da faca</p>
            <p className="font-display text-xl uppercase text-cream">Steak Tartare</p>
          </div>
          <div className="absolute bottom-[12%] right-[-4%] border border-line bg-panel/90 px-3 py-2 backdrop-blur-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-sand">Menu degustação</p>
            <p className="font-display text-xl uppercase text-ember">5 tempos · R$ 129,90</p>
          </div>
        </div>
      </Parallax>

      {/* camada 4 — conteúdo */}
      <div className="relative z-20 flex flex-1 items-center">
        <div className="shell w-full pt-28 pb-16">
          <div className="max-w-2xl">
            <p
              className="animate-rise font-mono text-[11px] uppercase tracking-[0.34em] text-gold sm:text-xs"
              style={{ animationDelay: "0.05s" }}
            >
              Cerqueira César · Jardins · desde sempre na Haddock Lobo
            </p>

            <h1 className="display-tight mt-6 font-display uppercase text-cream">
              <span className="animate-rise block text-5xl sm:text-7xl lg:text-[5.4rem]" style={{ animationDelay: "0.12s" }}>
                Francês
              </span>
              <span className="animate-rise block text-6xl text-ember sm:text-8xl lg:text-[7.2rem]" style={{ animationDelay: "0.2s" }}>
                descomplicado.
              </span>
              <span className="animate-rise block text-4xl sm:text-6xl lg:text-[4.6rem]" style={{ animationDelay: "0.28s" }}>
                Do jeito que a <span className="text-outline-ember">gente gosta.</span>
              </span>
            </h1>

            <p
              className="animate-rise mt-6 max-w-lg text-base leading-relaxed text-sand sm:text-lg"
              style={{ animationDelay: "0.36s" }}
            >
              Clássicos de bistrô — steak tartare, Wellington, sopa de cebola — com leveza, cor e sabor no número 74 da
              Haddock Lobo. Aberto todos os dias, das 12h às 23h.
            </p>

            <div className="animate-rise mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: "0.44s" }}>
              <Link
                to="/cardapio"
                className="group flex items-center gap-3 bg-ember px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-bg transition-all duration-300 hover:bg-gold hover:shadow-ember"
              >
                Ver cardápio
                <ClocheIcon size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
              </Link>
              <a
                href={createWhatsAppUrl(business.whatsappGreeting)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 border border-cream/25 px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-all duration-300 hover:border-ember hover:text-ember"
              >
                Reservar mesa
              </a>
              <button
                type="button"
                onClick={scrollToMenu}
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-sand underline-offset-8 transition-colors hover:text-ember hover:underline"
              >
                Sugestões da casa ↓
              </button>
            </div>

            <dl
              className="animate-rise mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-linesoft pt-6"
              style={{ animationDelay: "0.52s" }}
            >
              <div>
                <dt className="sr-only">Avaliação no Google</dt>
                <dd className="flex items-center gap-1.5 font-display text-2xl text-cream">
                  4,4 <Star aria-hidden size={16} fill="currentColor" className="text-gold" />
                </dd>
                <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-sand">1.148 no Google</dd>
              </div>
              <div>
                <dt className="sr-only">Horário de funcionamento</dt>
                <dd className="font-display text-2xl text-cream">12h–23h</dd>
                <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-sand">todos os dias</dd>
              </div>
              <div>
                <dt className="sr-only">Faixa de preço</dt>
                <dd className="font-display text-2xl text-cream">R$ 80–180</dd>
                <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-sand">por pessoa</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
