import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../config/assets";
import { business } from "../config/business";
import {
  MaskLines,
  SparkField,
  prefersReduced,
  scrollToEl,
  track,
  useParallax,
  useScramble,
  waLink,
} from "../lib/motion";
import { IconArrowRight, IconArrowUpRight, IconWhatsApp, Magnetic, Marquee } from "./ui";

/** Slideshow com as mídias reais do site oficial (fade + zoom lento) */
const HERO_SLIDES = [
  {
    src: assets.official.heroSparks,
    alt: "Produção Metal & Art — corte de metal com esmerilhadeira e faíscas",
  },
  {
    src: assets.official.heroWorkshop,
    alt: "Oficina Metal & Art — estrutura metálica em fabricação",
  },
];

function HeroSlideshow() {
  const reduced = prefersReduced();
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (reduced || HERO_SLIDES.length < 2) return;
    const t = window.setInterval(
      () => setIdx((i) => (i + 1) % HERO_SLIDES.length),
      5000
    );
    return () => window.clearInterval(t);
  }, [reduced]);
  return (
    <div className="absolute inset-0">
      {HERO_SLIDES.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={i === idx ? s.alt : ""}
          aria-hidden={i !== idx}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === idx ? "kenburns opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const imgRef = useParallax<HTMLDivElement>(55);
  const label = useScramble("SERRALHERIA SOB MEDIDA EM SÃO PAULO", 300);
  const [showCtas, setShowCtas] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShowCtas(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <section
        id="topo"
        className="relative flex min-h-svh flex-col overflow-hidden bg-coal-950"
        aria-label="Apresentação"
      >
        {/* fundo em camadas da marca: navy profundo → azul industrial.
            Forte por si só; quando as fotos reais da pasta entram, o
            slideshow as sobrepõe (fade + ken burns). */}
        <div className="absolute inset-0 bg-gradient-to-br from-coal-950 via-coal-900 to-arc-900" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_10%,var(--color-arc-700)_0%,transparent_55%)] opacity-45" />

        {/* slideshow com as mídias reais da pasta do cliente */}
        <div ref={imgRef} className="absolute inset-[-12%] will-change-transform">
          <HeroSlideshow />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-coal-950 via-coal-950/72 to-coal-950/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-coal-950 via-transparent to-coal-950/70" />
        <div className="blueprint-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(to_right,black,transparent_70%)]" />

        {/* desenho técnico de portão — identidade de projeto, não é foto */}
        <svg
          viewBox="0 0 420 300"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-[-4%] hidden h-[68%] -translate-y-1/2 opacity-[0.16] lg:block"
        >
          <g fill="none" stroke="var(--color-arc-400)" strokeWidth="1">
            <rect x="40" y="40" width="300" height="200" />
            {[90, 140, 190, 240, 290].map((x) => (
              <line key={x} x1={x} y1="52" x2={x} y2="228" strokeWidth="0.7" />
            ))}
            <line x1="40" y1="80" x2="340" y2="80" strokeWidth="0.7" />
            <line x1="40" y1="200" x2="340" y2="200" strokeWidth="0.7" />
            <line x1="10" y1="252" x2="410" y2="252" strokeWidth="1.6" />
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={i} x1={20 + i * 19} y1="244" x2={20 + i * 19} y2="252" strokeWidth="0.7" />
            ))}
            <rect x="340" y="214" width="62" height="28" />
            <circle cx="356" cy="228" r="4" strokeWidth="0.7" />
          </g>
          <g stroke="var(--color-ember-500)" strokeWidth="1">
            <line x1="40" y1="20" x2="340" y2="20" />
            <line x1="40" y1="14" x2="40" y2="26" />
            <line x1="340" y1="14" x2="340" y2="26" />
          </g>
          <text x="185" y="12" fill="var(--color-steel-400)" fontSize="9" fontFamily="IBM Plex Mono, monospace" letterSpacing="2" textAnchor="middle">
            VÃO LIVRE
          </text>
        </svg>

        <SparkField density={26} />

        {/* conteúdo */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-end px-5 pt-32 pb-16 md:px-8 md:pb-20">
          <p className="font-mono mb-6 min-h-[1.2em] text-[0.68rem] tracking-[0.3em] text-weld-400 uppercase">
            {label || "\u00A0"}
          </p>

          <h1 className="font-display max-w-[16ch] text-[clamp(3.1rem,9.5vw,8.75rem)] font-bold leading-[0.94] tracking-[0.005em] uppercase">
            <MaskLines
              delay={0.15}
              lines={[
                <span key="1" className="text-paper-100">
                  Metal <em className="text-ember-500 not-italic">sob medida.</em>
                </span>,
                <span key="2" className="text-stroke">
                  Segurança
                </span>,
                <span key="3" className="text-paper-100">
                  que <span className="text-weld-400">dura.</span>
                </span>,
              ]}
            />
          </h1>

          <div
            className="mt-8 flex flex-col gap-8 transition-all duration-700 md:flex-row md:items-end md:justify-between"
            style={{
              opacity: showCtas ? 1 : 0,
              transform: showCtas ? "translateY(0)" : "translateY(18px)",
            }}
          >
            <p className="max-w-xl text-base leading-relaxed text-steel-300 md:text-lg">
              Portões, grades, corrimãos, automação e estruturas metálicas com
              execução profissional para{" "}
              <strong className="font-medium text-paper-100">residências, condomínios e empresas</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Magnetic>
                <a
                  href={waLink(
                    business.whatsappDigits,
                    "Olá, Metal & Art! Vim pelo site e gostaria de solicitar um orçamento."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("cta_whatsapp_hero")}
                  className="btn-press bg-ember-500 hover:bg-weld-400 font-display group inline-flex items-center gap-3 px-7 py-4 text-lg font-bold tracking-[0.06em] text-coal-950 uppercase"
                >
                  <IconWhatsApp className="h-5 w-5" />
                  Solicitar orçamento no WhatsApp
                  <IconArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href="#projetos"
                  onClick={(e) => {
                    e.preventDefault();
                    track("cta_projetos_hero");
                    scrollToEl("#projetos", -72);
                  }}
                  className="btn-press font-display border-paper-100/35 hover:border-ember-500 hover:text-ember-400 inline-flex items-center gap-3 border px-7 py-4 text-lg tracking-[0.06em] text-paper-100 uppercase"
                >
                  Ver projetos realizados
                  <IconArrowRight className="h-5 w-5" />
                </a>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* rodapé do hero */}
        <div className="relative z-10 border-t border-paper-100/10">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-8">
            <p className="font-mono flex items-center gap-3 text-[0.62rem] tracking-[0.3em] text-steel-400 uppercase">
              <span className="relative inline-block h-8 w-px overflow-hidden bg-coal-600">
                <span className="absolute top-0 left-0 h-3 w-px animate-[marquee-y_1.6s_ease-in-out_infinite] bg-ember-500" />
              </span>
              Role para conhecer
            </p>
            <a
              href={waLink(business.whatsappDigits, "Olá, Metal & Art! Vim pelo site.")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_hero")}
              className="font-mono text-[0.68rem] tracking-[0.18em] text-steel-300 transition-colors hover:text-ember-400"
            >
              {business.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      {/* letreiro de serviços */}
      <div className="border-y border-coal-700/70 bg-coal-900 py-3.5" aria-hidden="true">
        <Marquee
          className="font-display text-xl tracking-[0.06em] text-steel-300 uppercase"
          items={[
            "Portões sob medida",
            "Automação",
            "Reformas e reparos",
            "Grades de proteção",
            "Corrimãos",
            "Guarda-corpos",
            "Portas de enrolar",
            "Travas eletromagnéticas",
            "Estruturas metálicas",
          ]}
        />
      </div>

      <style>{`
        @keyframes marquee-y {
          0% { transform: translateY(-100%); }
          60%,100% { transform: translateY(400%); }
        }
      `}</style>
    </>
  );
}
