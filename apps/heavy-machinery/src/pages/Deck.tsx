import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BUSINESS } from "../config/business";
import { availableCount, featuredMachines, MACHINES, machineBySlug, IMG } from "../data/machines";
import type { Machine } from "../data/machines";
import { cx, formatBRL, formatNum, machineMessage, usePageMeta } from "../lib/utils";
import { IcArrow, IcCheck, IcChevronL, IcChevronR, IcDoc, IcPin, IcWhatsApp } from "../components/ui";

/* constantes de projeto do slide — 1600×1131 = proporção exata do A4 paisagem */
const W = 1600;
const H = 1131;

const SLIDES: { id: string; label: string }[] = [
  { id: "capa", label: "Capa" },
  { id: "resumo", label: "Resumo executivo" },
  { id: "home-hero", label: "Página · Home (abertura)" },
  { id: "home-destaques", label: "Página · Narrativa & destaques" },
  { id: "catalogo", label: "Página · Catálogo de peças" },
  { id: "detalhe", label: "Página · Ficha da peça" },
  { id: "anatomia", label: "Página · Anatomia & aplicações" },
  { id: "marcas", label: "Página · Marcas" },
  { id: "empresa", label: "Página · A empresa" },
  { id: "conversao", label: "Página · Conversão & equipe" },
  { id: "contato", label: "Página · Contato" },
  { id: "qualidade", label: "Qualidade & próximos passos" },
];

function useDeckScale() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, scale };
}

