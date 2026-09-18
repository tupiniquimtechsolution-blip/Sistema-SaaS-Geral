import { Link, useParams } from "react-router-dom";
import { business } from "../config/business";
import { getService, services } from "../data/services";
import { categoryLabels, projects } from "../data/projects";
import { MaskLines, Reveal, track, waLink } from "../lib/motion";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconChevronL,
  IconChevronR,
  IconWhatsApp,
  SectionTag,
} from "../components/ui";

/** Converte o slug do serviço na opção equivalente do orçamento guiado */
const WIZARD_BY_SLUG: Record<string, string> = {
  "reforma-de-portoes": "Reforma",
  "automacao-de-portoes": "Automação",
  "portoes-sob-medida": "Portão",
  "grades-de-protecao": "Grade",
  corrimaos: "Corrimão",
  "guarda-corpos": "Guarda-corpo",
  "porta-de-enrolar": "Porta de enrolar",
  "estruturas-metalicas": "Estrutura metálica",
  "fechaduras-e-travas": "Outro",
};
const wizardServiceFor = (slug: string) => WIZARD_BY_SLUG[slug] ?? "Outro";

function PageHero({ kicker, title, sub }: { kicker: string; title: React.ReactNode[]; sub: string }) {
  return (
    <header className="blueprint-grid relative overflow-hidden bg-coal-950 pt-36 pb-16 md:pt-44 md:pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-coal-950" />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-8">
        <nav aria-label="Breadcrumb" className="font-mono text-[0.62rem] tracking-[0.25em] text-steel-500 uppercase">
          <Link to="/" className="hover:text-ember-400">Início</Link> <span className="text-ember-500">/</span> <span className="text-steel-300">{kicker}</span>
        </nav>
        <h1 className="font-display mt-6 text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] uppercase">
          <MaskLines lines={title} />
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-steel-400">{sub}</p>
      </div>
    </header>
  );
}

