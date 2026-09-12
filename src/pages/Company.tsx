import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BUSINESS } from "../config/business";
import { availableCount, IMG } from "../data/machines";
import { generalMessage, prefersReducedMotion, usePageMeta, waLink } from "../lib/utils";
import { Btn, Counter, HazardStrip, IcArrow, IcShield, IcTractor, IcWhatsApp, IcWrench, Kicker, Reveal, SectionHead } from "../components/ui";

gsap.registerPlugin(ScrollTrigger);

const MILESTONES = [
  { year: "1988", text: "Nasce a Lusomaq, distribuindo peças de reposição para rolos compactadores em São Paulo." },
  { year: "Anos 2000", text: "Consolidação com motores Perkins, MWM, Mercedes, Kubota, Deutz e Cummins na carteira." },
  { year: "Hoje", text: "Estoque próprio com mais de 30.000 itens e transporte próprio atendendo todo o Brasil." },
  { year: "Próximo", text: "Expansão da atuação para o mercado internacional — como manda a nossa visão." },
];

export default function Company() {
  usePageMeta(
    `A Empresa — ${BUSINESS.name} | Peças para Rolos Compactadores desde ${BUSINESS.founded}`,
    `Fundada em ${BUSINESS.founded}, a ${BUSINESS.name} distribui peças para rolos compactadores Dynapac, Muller, Hamm, Tema-Terra, Caterpillar e Bomag. Estoque com 30.000+ itens em São Paulo/SP.`,
  );

  const bgRef = useRef<HTMLImageElement | null>(null);
  const secRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !bgRef.current || !secRef.current) return;
    const tween = gsap.fromTo(
      bgRef.current,
      { yPercent: -10 },
      { yPercent: 10, ease: "none", scrollTrigger: { trigger: secRef.current, start: "top bottom", end: "bottom top", scrub: true } },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div className="pt-[120px] lg:pt-[150px]">
      <header className="relative overflow-hidden border-b border-line-dark">
        <div className="absolute inset-0" aria-hidden="true">
          <img src={IMG.road} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-coal-950/85" />
        </div>
        <div className="relative mx-auto max-w-(--container-site) px-6 py-24 md:py-32">
          <Reveal><Kicker>Desde {BUSINESS.founded} · {BUSINESS.yearsInMarket} anos</Kicker></Reveal>
          <Reveal delay={90}>
            <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.6rem,7vw,5.5rem)] uppercase leading-[0.9]">
              Peça boa se conhece <span className="text-hz-400">pelo balcão</span>.
            </h1>
          </Reveal>
          <Reveal delay={170}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bone-200/90">
              Fundada em <strong className="text-hz-300">{BUSINESS.founded}</strong>, a {BUSINESS.name} atua na distribuição de peças novas de reposição para equipamentos <strong className="text-bone-100">Dynapac, Muller, Hamm, Tema-Terra, Caterpillar, Bomag, Volvo, Sany, XCMG, Bobcat</strong>, entre outras. Também trabalhamos com motores <strong className="text-bone-100">Perkins, MWM, Mercedes, Kubota, Deutz, Cummins, Eaton</strong> e bombas Sundstrand.
            </p>
          </Reveal>
        </div>
      </header>

      {/* números */}
      <section className="border-b border-line-dark bg-coal-900">
        <div className="mx-auto grid max-w-(--container-site) grid-cols-2 lg:grid-cols-4">
          {BUSINESS.stats.map((s, i) => (
            <div key={s.label} className={`border-line-dark px-6 py-10 md:py-14 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b lg:border-b-0" : ""} ${i === 1 ? "lg:border-r" : ""}`}>
              <p className="font-display text-[clamp(2.2rem,4.5vw,3.6rem)] leading-none text-hz-300">
                <Counter to={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-3 font-cond text-[13px] font-semibold uppercase tracking-[0.22em] text-steel-300">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-line-dark">
          <p className="mx-auto flex max-w-(--container-site) items-center gap-3 px-6 py-4 font-cond text-[12px] font-semibold uppercase tracking-[0.22em] text-steel-500">
            <span className="h-2 w-2 animate-pulse bg-agri-400" aria-hidden="true" />
            {availableCount()} itens do catálogo online agora — disponíveis para despacho imediato
          </p>
        </div>
      </section>

      {/* sede + missão/visão/valores */}
      <section className="border-b border-line-dark bg-coal-950 py-24 md:py-32">
        <div className="mx-auto max-w-(--container-site) px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <Reveal variant="left">
              <div className="relative overflow-hidden border border-line-dark">
                <img src={IMG.predio} alt={`Fachada da sede da ${BUSINESS.name}`} className="w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-coal-950/90 to-transparent p-6">
                  <p className="font-cond text-lg font-bold uppercase tracking-[0.2em] text-bone-100">Nossa sede</p>
                  <p className="text-[14px] text-steel-300">{BUSINESS.address.street} — {BUSINESS.address.city}/{BUSINESS.address.state}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { icon: IcTractor, t: "Transporte próprio", d: "E parcerias com todas as transportadoras" },
                  { icon: IcShield, t: "Peças revisadas", d: "Durabilidade e eficiência conferidas" },
                  { icon: IcWrench, t: "Conhecimento técnico", d: "A melhor solução, não só a venda" },
                ].map((x) => {
                  const Icon = x.icon;
                  return (
                    <div key={x.t} className="border border-line-dark bg-coal-900 p-4">
                      <Icon size={22} className="text-hz-400" />
                      <p className="mt-2 font-cond text-[13px] font-bold uppercase tracking-[0.12em] text-bone-100">{x.t}</p>
                      <p className="mt-1 text-[12px] leading-snug text-steel-400">{x.d}</p>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <div>
              <SectionHead kicker="Quem somos" title={<>Mais de {BUSINESS.yearsInMarket} anos no mercado de <span className="text-hz-400">rolo compactador</span></>} />
              <Reveal delay={100}>
                <div className="mt-8 space-y-6">
                  <div className="border-l-2 border-hz-400 pl-5">
                    <h3 className="font-display text-xl uppercase">Nossa missão</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-steel-300">{BUSINESS.mission}</p>
                  </div>
                  <div className="border-l-2 border-steel-400 pl-5">
                    <h3 className="font-display text-xl uppercase">Nossa visão</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-steel-300">{BUSINESS.vision}</p>
                  </div>
                  <div className="border-l-2 border-agri-400 pl-5">
                    <h3 className="font-display text-xl uppercase">Nossos valores</h3>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {BUSINESS.values.map((v) => (
                        <li key={v} className="border border-line-dark bg-coal-900 px-3 py-1.5 font-cond text-[12px] font-bold uppercase tracking-[0.16em] text-bone-100">{v}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* linha do tempo com parallax */}
      <section ref={secRef} className="relative overflow-hidden border-b border-line-dark">
        <img ref={bgRef} src={IMG.road} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-[120%] w-full object-cover will-change-transform" />
        <div className="absolute inset-0 bg-coal-950/82" aria-hidden="true" />
        <div className="relative mx-auto max-w-(--container-site) px-6 py-24 md:py-32">
          <SectionHead kicker="Linha do tempo" title={<>Do balcão de bairro à <span className="text-hz-400">distribuição nacional</span></>} />
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {MILESTONES.map((m, i) => (
              <Reveal key={m.year} delay={i * 100}>
                <div className="border-t-2 border-hz-400 pt-5">
                  <p className="font-display text-4xl text-bone-100">{m.year}</p>
                  <p className="mt-3 text-[14px] leading-relaxed text-steel-300">{m.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-coal-950 py-24">
        <div className="mx-auto max-w-(--container-site) px-6">
          <div className="flex flex-wrap items-center justify-between gap-8 border border-line-dark bg-coal-900 p-8 md:p-12">
            <div className="max-w-xl">
              <Kicker tone="agri">Balcão aberto</Kicker>
              <h2 className="mt-4 font-display text-3xl uppercase leading-tight md:text-4xl">
                Traga a peça velha. Saia com a nova.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-steel-300">
                Atendimento de segunda a sexta, das 08h às 18h, na {BUSINESS.address.street} — ou pelo WhatsApp, de onde você estiver.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn href={waLink(BUSINESS.whatsapp, generalMessage())} tone="agri" size="lg"><IcWhatsApp size={17} /> Solicitar orçamento</Btn>
              <Btn to="/pecas" tone="outline" size="lg">Ver peças <IcArrow size={16} /></Btn>
            </div>
          </div>
        </div>
        <HazardStrip className="mt-24 opacity-50" />
      </section>
    </div>
  );
}
