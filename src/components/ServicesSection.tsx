import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { business } from "../config/business";
import { services } from "../data/services";
import {
  MaskLines,
  Reveal,
  cn,
  track,
  useParallax,
  waLink,
} from "../lib/motion";
import { IconArrowRight, IconArrowUpRight, IconCheck, IconWhatsApp, SectionTag } from "./ui";

gsap.registerPlugin(ScrollTrigger);

const EDITORIAL = ["reforma-de-portoes", "automacao-de-portoes", "grades-de-protecao"];

const CHAPTERS = [
  {
    n: "01",
    title: "Portões",
    text: "Fabricação e reforma de portões de garagem e sociais: deslizantes, basculantes e pivotantes, sempre medidos no vão real.",
    slug: "portoes-sob-medida",
  },
  {
    n: "02",
    title: "Automação",
    text: "Motor, cremalheira, trava eletromagnética e regulagem de fim de curso — com o portão revisado antes de automatizar.",
    slug: "automacao-de-portoes",
  },
  {
    n: "03",
    title: "Proteção",
    text: "Grades de proteção e guarda-corpos com fixação reforçada e desenho que valoriza a fachada em vez de pesar nela.",
    slug: "grades-de-protecao",
  },
  {
    n: "04",
    title: "Corrimãos",
    text: "Corrimãos com pega ergonômica e fixação estrutural para escadas internas, externas e áreas comuns.",
    slug: "corrimaos",
  },
  {
    n: "05",
    title: "Manutenção",
    text: "Troca de molas de portas de enrolar, roldanas, trilhos e reparos que devolvem o funcionamento — sem trocar tudo.",
    slug: "porta-de-enrolar",
  },
];