export function ServicesList() {
  return (
    <>
      <PageHero
        kicker="Serviços"
        title={[
          <span key="1" className="text-paper-100">O que a oficina</span>,
          <span key="2" className="text-stroke">resolve.</span>,
        ]}
        sub="Todos os serviços da Metal & Art, com descrição completa, aplicações e orçamento direto pelo WhatsApp. Toque em um serviço para ver os detalhes."
      />
      <section className="bg-coal-900 py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <div className="border-coal-700 border-t">
            {services.map((s, i) => (
              <Link
                key={s.slug}
                to={`/servicos/${s.slug}`}
                onClick={() => track("servico_lista", { slug: s.slug })}
                className="group border-coal-700 hover:bg-coal-850 grid grid-cols-[3rem_1fr_2rem] items-center gap-5 border-b px-2 py-8 transition-colors md:grid-cols-[5rem_1.2fr_1fr_10rem_3rem] md:px-4"
              >
                <span className="font-mono text-sm text-steel-500 group-hover:text-ember-500">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="font-display block text-2xl tracking-[0.03em] text-paper-100 uppercase transition-transform duration-300 group-hover:translate-x-1.5 md:text-3xl">
                    {s.name}
                  </span>
                  <span className="font-mono mt-1 block text-[0.6rem] tracking-[0.22em] text-ember-400/80 uppercase">{s.tag}</span>
                </span>
                <span className="hidden text-sm leading-relaxed text-steel-400 md:block">{s.shortDescription}</span>
                <span className="hidden md:block">
                  <span className="btn-press bg-ember-500 font-display inline-flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.08em] text-coal-950 uppercase">
                    Ver detalhes <IconArrowRight className="h-3.5 w-3.5" />
                  </span>
                </span>
                <IconArrowUpRight className="hidden h-5 w-5 justify-self-end text-steel-500 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-ember-500 md:block" />
              </Link>
            ))}
          </div>

          <Reveal className="mt-16 flex flex-col items-start justify-between gap-6 border border-dashed border-coal-600 p-8 md:flex-row md:items-center md:p-10">
            <div>
              <h2 className="font-display text-3xl tracking-[0.02em] text-paper-100 uppercase">Não encontrou o que precisa?</h2>
              <p className="mt-2 max-w-xl text-steel-400">
                Serralheria é ofício de resolver: mande uma foto ou a descrição que a gente avalia se faz — e como faz.
              </p>
            </div>
            <a
              href={waLink(business.whatsappDigits, "Olá, Metal & Art! Tenho uma necessidade que não está listada no site. Podemos conversar?")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_servicos_outro")}
              className="btn-press bg-ember-500 hover:bg-weld-400 font-display inline-flex shrink-0 items-center gap-3 px-6 py-3.5 text-base tracking-[0.06em] text-coal-950 uppercase"
            >
              <IconWhatsApp className="h-4.5 w-4.5" /> Descrever no WhatsApp
            </a>
          </Reveal>

          {/* ligação com as demais páginas */}
          <Reveal className="mt-10 flex flex-col items-start justify-between gap-6 border border-coal-700 bg-coal-850 p-8 md:flex-row md:items-center md:p-10">
            <div>
              <p className="font-mono text-[0.62rem] tracking-[0.28em] text-ember-400 uppercase">Antes de decidir, veja feito</p>
              <h2 className="font-display mt-2 text-3xl tracking-[0.02em] text-paper-100 uppercase">
                Projetos reais saídos <em className="text-ember-500 not-italic">daqui</em>.
              </h2>
            </div>
            <Link
              to="/projetos"
              onClick={() => track("nav_servicos_para_projetos")}
              className="btn-press border-coal-600 hover:border-ember-500 hover:text-ember-400 font-display inline-flex shrink-0 items-center gap-3 border px-6 py-3.5 text-base tracking-[0.06em] text-paper-100 uppercase"
            >
              Ver portfólio completo <IconArrowRight className="h-4.5 w-4.5" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export function ServiceDetail() {
  const { slug } = useParams();
  const service = getService(slug ?? "");

  if (!service) {
    return (
      <section className="bg-coal-950 px-5 pt-44 pb-24 text-center md:px-8">
        <p className="font-mono text-[0.7rem] tracking-[0.3em] text-ember-500 uppercase">Serviço não encontrado</p>
        <h1 className="font-display mt-4 text-4xl text-paper-100 uppercase">Essa página não existe.</h1>
        <Link to="/servicos" className="underline-weld font-mono mt-6 inline-block pb-1 text-[0.7rem] tracking-[0.22em] text-steel-300 uppercase">
          ← Voltar para serviços
        </Link>
      </section>
    );
  }

  const idx = services.findIndex((s) => s.slug === service.slug);
  const prev = services[(idx - 1 + services.length) % services.length];
  const next = services[(idx + 1) % services.length];
  const related = projects.filter((p) => p.serviceSlug === service.slug).slice(0, 3);

  return (
    <>
      <header className="blueprint-grid relative overflow-hidden bg-coal-950 pt-32 pb-14 md:pt-40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-coal-950" />
        <div className="relative mx-auto max-w-[1440px] px-5 md:px-8">
          <nav aria-label="Breadcrumb" className="font-mono text-[0.62rem] tracking-[0.25em] text-steel-500 uppercase">
            <Link to="/" className="hover:text-ember-400">Início</Link> <span className="text-ember-500">/</span>{" "}
            <Link to="/servicos" className="hover:text-ember-400">Serviços</Link> <span className="text-ember-500">/</span>{" "}
            <span className="text-steel-300">{service.slug}</span>
          </nav>
          <div className="mt-6 grid items-end gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <SectionTag index={String(idx + 1).padStart(2, "0")} label={service.tag} />
              <h1 className="font-display mt-5 text-[clamp(2.4rem,6.5vw,5rem)] leading-[0.95] uppercase">
                <MaskLines lines={[<span key="full" className="text-paper-100">{service.name}</span>]} />
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-steel-300">{service.shortDescription}</p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <a
                href={waLink(business.whatsappDigits, service.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_servico_pagina", { slug: service.slug })}
                className="btn-press bg-ember-500 hover:bg-weld-400 font-display inline-flex items-center gap-3 px-6 py-3.5 text-base tracking-[0.06em] text-coal-950 uppercase"
              >
                <IconWhatsApp className="h-4.5 w-4.5" /> Orçamento deste serviço
              </a>
              <Link
                to="/orcamento"
                state={{ service: wizardServiceFor(service.slug) }}
                onClick={() => track("orcamento_do_servico", { slug: service.slug })}
                className="btn-press border-coal-600 hover:border-ember-500 hover:text-ember-400 font-display inline-flex items-center gap-2 border px-6 py-3.5 text-base tracking-[0.06em] text-paper-100 uppercase"
              >
                Orçamento guiado <IconArrowRight className="h-4.5 w-4.5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-coal-900 py-16 md:py-20">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
            <div>
              <img
                src={service.images[0]}
                alt={`${service.name} — trabalho da Metal & Art`}
                className="border-coal-600 aspect-[16/10] w-full border object-cover"
              />
              {service.images[1] && (
                <img
                  src={service.images[1]}
                  alt={`${service.name} — detalhe`}
                  className="border-coal-600 mt-5 hidden aspect-[16/10] w-full border object-cover md:block"
                  loading="lazy"
                />
              )}
            </div>
            <div>
              {service.description.map((par, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <p className="mb-5 leading-relaxed text-steel-300">{par}</p>
                </Reveal>
              ))}

              <div className="border-coal-700 mt-8 border-t pt-7">
                <p className="font-mono text-[0.65rem] tracking-[0.28em] text-steel-500 uppercase">O que está incluso</p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {service.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-steel-300">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-ember-500" /> {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-coal-700 mt-7 border-t pt-7">
                <p className="font-mono text-[0.65rem] tracking-[0.28em] text-steel-500 uppercase">Aplicações</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {service.applications.map((a) => (
                    <span key={a} className="border border-coal-600 px-3 py-1.5 font-mono text-[0.62rem] tracking-[0.18em] text-steel-300 uppercase">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-20">
              <SectionTag index="+" label="Projetos com este serviço" />
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <Link key={p.slug} to={`/projetos/${p.slug}`} className="img-zoom border-coal-600 group relative block overflow-hidden border" data-cursor="ABRIR">
                    <img src={p.images[0]} alt={p.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-coal-950/90 via-transparent to-transparent" />
                    <p className="font-mono absolute bottom-4 left-4 text-[0.6rem] tracking-[0.22em] text-ember-400 uppercase">
                      {categoryLabels[p.category]}
                    </p>
                    <h3 className="font-display absolute right-4 bottom-3.5 left-4 pt-4 text-lg tracking-[0.02em] text-paper-100 uppercase">
                      {p.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <nav className="border-coal-700 mt-20 grid gap-px border bg-coal-700 sm:grid-cols-2" aria-label="Outros serviços">
            <Link to={`/servicos/${prev.slug}`} className="group bg-coal-900 p-6 transition-colors hover:bg-coal-850 md:p-8">
              <p className="font-mono flex items-center gap-2 text-[0.62rem] tracking-[0.25em] text-steel-500 uppercase">
                <IconChevronL className="h-4 w-4" /> Serviço anterior
              </p>
              <p className="font-display mt-2 text-xl tracking-[0.03em] text-paper-100 uppercase group-hover:text-ember-400">{prev.name}</p>
            </Link>
            <Link to={`/servicos/${next.slug}`} className="group bg-coal-900 p-6 text-right transition-colors hover:bg-coal-850 md:p-8">
              <p className="font-mono flex items-center justify-end gap-2 text-[0.62rem] tracking-[0.25em] text-steel-500 uppercase">
                Próximo serviço <IconChevronR className="h-4 w-4" />
              </p>
              <p className="font-display mt-2 text-xl tracking-[0.03em] text-paper-100 uppercase group-hover:text-ember-400">{next.name}</p>
            </Link>
          </nav>
        </div>
      </section>
    </>
  );
}
