import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { business } from "../config/business";
import { categoryLabels, getProject, projects } from "../data/projects";
import { getService } from "../data/services";
import { MaskLines, cn, track, waLink } from "../lib/motion";
import { Portfolio } from "../components/Portfolio";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconDrag,
  IconWhatsApp,
  SectionTag,
} from "../components/ui";

/* mini comparador antes/depois para cases de reforma */
function Compare({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="border-coal-600 relative aspect-[4/3] overflow-hidden border select-none" data-cursor="ARRASTE">
      <img src={after} alt="Depois da reforma" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt="Antes da reforma" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      </div>
      <div className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-ember-500" style={{ left: `${pos}%` }} aria-hidden="true">
        <span className="border-ember-500 absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 bg-coal-950/85 text-ember-400">
          <IconDrag className="h-4.5 w-4.5" />
        </span>
      </div>
      <span className="font-mono absolute top-3 left-3 z-10 bg-coal-950/85 px-2.5 py-1 text-[0.6rem] tracking-[0.25em] text-steel-300 uppercase">Antes</span>
      <span className="font-mono absolute top-3 right-3 z-10 bg-ember-500 px-2.5 py-1 text-[0.6rem] tracking-[0.25em] text-coal-950 uppercase">Depois</span>
      <label className="absolute inset-0 z-20 cursor-ew-resize">
        <span className="sr-only">Comparar antes e depois</span>
        <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} className="h-full w-full cursor-ew-resize opacity-0" />
      </label>
    </div>
  );
}

