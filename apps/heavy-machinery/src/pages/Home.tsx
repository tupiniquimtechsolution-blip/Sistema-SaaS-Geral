import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BUSINESS } from "../config/business";
import { availableCount, CATEGORY_META, featuredMachines, IMG } from "../data/machines";
import type { Category } from "../data/machines";
import { cx, generalMessage, machineMessage, prefersReducedMotion, usePageMeta, waLink } from "../lib/utils";
import { useApp } from "../store/AppStore";
import { MachineCard } from "../components/MachineCard";
import {
  Btn,
  Counter,
  HazardStrip,
  IcArrow,
  IcArrowUpRight,
  IcEngine,
  IcShield,
  IcTractor,
  IcWhatsApp,
  IcWrench,
  Kicker,
  Reveal,
  SectionHead,
  StatusTag,
} from "../components/ui";

gsap.registerPlugin(ScrollTrigger);

const MARQUEE = [
  "Bombas hidráulicas",
  "Duocones",
  "Rolamentos",
  "Filtros",
  "Engrenagens",
  "Caixas de transmissão",
  "Vedações",
  "Motores Perkins · MWM · Deutz",
  "Pneus & rodas",
  "Bicos espargidores",
];

const STORY = [
  { word: "Estoque", img: IMG.hero3, copy: "Mais de 30.000 itens disponíveis imediatamente no estoque próprio — a peça certa sai daqui no mesmo dia.", meta: "01 / 04" },
  { word: "Agilidade", img: IMG.hero2, copy: "Transporte próprio e parceria com todas as transportadoras. Entrega rápida e eficiente para todo o Brasil.", meta: "02 / 04" },
  { word: "Qualidade", img: IMG.hero5, copy: "Peças originais e compatíveis rigorosamente revisadas para garantir durabilidade e eficiência.", meta: "03 / 04" },
  { word: "Preço justo", img: IMG.hero6, copy: "38 anos de mercado comprando bem para vender bem. A melhor solução conforme a sua necessidade.", meta: "04 / 04" },
];

const APPS: { title: string; img: string; text: string; cat: Category | "all" }[] = [
  { title: "Dynapac", img: IMG.p1, text: "CA130 · CA150 · CA250 · CA300 — vibração, transmissão e motor", cat: "all" },
  { title: "Hamm", img: IMG.p2, text: "Linha 3400 — rolamentos, redutores e filtros", cat: "rolamentos" },
  { title: "Muller", img: IMG.p9, text: "AP4000 e linha pesada — PTOs e transmissão", cat: "transmissao" },
  { title: "Caterpillar", img: IMG.p12, text: "CS e CP — cubos, rodas e material rodante", cat: "rodado" },
  { title: "Bomag", img: IMG.p11, text: "BW211 · BW213 — hidráulica e rodado", cat: "bombas" },
  { title: "Pneumáticos", img: IMG.p10, text: "Goodyear e Continental para rolos pneumáticos", cat: "rodado" },
];

const SPOTS = [
  { id: "tambor", x: "22%", y: "62%", title: "Tambor & vibração", points: ["Bombas e motores de vibração Sundstrand / Sauer Danfoss", "Duocones e retentores de tambor", "Coxins do módulo vibratório", "Teste em bancada com laudo de vazão"] },
  { id: "motor", x: "52%", y: "34%", title: "Motor", points: ["Perkins, MWM, Cummins, Deutz e Kubota", "Jogos de juntas e bombas d'água", "Filtros Donaldson e Fleetguard", "Correias Gates nas medidas originais"] },
  { id: "transmissao", x: "70%", y: "56%", title: "Transmissão", points: ["Caixas de câmbio e engrenagens", "Tomadas de força (PTOs)", "Redutores e transmissão final", "Diferenciais e eixos"] },
  { id: "rodado", x: "86%", y: "72%", title: "Rodado", points: ["Pneus 23.1-26 Goodyear / Continental", "Rodas com cubo montado", "Rolamentos SKF, Timken e FAG", "Roletes para material rodante"] },
];

