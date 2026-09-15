import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { business, priceOf } from "../config/business";
import { brl, openStatus, Reveal, track, usePageMeta, whatsLink } from "../lib/core";
import { Btn, ProductArt, SectionHead } from "../components/ui";
import { TrustStrip } from "../components/chrome";
import { ProductCard } from "../components/ProductCard";
import {
  IArrow, IBath, ICalendar, ICat, IChevron, IClock, IDrop, IPaw, IPin,
  ISparkle, IStar, ITruck, IWhatsApp, IBall, IBone, IKibble, IBed, ICollar, IRefresh, IHeart,
} from "../components/icons";
import { PawMark } from "../components/icons";

const P = business.branding.photos;

/* ---------- pegadas de scroll ---------- */
function PawTrail({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`} aria-hidden>
      {[0, 1, 2].map((i) => (
        <PawMark key={i} className={`w-4 h-4 text-cream/85 paw-step ${i % 2 ? "translate-x-2 -rotate-12" : "-translate-x-2 rotate-12"}`} style={{ animationDelay: `${i * 0.55}s` }} />
      ))}
    </div>
  );
}

/* ---------- bolhas ---------- */
function Bubbles({ count = 16 }: { count?: number }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 61) % 100}%`,
        size: 8 + ((i * 13) % 26),
        dur: `${11 + ((i * 7) % 12)}s`,
        delay: `${(i * 1.7) % 12}s`,
        op: 0.25 + ((i * 11) % 40) / 100,
      })),
    [count]
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {bubbles.map((b, i) => (
        <span key={i} className="bubble" style={{ left: b.left, width: b.size, height: b.size, "--b-dur": b.dur, "--b-delay": b.delay, "--b-op": b.op } as React.CSSProperties} />
      ))}
    </div>
  );
}

/* ---------- storytelling sticky ---------- */
const STORY = [
  { key: "chegada", title: "Chegada", text: "Recepção com carinho, checagem das anotações do seu pet e aquele tempo para ele se ambientar sem pressa.", img: P.care, tag: "08:00" },
  { key: "banho", title: "Banho", text: "Água morna, shampoo escolhido para o tipo de pelagem e massagem que relaxa até o mais agitado.", img: P.bath, tag: "08:40" },
  { key: "secagem", title: "Secagem", text: "Secagem cuidadosa com controle de temperatura, escovação e desembaraço completos.", img: P.dry, tag: "09:30" },
  { key: "tosa", title: "Tosa & acabamento", text: "Tosa no estilo combinado, acabamento de patas, ouvidos e unhas — sempre no ritmo do pet.", img: P.hero, tag: "10:10" },
  { key: "perfume", title: "Perfume da casa", text: "A colônia assinatura de algodão, laço ou gravatinha e uma sessão de fotos para mandar pra você.", img: P.after, tag: "11:00" },
  { key: "casa", title: "De volta pra casa", text: "Você recebe o aviso na hora, e ele volta cheiroso, leve e pronto para o sofá.", img: P.play, tag: "11:30" },
];

