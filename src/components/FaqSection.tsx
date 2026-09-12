import { useState } from "react";
import { Link } from "react-router-dom";
import { business } from "../config/business";
import { cn, MaskLines, Reveal, track, waLink } from "../lib/motion";
import { IconArrowRight, IconPlus, IconWhatsApp, SectionTag } from "./ui";

/* ============================================================
   FAQ — objeções comuns (prazo, orçamento, visita técnica,
   materiais, manutenção, automação e formas de atendimento).
   Respostas diretas, sem promessas comerciais inventadas.
   ============================================================ */

const FAQS = [
  {
    q: "Como solicito um orçamento?",
    a: "Pelo WhatsApp: envie fotos do local, uma descrição do que precisa e, se tiver, medidas aproximadas. Com isso a equipe já consegue avaliar e responder com uma proposta — ou agendar uma visita técnica quando o serviço exigir medição no local.",
  },
  {
    q: "Vocês fazem visita técnica e medição?",
    a: "Sim. Para portões, estruturas, coberturas e serviços sob medida, a medição no local faz parte do processo: garante que a peça nasça com as medidas certas do vão. A visita é combinada pelo WhatsApp.",
  },
  {
    q: "Meu portão precisa de reforma ou de troca?",
    a: "Depende do estado da estrutura. Em muitos casos a reforma — alinhamento, roldanas, trilho, solda e pintura — resolve com custo menor. Quando a estrutura está comprometida, a substituição compensa mais. Use a ferramenta “Seu portão precisa de quê?” aqui do site ou envie uma foto que ajudamos a entender o caso.",
  },
  {
    q: "É possível automatizar um portão que já existe?",
    a: "Na maioria dos casos, sim. Antes de instalar o motor, o portão passa por revisão de roldanas, trilho e alinhamento — automação em portão desregulado força o equipamento e encurta a vida útil. Fazemos a automação junto com esse ajuste.",
  },
  {
    q: "Quais materiais vocês trabalham?",
    a: "Aço carbono, perfis metalon, tubos e chapas, com galvanização e pintura conforme a exposição da peça (interna, externa, litoral etc.). O material certo é definido no orçamento, de acordo com o projeto e o uso.",
  },
  {
    q: "Qual o prazo de execução?",
    a: "O prazo depende do tipo de serviço: um reparo simples é diferente de uma estrutura sob medida. Por isso o prazo é informado no orçamento, depois da medição e da definição do escopo — sem promessa genérica.",
  },
  {
    q: "Vocês atendem condomínios e empresas?",
    a: "Sim. Atendemos residências, condomínios e empresas — de portões e grades de proteção a estruturas metálicas, fechamentos e portas de enrolar para comércios.",
  },
  {
    q: "Existe manutenção depois da instalação?",
    a: "Sim. Reparo e manutenção fazem parte dos serviços da oficina: molas de porta de enrolar, fechaduras, ajustes de portão, automação e pintura. É só chamar no WhatsApp com uma foto ou descrição do problema.",
  },
];