function useParallax(triggerRef: React.RefObject<HTMLElement | null>, imgRef: React.RefObject<HTMLImageElement | null>, from: number, to: number) {
  useLayoutEffect(() => {
    if (prefersReducedMotion() || !triggerRef.current || !imgRef.current) return;
    const tween = gsap.fromTo(
      imgRef.current,
      { yPercent: from },
      { yPercent: to, ease: "none", scrollTrigger: { trigger: triggerRef.current, start: "top bottom", end: "bottom top", scrub: true } },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  useParallax(heroRef, bgRef, 0, 20);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".hero-line > span", { yPercent: 112 }, { yPercent: 0, duration: 1.1, stagger: 0.14, ease: "power4.out", delay: 0.2 });
      gsap.fromTo(".hero-fade", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, delay: 0.75, ease: "power3.out" });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative flex min-h-[100svh] items-end overflow-hidden">
      <img ref={bgRef} src={IMG.road} alt="" aria-hidden="true" className="absolute inset-0 h-[118%] w-full object-cover will-change-transform" />
      <div className="absolute inset-0 bg-gradient-to-t from-coal-950 via-coal-950/40 to-coal-950/70" aria-hidden="true" />
      <img src={IMG.hero1} alt="" aria-hidden="true" className="hero-fade pointer-events-none absolute bottom-0 right-[2%] hidden w-[38%] max-w-[560px] drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)] lg:block" />

      <div className="relative z-10 mx-auto w-full max-w-(--container-site) px-6 pb-24 pt-44">
        <div className="hero-fade">
          <Kicker>{BUSINESS.slogan} · desde {BUSINESS.founded}</Kicker>
        </div>
        <h1 className="mt-5 max-w-4xl font-display uppercase leading-[0.92] text-shadow-hard">
          <span className="mask-line hero-line block text-[clamp(2.6rem,8vw,6.4rem)]"><span>A peça que mantém</span></span>
          <span className="mask-line hero-line block text-[clamp(2.6rem,8vw,6.4rem)]"><span>seu rolo <em className="not-italic text-hz-400">trabalhando</em></span></span>
        </h1>
        <p className="hero-fade mt-6 max-w-xl text-lg leading-relaxed text-bone-200/90 md:text-xl">
          {BUSINESS.tagline} Estoque próprio com mais de <strong className="text-hz-300">30.000 itens</strong> e despacho para todo o Brasil.
        </p>
        <div className="hero-fade mt-9 flex flex-wrap items-center gap-4">
          <Btn to="/pecas" size="lg" tone="hz">Ver estoque <IcArrow size={17} /></Btn>
          <Btn href={waLink(BUSINESS.whatsapp, generalMessage())} size="lg" tone="outline"><IcWhatsApp size={17} /> Solicitar orçamento</Btn>
          <span className="font-cond text-[13px] font-semibold uppercase tracking-[0.22em] text-steel-300">{BUSINESS.phoneDisplay} · Seg–Sex 8h–18h</span>
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex" aria-hidden="true">
        <span className="font-cond text-[11px] font-semibold uppercase tracking-[0.34em] text-steel-300">Role</span>
        <span className="block h-12 w-px overflow-hidden bg-steel-500/40">
          <span className="animate-scroll-line block h-full w-full bg-hz-400" />
        </span>
      </div>
    </section>
  );
}

