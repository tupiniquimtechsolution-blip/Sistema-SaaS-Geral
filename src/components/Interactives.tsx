import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { assets } from "../config/assets";
import { business } from "../config/business";
import { MaskLines, cn, track, waLink } from "../lib/motion";
import {
  IconArrowRight,
  IconCamera,
  IconCheck,
  IconDrag,
  IconWhatsApp,
  SectionTag,
} from "./ui";

/* ================= BEFORE × AFTER ================= */

export function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <section id="antes-depois" className="blueprint-grid border-y border-coal-700/60 bg-coal-850 py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <SectionTag index="05" label="Reformas" />
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display max-w-[16ch] text-[clamp(2.4rem,6vw,5rem)] leading-[0.96] uppercase">
            <MaskLines
              lines={[
                <span key="1" className="text-paper-100">Veja a</span>,
                <span key="2" className="text-paper-100">
                  <em className="text-ember-500 not-italic">transformação</em>.
                </span>,
              ]}
            />
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-steel-400 md:text-right">
            Reforma de portão não é só pintura: é estrutura, ferragens e
            funcionamento. Arraste a linha e compare o antes e o depois.
          </p>
        </div>

        <div
          ref={wrapRef}
          className="border-coal-600 relative mt-14 aspect-[4/5] w-full overflow-hidden border select-none sm:aspect-[16/10]"
          data-cursor="ARRASTE"
        >
          {/* depois (fundo) */}
          <img
            src={assets.beforeAfter.after}
            alt="Portão depois da reforma completa pela Metal & Art"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          {/* antes (recortado) */}
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <img
              src={assets.beforeAfter.before}
              alt="Portão antes da reforma, com ferrugem e pintura desgastada"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
          </div>

          {/* divisor */}
          <div
            className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-ember-500"
            style={{ left: `${pos}%` }}
            aria-hidden="true"
          >
            <span className="border-ember-500 absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 bg-coal-950/85 text-ember-400">
              <IconDrag className="h-5 w-5" />
            </span>
          </div>

          <span className="font-mono absolute top-3 left-3 z-10 bg-coal-950/85 px-2.5 py-1 text-[0.6rem] tracking-[0.25em] text-steel-300 uppercase">
            Antes
          </span>
          <span className="font-mono absolute top-3 right-3 z-10 bg-ember-500 px-2.5 py-1 text-[0.6rem] tracking-[0.25em] text-coal-950 uppercase">
            Depois
          </span>

          {/* controle acessível (teclado + touch) */}
          <label className="absolute inset-0 z-20 cursor-ew-resize">
            <span className="sr-only">Arraste para comparar antes e depois da reforma do portão</span>
            <input
              type="range"
              min={0}
              max={100}
              value={pos}
              onChange={(e) => setPos(Number(e.target.value))}
              className="h-full w-full cursor-ew-resize opacity-0"
            />
          </label>
        </div>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {["Portão", "Reforma", "Pintura", "Recuperação", "Automação"].map((t) => (
              <span key={t} className="font-mono border border-coal-600 px-3 py-1.5 text-[0.62rem] tracking-[0.2em] text-steel-400 uppercase">
                {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/orcamento"
              className="btn-press bg-ember-500 hover:bg-weld-400 font-display inline-flex items-center gap-2.5 px-6 py-3.5 text-base tracking-[0.06em] text-coal-950 uppercase"
            >
              Quero reformar o meu <IconArrowRight className="h-4.5 w-4.5" />
            </Link>
            <a
              href={waLink(business.whatsappDigits, "Olá, Metal & Art! Vi o antes/depois no site e quero avaliar uma reforma de portão.")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_antes_depois")}
              className="btn-press border-coal-600 hover:border-ember-500 hover:text-ember-400 font-display inline-flex items-center gap-2.5 border px-6 py-3.5 text-base tracking-[0.06em] text-paper-100 uppercase"
            >
              <IconWhatsApp className="h-4.5 w-4.5" /> Falar agora
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================= DIAGNÓSTICO — SEU PORTÃO PRECISA DE QUÊ? ================= */

const SYMPTOMS = [
  "Está pesado para abrir",
  "Faz barulho ao abrir/fechar",
  "Parou de automatizar",
  "Está enferrujado",
  "Está desalinhado",
  "A mola quebrou",
  "Quero automatizar",
  "Quero reformar o visual",
  "Quero um portão novo",
  "Outro problema",
];

export function Diagnostic() {
  const [sel, setSel] = useState<string[]>([]);
  const toggle = (s: string) =>
    setSel((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const message = `Olá, Metal & Art! Vim pelo site e quero entender meu caso.\n\nMeu portão:\n${sel
    .map((s) => `• ${s}`)
    .join("\n")}\n\nPodemos conversar? Tenho fotos para enviar.`;

  return (
    <section id="diagnostico" className="bg-coal-950 py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div>
            <SectionTag index="06" label="Diagnóstico rápido" />
            <h2 className="font-display mt-6 text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[0.97] uppercase">
              <MaskLines
                lines={[
                  <span key="1" className="text-paper-100">Seu portão</span>,
                  <span key="2" className="text-paper-100">
                    precisa de <em className="text-ember-500 not-italic">quê</em>?
                  </span>,
                ]}
              />
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-steel-400">
              Marque o que está acontecendo. A gente não fecha diagnóstico pela
              internet — quem fecha é a avaliação no local. Mas com os sintomas
              certos, a conversa já começa adiantada.
            </p>
            <p className="font-mono mt-8 text-[0.65rem] leading-relaxed tracking-[0.15em] text-steel-500 uppercase">
              * Nenhuma resposta aqui substitui a visita técnica.
            </p>
          </div>

          <div className="border-coal-700 border bg-coal-900/60 p-6 md:p-8">
            <div className="grid gap-3 sm:grid-cols-2">
              {SYMPTOMS.map((s) => {
                const on = sel.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggle(s)}
                    aria-pressed={on}
                    className={cn(
                      "btn-press flex items-center gap-3 border px-4 py-3.5 text-left text-sm transition-colors",
                      on
                        ? "border-ember-500 bg-ember-500/12 text-paper-100"
                        : "border-coal-600 text-steel-300 hover:border-steel-400"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center border transition-colors",
                        on ? "border-ember-500 bg-ember-500 text-coal-950" : "border-coal-600"
                      )}
                    >
                      {on && <IconCheck className="h-3.5 w-3.5" />}
                    </span>
                    {s}
                  </button>
                );
              })}
            </div>

            <div className="border-coal-700 mt-8 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[0.65rem] tracking-[0.2em] text-steel-400 uppercase">
                {sel.length === 0
                  ? "Selecione ao menos um sintoma"
                  : `${sel.length} sintoma${sel.length > 1 ? "s" : ""} selecionado${sel.length > 1 ? "s" : ""}`}
              </p>
              <a
                href={sel.length ? waLink(business.whatsappDigits, message) : undefined}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sel.length && track("diagnostico_enviado", { sintomas: sel })}
                aria-disabled={sel.length === 0}
                className={cn(
                  "btn-press font-display inline-flex items-center justify-center gap-3 px-6 py-3.5 text-base tracking-[0.06em] uppercase",
                  sel.length
                    ? "bg-ember-500 text-coal-950 hover:bg-weld-400"
                    : "pointer-events-none border border-coal-600 text-steel-500"
                )}
              >
                <IconWhatsApp className="h-4.5 w-4.5" /> Enviar pelo WhatsApp
              </a>
            </div>
            <p className="mt-4 text-center text-xs text-steel-500">
              Vamos entender seu caso: envie estas informações para nossa equipe e receba a orientação certa.
            </p>
          </div>
        </div>

        {/* CTA de fotografia — simples no mobile */}
        <div className="border-ember-600/40 mt-16 grid gap-8 border bg-coal-900/70 p-8 md:grid-cols-[auto_1fr_auto] md:items-center md:p-10">
          <IconCamera className="h-12 w-12 text-ember-500" />
          <div>
            <h3 className="font-display text-2xl tracking-[0.03em] text-paper-100 uppercase md:text-3xl">
              Envie uma foto e explique o problema
            </h3>
            <ol className="mt-3 flex flex-col gap-1.5 text-sm text-steel-400 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {["Fotografe o portão/porta", "Clique no botão", "Envie as fotos no WhatsApp", "Explique a necessidade"].map(
                (step, i) => (
                  <li key={step} className="flex items-center gap-2">
                    <span className="font-mono text-[0.62rem] text-ember-500">{i + 1}.</span> {step}
                  </li>
                )
              )}
            </ol>
          </div>
          <a
            href={waLink(business.whatsappDigits, "Olá, Metal & Art! Estou enviando fotos do meu portão para avaliação.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_foto_cta")}
            className="btn-press bg-[#123524] hover:bg-[#1a4a32] font-display flex items-center justify-center gap-3 border border-[#25D366]/50 px-7 py-4 text-base tracking-[0.06em] text-[#7BE3AC] uppercase"
          >
            <IconWhatsApp className="h-5 w-5" /> Enviar fotos
          </a>
        </div>
      </div>
    </section>
  );
}