export function ServicesSection() {
  const storyRef = useRef<HTMLDivElement>(null);
  const chapRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeChap, setActiveChap] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      chapRefs.current.forEach((b, i) => {
        if (!b) return;
        ScrollTrigger.create({
          trigger: b,
          start: "top 60%",
          end: "bottom 60%",
          onEnter: () => setActiveChap(i),
          onEnterBack: () => setActiveChap(i),
        });
      });
    }, storyRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="servicos" className="relative bg-coal-900 py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <SectionTag index="02" label="Serviços" />
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display max-w-[16ch] text-[clamp(2.4rem,6vw,5rem)] leading-[0.96] uppercase">
            <MaskLines
              lines={[
                <span key="1" className="text-paper-100">O que a oficina</span>,
                <span key="2" className="text-stroke">resolve.</span>,
              ]}
            />
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-steel-400 md:text-right">
            Serviços confirmados na atuação da Metal &amp; Art — cada um com
            página própria, descrição completa e orçamento direto pelo WhatsApp.
          </p>
        </div>

        {/* índice editorial */}
        <div className="border-coal-700 mt-14 border-t">
          {services.map((s, i) => (
            <Link
              key={s.slug}
              to={`/servicos/${s.slug}`}
              onClick={() => track("servico_indice", { slug: s.slug })}
              className="group border-coal-700 hover:bg-coal-850 grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b px-2 py-5 transition-colors md:grid-cols-[4rem_1fr_10rem_3rem] md:px-4"
            >
              <span className="font-mono text-[0.68rem] text-steel-500 group-hover:text-ember-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <span className="font-display block text-xl tracking-[0.03em] text-paper-100 uppercase transition-transform duration-300 group-hover:translate-x-1.5 md:text-2xl">
                  {s.name}
                </span>
                <span className="mt-1 hidden max-w-2xl text-sm text-steel-400 md:block">
                  {s.shortDescription}
                </span>
              </span>
              <span className="font-mono hidden text-[0.62rem] tracking-[0.22em] text-steel-500 uppercase md:block">
                {s.tag}
              </span>
              <IconArrowUpRight className="h-5 w-5 justify-self-end text-steel-500 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-ember-500" />
            </Link>
          ))}
        </div>
      </div>

      {/* destaques editoriais alternados */}
      <div className="mx-auto mt-28 max-w-[1440px] px-5 md:px-8">
        {EDITORIAL.map((slug, idx) => {
          const s = services.find((x) => x.slug === slug);
          if (!s) return null;
          const flip = idx % 2 === 1;
          return (
            <Reveal key={s.slug} className="mt-20 first:mt-0">
              <article
                className={cn(
                  "grid items-center gap-8 md:gap-14 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",
                  flip && "lg:[direction:rtl]"
                )}
              >
                <div className="img-zoom border-coal-600 relative overflow-hidden border [direction:ltr]">
                  <EditorialImg src={s.images[0]} alt={`${s.name} — trabalho da Metal & Art`} />
                  <span className="font-mono absolute top-3 left-3 bg-coal-950/85 px-2.5 py-1 text-[0.6rem] tracking-[0.22em] text-weld-400 uppercase">
                    Serviço {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="[direction:ltr]">
                  <p className="font-mono text-[0.65rem] tracking-[0.3em] text-ember-500 uppercase">{s.tag}</p>
                  <h3 className="font-display mt-3 text-3xl leading-[1.02] tracking-[0.02em] text-paper-100 uppercase md:text-4xl">
                    {s.name}
                  </h3>
                  <p className="mt-4 leading-relaxed text-steel-400">{s.shortDescription}</p>
                  <ul className="mt-6 space-y-2.5">
                    {s.benefits.slice(0, 3).map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm text-steel-300">
                        <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-ember-500" /> {b}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Link
                      to={`/servicos/${s.slug}`}
                      className="btn-press bg-ember-500 hover:bg-weld-400 font-display inline-flex items-center gap-2.5 px-5 py-3 text-sm tracking-[0.07em] text-coal-950 uppercase"
                    >
                      Detalhes do serviço <IconArrowRight className="h-4 w-4" />
                    </Link>
                    <a
                      href={waLink(business.whatsappDigits, s.whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("whatsapp_servico", { slug: s.slug })}
                      className="btn-press border-coal-600 hover:border-ember-500 hover:text-ember-400 font-display inline-flex items-center gap-2.5 border px-5 py-3 text-sm tracking-[0.07em] text-paper-100 uppercase"
                    >
                      <IconWhatsApp className="h-4 w-4" /> Orçamento rápido
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* storytelling sticky — capítulos */}
      <div ref={storyRef} className="mx-auto mt-28 max-w-[1440px] px-5 md:px-8 md:mt-40">
        <SectionTag index="03" label="Capitais da oficina" />
        <h3 className="font-display mt-6 text-[clamp(2rem,4.5vw,3.6rem)] leading-[0.98] text-paper-100 uppercase">
          Cinco frentes, <em className="text-ember-500 not-italic">um padrão só</em>.
        </h3>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="relative hidden lg:block">
            <div className="sticky top-24">
              <div className="border-coal-600 relative aspect-[4/5] overflow-hidden border bg-coal-850">
                {CHAPTERS.map((c, i) => {
                  const s = services.find((x) => x.slug === c.slug);
                  return (
                    <img
                      key={c.n}
                      src={s?.images[0]}
                      alt={c.title}
                      loading="lazy"
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover transition-all duration-700",
                        i === activeChap ? "scale-100 opacity-100" : "scale-105 opacity-0"
                      )}
                    />
                  );
                })}
                <span className="font-mono absolute bottom-3 left-3 bg-coal-950/85 px-2.5 py-1 text-[0.62rem] tracking-[0.22em] text-weld-400 uppercase">
                  {CHAPTERS[activeChap].n} — {CHAPTERS[activeChap].title}
                </span>
              </div>
              <div className="mt-4 flex gap-1.5" aria-hidden="true">
                {CHAPTERS.map((c, i) => (
                  <span key={c.n} className={cn("h-1 flex-1 transition-colors duration-500", i <= activeChap ? "bg-ember-500" : "bg-coal-700")} />
                ))}
              </div>
            </div>
          </div>

          <div>
            {CHAPTERS.map((c, i) => (
              <div
                key={c.n}
                ref={(el) => void (chapRefs.current[i] = el)}
                className="border-coal-700 border-b py-14 first:pt-0 md:py-20"
              >
                <div className="mb-6 lg:hidden">
                  <img
                    src={services.find((x) => x.slug === c.slug)?.images[0]}
                    alt={c.title}
                    loading="lazy"
                    className="border-coal-600 aspect-[4/3] w-full border object-cover"
                  />
                </div>
                <p className="font-mono text-[0.65rem] tracking-[0.3em] text-ember-500 uppercase">Capítulo {c.n}</p>
                <h4 className="font-display mt-3 text-4xl tracking-[0.02em] text-paper-100 uppercase md:text-5xl">{c.title}</h4>
                <p className="mt-4 max-w-md leading-relaxed text-steel-400">{c.text}</p>
                <Link
                  to={`/servicos/${c.slug}`}
                  className="underline-weld font-mono mt-6 inline-block pb-1 text-[0.7rem] tracking-[0.25em] text-steel-300 uppercase hover:text-ember-400"
                >
                  Ver serviço completo →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EditorialImg({ src, alt }: { src: string; alt: string }) {
  const par = useParallax<HTMLDivElement>(28);
  return (
    <div ref={par} className="h-[114%] w-full will-change-transform">
      <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
}
