import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { assets } from "../config/assets";
import { business } from "../config/business";
import { MaskLines, prefersReduced, track, waLink } from "../lib/motion";
import { IconArrowRight, IconWhatsApp, SectionTag } from "./ui";

gsap.registerPlugin(ScrollTrigger);

const PANELS = [
  {
    n: "01",
    title: "Residências",
    text: "Portão de garagem e social, grades de janela, corrimão de escada e automação para o dia a dia ficar leve e seguro.",
    img: assets.beforeAfter.after,
    alt: "Portão residencial reformado e pintado",
    tags: ["Portões", "Grades", "Corrimãos", "Automação"],
    wa: "Olá, Metal & Art! Quero um orçamento para minha CASA.",
  },
  {
    n: "02",
    title: "Condomínios",
    text: "Portões de acesso, automação com trava, grades de áreas comuns e manutenção programada para o condomínio não parar.",
    img: assets.gates.sliding,
    alt: "Portão deslizante instalado em condomínio",
    tags: ["Portões de acesso", "Automação", "Manutenção"],
    wa: "Olá, Metal & Art! Quero um orçamento para meu CONDOMÍNIO.",
  },
  {
    n: "03",
    title: "Empresas",
    text: "Estruturas metálicas, mezaninos para estoque, suportes e portões de galpão dimensionados para carga de trabalho pesado.",
    img: assets.workshop.fabrication,
    alt: "Estrutura metálica em fabricação na oficina",
    tags: ["Estruturas", "Mezaninos", "Portões industriais"],
    wa: "Olá, Metal & Art! Quero um orçamento para minha EMPRESA.",
  },
  {
    n: "04",
    title: "Comércios",
    text: "Porta de enrolar com mola regulada, grades de vitrine e travas que abrem cedo e fecham seguras — sem dor de cabeça.",
    img: assets.rollingDoors.storefront,
    alt: "Porta de enrolar instalada em comércio",
    tags: ["Portas de enrolar", "Grades", "Travas"],
    wa: "Olá, Metal & Art! Quero um orçamento para meu COMÉRCIO.",
  },
];

export function Spaces() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      if (prefersReduced()) return;
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;
      const amount = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -amount(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${amount()}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(track, { x: 0 });
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      id="espacos"
      ref={sectionRef}
      className="relative overflow-hidden border-y border-coal-700/60 bg-coal-900"
    >
      <div className="mx-auto max-w-[1440px] px-5 pt-16 md:px-8 md:pt-24">
        <SectionTag index="04" label="Onde atendemos" />
        <h2 className="font-display mt-6 text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.96] uppercase">
          <MaskLines
            lines={[
              <span key="1" className="text-paper-100">Soluções para</span>,
              <span key="2" className="text-paper-100">
                cada <em className="text-ember-500 not-italic">espaço</em>.
              </span>,
            ]}
          />
        </h2>
      </div>

      {/* trilho horizontal: pin no desktop, swipe natural no mobile */}
      <div
        ref={trackRef}
        className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pt-2 pb-16 will-change-transform md:mt-16 md:px-8 md:pb-24 lg:overflow-visible lg:px-[max(2rem,calc((100vw-1440px)/2+2rem))]"
      >
        {PANELS.map((p) => (
          <article
            key={p.n}
            className="border-coal-600 grid w-[88vw] shrink-0 snap-center grid-cols-1 overflow-hidden border bg-coal-850 sm:w-[75vw] lg:w-[64vw] lg:snap-none lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]"
          >
            <div className="img-zoom relative min-h-64 overflow-hidden lg:min-h-[26rem]">
              <img src={p.img} alt={p.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <span className="font-mono absolute top-3 left-3 bg-coal-950/85 px-2.5 py-1 text-[0.6rem] tracking-[0.22em] text-weld-400 uppercase">
                Espaço {p.n}
              </span>
            </div>
            <div className="flex flex-col justify-between p-7 md:p-10">
              <div>
                <h3 className="font-display text-4xl tracking-[0.02em] text-paper-100 uppercase md:text-5xl">{p.title}</h3>
                <p className="mt-4 max-w-md leading-relaxed text-steel-400">{p.text}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span key={t} className="font-mono border border-coal-600 px-3 py-1.5 text-[0.6rem] tracking-[0.18em] text-steel-300 uppercase">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/orcamento"
                  onClick={() => track("cta_orcamento_espacos", { espaco: p.title })}
                  className="btn-press bg-ember-500 hover:bg-weld-400 font-display inline-flex items-center gap-2.5 px-5 py-3 text-sm tracking-[0.07em] text-coal-950 uppercase"
                >
                  Orçamento para {p.title.toLowerCase()} <IconArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={waLink(business.whatsappDigits, p.wa)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-press border-coal-600 hover:border-ember-500 hover:text-ember-400 font-display inline-flex items-center gap-2.5 border px-5 py-3 text-sm tracking-[0.07em] text-paper-100 uppercase"
                >
                  <IconWhatsApp className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
          </article>
        ))}

        {/* painel final */}
        <article className="flex w-[70vw] shrink-0 snap-center flex-col items-start justify-center gap-5 border border-dashed border-coal-600 p-10 sm:w-[45vw] lg:w-[30vw] lg:snap-none">
          <p className="font-mono text-[0.65rem] tracking-[0.3em] text-steel-500 uppercase">Próximo passo</p>
          <h3 className="font-display text-3xl leading-tight tracking-[0.02em] text-paper-100 uppercase md:text-4xl">
            Seu espaço merece um projeto <em className="text-ember-500 not-italic">sob medida</em>.
          </h3>
          <Link
            to="/projetos"
            className="btn-press bg-ember-500 hover:bg-weld-400 font-display inline-flex items-center gap-2.5 px-5 py-3 text-sm tracking-[0.07em] text-coal-950 uppercase"
          >
            Ver projetos reais <IconArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </div>

      <p className="font-mono absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-[0.6rem] tracking-[0.3em] text-steel-500 uppercase lg:block">
        Continue rolando — o trilho anda sozinho
      </p>
    </section>
  );
}
