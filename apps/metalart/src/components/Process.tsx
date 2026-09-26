import { useEffect, useRef, useState } from "react";
import { MaskLines, Reveal, cn } from "../lib/motion";
import { SectionTag, WeldDivider } from "./ui";

/* ================= COMO TRABALHAMOS — linha de solda ================= */

const STEPS = [
  {
    n: "01",
    title: "Contato",
    text: "Você chama no WhatsApp ou pelo site e conta o que precisa — pode mandar foto, medida ou só a ideia.",
  },
  {
    n: "02",
    title: "Entendimento da necessidade",
    text: "A gente faz as perguntas certas: uso, vão, peso, segurança e o resultado que você espera.",
  },
  {
    n: "03",
    title: "Avaliação e medição",
    text: "Visita técnica com medição do vão, conferência de nível, prumo e rota de funcionamento.",
  },
  {
    n: "04",
    title: "Orçamento",
    text: "Proposta clara com material, prazo de fabricação e instalação — sem letra miúda.",
  },
  {
    n: "05",
    title: "Fabricação ou reparo",
    text: "Corte, solda e montagem na oficina — ou o reparo no local, quando é o caso.",
  },
  {
    n: "06",
    title: "Acabamento",
    text: "Tratamento antiferrugem, massa, fundo e pintura na cor combinada.",
  },
  {
    n: "07",
    title: "Instalação",
    text: "Peça instalada, nivelada e testada: abertura, travamento e regulagem fina antes da entrega.",
  },
];

export function HowWeWork() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = (vh * 0.7 - r.top) / r.height;
        setP(Math.min(1, Math.max(0, progress)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const activeIdx = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length * 1.15));

  return (
    <section id="como-trabalhamos" className="blueprint-grid-light bg-paper-100 py-24 text-ink-900 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <SectionTag light index="08" label="Método" />
        <h2 className="font-display mt-6 max-w-[18ch] text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[0.96] uppercase">
          <MaskLines
            lines={[
              <span key="1">Como a gente</span>,
              <span key="2">
                trabalha<em className="text-ember-600 not-italic">.</em>
              </span>,
            ]}
          />
        </h2>

        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <p className="font-display text-7xl tracking-[0.02em] text-ink-900">
                {String(activeIdx + 1).padStart(2, "0")}
                <span className="text-ember-600">/07</span>
              </p>
              <p className="font-mono mt-3 text-[0.68rem] tracking-[0.25em] text-ink-700/70 uppercase">
                Etapa atual do scroll
              </p>
              <WeldDivider className="mt-8" />
              <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-700">
                O mesmo caminho para portão novo, reforma ou estrutura: você
                acompanha cada etapa do pedido à entrega.
              </p>
            </div>
          </div>

          <div ref={trackRef} className="relative pl-10 md:pl-16">
            {/* linha metálica + solda */}
            <div className="bg-ink-900/15 absolute top-2 bottom-2 left-2 w-px md:left-4" aria-hidden="true">
              <div
                className="absolute top-0 left-0 w-px bg-gradient-to-b from-ember-600 to-ember-500 transition-[height] duration-200"
                style={{ height: `${p * 100}%` }}
              />
              <div
                className="weld-dot bg-ember-500 absolute h-2.5 w-2.5 -translate-x-1/2 rounded-full transition-[top] duration-200"
                style={{ top: `${p * 100}%` }}
              />
            </div>

            <ol className="flex flex-col gap-10 md:gap-12">
              {STEPS.map((s, i) => (
                <li key={s.n} className="relative">
                  <span
                    className={cn(
                      "absolute top-1.5 -left-8 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border transition-colors duration-300 md:-left-12",
                      i <= activeIdx ? "border-ember-600 bg-ember-500" : "border-ink-900/30 bg-paper-100"
                    )}
                    aria-hidden="true"
                  />
                  <Reveal delay={0.05}>
                    <p className={cn("font-mono text-[0.65rem] tracking-[0.3em] uppercase", i <= activeIdx ? "text-ember-600" : "text-ink-700/50")}>
                      Etapa {s.n}
                    </p>
                    <h3 className="font-display mt-2 text-2xl tracking-[0.02em] uppercase md:text-3xl">{s.title}</h3>
                    <p className="mt-2 max-w-xl leading-relaxed text-ink-700">{s.text}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