function Slide({
  id,
  page,
  label,
  children,
  scale,
  wide = false,
}: {
  id: string;
  page: number;
  label: string;
  children: ReactNode;
  scale: number;
  wide?: boolean;
}) {
  return (
    <div className="deck-outer mx-auto w-full" style={{ maxWidth: wide ? 1400 : 1240, height: H * scale + 48 }}>
      <div
        id={id}
        data-deck-slide
        className="deck-slide relative flex flex-col overflow-hidden bg-coal-900"
        style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <div className="relative flex-1 overflow-hidden">{children}</div>
        {/* rodapé de documento — impresso em cada página */}
        <div className="relative z-20 flex h-[64px] shrink-0 items-center justify-between border-t border-line-dark bg-coal-950 px-12">
          <div className="flex items-center gap-4">
            <span className="hazard-thin inline-block h-3 w-14" aria-hidden="true" />
            <span className="font-cond text-[19px] font-bold uppercase tracking-[0.22em] text-bone-100">
              {BUSINESS.name} — Proposta comercial
            </span>
          </div>
          <span className="font-cond text-[17px] font-semibold uppercase tracking-[0.24em] text-steel-400">{label}</span>
          <span className="font-display text-[26px] tracking-wide text-hz-400">
            {String(page).padStart(2, "0")} <span className="text-steel-500">/ {SLIDES.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function SlideTag({ children, tone = "hz" }: { children: ReactNode; tone?: "hz" | "steel" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-3 px-4 py-2 font-cond text-[19px] font-bold uppercase tracking-[0.26em]",
        tone === "hz" ? "bg-hz-400 text-coal-950" : "border border-line-dark text-steel-300",
      )}
    >
      {children}
    </span>
  );
}

function BrowserBar({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-4 border-b border-line-dark bg-coal-950 px-6 py-3.5">
      <span className="flex gap-2" aria-hidden="true">
        <span className="h-3.5 w-3.5 rounded-full bg-safety-500" />
        <span className="h-3.5 w-3.5 rounded-full bg-hz-400" />
        <span className="h-3.5 w-3.5 rounded-full bg-agri-400" />
      </span>
      <span className="flex-1 border border-line-dark bg-coal-800 px-5 py-2 font-cond text-[19px] font-semibold tracking-[0.14em] text-steel-300">
        {url}
      </span>
      <span className="font-cond text-[17px] font-bold uppercase tracking-[0.2em] text-agri-300">● ao vivo</span>
    </div>
  );
}

function DeckPartCard({ m }: { m: Machine }) {
  return (
    <div className="flex flex-col border border-line-dark bg-coal-950">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={m.images[0]} alt={m.model} loading="eager" decoding="sync" className="h-full w-full object-cover" />
        <span
          className={cx(
            "clip-cut-sm absolute left-3 top-3 px-2.5 py-1 font-cond text-[15px] font-bold uppercase tracking-[0.16em]",
            m.condition === "original" ? "bg-hz-400 text-coal-950" : "bg-coal-950/85 text-bone-100",
          )}
        >
          {m.condition === "original" ? "Original" : "Compatível"}
        </span>
        <span className="absolute bottom-3 left-3 bg-coal-950/90 px-2.5 py-1 font-cond text-[15px] font-bold tracking-[0.12em] text-hz-300">
          {m.price ? formatBRL(m.price) : "Sob consulta"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-cond text-[15px] font-semibold uppercase tracking-[0.2em] text-steel-400">
          {m.brand} · {m.code}
        </p>
        <p className="mt-1 font-display text-[26px] leading-tight uppercase text-bone-100">{m.model}</p>
        <p className="mt-1 line-clamp-1 text-[16px] text-steel-300">{m.application}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-cond text-[14px] font-bold uppercase tracking-[0.18em] text-agri-300">
            <IcWhatsApp size={15} className="mr-1 inline" /> Orçamento
          </span>
          <span className="font-cond text-[14px] font-semibold uppercase tracking-[0.14em] text-steel-500">{m.status === "disponivel" ? "Em estoque" : m.status}</span>
        </div>
      </div>
    </div>
  );
}

/* ============================= SLIDES ============================= */

function CoverSlide({ page, scale }: { page: number; scale: number }) {
  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  return (
    <Slide id="capa" page={page} label="Capa" scale={scale}>
      <img src={IMG.road} alt="" loading="eager" decoding="sync" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-coal-950/82" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-coal-950 via-coal-950/40 to-transparent" aria-hidden="true" />

      <div className="relative flex h-full flex-col px-20 py-16">
        <div className="flex items-start justify-between">
          <img src={IMG.logo} alt="Lusomaq" loading="eager" decoding="sync" className="h-[88px] w-auto object-contain" />
          <div className="text-right">
            <p className="font-cond text-[20px] font-bold uppercase tracking-[0.3em] text-hz-300">PROP-LMQ-001 · REV 01</p>
            <p className="mt-1 font-cond text-[18px] font-semibold uppercase tracking-[0.22em] text-steel-300">{today}</p>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-[1.15fr_0.85fr] items-end gap-10">
          <div>
            <p className="flex items-center gap-4 font-cond text-[22px] font-bold uppercase tracking-[0.3em] text-hz-300">
              <span className="h-[3px] w-12 bg-hz-400" aria-hidden="true" />
              Showroom digital · Catálogo de peças · Geração de leads
            </p>
            <h1 className="mt-6 font-display text-[148px] uppercase leading-[0.86] text-bone-100">
              Proposta<br />comercial
            </h1>
            <p className="mt-7 max-w-[620px] text-[26px] leading-snug text-bone-200/90">
              Plataforma digital da <strong className="text-hz-300">Lusomaq</strong> — peças para rolos compactadores,
              motores e equipamentos de pavimentação, terraplanagem e construção.
            </p>

            <dl className="mt-10 grid max-w-[640px] grid-cols-3 gap-6 border-t border-bone-100/15 pt-6">
              {[
                ["Preparada para", "LUSOMAQ"],
                ["Apresentação", today],
                ["Status", "Preview ao vivo"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-cond text-[16px] font-semibold uppercase tracking-[0.22em] text-steel-400">{k}</dt>
                  <dd className="mt-1 font-cond text-[22px] font-bold uppercase tracking-[0.1em] text-bone-100">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative pb-4">
            <img
              src={IMG.hero1}
              alt="Rolo compactador — arte oficial Lusomaq"
              loading="eager"
              decoding="sync"
              className="w-full object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.6)]"
              style={{ filter: "drop-shadow(0 30px 40px rgba(0,0,0,.6))" }}
            />
            <span className="absolute right-2 top-2 -rotate-6 border-2 border-hz-400 px-4 py-2 font-display text-[24px] uppercase tracking-[0.14em] text-hz-400">
              Preview ao vivo
            </span>
          </div>
        </div>
      </div>
      <div className="hazard absolute inset-x-0 bottom-0 z-10 h-4" aria-hidden="true" />
    </Slide>
  );
}

function SummarySlide({ page, scale }: { page: number; scale: number }) {
  const tiles: [string, string][] = [
    ["12", "páginas e rotas"],
    ["24", "itens de exemplo*"],
    ["23", "marcas de peças"],
    ["12", "marcas de rolos"],
    ["4", "canais de WhatsApp"],
    ["38", "anos de narrativa"],
  ];
  return (
    <Slide id="resumo" page={page} label="Resumo executivo" scale={scale}>
      <div className="grid h-full grid-cols-[1.05fr_0.95fr] gap-14 px-20 py-16">
        <div className="flex flex-col">
          <SlideTag>Resumo executivo</SlideTag>
          <h2 className="mt-8 font-display text-[84px] uppercase leading-[0.9] text-bone-100">
            Operação digital para quem <span className="text-hz-400">mantém a máquina rodando</span>
          </h2>
          <p className="mt-7 max-w-[560px] text-[24px] leading-relaxed text-steel-300">
            O site une <strong className="text-bone-100">estoque consultável</strong>, ficha técnica por peça e
            atendimento comercial direto. O visitante encontra a peça, confere aplicação e preço, e chega no
            WhatsApp da equipe com a mensagem pronta.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Vitrine institucional com a história desde 1988",
              "Catálogo com filtros, busca, comparação e favoritos",
              "Orçamento estruturado por WhatsApp em qualquer item",
            ].map((t) => (
              <li key={t} className="flex items-center gap-4 text-[23px] text-bone-200">
                <span className="h-3 w-3 shrink-0 rotate-45 bg-hz-400" aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
          <p className="mt-auto border-l-2 border-steel-500 pl-5 text-[19px] leading-relaxed text-steel-400">
            *Catálogo de exemplo com as famílias reais distribuídas pela Lusomaq — substituído pelo estoque
            verdadeiro na etapa de publicação.
          </p>
        </div>

        <div className="flex flex-col">
          <div className="grid flex-1 grid-cols-2 gap-5">
            {tiles.map(([v, l]) => (
              <div key={l} className="flex flex-col justify-center border border-line-dark bg-coal-950 px-8">
                <p className="font-display text-[76px] leading-none text-hz-300">{v}</p>
                <p className="mt-2 font-cond text-[19px] font-semibold uppercase tracking-[0.2em] text-steel-300">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-4 border border-line-dark bg-coal-950 px-7 py-5">
            {["Visitante", "Encontra a peça", "Compara", "Orçamento no WhatsApp"].map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-4">
                <span className={cx("flex-1 text-center font-cond text-[17px] font-bold uppercase tracking-[0.1em]", i === 3 ? "bg-hz-400 px-2 py-2.5 text-coal-950" : "border border-line-dark px-2 py-2.5 text-bone-100")}>
                  {s}
                </span>
                {i < 3 && <IcArrow size={20} className="shrink-0 text-hz-400" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  );
}

function HomeHeroSlide({ page, scale }: { page: number; scale: number }) {
  return (
    <Slide id="home-hero" page={page} label="Página · Home" scale={scale}>
      <div className="flex h-full flex-col">
        <BrowserBar url="lusomaq.com.br" />
        <div className="relative flex-1 overflow-hidden">
          <img src={IMG.road} alt="" loading="eager" decoding="sync" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-coal-950 via-coal-950/55 to-coal-950/10" aria-hidden="true" />
          <div className="relative grid h-full grid-cols-[1.1fr_0.9fr] items-center px-16">
            <div>
              <p className="flex items-center gap-4 font-cond text-[20px] font-bold uppercase tracking-[0.3em] text-hz-300">
                <span className="h-[3px] w-10 bg-hz-400" aria-hidden="true" /> Desde 1988 · Alto da Mooca — SP
              </p>
              <h2 className="mt-6 font-display text-[106px] uppercase leading-[0.88] text-bone-100">
                A peça que mantém o <span className="text-hz-400">rolo rodando</span>
              </h2>
              <p className="mt-6 max-w-[560px] text-[24px] leading-relaxed text-bone-200/90">
                Peças novas originais e compatíveis para rolos compactadores, com estoque próprio e entrega
                rápida para todo o Brasil.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <span className="clip-cut-sm bg-hz-400 px-8 py-4 font-cond text-[21px] font-bold uppercase tracking-[0.18em] text-coal-950">
                  Ver peças
                </span>
                <span className="clip-cut-sm border border-steel-400 px-8 py-4 font-cond text-[21px] font-bold uppercase tracking-[0.18em] text-bone-100">
                  <IcWhatsApp size={20} className="mr-2 inline text-agri-300" /> Orçamento
                </span>
              </div>
              <p className="mt-9 flex items-center gap-3 font-cond text-[19px] font-semibold uppercase tracking-[0.22em] text-steel-300">
                <span className="h-2.5 w-2.5 animate-pulse bg-agri-400" aria-hidden="true" />
                {formatNum(availableCount())} peças do catálogo online · 30.000+ itens no estoque físico
              </p>
            </div>
            <img
              src={IMG.hero2}
              alt="Rolo compactador — arte oficial"
              loading="eager"
              decoding="sync"
              className="w-[92%] justify-self-end object-contain"
              style={{ filter: "drop-shadow(0 30px 40px rgba(0,0,0,.55))" }}
            />
          </div>
        </div>
        <p className="border-t border-line-dark bg-coal-950 px-16 py-4 text-[19px] text-steel-400">
          <strong className="text-steel-200">Abertura real:</strong> fundo de estrada do site oficial + PNGs das máquinas da própria Lusomaq.
        </p>
      </div>
    </Slide>
  );
}

function HomeStorySlide({ page, scale }: { page: number; scale: number }) {
  const feats = featuredMachines().slice(0, 2);
  const words = [
    { w: "Estoque", img: IMG.hero3, d: "30.000+ itens a pronta entrega" },
    { w: "Agilidade", img: IMG.hero2, d: "Logística própria para todo o Brasil" },
    { w: "Qualidade", img: IMG.hero5, d: "Peças originais e revisadas" },
    { w: "Preço justo", img: IMG.hero6, d: "Solução que fecha a conta" },
  ];
  return (
    <Slide id="home-destaques" page={page} label="Página · Narrativa" scale={scale}>
      <div className="flex h-full flex-col px-16 py-12">
        <div className="flex items-center justify-between">
          <SlideTag>Scroll narrativo — a marca em 4 palavras</SlideTag>
          <span className="font-cond text-[18px] font-semibold uppercase tracking-[0.2em] text-steel-400">parallax em tela cheia no site</span>
        </div>
        <div className="mt-8 grid grid-cols-4 gap-5">
          {words.map((s) => (
            <div key={s.w} className="relative h-[300px] overflow-hidden border border-line-dark">
              <img src={s.img} alt={s.w} loading="eager" decoding="sync" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-coal-950 via-coal-950/25 to-transparent" aria-hidden="true" />
              <div className="absolute bottom-0 p-5">
                <p className="font-display text-[44px] uppercase leading-none text-bone-100">{s.w}</p>
                <p className="mt-2 text-[17px] text-bone-200/85">{s.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-end justify-between">
          <SlideTag tone="steel">Oportunidades da semana — cards reais do catálogo</SlideTag>
          <span className="font-cond text-[18px] font-semibold uppercase tracking-[0.2em] text-steel-400">mesmo componente usado no site</span>
        </div>
        <div className="mt-6 grid flex-1 grid-cols-2 gap-6">
          {feats.map((m) => (
            <DeckPartCard key={m.id} m={m} />
          ))}
        </div>
      </div>
    </Slide>
  );
}

function CatalogSlide({ page, scale }: { page: number; scale: number }) {
  const items = MACHINES.slice(0, 6);
  const cats = ["Bombas & hidráulica", "Duocones & rodado", "Rolamentos", "Filtros & vedações", "Caixas & engrenagens", "Motores"];
  return (
    <Slide id="catalogo" page={page} label="Página · Catálogo" scale={scale}>
      <div className="flex h-full flex-col">
        <BrowserBar url="lusomaq.com.br/#/pecas" />
        <div className="flex items-center justify-between border-b border-line-dark bg-coal-900 px-10 py-5">
          <div>
            <h2 className="font-display text-[52px] uppercase leading-none text-bone-100">Catálogo de peças</h2>
            <p className="mt-1 font-cond text-[18px] font-semibold uppercase tracking-[0.2em] text-steel-400">
              {items.length} de 24 itens de exemplo · filtros por família, marca do rolo e condição
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="border border-line-dark bg-coal-950 px-5 py-3 font-cond text-[18px] font-semibold tracking-[0.1em] text-steel-300">
              🔎 Buscar por código, OEM ou modelo…
            </span>
            <span className="bg-hz-400 px-5 py-3 font-cond text-[18px] font-bold uppercase tracking-[0.14em] text-coal-950">Filtrar</span>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-[280px_1fr] gap-8 overflow-hidden px-10 py-7">
          <div className="border border-line-dark bg-coal-950 p-6">
            <p className="font-cond text-[17px] font-bold uppercase tracking-[0.24em] text-hz-300">Famílias</p>
            <ul className="mt-4 space-y-3">
              {cats.map((c, i) => (
                <li key={c} className="flex items-center justify-between border-b border-line-dark pb-2.5 text-[18px] text-bone-200">
                  <span className="flex items-center gap-3">
                    <span className={cx("h-4 w-4 border", i === 0 ? "border-hz-400 bg-hz-400" : "border-steel-500")} aria-hidden="true" />
                    {c}
                  </span>
                  <span className="font-cond text-[16px] text-steel-500">{[8, 4, 3, 3, 2, 4][i]}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 font-cond text-[17px] font-bold uppercase tracking-[0.24em] text-hz-300">Condição</p>
            <div className="mt-3 flex gap-2">
              <span className="border border-hz-400 bg-hz-400/10 px-3 py-1.5 font-cond text-[16px] font-bold uppercase tracking-[0.12em] text-hz-300">Original</span>
              <span className="border border-line-dark px-3 py-1.5 font-cond text-[16px] font-bold uppercase tracking-[0.12em] text-steel-300">Compatível</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5 overflow-hidden">
            {items.map((m) => (
              <DeckPartCard key={m.id} m={m} />
            ))}
          </div>
        </div>
      </div>
    </Slide>
  );
}

function DetailSlide({ page, scale }: { page: number; scale: number }) {
  const m = machineBySlug("duocone-dynapac") ?? MACHINES[0];
  const specs = m.specGroups[0]?.rows.slice(0, 4) ?? [];
  return (
    <Slide id="detalhe" page={page} label="Página · Ficha da peça" scale={scale}>
      <div className="flex h-full flex-col">
        <BrowserBar url={`lusomaq.com.br/#/pecas/${m.slug}`} />
        <div className="grid flex-1 grid-cols-[1.05fr_0.95fr_300px] gap-9 overflow-hidden px-12 py-8">
          <div>
            <div className="tick-corners relative overflow-hidden border border-line-dark">
              <img src={m.images[0]} alt={m.model} loading="eager" decoding="sync" className="aspect-[4/3] w-full object-cover" />
              <span className="clip-cut-sm absolute left-5 top-5 bg-hz-400 px-3 py-1.5 font-cond text-[17px] font-bold uppercase tracking-[0.16em] text-coal-950">
                {m.condition === "original" ? "Original" : "Compatível"}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {m.images.slice(0, 3).map((img, i) => (
                <img key={i} src={img} alt="" loading="eager" decoding="sync" className={cx("aspect-[4/3] w-full border object-cover", i === 0 ? "border-hz-400" : "border-line-dark")} />
              ))}
            </div>
            <p className="mt-4 text-[18px] leading-relaxed text-steel-300">{m.description}</p>
          </div>

          <div className="flex flex-col">
            <p className="font-cond text-[17px] font-semibold uppercase tracking-[0.24em] text-steel-400">{m.brand} · {m.code}</p>
            <h2 className="mt-2 font-display text-[58px] uppercase leading-[0.92] text-bone-100">{m.model}</h2>
            <p className="mt-3 text-[19px] text-steel-300">{m.application}</p>
            <div className="mt-5 flex items-center justify-between border-y border-line-dark py-4">
              <span className="font-cond text-[40px] font-bold text-hz-300">{m.price ? formatBRL(m.price) : "Sob consulta"}</span>
              <span className="flex items-center gap-2 font-cond text-[17px] font-bold uppercase tracking-[0.16em] text-agri-300">
                <span className="h-2.5 w-2.5 bg-agri-400" aria-hidden="true" /> Pronta entrega
              </span>
            </div>
            <dl className="mt-5 space-y-2.5">
              {specs.map((r) => (
                <div key={r.label} className="flex items-baseline justify-between gap-6 border-b border-line-dark/70 pb-2">
                  <dt className="font-cond text-[17px] font-semibold uppercase tracking-[0.18em] text-steel-400">{r.label}</dt>
                  <dd className="text-right text-[19px] text-bone-100">{r.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-auto flex gap-3 pt-6">
              <span className="clip-cut-sm flex flex-1 items-center justify-center gap-2 bg-agri-500 px-4 py-3.5 font-cond text-[19px] font-bold uppercase tracking-[0.14em] text-bone-100">
                <IcWhatsApp size={19} /> WhatsApp
              </span>
              <span className="clip-cut-sm flex flex-1 items-center justify-center bg-hz-400 px-4 py-3.5 font-cond text-[19px] font-bold uppercase tracking-[0.14em] text-coal-950">
                Solicitar orçamento
              </span>
            </div>
          </div>

          <div className="flex flex-col">
            <p className="font-cond text-[16px] font-bold uppercase tracking-[0.2em] text-steel-400">No celular — barra fixa</p>
            <div className="mx-auto mt-4 w-[240px] border-[6px] border-coal-600 bg-coal-950 p-3">
              <div className="aspect-[9/16] overflow-hidden border border-line-dark">
                <img src={m.images[0]} alt="" loading="eager" decoding="sync" className="h-2/3 w-full object-cover" />
                <div className="space-y-2 p-2.5">
                  <p className="font-display text-[15px] uppercase leading-tight text-bone-100">{m.model}</p>
                  <p className="font-cond text-[12px] uppercase tracking-[0.12em] text-steel-400">{m.code}</p>
                  <p className="font-cond text-[15px] font-bold text-hz-300">{m.price ? formatBRL(m.price) : "Sob consulta"}</p>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-1">
                <span className="bg-agri-500 py-2 text-center font-cond text-[11px] font-bold uppercase text-bone-100">Whats</span>
                <span className="bg-coal-700 py-2 text-center font-cond text-[11px] font-bold uppercase text-bone-100">Ligar</span>
                <span className="bg-hz-400 py-2 text-center font-cond text-[11px] font-bold uppercase text-coal-950">Orçar</span>
              </div>
            </div>
            <p className="mt-4 border border-line-dark bg-coal-950 p-4 text-[16px] leading-relaxed text-steel-300">
              A barra de conversão acompanha o scroll com a área segura do dispositivo — o orçamento fica a um toque.
            </p>
          </div>
        </div>
      </div>
    </Slide>
  );
}

function AnatomySlide({ page, scale }: { page: number; scale: number }) {
  const spots = [
    { x: "24%", y: "34%", t: "Motor", d: "Perkins · MWM · Cummins · Deutz" },
    { x: "46%", y: "62%", t: "Vibração", d: "Bombas e motores de vibração" },
    { x: "66%", y: "44%", t: "Tração", d: "Caixas, duocones e redutores" },
    { x: "82%", y: "66%", t: "Dumper", d: "Tanques, mangueiras e bicos" },
  ];
  const apps = [
    { t: "Pavimentação", d: "Rolos lisos e pé-de-carneiro", img: IMG.road },
    { t: "Terraplanagem", d: "Compactação de solo e base", img: IMG.hero6 },
    { t: "Obras municipais", d: "Valas, recape e tapa-buraco", img: IMG.hero4 },
    { t: "Mineração", d: "Frota pesada em operação contínua", img: IMG.hero3 },
  ];
  return (
    <Slide id="anatomia" page={page} label="Página · Anatomia" scale={scale}>
      <div className="grid h-full grid-cols-[1.15fr_0.85fr] gap-10 px-14 py-10">
        <div className="flex flex-col">
          <SlideTag>Seção interativa — anatomia do rolo</SlideTag>
          <h2 className="mt-5 font-display text-[62px] uppercase leading-[0.9] text-bone-100">
            Cada ponto, <span className="text-hz-400">uma família de peças</span>
          </h2>
          <div className="tick-corners relative mt-6 flex-1 overflow-hidden border border-line-dark">
            <img src={IMG.rolo} alt="Rolo compactador em vista lateral" loading="eager" decoding="sync" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-coal-950/60 to-transparent" aria-hidden="true" />
            {spots.map((s) => (
              <div key={s.t} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: s.x, top: s.y }}>
                <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-hz-400 bg-coal-950/70 font-cond text-[17px] font-bold text-hz-300">+</span>
                <p className="mt-2 w-max border border-line-dark bg-coal-950/90 px-3 py-1.5 text-center">
                  <span className="block font-cond text-[16px] font-bold uppercase tracking-[0.14em] text-bone-100">{s.t}</span>
                  <span className="block text-[14px] text-steel-300">{s.d}</span>
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[18px] text-steel-400">No site, os pontos são clicáveis e abrem a especificação configurada — nada de dado inventado.</p>
        </div>
        <div className="flex flex-col">
          <SlideTag tone="steel">Escolha pela aplicação</SlideTag>
          <div className="mt-6 grid flex-1 grid-cols-1 gap-4">
            {apps.map((a) => (
              <div key={a.t} className="relative min-h-[130px] flex-1 overflow-hidden border border-line-dark">
                <img src={a.img} alt={a.t} loading="eager" decoding="sync" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-coal-950 via-coal-950/45 to-transparent" aria-hidden="true" />
                <div className="relative flex h-full flex-col justify-center p-6">
                  <p className="font-display text-[40px] uppercase leading-none text-bone-100">{a.t}</p>
                  <p className="mt-2 text-[18px] text-bone-200/85">{a.d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-l-2 border-hz-400 pl-4 font-cond text-[17px] font-semibold uppercase tracking-[0.16em] text-steel-300">
            Scroll vertical controla o trilho horizontal no site · swipe no celular
          </p>
        </div>
      </div>
    </Slide>
  );
}

function BrandsSlide({ page, scale }: { page: number; scale: number }) {
  return (
    <Slide id="marcas" page={page} label="Página · Marcas" scale={scale}>
      <div className="flex h-full flex-col px-20 py-14">
        <div className="flex items-end justify-between">
          <div>
            <SlideTag>Marcas trabalhadas</SlideTag>
            <h2 className="mt-5 font-display text-[72px] uppercase leading-[0.9] text-bone-100">
              Só marca que a Lusomaq <span className="text-hz-400">realmente atende</span>
            </h2>
          </div>
          <p className="max-w-[360px] text-right text-[19px] leading-relaxed text-steel-400">
            Listas extraídas do site oficial — nenhuma parceria inventada.
          </p>
        </div>

        <div className="mt-10">
          <p className="font-cond text-[20px] font-bold uppercase tracking-[0.26em] text-steel-300">Rolos compactadores</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
            {BUSINESS.rollerBrands.map((b, i) => (
              <span key={b} className="flex items-center gap-8">
                <span className="font-display text-[52px] uppercase text-bone-100">{b}</span>
                {i < BUSINESS.rollerBrands.length - 1 && <span className="h-2.5 w-2.5 rotate-45 bg-hz-400/70" aria-hidden="true" />}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 flex-1">
          <p className="font-cond text-[20px] font-bold uppercase tracking-[0.26em] text-steel-300">Peças & motores distribuídos</p>
          <div className="mt-4 grid grid-cols-4 gap-x-8 gap-y-2.5">
            {BUSINESS.partBrands.map((b) => (
              <span key={b} className="flex items-center gap-3 border-b border-line-dark pb-2 font-cond text-[24px] font-semibold uppercase tracking-[0.08em] text-bone-200">
                <span className="h-2 w-2 rotate-45 bg-steel-500" aria-hidden="true" /> {b}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-6 border-t border-line-dark pt-4 font-cond text-[18px] font-semibold uppercase tracking-[0.2em] text-steel-400">
          No site, as marcas rolam em letreiro contínuo — aqui, congeladas para leitura.
        </p>
      </div>
    </Slide>
  );
}

function CompanySlide({ page, scale }: { page: number; scale: number }) {
  return (
    <Slide id="empresa" page={page} label="Página · A empresa" scale={scale}>
      <div className="grid h-full grid-cols-[0.9fr_1.1fr] gap-12 px-16 py-12">
        <div className="flex flex-col">
          <SlideTag tone="steel">Nossa sede — registro real</SlideTag>
          <div className="tick-corners relative mt-6 flex-1 overflow-hidden border border-line-dark">
            <img src={IMG.predio} alt="Fachada da sede Lusomaq" loading="eager" decoding="sync" className="h-full w-full object-cover" />
            <span className="absolute bottom-4 left-4 bg-coal-950/90 px-4 py-2 font-cond text-[17px] font-bold uppercase tracking-[0.16em] text-bone-100">
              <IcPin size={17} className="mr-2 inline text-hz-400" /> Rua Sapucaia, 26 — Alto da Mooca
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[
              ["38", "anos de estrada"],
              ["30.000+", "itens em estoque"],
              ["100%", "entrega Brasil"],
            ].map(([v, l]) => (
              <div key={l} className="border border-line-dark bg-coal-950 px-3 py-4">
                <p className="font-display text-[42px] leading-none text-hz-300">{v}</p>
                <p className="mt-1.5 font-cond text-[15px] font-semibold uppercase tracking-[0.14em] text-steel-300">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col">
          <SlideTag>Institucional — texto oficial</SlideTag>
          <h2 className="mt-5 font-display text-[64px] uppercase leading-[0.9] text-bone-100">
            Desde 1988, a peça certa <span className="text-hz-400">na hora certa</span>
          </h2>
          <div className="mt-7 space-y-5">
            <div className="border-l-2 border-hz-400 pl-5">
              <p className="font-cond text-[19px] font-bold uppercase tracking-[0.24em] text-hz-300">Missão</p>
              <p className="mt-1.5 text-[20px] leading-relaxed text-bone-200">{BUSINESS.mission}</p>
            </div>
            <div className="border-l-2 border-steel-500 pl-5">
              <p className="font-cond text-[19px] font-bold uppercase tracking-[0.24em] text-steel-300">Visão</p>
              <p className="mt-1.5 text-[20px] leading-relaxed text-bone-200">{BUSINESS.vision}</p>
            </div>
          </div>
          <div className="mt-auto pt-6">
            <p className="font-cond text-[19px] font-bold uppercase tracking-[0.24em] text-steel-300">Valores</p>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {BUSINESS.values.map((v) => (
                <span key={v} className="border border-line-dark bg-coal-950 px-4 py-2 font-cond text-[18px] font-semibold uppercase tracking-[0.12em] text-bone-100">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

function ConversionSlide({ page, scale }: { page: number; scale: number }) {
  const m = featuredMachines()[0] ?? MACHINES[0];
  const msg = machineMessage(m);
  return (
    <Slide id="conversao" page={page} label="Página · Conversão" scale={scale}>
      <div className="grid h-full grid-cols-[1fr_1fr] gap-12 px-16 py-12">
        <div className="flex flex-col">
          <SlideTag>Conversão — WhatsApp contextual</SlideTag>
          <h2 className="mt-5 font-display text-[62px] uppercase leading-[0.9] text-bone-100">
            Do card ao atendimento em <span className="text-hz-400">um clique</span>
          </h2>
          <p className="mt-5 max-w-[520px] text-[21px] leading-relaxed text-steel-300">
            Cada botão abre o WhatsApp da equipe com a mensagem já preenchida com a peça, o código e a aplicação.
            Nenhum formulário finge envio — tudo chega de verdade.
          </p>
          <div className="mt-7 w-[480px] border border-line-dark bg-[#0b141a] p-5">
            <p className="border-b border-bone-100/10 pb-3 text-center font-cond text-[15px] font-bold uppercase tracking-[0.2em] text-steel-400">
              Prévia da mensagem gerada
            </p>
            <div className="mt-4 w-fit max-w-full rounded-lg rounded-tl-none bg-[#1f2c34] p-4">
              {msg.split("\n").map((l, i) => (
                <p key={i} className={cx("whitespace-pre-wrap font-cond text-[19px] leading-snug", l.startsWith("•") ? "text-bone-200" : "text-bone-100")}>
                  {l || "\u00A0"}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <SlideTag tone="steel">Fale com um especialista — equipe real</SlideTag>
          <div className="mt-7 grid flex-1 grid-cols-2 gap-5">
            {BUSINESS.team.map((t) => (
              <div key={t.whatsapp} className="flex flex-col border border-line-dark bg-coal-950 p-6">
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-hz-400 font-display text-[24px] uppercase text-coal-950">
                    {t.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <p className="font-display text-[26px] uppercase leading-none text-bone-100">{t.name}</p>
                    <p className="mt-1 font-cond text-[15px] font-semibold uppercase tracking-[0.14em] text-steel-400">{t.role}</p>
                  </div>
                </div>
                <div className="mt-auto pt-4">
                  <p className="font-cond text-[19px] font-semibold text-bone-200">{t.phoneDisplay}</p>
                  <span className="mt-2 inline-flex items-center gap-2 bg-agri-500 px-4 py-2 font-cond text-[16px] font-bold uppercase tracking-[0.12em] text-bone-100">
                    <IcWhatsApp size={16} /> Chamar agora
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 border border-line-dark bg-coal-950 px-5 py-4 text-[18px] text-steel-300">
            <strong className="text-bone-100">Botão flutuante</strong> sempre visível no site · na ficha da peça, barra fixa com
            WhatsApp, ligar e orçamento.
          </p>
        </div>
      </div>
    </Slide>
  );
}

function ContactSlide({ page, scale }: { page: number; scale: number }) {
  return (
    <Slide id="contato" page={page} label="Página · Contato" scale={scale}>
      <div className="grid h-full grid-cols-[0.95fr_1.05fr] gap-12 px-16 py-12">
        <div className="flex flex-col">
          <SlideTag>Visite o balcão</SlideTag>
          <h2 className="mt-5 font-display text-[64px] uppercase leading-[0.9] text-bone-100">
            Alto da Mooca, <span className="text-hz-400">São Paulo</span>
          </h2>
          <dl className="mt-8 space-y-4">
            {[
              ["Endereço", `${BUSINESS.address.street} · ${BUSINESS.address.city}/${BUSINESS.address.state} · CEP ${BUSINESS.address.zip}`],
              ["Telefone fixo", BUSINESS.phoneDisplay],
              ["E-mail", BUSINESS.email],
              ["Horário", "Segunda a sexta · 08h às 18h"],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-line-dark pb-3.5">
                <dt className="font-cond text-[16px] font-bold uppercase tracking-[0.24em] text-steel-400">{k}</dt>
                <dd className="mt-1 text-[21px] text-bone-100">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-auto flex gap-3 pt-6">
            <span className="clip-cut-sm flex items-center gap-2 bg-agri-500 px-7 py-4 font-cond text-[20px] font-bold uppercase tracking-[0.14em] text-bone-100">
              <IcWhatsApp size={20} /> {BUSINESS.whatsappDisplay}
            </span>
            <span className="clip-cut-sm flex items-center gap-2 border border-steel-400 px-7 py-4 font-cond text-[20px] font-bold uppercase tracking-[0.14em] text-bone-100">
              Traçar rota
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <SlideTag tone="steel">Mapa — coordenadas reais</SlideTag>
          <div className="relative mt-6 flex-1 overflow-hidden border border-line-dark bg-coal-950">
            <svg viewBox="0 0 800 620" className="h-full w-full" aria-hidden="true">
              <g stroke="#262a31" strokeWidth="1.5">
                {Array.from({ length: 16 }, (_, i) => (
                  <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="620" />
                ))}
                {Array.from({ length: 13 }, (_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} />
                ))}
              </g>
              <path d="M-20 470 C 180 430, 300 380, 430 330 S 700 210, 830 170" stroke="#3a4049" strokeWidth="34" fill="none" />
              <path d="M-20 470 C 180 430, 300 380, 430 330 S 700 210, 830 170" stroke="#f7a800" strokeWidth="3" strokeDasharray="26 20" fill="none" />
              <path d="M250 -20 C 270 160, 330 340, 360 640" stroke="#3a4049" strokeWidth="22" fill="none" />
              <g transform="translate(400 300)">
                <path d="M0 0C-26-34-44-58-44-84a44 44 0 1 1 88 0c0 26-18 50-44 84Z" fill="#f7a800" stroke="#0b0c0e" strokeWidth="4" />
                <circle cx="0" cy="-84" r="16" fill="#0b0c0e" />
              </g>
              <text x="400" y="212" textAnchor="middle" fill="#f0eee8" fontSize="26" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" letterSpacing="4">
                LUSOMAQ — R. SAPUCAIA, 26
              </text>
              <text x="400" y="560" textAnchor="middle" fill="#959ca8" fontSize="18" fontFamily="Barlow Condensed, sans-serif" letterSpacing="3">
                −23.548194, −46.596889 · ALTO DA MOOCA
              </text>
            </svg>
          </div>
          <p className="mt-4 text-[18px] text-steel-400">
            No site, o mapa é o <strong className="text-steel-200">Google Maps incorporado</strong> nas coordenadas reais da sede,
            com botão de rota e foto da fachada.
          </p>
        </div>
      </div>
    </Slide>
  );
}

function QualitySlide({ page, scale }: { page: number; scale: number }) {
  const checks = [
    ["Responsivo de 360 a 1920 px", "Catálogo excelente no celular — drawer de filtros incluso"],
    ["SEO técnico + local", "Schema.org (AutoPartsStore, Product), rotas indexáveis"],
    ["Acessibilidade", "Teclado, foco, contraste, alt, reduced-motion"],
    ["Performance", "Lazy loading, imagens otimizadas, bundle único"],
    ["Zero envio falso", "Todo formulário vira WhatsApp real e rastreável"],
    ["Pronto para painel", "Dados separados da UI — estoque editável no futuro"],
  ];
  const steps = [
    ["1", "Estoque real", "Substituir os 24 itens de exemplo por códigos, preços e fotos do estoque"],
    ["2", "Revisão conjunta", "Ajustes de texto, selos e vitrines com a equipe Lusomaq"],
    ["3", "Publicação", "Domínio, medição e treinamento do time para o dia a dia"],
  ];
  return (
    <Slide id="qualidade" page={page} label="Qualidade & próximos passos" scale={scale}>
      <div className="grid h-full grid-cols-[1.05fr_0.95fr] gap-14 px-18 py-12">
        <div className="flex flex-col px-2">
          <SlideTag>Engenharia por trás</SlideTag>
          <h2 className="mt-5 font-display text-[64px] uppercase leading-[0.9] text-bone-100">
            Feito para <span className="text-hz-400">converter</span>, auditável por dentro
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5">
            {checks.map(([t, d]) => (
              <li key={t} className="border border-line-dark bg-coal-950 p-5">
                <p className="flex items-center gap-3 font-cond text-[20px] font-bold uppercase tracking-[0.08em] text-bone-100">
                  <span className="grid h-7 w-7 shrink-0 place-items-center bg-agri-500 text-bone-100"><IcCheck size={16} /></span>
                  {t}
                </p>
                <p className="mt-2 text-[17px] leading-snug text-steel-300">{d}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col">
          <SlideTag tone="steel">Plano de publicação</SlideTag>
          <div className="mt-8 space-y-5">
            {steps.map(([n, t, d]) => (
              <div key={n} className="flex gap-6 border border-line-dark bg-coal-950 p-6">
                <span className="font-display text-[56px] leading-none text-hz-400">{n}</span>
                <div>
                  <p className="font-display text-[30px] uppercase leading-none text-bone-100">{t}</p>
                  <p className="mt-2 text-[18px] leading-relaxed text-steel-300">{d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[17px] text-steel-400">
            O passo a passo completo está no documento <strong className="text-steel-200">CLIENT_REPLACEMENT_GUIDE</strong> entregue com o projeto.
          </p>
          <div className="mt-auto border-t border-line-dark pt-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="font-display text-[64px] uppercase leading-none text-bone-100">
                  Luso<span className="text-hz-400">maq</span>
                </p>
                <p className="mt-2 font-cond text-[18px] font-semibold uppercase tracking-[0.26em] text-steel-300">
                  Desde 1988 · peças que mantêm o rolo rodando
                </p>
              </div>
              <span className="hazard-thin h-12 w-32" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* ============================= DECK ============================= */

export default function Deck() {
  const { ref, scale } = useDeckScale();
  const [current, setCurrent] = useState(0);
  usePageMeta(
    "Proposta Comercial — Lusomaq | Apresentação em PDF",
    "Deck de apresentação da plataforma digital Lusomaq: páginas do site, catálogo de peças, conversão via WhatsApp, marcas, empresa e plano de publicação.",
  );

  useEffect(() => {
    document.documentElement.classList.add("deck-mode");
    return () => document.documentElement.classList.remove("deck-mode");
  }, []);

  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-deck-slide]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setCurrent(els.indexOf(e.target as HTMLElement));
        });
      },
      { threshold: 0.5 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (dir: 1 | -1) => {
    const els = document.querySelectorAll<HTMLElement>("[data-deck-slide]");
    const next = Math.min(els.length - 1, Math.max(0, current + dir));
    els[next]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div ref={ref} className="deck-bg min-h-screen pb-32">
      {/* toolbar — somente em tela */}
      <div className="deck-toolbar no-print fixed inset-x-0 bottom-5 z-[80] flex justify-center px-4">
        <div className="flex items-center gap-2 border border-line-dark bg-coal-950/95 px-3 py-2 shadow-plate backdrop-blur-md">
          <button onClick={() => go(-1)} className="grid h-10 w-10 place-items-center border border-line-dark text-steel-300 transition-colors hover:border-hz-400 hover:text-hz-300" aria-label="Slide anterior">
            <IcChevronL size={18} />
          </button>
          <span className="min-w-[190px] px-2 text-center font-cond text-[13px] font-bold uppercase tracking-[0.16em] text-bone-100">
            {String(current + 1).padStart(2, "0")} / {SLIDES.length} — {SLIDES[current]?.label}
          </span>
          <button onClick={() => go(1)} className="grid h-10 w-10 place-items-center border border-line-dark text-steel-300 transition-colors hover:border-hz-400 hover:text-hz-300" aria-label="Próximo slide">
            <IcChevronR size={18} />
          </button>
          <span className="mx-1 h-6 w-px bg-line-dark" aria-hidden="true" />
          <button
            onClick={() => window.print()}
            className="clip-cut-sm flex items-center gap-2 bg-hz-400 px-5 py-2.5 font-cond text-[13px] font-bold uppercase tracking-[0.16em] text-coal-950 transition-colors hover:bg-hz-300"
          >
            <IcDoc size={16} /> Salvar em PDF
          </button>
          <Link to="/" className="hidden items-center gap-2 px-3 py-2 font-cond text-[13px] font-bold uppercase tracking-[0.16em] text-steel-300 transition-colors hover:text-hz-300 sm:flex">
            Ver o site <IcArrow size={14} />
          </Link>
        </div>
      </div>

      {/* índice lateral — somente em tela */}
      <nav className="deck-nav no-print fixed right-5 top-1/2 z-[75] hidden -translate-y-1/2 flex-col gap-2 xl:flex" aria-label="Índice de slides">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className={cx("group flex items-center gap-3", i === current ? "" : "justify-end")}
            aria-label={`Ir para ${s.label}`}
          >
            <span
              className={cx(
                "pointer-events-none whitespace-nowrap font-cond text-[12px] font-bold uppercase tracking-[0.14em] opacity-0 transition-opacity duration-200 group-hover:opacity-100",
                i === current ? "text-hz-300 opacity-100" : "text-steel-300",
              )}
            >
              {s.label}
            </span>
            <span className={cx("h-2.5 w-2.5 rotate-45 transition-all duration-200", i === current ? "scale-125 bg-hz-400" : "bg-steel-500 group-hover:bg-hz-300")} />
          </button>
        ))}
      </nav>

      <div className="mx-auto max-w-[1440px] space-y-10 px-4 pt-10 md:px-8">
        <CoverSlide page={1} scale={scale} />
        <SummarySlide page={2} scale={scale} />
        <HomeHeroSlide page={3} scale={scale} />
        <HomeStorySlide page={4} scale={scale} />
        <CatalogSlide page={5} scale={scale} />
        <DetailSlide page={6} scale={scale} />
        <AnatomySlide page={7} scale={scale} />
        <BrandsSlide page={8} scale={scale} />
        <CompanySlide page={9} scale={scale} />
        <ConversionSlide page={10} scale={scale} />
        <ContactSlide page={11} scale={scale} />
        <QualitySlide page={12} scale={scale} />
      </div>
    </div>
  );
}