function MarqueeBand() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="hazard relative z-20 overflow-hidden py-3" aria-hidden="true">
      <div className="animate-marquee flex w-max items-center gap-8">
        {items.map((mItem, i) => (
          <span key={i} className="flex items-center gap-8 font-display text-lg uppercase tracking-[0.08em] text-coal-950">
            {mItem} <span className="text-coal-950/60">///</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function StoryPanel({ word, img, copy, meta, z }: { word: string; img: string; copy: string; meta: string; z: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  useParallax(ref, bgRef, -6, 6);

  return (
    <div ref={ref} className="sticky top-0 flex h-[100svh] items-end overflow-hidden border-t border-line-dark" style={{ zIndex: z }}>
      <img ref={bgRef} src={IMG.road} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-[112%] w-full object-cover will-change-transform" />
      <div className="absolute inset-0 bg-coal-950/78" aria-hidden="true" />
      <img ref={imgRef} src={img} alt={`${word} — ${copy}`} loading="lazy" className="pointer-events-none absolute right-[4%] top-1/2 hidden h-[58%] -translate-y-1/2 object-contain drop-shadow-[0_26px_36px_rgba(0,0,0,0.55)] md:block" />
      <div className="relative z-10 mx-auto w-full max-w-(--container-site) px-6 pb-16 md:pb-20">
        <p className="font-cond text-sm font-bold uppercase tracking-[0.3em] text-hz-300">{meta}</p>
        <h3 className="mt-2 font-display text-[clamp(3.2rem,12vw,8.5rem)] uppercase leading-[0.85] text-shadow-hard">
          {word}<span className="text-hz-400">.</span>
        </h3>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-bone-200/90">{copy}</p>
      </div>
      <div className="absolute right-6 top-6 z-10 hidden md:block" aria-hidden="true">
        <span className="block h-16 w-16 border-r-2 border-t-2 border-hz-400/70" />
      </div>
    </div>
  );
}

function StorySection() {
  return (
    <section aria-label="Estoque, agilidade, qualidade e preço justo">
      {STORY.map((s, i) => <StoryPanel key={s.word} {...s} z={i + 1} />)}
    </section>
  );
}

function Highlights() {
  const feats = featuredMachines();
  const { openQuote } = useApp();
  return (
    <section className="relative border-b border-line-dark bg-coal-950 py-24 md:py-32">
      <div className="mx-auto max-w-(--container-site) px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            kicker="Saem rápido do balcão"
            title={<>Destaques do <span className="text-hz-400">estoque</span></>}
            lead="As peças mais procuradas da semana — código, aplicação e preço direto, como a Lusomaq trabalha há 38 anos."
          />
          <Reveal delay={200}><Btn to="/pecas" tone="outline">Estoque completo <IcArrow size={16} /></Btn></Reveal>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {feats.slice(0, 4).map((m, i) => (
            <div key={m.id}><MachineCard m={m} delay={i * 80} /></div>
          ))}
        </div>
        {feats[0] && (
          <Reveal delay={120}>
            <button
              onClick={() => openQuote(feats[0])}
              className="clip-cut-sm mt-8 w-full border border-hz-500/40 bg-hz-400/5 px-5 py-4 text-left font-cond text-sm font-bold uppercase tracking-[0.18em] text-hz-300 transition-colors hover:bg-hz-400/10"
            >
              Montar pedido com várias peças? Solicite um orçamento fechado →
            </button>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function CategoryTiles() {
  const cats = Object.entries(CATEGORY_META) as [Category, (typeof CATEGORY_META)[Category]][];
  return (
    <section className="border-b border-line-dark bg-coal-900 py-24 md:py-32">
      <div className="mx-auto max-w-(--container-site) px-6">
        <SectionHead
          kicker="Navegue por família"
          title={<>Do parafuso à caixa de <span className="text-hz-400">transmissão</span></>}
          lead="Anéis e retentores, bicos espargidores, bombas, caixas, cubos, duocones, engrenagens, filtros, mangueiras, pneus, redutores, rodas, rolamentos, tanques, PTOs — e tudo entre isso."
        />
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cats.map(([key, meta], i) => (
            <Reveal key={key} delay={(i % 4) * 70} className={i === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""}>
              <Link
                to={`/pecas?categoria=${key}`}
                className={cx("group relative block overflow-hidden border border-line-dark transition-all duration-300 hover:border-hz-400/70 hover:shadow-plate", i === 0 ? "h-full min-h-[340px]" : "h-[210px]")}
              >
                <div className="absolute inset-0 bg-white">
                  <img src={meta.image} alt={meta.plural} loading="lazy" className="h-full w-full object-contain p-6 transition-transform duration-700 group-hover:scale-[1.06]" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-coal-950 via-coal-950/25 to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <div>
                    <h3 className={cx("font-display uppercase leading-none", i === 0 ? "text-3xl md:text-4xl" : "text-2xl")}>{meta.plural}</h3>
                    <p className="mt-2 hidden max-w-[260px] text-[13px] leading-snug text-steel-300 sm:block">{meta.blurb}</p>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center border border-bone-100/25 text-bone-100 transition-all duration-300 group-hover:border-hz-400 group-hover:bg-hz-400 group-hover:text-coal-950">
                    <IcArrowUpRight size={19} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Applications() {
  const secRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const track = trackRef.current;
        const sec = secRef.current;
        if (!track || !sec) return;
        const amount = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const tween = gsap.to(track, {
          x: () => -amount(),
          ease: "none",
          scrollTrigger: { trigger: sec, start: "top top", end: () => `+=${amount()}`, scrub: 1, pin: true, invalidateOnRefresh: true, anticipatePin: 1 },
        });
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
    }, secRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={secRef} className="relative flex h-[100svh] flex-col justify-center overflow-hidden border-b border-line-dark bg-coal-950">
      <div className="mx-auto w-full max-w-(--container-site) px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead kicker="Peça por marca do rolo" title={<>O seu rolo tem nome — <span className="text-hz-400">a peça também</span></>} />
          <p className="mb-2 hidden font-cond text-[13px] font-semibold uppercase tracking-[0.24em] text-steel-400 md:block">Continue rolando — o trilho anda sozinho →</p>
        </div>
      </div>
      <div className="mt-10 overflow-x-auto pb-8 md:overflow-visible md:pb-0" data-lenis-prevent>
        <div ref={trackRef} className="flex w-max gap-6 px-6 md:px-[max(1.5rem,calc((100vw-84rem)/2+1.5rem))]">
          {APPS.map((a, i) => (
            <Link
              key={a.title}
              to={a.cat === "all" ? "/pecas" : `/pecas?categoria=${a.cat}`}
              className="group relative block h-[52svh] min-h-[340px] w-[82vw] shrink-0 overflow-hidden border border-line-dark transition-colors duration-300 hover:border-hz-400/70 sm:w-[420px] md:h-[46vh] md:w-[440px]"
            >
              <div className="absolute inset-0 bg-white">
                <img src={a.img} alt={`Peças para ${a.title}`} loading="lazy" className="h-full w-full object-contain p-8 transition-transform duration-700 group-hover:scale-[1.06]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-coal-950 via-coal-950/20 to-transparent" aria-hidden="true" />
              <span className="absolute right-5 top-5 font-display text-5xl text-coal-950/15">0{i + 1}</span>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-4xl uppercase leading-none md:text-5xl">{a.title}</h3>
                <p className="mt-3 max-w-[300px] text-[14px] leading-relaxed text-bone-200/85">{a.text}</p>
                <span className="mt-4 inline-flex items-center gap-2 border-b border-hz-400 pb-1 font-cond text-[13px] font-bold uppercase tracking-[0.2em] text-hz-300 transition-all duration-300 group-hover:gap-3.5">
                  Ver peças <IcArrow size={15} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HotspotSection() {
  const [active, setActive] = useState(SPOTS[0]?.id ?? "");
  const spot = SPOTS.find((s) => s.id === active) ?? SPOTS[0];

  return (
    <section className="border-b border-line-dark bg-coal-900 py-24 md:py-32">
      <div className="mx-auto max-w-(--container-site) px-6">
        <SectionHead
          kicker="Anatomia do rolo"
          title={<>Cada sistema, <span className="text-hz-400">uma prateleira nossa</span></>}
          lead="Toque nos pontos do rolo compactador e veja o que a Lusomaq fornece para cada sistema — dados do nosso catálogo real."
        />
        <div className="mt-14 grid items-start gap-10 lg:grid-cols-5">
          <Reveal variant="left" className="lg:col-span-3">
            <div className="tick-corners relative overflow-hidden border border-line-dark">
              <img src={IMG.rolo} alt="Rolo compactador vibratório de tambor liso" className="aspect-[16/10] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-coal-950/50 to-transparent" aria-hidden="true" />
              {SPOTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  aria-pressed={active === s.id}
                  aria-label={`Ver peças: ${s.title}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: s.x, top: s.y }}
                >
                  <span
                    className={cx(
                      "grid h-10 w-10 place-items-center rounded-full border-2 font-cond text-[15px] font-bold transition-all duration-300",
                      active === s.id ? "animate-pulse-ring scale-110 border-hz-400 bg-hz-400 text-coal-950" : "border-bone-100/70 bg-coal-950/60 text-bone-100 backdrop-blur-sm hover:scale-110 hover:border-hz-300",
                    )}
                  >
                    +
                  </span>
                </button>
              ))}
              <span className="absolute bottom-3 left-3 bg-coal-950/85 px-3 py-1.5 font-cond text-[11px] font-semibold uppercase tracking-[0.22em] text-steel-300">
                Rolo vibratório — sistemas atendidos
              </span>
            </div>
          </Reveal>
          <Reveal variant="right" delay={120} className="lg:col-span-2">
            <div className="border border-line-dark bg-coal-950 p-7">
              <p className="font-cond text-[12px] font-bold uppercase tracking-[0.26em] text-hz-300">Sistema ativo</p>
              <h3 className="mt-2 font-display text-3xl uppercase leading-tight">{spot.title}</h3>
              <ul className="mt-5 space-y-3">
                {spot.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-[15px] leading-relaxed text-steel-200">
                    <span className="mt-[9px] h-[2px] w-4 shrink-0 bg-hz-400" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap gap-2 border-t border-line-dark pt-5">
                {SPOTS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActive(s.id)}
                    className={cx("px-3 py-1.5 font-cond text-[12px] font-bold uppercase tracking-[0.14em] transition-colors", active === s.id ? "bg-hz-400 text-coal-950" : "border border-line-dark text-steel-300 hover:border-hz-400 hover:text-hz-300")}
                  >
                    {s.title.split(" ")[0]}
                  </button>
                ))}
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Btn to="/pecas" tone="hz" className="flex-1">Ver peças</Btn>
                <Btn href={waLink(BUSINESS.whatsapp, "Olá! Preciso de peças para o sistema de vibração do meu rolo.")} tone="outline" className="flex-1">
                  <IcWhatsApp size={16} /> WhatsApp
                </Btn>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ProductStrip() {
  const strip = [IMG.p4, IMG.p5, IMG.p6, IMG.p7, IMG.p13, IMG.p17, IMG.p19, IMG.p20, IMG.p21, IMG.p22, IMG.p23, IMG.p24];
  return (
    <section className="border-b border-line-dark bg-bone-100 py-20 text-coal-950" aria-label="Linha de produtos">
      <div className="mx-auto max-w-(--container-site) px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Reveal><Kicker tone="steel">Balcão aberto</Kicker></Reveal>
            <Reveal delay={80}>
              <h2 className="mt-4 font-display text-[clamp(2rem,5.5vw,3.6rem)] uppercase leading-[0.98]">
                Peça boa se mostra <span className="text-hz-600">de perto</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-coal-600">
                Alguns dos itens que passam pelo nosso balcão todos os dias — fotografados no estoque, sem maquiagem.
              </p>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <Btn to="/pecas" tone="outlineDark" size="lg">Catálogo completo <IcArrow size={16} /></Btn>
          </Reveal>
        </div>
      </div>
      <div className="mt-12 overflow-hidden">
        <div className="animate-marquee flex w-max gap-4 px-6" aria-hidden="true">
          {[...strip, ...strip].map((img, i) => (
            <div key={i} className="h-44 w-60 shrink-0 border border-line-light bg-white p-3 shadow-card transition-transform duration-300 hover:-translate-y-1">
              <img src={img} alt="" loading="lazy" className="h-full w-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section className="border-b border-line-dark bg-coal-950 py-24 md:py-32">
      <div className="mx-auto max-w-(--container-site) px-6">
        <SectionHead
          kicker="Por que a Lusomaq"
          title={<>Quem tem rolo parado <span className="text-hz-400">não pode esperar</span></>}
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: IcTractor, tone: "hz" as const, t: "Entrega rápida", d: "Estrutura logística própria e parceria com todas as transportadoras — distribuição para todo o Brasil." },
            { icon: IcShield, tone: "agri" as const, t: "Peças originais", d: "Das melhores marcas do mercado, com procedência conferida e nota fiscal." },
            { icon: IcEngine, tone: "safety" as const, t: "Conhecimento técnico", d: "Time que conhece rolo por dentro: esclarece a dúvida e indica a melhor solução, não só a mais cara." },
            { icon: IcWrench, tone: "steel" as const, t: "Atendimento personalizado", d: "Trabalhamos em parceria com você para buscar a solução que fecha a conta do seu negócio." },
          ].map((s, i) => {
            const Icon = s.icon;
            const toneText = s.tone === "agri" ? "text-agri-300" : s.tone === "safety" ? "text-safety-400" : s.tone === "steel" ? "text-steel-300" : "text-hz-300";
            return (
              <Reveal key={s.t} delay={i * 90}>
                <div className="group h-full border border-line-dark bg-coal-900 p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-steel-500 hover:shadow-plate">
                  <span className={cx("font-display text-5xl text-coal-600 transition-colors duration-300 group-hover:text-hz-400")}>0{i + 1}</span>
                  <Icon size={30} className={cx("mt-5 transition-colors", toneText)} />
                  <h3 className="mt-4 font-display text-2xl uppercase leading-tight">{s.t}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-steel-300">{s.d}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StatsBand() {
  const stats = BUSINESS.stats;
  return (
    <section className="border-b border-line-dark bg-coal-900" aria-label="Números da empresa">
      <div className="mx-auto grid max-w-(--container-site) grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={cx("border-line-dark px-6 py-10 md:py-14", i % 2 === 0 && "border-r", i < 2 && "border-b lg:border-b-0", i === 1 && "lg:border-r")}>
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
          {availableCount()} itens do catálogo online agora — o estoque físico tem muito mais
        </p>
      </div>
    </section>
  );
}

function BrandsBand() {
  const list = [...BUSINESS.partBrands, ...BUSINESS.partBrands];
  const rollers = [...BUSINESS.rollerBrands, ...BUSINESS.rollerBrands];
  return (
    <section className="overflow-hidden border-b border-line-dark bg-coal-950 py-16" aria-label="Marcas trabalhadas">
      <p className="mb-7 text-center font-cond text-[13px] font-semibold uppercase tracking-[0.3em] text-steel-400">Marcas de peças & motores</p>
      <div className="animate-marquee flex w-max items-center gap-12" aria-hidden="true">
        {list.map((b, i) => (
          <span key={`${b}-${i}`} className="flex items-center gap-12">
            <span className="font-display text-4xl uppercase text-steel-500 transition-colors duration-300 hover:text-hz-300">{b}</span>
            <span className="h-2 w-2 rotate-45 bg-hz-400/50" />
          </span>
        ))}
      </div>
      <p className="mb-7 mt-12 text-center font-cond text-[13px] font-semibold uppercase tracking-[0.3em] text-steel-400">Rolos compactadores atendidos</p>
      <div className="animate-marquee flex w-max items-center gap-12" style={{ animationDirection: "reverse" }} aria-hidden="true">
        {rollers.map((b, i) => (
          <span key={`${b}-${i}`} className="flex items-center gap-12">
            <span className="font-display text-5xl uppercase text-coal-600 transition-colors duration-300 hover:text-hz-300">{b}</span>
            <span className="h-2 w-2 rotate-45 bg-safety-500/50" />
          </span>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  const ctaRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  useParallax(ctaRef, bgRef, -12, 12);

  return (
    <section ref={ctaRef} className="relative overflow-hidden">
      <img ref={bgRef} src={IMG.road} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-[124%] w-full object-cover will-change-transform" />
      <div className="absolute inset-0 bg-coal-950/80" aria-hidden="true" />
      <HazardStrip className="relative" />
      <div className="relative mx-auto max-w-(--container-site) px-6 py-28 text-center md:py-40">
        <Reveal><Kicker tone="steel">{BUSINESS.slogan}</Kicker></Reveal>
        <Reveal delay={100}>
          <h2 className="mx-auto mt-6 max-w-4xl font-display text-[clamp(2.4rem,7vw,5.2rem)] uppercase leading-[0.92] text-shadow-hard">
            Seu rolo não pode parar. <span className="text-hz-400">A peça está aqui.</span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Btn to="/pecas" size="lg" tone="hz">Ver estoque <IcArrow size={17} /></Btn>
            <Btn href={waLink(BUSINESS.whatsapp, generalMessage())} size="lg" tone="outline"><IcWhatsApp size={17} /> Solicitar orçamento</Btn>
          </div>
        </Reveal>
        <Reveal delay={280}>
          <p className="mt-8 font-cond text-[13px] font-semibold uppercase tracking-[0.22em] text-steel-300">
            {BUSINESS.address.street} · {BUSINESS.address.city}/{BUSINESS.address.state}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta(
    "Lusomaq — Peças para Rolos Compactadores desde 1988 | São Paulo",
    "Peças originais e compatíveis para rolos compactadores Dynapac, Muller, Hamm, Tema-Terra, Caterpillar e Bomag. Mais de 30.000 itens em estoque com entrega rápida para todo o Brasil. Solicite seu orçamento.",
  );

  return (
    <>
      <Hero />
      <MarqueeBand />
      <StorySection />
      <Highlights />
      <CategoryTiles />
      <Applications />
      <HotspotSection />
      <ProductStrip />
      <ServicesSection />
      <StatsBand />
      <BrandsBand />
      <FinalCta />
    </>
  );
}