function GroomingStory() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            setActive(idx);
          }
        });
      },
      { threshold: 0.55 }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="banho-e-tosa" className="relative bg-leaf-deep text-cream overflow-hidden">
      <Bubbles count={18} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <Reveal>
          <SectionHead
            light
            eyebrow="Banho & tosa"
            title={<>Um dia de spa, <span className="font-accent italic font-normal text-mint">do começo ao fim.</span></>}
            desc="Acompanhe o ritual completo. Sem gaiolas, sem pressa e com envio de fotos quando ele estiver pronto."
          />
        </Reveal>

        <div className="mt-14 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* fotos sticky */}
          <div className="hidden lg:block sticky top-24 h-[560px]">
            <div className="relative h-full rounded-[28px] rounded-bl-[8px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]">
              {STORY.map((s, i) => (
                <img
                  key={s.key} src={s.img} alt={s.title} loading="lazy"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${i === active ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]"}`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" aria-hidden />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                <p className="font-display font-bold text-xl">{STORY[active].title}</p>
                <span className="font-display font-bold text-[12px] bg-cream/90 text-bark rounded-full px-3 py-1.5">{STORY[active].tag}</span>
              </div>
            </div>
            {/* trilha de pegadas */}
            <div className="absolute -right-8 top-8 bottom-8 hidden xl:block" aria-hidden>
              <div className="h-full flex flex-col justify-between items-center">
                {STORY.map((_, i) => (
                  <PawMark key={i} className={`w-5 h-5 transition-all duration-500 ${i <= active ? "text-brand opacity-90" : "text-cream/25"} ${i % 2 ? "translate-x-2 rotate-12" : "-translate-x-2 -rotate-12"}`} />
                ))}
              </div>
            </div>
          </div>

          {/* passos */}
          <div className="relative">
            {/* linha do tempo mobile */}
            <div className="lg:hidden mb-6 flex gap-1.5" aria-hidden>
              {STORY.map((_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i === active ? "bg-brand" : "bg-cream/20"}`} />
              ))}
            </div>
            <div className="lg:hidden relative h-[300px] mb-8 rounded-[24px] overflow-hidden">
              {STORY.map((s, i) => (
                <img key={s.key} src={s.img} alt={s.title} loading="lazy" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === active ? "opacity-100" : "opacity-0"}`} />
              ))}
            </div>

            {STORY.map((s, i) => (
              <div
                key={s.key}
                data-idx={i}
                ref={(el) => { refs.current[i] = el; }}
                className={`py-8 lg:py-12 border-b border-cream/12 last:border-0 transition-all duration-500 ${i === active ? "opacity-100 translate-x-0" : "lg:opacity-40"}`}
              >
                <div className="flex items-baseline gap-4">
                  <span className={`font-display font-extrabold text-[13px] tracking-[0.2em] ${i === active ? "text-brand" : "text-cream/40"}`}>0{i + 1}</span>
                  <div>
                    <h3 className="font-display font-bold text-2xl md:text-[27px]">{s.title}</h3>
                    <p className="mt-2.5 text-cream/75 text-[15px] leading-relaxed max-w-md">{s.text}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-8 flex flex-wrap gap-3">
              <Btn to="/agendamento" size="lg"><ICalendar size={18} /> Agendar banho e tosa</Btn>
              <Btn to="/servicos" variant="light" size="lg">Ver serviços e valores</Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- antes / depois ---------- */
function BeforeAfter() {
  const [pos, setPos] = useState(52);
  return (
    <div className="relative rounded-[28px] rounded-bl-[8px] overflow-hidden select-none shadow-[0_30px_60px_-25px_rgba(91,64,52,0.45)] aspect-[4/5] sm:aspect-[5/4] lg:aspect-auto lg:h-[520px]">
      <img src={P.after} alt="Depois do banho e tosa" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} aria-hidden>
        <img src={P.before} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      </div>
      {/* divisor */}
      <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${pos}%` }} aria-hidden>
        <div className="absolute inset-y-0 -left-px w-[3px] bg-cream shadow-lg" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-cream grid place-items-center shadow-xl">
          <IChevron size={14} className="rotate-180 text-bark" />
          <IChevron size={14} className="text-bark -ml-2" />
        </div>
      </div>
      <span className="absolute top-4 left-4 font-display font-bold text-[11px] uppercase tracking-[0.18em] bg-ink/70 text-cream rounded-full px-3 py-1.5">Antes</span>
      <span className="absolute top-4 right-4 font-display font-bold text-[11px] uppercase tracking-[0.18em] bg-brand text-white rounded-full px-3 py-1.5">Depois</span>
      <input
        type="range" min={2} max={98} value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="ba-handle"
        aria-label="Comparar antes e depois"
      />
    </div>
  );
}

/* ================= HOME ================= */
export default function Home() {
  usePageMeta(
    `${business.name} · Banho & Tosa, Produtos e Delivery em São Paulo`,
    business.subheadline
  );
  const status = openStatus();
  const loc = business.locations[0];
  const bestSellers = business.products.filter((p) => p.tags.includes("mais-vendidos")).slice(0, 4);
  const offers = business.products.filter((p) => p.promotionalPrice).slice(0, 4);
  const gallery = [
    { img: P.care, label: "Carinho em primeiro lugar" },
    { img: P.bath, label: "Dia de banho" },
    { img: P.play, label: "Recreio garantido" },
    { img: P.cat, label: "Clientes felinos" },
    { img: P.after, label: "Prontos para o sofá" },
    { img: P.store, label: "Nossa casa" },
  ];
  const catIcons: Record<string, React.ReactNode> = {
    kibble: <IKibble size={22} />, treat: <IBone size={22} />, ball: <IBall size={22} />,
    drop: <IDrop size={22} />, bed: <IBed size={22} />, collar: <ICollar size={22} />, cat: <ICat size={22} />,
  };

  return (
    <main>
      {/* ============ 01 · HERO CINEMATOGRÁFICO ============ */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <img src={P.hero} alt="" className="kenburns w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(47,40,37,0.82)_0%,rgba(47,40,37,0.45)_45%,rgba(47,40,37,0.08)_75%)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-cream to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full pt-32 pb-20 md:pb-24">
          <Reveal>
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-display font-bold ${status.open ? "bg-mint/95 text-leaf-deep" : "bg-cream/90 text-bark"}`}>
                <span className={`w-2 h-2 rounded-full ${status.open ? "bg-leaf animate-pulse motion-reduce:animate-none" : "bg-coral"}`} aria-hidden />
                {status.label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/90 px-3.5 py-1.5 text-[12px] font-display font-bold text-bark">
                <IStar size={13} className="text-brand" /> 4.9 · 620+ avaliações
              </span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="font-display font-extrabold text-cream display-tight text-[clamp(2.6rem,7.2vw,5.2rem)] max-w-3xl">
              {business.headline}{" "}
              <span className="font-accent italic font-normal text-brand">{business.headlineAccent}</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mt-5 text-cream/85 text-[16.5px] md:text-lg max-w-xl leading-relaxed">{business.subheadline}</p>
          </Reveal>
          <Reveal delay={360}>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Btn to="/agendamento" size="lg"><ICalendar size={18} /> Agendar banho e tosa</Btn>
              <Btn to="/produtos" variant="light" size="lg">Comprar agora <IArrow size={16} /></Btn>
              <a
                href={whatsLink(business.contact.whatsapp, "Olá! Vim pelo site e quero saber mais.")}
                target="_blank" rel="noreferrer"
                onClick={() => track("click_whatsapp", { from: "hero" })}
                className="inline-flex items-center gap-2 font-display font-bold text-cream text-[14.5px] px-4 py-2 rounded-full hover:bg-cream/12 transition-colors"
              >
                <IWhatsApp size={19} className="text-mint" /> Falar no WhatsApp
              </a>
            </div>
          </Reveal>
          <Reveal delay={480}>
            <div className="mt-12"><TrustStrip light /></div>
          </Reveal>
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:block" aria-hidden>
          <PawTrail />
        </div>
      </section>

      {/* ============ 02 · MARQUEE ============ */}
      <div className="marquee bg-bark text-cream py-3.5 overflow-hidden" aria-hidden>
        <div className="marquee-track">
          {[0, 1].map((n) => (
            <div key={n} className="flex items-center shrink-0">
              {["Banho & tosa com hora marcada", "Delivery no mesmo dia", "Clube Pet de vantagens", "Tosa de gatos com especialista", "Retire na loja", "Fotos do seu pet pronto"].map((t) => (
                <span key={t} className="flex items-center gap-6 pr-6 font-display font-semibold text-[13.5px] tracking-wide">
                  {t} <PawMark className="w-3.5 h-3.5 text-brand" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============ 03 · CATEGORIAS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 md:pt-24">
        <Reveal className="flex items-end justify-between gap-6">
          <SectionHead eyebrow="Para cada necessidade" title={<>O que você procura <span className="font-accent italic font-normal text-brand-deep">hoje?</span></>} />
          <Link to="/produtos" className="hidden sm:inline-flex items-center gap-2 font-display font-bold text-sm text-bark hover:text-brand-deep transition-colors shrink-0 mb-2">
            Ver catálogo completo <IArrow size={15} />
          </Link>
        </Reveal>
        <div className="mt-8 flex gap-3.5 overflow-x-auto no-bar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 lg:grid-cols-7">
          {business.categories.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60} className="shrink-0">
              <Link
                to={`/categoria/${c.slug}`}
                className="group flex flex-col items-center gap-3 bg-white border border-line rounded-[20px] rounded-bl-[6px] px-4 py-5 w-[120px] sm:w-auto transition-all duration-300 hover:-translate-y-1.5 hover:border-brand hover:shadow-[0_18px_36px_-16px_rgba(231,136,74,0.45)]"
              >
                <span className={`w-12 h-12 grid place-items-center rounded-full text-bark transition-colors duration-300 group-hover:bg-brand group-hover:text-white ${c.tint === "mint" ? "bg-mint/70" : "bg-sand"}`}>
                  {catIcons[c.icon]}
                </span>
                <span className="font-display font-semibold text-[13px] text-ink text-center leading-tight">{c.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ 04 · DESTAQUES ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 md:pt-24">
        <Reveal className="flex items-end justify-between gap-6">
          <SectionHead eyebrow="Os queridinhos" title={<>Mais vendidos <span className="font-accent italic font-normal text-brand-deep">da casa</span></>} desc="O que os tutores daqui levam de olhos fechados — aprovado por focinhos exigentes." />
          <Link to="/produtos" className="hidden sm:inline-flex items-center gap-2 font-display font-bold text-sm text-bark hover:text-brand-deep transition-colors shrink-0 mb-2">
            Ver todos <IArrow size={15} />
          </Link>
        </Reveal>
        <div className="mt-9 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {bestSellers.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}><ProductCard product={p} /></Reveal>
          ))}
        </div>
      </section>

      {/* ============ 05 · STORYTELLING BANHO & TOSA ============ */}
      <div className="mt-20 md:mt-28"><GroomingStory /></div>

      {/* ============ 06 · ANTES / DEPOIS + AGENDAMENTO ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 md:pt-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <Reveal><BeforeAfter /></Reveal>
          <div>
            <Reveal>
              <SectionHead
                eyebrow="Resultado de verdade"
                title={<>Arraste e veja a <span className="font-accent italic font-normal text-brand-deep">mágica</span> acontecer.</>}
                desc="Fotos reais de clientes da casa, com autorização dos tutores. Agendar é simples: escolha o pet, o serviço e o horário — a gente cuida do resto."
              />
            </Reveal>
            <Reveal delay={150}>
              <ol className="mt-8 grid gap-4">
                {[
                  { n: "1", t: "Escolha o pet", d: "Use um perfil salvo ou cadastre em segundos." },
                  { n: "2", t: "Serviço e horário", d: "Agenda em tempo real com os horários livres." },
                  { n: "3", t: "Acompanhe", d: "Você recebe aviso quando ele estiver pronto e cheiroso." },
                ].map((s) => (
                  <li key={s.n} className="flex gap-4 items-start">
                    <span className="w-9 h-9 shrink-0 grid place-items-center rounded-full bg-brand text-white font-display font-extrabold text-sm">{s.n}</span>
                    <div>
                      <p className="font-display font-bold text-ink">{s.t}</p>
                      <p className="text-fog text-[14px]">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Btn to="/agendamento" size="lg"><ICalendar size={18} /> Agendar agora</Btn>
                <Btn to="/meu-pet" variant="outline" size="lg"><IPaw size={18} /> Cadastrar meu pet</Btn>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 07 · OFERTAS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 md:pt-28">
        <Reveal className="flex items-end justify-between gap-6">
          <SectionHead eyebrow="Só essa semana" title={<>Ofertas com <span className="font-accent italic font-normal text-brand-deep">estoque contado</span></>} />
          <Link to="/produtos?tag=ofertas" className="hidden sm:inline-flex items-center gap-2 font-display font-bold text-sm text-bark hover:text-brand-deep transition-colors shrink-0 mb-2">
            Todas as ofertas <IArrow size={15} />
          </Link>
        </Reveal>
        <div className="mt-9 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {offers.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}><ProductCard product={p} /></Reveal>
          ))}
        </div>
      </section>

      {/* ============ 08 · ASSINATURA / RECOMPRA ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 md:pt-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] rounded-bl-[8px] bg-sand px-6 sm:px-12 py-12 md:py-16">
            <PawMark className="absolute -right-8 -top-8 w-52 h-52 text-sand-deep/60 rotate-12" />
            <PawMark className="absolute right-24 -bottom-10 w-36 h-36 text-sand-deep/50 -rotate-12" />
            <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-brand inline-block" aria-hidden /> Entrega recorrente</p>
                <h2 className="font-display font-extrabold display-tight text-[clamp(1.6rem,3.6vw,2.6rem)] text-ink mt-3">
                  A ração acaba. <span className="font-accent italic font-normal text-brand-deep">A reposição, não.</span>
                </h2>
                <p className="mt-4 text-fog text-[15.5px] leading-relaxed max-w-lg">
                  Assine ração, areia, tapete higiênico e petiscos com a frequência que fizer sentido — a cada 15, 30 ou 45 dias. Você pausa ou cancela quando quiser, direto pelo WhatsApp.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Btn to="/produtos?assinatura=1"><IRefresh size={17} /> Ver produtos assináveis</Btn>
                  <Btn to="/meus-pedidos" variant="outline">Minhas recompras</Btn>
                </div>
              </div>
              <div className="bg-white rounded-[22px] rounded-bl-[6px] p-6 shadow-[0_24px_50px_-24px_rgba(91,64,52,0.4)]">
                <p className="font-display font-bold text-ink text-[15px]">Exemplo de assinatura</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[14px] bg-sand grid place-items-center shrink-0">
                    <ProductArt kind="kibble-bag" className="w-13 max-w-[52px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-ink text-sm truncate">Ração Primus Frango & Arroz 15 kg</p>
                    <p className="text-[12.5px] text-fog">A cada 30 dias · {brl(priceOf(business.products[0], "v15"))}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {["15 dias", "30 dias", "45 dias"].map((f, i) => (
                    <span key={f} className={`rounded-full py-2 text-[12px] font-display font-bold ${i === 1 ? "bg-brand text-white" : "bg-sand/70 text-bark"}`}>{f}</span>
                  ))}
                </div>
                <p className="mt-4 text-[12px] text-fog flex items-center gap-1.5"><IHeart size={13} className="text-coral" /> Sem fidelidade. Cancele quando quiser.</p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ 09 · CUIDADOS & DICAS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 md:pt-28">
        <Reveal>
          <SectionHead eyebrow="Cuidados & dicas" title={<>Conteúdo de quem <span className="font-accent italic font-normal text-brand-deep">vive isso todo dia</span></>} desc="Guias rápidos da nossa equipe para o dia a dia. Para questões de saúde, procure sempre um médico-veterinário." />
        </Reveal>
        <div className="mt-9 grid md:grid-cols-2 gap-5">
          {business.articles.map((a, i) => (
            <Reveal key={a.slug} delay={i * 80}>
              <article className={`group relative overflow-hidden rounded-[24px] rounded-bl-[6px] bg-bark ${i === 0 ? "md:row-span-2 min-h-[320px] md:min-h-full" : "min-h-[210px]"}`}>
                <img src={a.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" aria-hidden />
                <div className="relative h-full flex flex-col justify-end p-6 min-h-[210px]">
                  <span className="self-start mb-3 inline-flex items-center gap-1.5 bg-cream/90 text-bark text-[10.5px] font-display font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <ISparkle size={11} className="text-brand" /> {a.tag} · {a.minutes} min
                  </span>
                  <h3 className={`font-display font-bold text-cream ${i === 0 ? "text-2xl md:text-[28px]" : "text-lg"}`}>{a.title}</h3>
                  {i === 0 && <p className="mt-2 text-cream/75 text-[14.5px] max-w-md">{a.excerpt}</p>}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ 10 · AVALIAÇÕES ============ */}
      <section className="pt-20 md:pt-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal>
            <SectionHead align="center" eyebrow="Prova social" title={<>Quem ama, <span className="font-accent italic font-normal text-brand-deep">recomenda.</span></>} desc="Avaliações reais deixadas por clientes da loja." />
          </Reveal>
        </div>
        <div className="marquee mt-10" aria-label="Avaliações de clientes">
          <div className="marquee-track gap-5 px-4">
            {[0, 1].map((n) => (
              <div key={n} className="flex gap-5 shrink-0">
                {business.reviews.map((r, i) => (
                  <figure key={`${n}-${i}`} className="w-[300px] sm:w-[360px] bg-white border border-line rounded-[22px] rounded-bl-[6px] p-6 flex flex-col">
                    <div className="flex gap-1 text-brand" aria-label={`${r.rating} de 5 estrelas`}>
                      {Array.from({ length: r.rating }).map((_, s) => <IStar key={s} size={15} />)}
                    </div>
                    <blockquote className="mt-3.5 text-ink text-[14.5px] leading-relaxed flex-1">“{r.text}”</blockquote>
                    <figcaption className="mt-5 pt-4 border-t border-line flex items-center justify-between">
                      <div>
                        <p className="font-display font-bold text-ink text-sm">{r.name}</p>
                        <p className="text-[12px] text-fog">tutora de {r.pet}</p>
                      </div>
                      <span className="text-[10.5px] font-display font-bold uppercase tracking-wider bg-sand text-bark rounded-full px-2.5 py-1">{r.service}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 11 · INSTAGRAM / GALERIA ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 md:pt-28">
        <Reveal className="flex items-end justify-between gap-6">
          <SectionHead eyebrow={business.contact.instagram} title={<>Eles também <span className="font-accent italic font-normal text-brand-deep">passam por aqui</span></>} />
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hidden sm:inline-flex items-center gap-2 font-display font-bold text-sm text-bark hover:text-brand-deep transition-colors shrink-0 mb-2">
            Seguir <IArrow size={15} />
          </a>
        </Reveal>
        <div className="mt-9 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {gallery.map((g, i) => (
            <Reveal key={g.label} delay={i * 60}>
              <figure className="group relative aspect-square overflow-hidden rounded-[20px] rounded-bl-[6px]">
                <img src={g.img} alt={g.label} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" />
                <figcaption className="absolute inset-0 bg-bark/0 group-hover:bg-bark/45 transition-colors duration-400 grid place-items-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0 text-cream font-display font-bold text-sm flex items-center gap-2">
                    <IHeart size={15} /> {g.label}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ 12 · DELIVERY + LOCALIZAÇÃO ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 md:mt-28">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="relative">
              <div className="rounded-[28px] rounded-bl-[8px] overflow-hidden shadow-[0_30px_60px_-25px_rgba(91,64,52,0.45)]">
                <img src={P.play} alt="Cachorro feliz correndo com bolinha" loading="lazy" className="w-full aspect-[4/3] object-cover" />
              </div>
              <div className="absolute -bottom-5 -right-3 sm:right-6 bg-white rounded-[18px] rounded-bl-[6px] shadow-xl px-5 py-3.5 flex items-center gap-3">
                <span className="w-10 h-10 grid place-items-center rounded-full bg-mint text-leaf-deep"><ITruck size={19} /></span>
                <div>
                  <p className="font-display font-extrabold text-ink text-sm">Entrega em até 3h</p>
                  <p className="text-[12px] text-fog">Zona Oeste · grátis acima de {brl(business.delivery.freeAbove)}</p>
                </div>
              </div>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <SectionHead
                eyebrow="Delivery & retirada"
                title={<>Chega rapidinho. <span className="font-accent italic font-normal text-brand-deep">Ou passa aqui.</span></>}
                desc={business.delivery.note}
              />
            </Reveal>
            <Reveal delay={150}>
              <div className="mt-7 bg-white border border-line rounded-[22px] rounded-bl-[6px] p-6">
                <div className="flex items-start gap-4">
                  <span className="w-11 h-11 shrink-0 grid place-items-center rounded-full bg-sand text-bark"><IPin size={20} /></span>
                  <div>
                    <p className="font-display font-bold text-ink">{loc.name}</p>
                    <p className="text-fog text-[14px] mt-0.5">{loc.address} · {loc.district} — {loc.city}</p>
                    <p className="text-[13px] text-fog mt-1.5 flex items-center gap-1.5"><IClock size={14} className="text-brand" /> {status.label}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Btn to="/localizacao" variant="bark"><IPin size={16} /> Ver localização</Btn>
                  <a href={loc.mapsUrl} target="_blank" rel="noreferrer" onClick={() => track("view_location", {})} className="inline-flex items-center gap-2 font-display font-bold text-sm text-brand-deep hover:text-brand px-2 transition-colors">
                    Traçar rota <IArrow size={14} />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 13 · CTA FINAL ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 md:pt-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] rounded-bl-[8px] bg-bark text-cream px-6 sm:px-14 py-14 md:py-20">
            <img src={P.dry} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-25" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-r from-bark via-bark/80 to-bark/30" aria-hidden />
            <div className="relative max-w-xl">
              <p className="eyebrow text-brand">Bora começar?</p>
              <h2 className="font-display font-extrabold display-tight text-[clamp(1.8rem,4.4vw,3.2rem)] mt-3 text-cream">
                Ele já fez tanto por você. <span className="font-accent italic font-normal text-brand">Retribua hoje.</span>
              </h2>
              <p className="mt-4 text-cream/75 text-[15.5px]">Agende um banho, monte o carrinho ou só mande um oi. A gente responde rápido.</p>
              <div className="mt-8 flex flex-wrap gap-3.5">
                <Btn to="/agendamento" size="lg"><IBath size={18} /> Agendar banho e tosa</Btn>
                <Btn to="/produtos" variant="light" size="lg"><IBag2 /> Comprar produtos</Btn>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

function IBag2() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 8.5h14l-1 11a2 2 0 0 1-2 1.8H8a2 2 0 0 1-2-1.8l-1-11Z" />
      <path d="M8.5 11V7a3.5 3.5 0 0 1 7 0v4" />
    </svg>
  );
}