export function ProjectsList() {
  return (
    <>
      <header className="blueprint-grid relative overflow-hidden bg-coal-950 pt-36 pb-10 md:pt-44 md:pb-14">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-coal-950" />
        <div className="relative mx-auto max-w-[1440px] px-5 md:px-8">
          <nav aria-label="Breadcrumb" className="font-mono text-[0.62rem] tracking-[0.25em] text-steel-500 uppercase">
            <Link to="/" className="hover:text-ember-400">Início</Link> <span className="text-ember-500">/</span>{" "}
            <span className="text-steel-300">Projetos</span>
          </nav>
          <h1 className="font-display mt-6 text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] uppercase">
            <MaskLines
              lines={[
                <span key="1" className="text-paper-100">Trabalho real,</span>,
                <span key="2" className="text-stroke">peça por peça.</span>,
              ]}
            />
          </h1>
          <p className="mt-5 max-w-2xl leading-relaxed text-steel-400">
            O portfólio da Metal & Art: portões, reformas, automação, proteção e estruturas.
            Filtre por categoria e abra qualquer projeto para ver o que foi feito.
          </p>
        </div>
      </header>
      <div className="-mt-4">
        <Portfolio mode="page" />
      </div>

      {/* ligação com as demais páginas */}
      <section className="border-t border-coal-700 bg-coal-900 py-14">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-6 px-5 md:flex-row md:items-center md:px-8">
          <div>
            <h2 className="font-display text-2xl tracking-[0.03em] text-paper-100 uppercase md:text-3xl">
              Gostou do que viu <em className="text-ember-500 not-italic">aqui</em>?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-steel-400">
              Tudo isso saiu da mesma oficina. Conheça os serviços em detalhe ou monte seu pedido de orçamento em menos de dois minutos.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/servicos"
              onClick={() => track("nav_projetos_para_servicos")}
              className="btn-press border-coal-600 hover:border-ember-500 hover:text-ember-400 font-display inline-flex items-center gap-2 border px-6 py-3.5 text-base tracking-[0.06em] text-paper-100 uppercase"
            >
              Ver todos os serviços <IconArrowRight className="h-4.5 w-4.5" />
            </Link>
            <Link
              to="/orcamento"
              onClick={() => track("nav_projetos_para_orcamento")}
              className="btn-press bg-ember-500 hover:bg-weld-400 font-display inline-flex items-center gap-2 px-6 py-3.5 text-base tracking-[0.06em] text-coal-950 uppercase"
            >
              Montar orçamento <IconArrowUpRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function ProjectDetail() {
  const { slug } = useParams();
  const project = getProject(slug ?? "");

  if (!project) {
    return (
      <section className="bg-coal-950 px-5 pt-44 pb-24 text-center md:px-8">
        <p className="font-mono text-[0.7rem] tracking-[0.3em] text-ember-500 uppercase">Projeto não encontrado</p>
        <h1 className="font-display mt-4 text-4xl text-paper-100 uppercase">Essa página não existe.</h1>
        <Link to="/projetos" className="underline-weld font-mono mt-6 inline-block pb-1 text-[0.7rem] tracking-[0.22em] text-steel-300 uppercase">
          ← Voltar para projetos
        </Link>
      </section>
    );
  }

  const service = getService(project.serviceSlug);
  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length];

  return (
    <article className="bg-coal-950">
      <header className="relative">
        <div className="img-zoom relative h-[52vh] min-h-[22rem] overflow-hidden md:h-[64vh]">
          <img src={project.images[0]} alt={project.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-coal-950 via-coal-950/30 to-coal-950/40" />
        </div>
        <div className="absolute right-0 bottom-0 left-0">
          <div className="mx-auto max-w-[1440px] px-5 pb-10 md:px-8">
            <nav aria-label="Breadcrumb" className="font-mono text-[0.62rem] tracking-[0.25em] text-steel-300 uppercase">
              <Link to="/" className="hover:text-ember-400">Início</Link> <span className="text-ember-500">/</span>{" "}
              <Link to="/projetos" className="hover:text-ember-400">Projetos</Link> <span className="text-ember-500">/</span>{" "}
              <span className="text-paper-100">{categoryLabels[project.category]}</span>
            </nav>
            <h1 className="font-display mt-4 max-w-[22ch] text-[clamp(2.2rem,6vw,4.6rem)] leading-[0.97] text-paper-100 uppercase">
              {project.title}
            </h1>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20">
          <div>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((t) => (
                <span key={t} className="border border-coal-600 px-3 py-1.5 font-mono text-[0.62rem] tracking-[0.18em] text-steel-300 uppercase">
                  {categoryLabels[t]}
                </span>
              ))}
              <span className="border border-ember-600/50 px-3 py-1.5 font-mono text-[0.62rem] tracking-[0.18em] text-ember-400 uppercase">
                {project.location}
              </span>
            </div>

            <p className="mt-7 text-lg leading-relaxed text-steel-300">{project.description}</p>

            {project.beforeImage && project.afterImage && (
              <div className="mt-10">
                <p className="font-mono mb-3 text-[0.65rem] tracking-[0.28em] text-steel-500 uppercase">
                  Transformação — arraste para comparar
                </p>
                <Compare before={project.beforeImage} after={project.afterImage} />
              </div>
            )}

            {project.images.length > 1 && (
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {project.images.slice(1).map((img, i) => (
                  <img key={i} src={img} alt={`${project.title} — imagem ${i + 2}`} loading="lazy" className="border-coal-600 aspect-[4/3] w-full border object-cover" />
                ))}
              </div>
            )}
          </div>

          <aside>
            <div className="border-coal-700 border bg-coal-900/70 p-7 md:p-8">
              <p className="font-mono text-[0.65rem] tracking-[0.28em] text-steel-500 uppercase">Serviço realizado</p>
              <ul className="mt-4 space-y-3">
                {project.scope.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm text-steel-300">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-ember-500" /> {s}
                  </li>
                ))}
              </ul>
            </div>

            {service && (
              <Link
                to={`/servicos/${service.slug}`}
                className="btn-press border-coal-700 hover:border-ember-500 group mt-5 flex items-center justify-between gap-4 border bg-coal-900/70 p-6"
              >
                <span>
                  <span className="font-mono block text-[0.6rem] tracking-[0.22em] text-steel-500 uppercase">Serviço relacionado</span>
                  <span className="font-display mt-1 block text-xl tracking-[0.03em] text-paper-100 uppercase group-hover:text-ember-400">
                    {service.name}
                  </span>
                </span>
                <IconArrowUpRight className="h-5 w-5 shrink-0 text-steel-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ember-500" />
              </Link>
            )}

            <a
              href={waLink(
                business.whatsappDigits,
                `Olá, Metal & Art! Vi o projeto "${project.title}" no site e quero um projeto como este.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_case", { slug: project.slug })}
              className="btn-press bg-ember-500 hover:bg-weld-400 font-display mt-5 flex items-center justify-center gap-3 px-6 py-4 text-base tracking-[0.06em] text-coal-950 uppercase"
            >
              <IconWhatsApp className="h-4.5 w-4.5" /> Quero um projeto como este
            </a>

            <p className="font-mono mt-6 text-[0.6rem] leading-relaxed tracking-[0.15em] text-steel-500 uppercase">
              Fonte do asset: {project.source}
            </p>
          </aside>
        </div>

        <div className="border-coal-700 mt-20 border-t pt-10">
          <SectionTag index="→" label="Próximo projeto" />
          <Link
            to={`/projetos/${next.slug}`}
            onClick={() => track("projeto_aberto", { slug: next.slug })}
            className="group mt-6 grid items-center gap-6 md:grid-cols-[16rem_1fr_auto]"
            data-cursor="ABRIR"
          >
            <div className="img-zoom border-coal-600 relative overflow-hidden border">
              <img src={next.images[0]} alt={next.title} loading="lazy" className={cn("w-full object-cover", "aspect-[4/3]")} />
            </div>
            <div>
              <p className="font-mono text-[0.62rem] tracking-[0.25em] text-ember-400 uppercase">{categoryLabels[next.category]}</p>
              <h2 className="font-display mt-2 text-3xl tracking-[0.02em] text-paper-100 uppercase transition-colors group-hover:text-ember-400 md:text-4xl">
                {next.title}
              </h2>
            </div>
            <IconArrowRight className="hidden h-8 w-8 text-steel-500 transition-all group-hover:translate-x-1 group-hover:text-ember-500 md:block" />
          </Link>
        </div>
      </div>
    </article>
  );
}