export function FaqAccordion({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = compact ? FAQS.slice(0, 5) : FAQS;
  return (
    <div className={cn("border-coal-700 divide-coal-700 divide-y border", !compact && "bg-coal-900/60")}>
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q}>
            <button
              type="button"
              onClick={() => {
                setOpen(isOpen ? null : i);
                track("faq_toggle", { q: f.q });
              }}
              aria-expanded={isOpen}
              className="group flex w-full items-center gap-5 px-5 py-5 text-left transition-colors hover:bg-coal-800/30 md:px-7"
            >
              <span className="font-display text-lg text-sand-400 tabular-nums group-hover:text-ember-500">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "font-display flex-1 text-xl tracking-[0.02em] uppercase transition-colors md:text-2xl",
                  isOpen ? "text-ember-400" : "text-paper-100 group-hover:text-weld-400"
                )}
              >
                {f.q}
              </span>
              <IconPlus
                className={cn(
                  "h-5 w-5 shrink-0 text-arc-400 transition-transform duration-300",
                  isOpen && "rotate-45 text-ember-500"
                )}
              />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl px-5 pb-6 pl-[3.4rem] leading-relaxed text-steel-300 md:px-7 md:pl-[4.4rem]">
                  {f.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Seção resumida exibida na Home (antes do CTA final) */
export function FaqSection() {
  return (
    <section id="faq" className="blueprint-grid relative bg-coal-950 py-24 md:py-28">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
          <div>
            <SectionTag index="12" label="Perguntas frequentes" />
            <h2 className="font-display mt-6 text-[clamp(2.2rem,5vw,3.8rem)] leading-[0.96] uppercase">
              <MaskLines
                lines={[
                  <span key="1" className="text-paper-100">Dúvida de quem</span>,
                  <span key="2" className="text-paper-100">
                    vai <em className="text-ember-500 not-italic">fechar negócio</em>.
                  </span>,
                ]}
              />
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-steel-400">
              As perguntas que mais chegam no WhatsApp, respondidas de forma direta. Não achou a sua?
            </p>
            <a
              href={waLink(business.whatsappDigits, "Olá, Metal & Art! Tenho uma dúvida antes de pedir um orçamento.")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_faq")}
              className="btn-press bg-ember-500 hover:bg-weld-400 font-display mt-7 inline-flex items-center gap-3 px-6 py-3.5 text-base font-bold tracking-[0.06em] text-coal-950 uppercase"
            >
              <IconWhatsApp className="h-4.5 w-4.5" /> Perguntar no WhatsApp
            </a>
          </div>
          <Reveal>
            <FaqAccordion compact />
            <Link
              to="/faq"
              onClick={() => track("faq_ver_todas")}
              className="underline-weld font-mono mt-6 inline-flex items-center gap-2 pb-0.5 text-[0.7rem] tracking-[0.22em] text-arc-400 uppercase hover:text-ember-400"
            >
              Ver todas as perguntas <IconArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Página completa /faq */
export function FaqPage() {
  return (
    <>
      <header className="blueprint-grid relative overflow-hidden bg-coal-950 pt-36 pb-14 md:pt-44">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-coal-950" />
        <div className="relative mx-auto max-w-[1440px] px-5 md:px-8">
          <nav aria-label="Breadcrumb" className="font-mono text-[0.62rem] tracking-[0.25em] text-steel-500 uppercase">
            <Link to="/" className="hover:text-ember-400">Início</Link>{" "}
            <span className="text-ember-500">/</span> <span className="text-steel-300">Perguntas frequentes</span>
          </nav>
          <h1 className="font-display mt-6 max-w-[18ch] text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] uppercase">
            <MaskLines
              lines={[
                <span key="1" className="text-paper-100">Antes do orçamento,</span>,
                <span key="2" className="text-stroke">as respostas.</span>,
              ]}
            />
          </h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-steel-400">
            Prazo, visita técnica, materiais, automação e manutenção — o que os clientes mais perguntam
            antes de fechar com a Metal &amp; Art.
          </p>
        </div>
      </header>

      <section className="bg-coal-900 py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <FaqAccordion />

          <div className="border-coal-700 mt-14 border bg-gradient-to-br from-coal-900 to-coal-800 p-8 md:p-10">
            <p className="font-mono text-[0.65rem] tracking-[0.28em] text-ember-400 uppercase">Ficou alguma dúvida?</p>
            <h2 className="font-display mt-3 text-2xl tracking-[0.02em] text-paper-100 uppercase md:text-3xl">
              Manda a pergunta com uma foto — <em className="text-ember-500 not-italic">resposta rápida</em>.
            </h2>
            <div className="mt-6 flex flex-wrap gap-4">
              <a
                href={waLink(business.whatsappDigits, "Olá, Metal & Art! Tenho uma dúvida antes de pedir um orçamento.")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_faq_pagina")}
                className="btn-press bg-ember-500 hover:bg-weld-400 font-display inline-flex items-center gap-3 px-6 py-3.5 text-base font-bold tracking-[0.06em] text-coal-950 uppercase"
              >
                <IconWhatsApp className="h-4.5 w-4.5" /> WhatsApp {business.phoneDisplay}
              </a>
              <Link
                to="/orcamento"
                className="btn-press border-coal-600 hover:border-ember-500 hover:text-ember-400 font-display inline-flex items-center gap-2 border px-6 py-3.5 text-base tracking-[0.06em] text-paper-100 uppercase"
              >
                Montar orçamento <IconArrowRight className="h-4.5 w-4.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
