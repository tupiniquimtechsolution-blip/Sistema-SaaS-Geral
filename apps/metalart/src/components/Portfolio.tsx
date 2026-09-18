import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { business } from "../config/business";
import {
  categoryLabels,
  filters,
  projects,
  type Project,
  type ProjectCategory,
} from "../data/projects";
import {
  MaskLines,
  Reveal,
  cn,
  startSmooth,
  stopSmooth,
  track,
  waLink,
} from "../lib/motion";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconChevronL,
  IconChevronR,
  IconClose,
  IconWhatsApp,
  SectionTag,
} from "./ui";

/* ---------------- card ---------------- */

function ProjectCard({
  p,
  index,
  onOpen,
}: {
  p: Project;
  index: number;
  onOpen?: (p: Project) => void;
}) {
  const isLink = !onOpen;
  const inner = (
    <>
      <div className="img-zoom border-coal-600 group relative overflow-hidden border bg-coal-800">
        <img
          src={p.images[0]}
          alt={p.title}
          loading="lazy"
          className={cn("w-full object-cover", p.tall ? "aspect-[3/4]" : "aspect-[4/3]")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-coal-950/90 via-coal-950/15 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-95" />
        <div className="absolute right-4 bottom-4 left-4 translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
          <p className="font-mono text-[0.6rem] tracking-[0.25em] text-ember-400 uppercase">
            {categoryLabels[p.category]}
          </p>
          <h3 className="font-display mt-1 text-xl leading-tight tracking-[0.02em] text-paper-100 uppercase">
            {p.title}
          </h3>
        </div>
        <span className="font-mono absolute top-3 right-3 bg-coal-950/85 px-2 py-1 text-[0.58rem] tracking-[0.2em] text-steel-300 uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {isLink ? "Abrir case" : "Ver"}
        </span>
      </div>
      <p className="font-mono mt-2 text-[0.6rem] tracking-[0.2em] text-steel-500 uppercase">
        {String(index + 1).padStart(2, "0")} · {p.location}
      </p>
    </>
  );

  const cls = cn("group block", p.tall ? "" : "md:col-span-2");

  if (isLink) {
    return (
      <Link
        to={`/projetos/${p.slug}`}
        className={cls}
        data-cursor="ABRIR"
        onClick={() => track("projeto_aberto", { slug: p.slug })}
      >
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={() => onOpen(p)} className={cn(cls, "text-left")} data-cursor="VER" aria-label={`Ver projeto: ${p.title}`}>
      {inner}
    </button>
  );
}

/* ---------------- lightbox ---------------- */

export function Lightbox({ project, onClose }: { project: Project; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    setImgIdx(0);
    stopSmooth();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setImgIdx((i) => (i + 1) % project.images.length);
      if (e.key === "ArrowLeft") setImgIdx((i) => (i - 1 + project.images.length) % project.images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      startSmooth();
    };
  }, [onClose, project.images.length]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-coal-950/96 p-4 backdrop-blur-sm md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      onClick={onClose}
    >
      <div
        className="border-coal-600 grid max-h-full w-full max-w-6xl grid-cols-1 overflow-y-auto border bg-coal-900 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* galeria */}
        <div className="relative bg-coal-950">
          <img
            src={project.images[imgIdx]}
            alt={`${project.title} — imagem ${imgIdx + 1}`}
            className="aspect-[4/3] w-full object-cover lg:aspect-auto lg:h-full lg:min-h-[26rem]"
          />
          {project.images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx((i) => (i - 1 + project.images.length) % project.images.length)}
                aria-label="Imagem anterior"
                className="btn-press absolute top-1/2 left-3 -translate-y-1/2 border border-coal-600 bg-coal-950/80 p-2 text-paper-100 hover:border-ember-500"
              >
                <IconChevronL className="h-5 w-5" />
              </button>
              <button
                onClick={() => setImgIdx((i) => (i + 1) % project.images.length)}
                aria-label="Próxima imagem"
                className="btn-press absolute top-1/2 right-3 -translate-y-1/2 border border-coal-600 bg-coal-950/80 p-2 text-paper-100 hover:border-ember-500"
              >
                <IconChevronR className="h-5 w-5" />
              </button>
              <span className="font-mono absolute bottom-3 left-3 bg-coal-950/85 px-2 py-1 text-[0.6rem] tracking-[0.2em] text-steel-300 uppercase">
                {imgIdx + 1} / {project.images.length}
              </span>
            </>
          )}
        </div>

        {/* detalhes */}
        <div className="flex flex-col p-6 md:p-8">
          <p className="font-mono text-[0.62rem] tracking-[0.28em] text-ember-500 uppercase">
            {categoryLabels[project.category]} · {project.location}
          </p>
          <h3 className="font-display mt-3 text-3xl leading-tight tracking-[0.02em] text-paper-100 uppercase">
            {project.title}
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-steel-300">{project.description}</p>

          <p className="font-mono mt-6 text-[0.62rem] tracking-[0.25em] text-steel-500 uppercase">Serviço realizado</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {project.scope.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm text-steel-300">
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-ember-500" /> {s}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 pt-2">
            <a
              href={waLink(
                business.whatsappDigits,
                `Olá, Metal & Art! Vi o projeto "${project.title}" no site e quero um projeto como este. Pode me ajudar?`
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_projeto", { slug: project.slug })}
              className="btn-press bg-ember-500 hover:bg-weld-400 font-display flex items-center justify-center gap-3 px-5 py-3.5 text-base tracking-[0.06em] text-coal-950 uppercase"
            >
              <IconWhatsApp className="h-4.5 w-4.5" /> Quero um projeto como este
            </a>
            <Link
              to={`/projetos/${project.slug}`}
              onClick={onClose}
              className="btn-press border-coal-600 hover:border-ember-500 hover:text-ember-400 font-display flex items-center justify-center gap-2 border px-5 py-3 text-sm tracking-[0.07em] text-paper-100 uppercase"
            >
              Ver case completo <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        aria-label="Fechar galeria"
        className="btn-press border-coal-600 hover:border-ember-500 hover:text-ember-400 absolute top-4 right-4 border border-coal-600 bg-coal-950/90 p-3 text-paper-100 md:top-6 md:right-6"
      >
        <IconClose className="h-5 w-5" />
      </button>
    </div>
  );
}

/* ---------------- seção principal ---------------- */

export function Portfolio({
  mode = "home",
  initialFilter = "todos",
}: {
  mode?: "home" | "page";
  initialFilter?: ProjectCategory | "todos";
}) {
  const [filter, setFilter] = useState<ProjectCategory | "todos">(initialFilter);
  const [open, setOpen] = useState<Project | null>(null);

  const list = useMemo(
    () => (filter === "todos" ? projects : projects.filter((p) => p.tags.includes(filter))),
    [filter]
  );

  const handleOpen = useCallback((p: Project) => {
    track("projeto_aberto", { slug: p.slug });
    setOpen(p);
  }, []);

  return (
    <section id="projetos" className="relative bg-coal-950 py-24 md:py-32">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <SectionTag index={mode === "home" ? "05" : "—"} label="Portfólio" />
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="font-display max-w-[18ch] text-[clamp(2.4rem,6vw,5rem)] leading-[0.96] uppercase">
            <MaskLines
              lines={[
                <span key="1" className="text-paper-100">Projetos</span>,
                <span key="2" className="text-paper-100">
                  Metal <em className="text-ember-500 not-italic">&amp;</em> Art
                </span>,
              ]}
            />
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-steel-400 md:text-right">
            Trabalho real de oficina: portões, reformas, automação, proteção e
            estruturas. Toque em qualquer projeto para ver os detalhes.
          </p>
        </div>

        {/* filtros */}
        <div className="mt-12 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar projetos por categoria">
          {filters.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => {
                setFilter(f.id);
                track("filtro_portfolio", { filtro: f.id });
              }}
              className={cn(
                "btn-press font-mono border px-4 py-2 text-[0.65rem] tracking-[0.22em] uppercase transition-colors",
                filter === f.id
                  ? "border-ember-500 bg-ember-500 text-coal-950"
                  : "border-coal-600 text-steel-300 hover:border-steel-400 hover:text-paper-100"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* grade editorial mista */}
        <div key={filter} className="mt-10 grid grid-flow-dense grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p, i) => (
            <div
              key={p.slug}
              className={cn("card-in", p.tall ? "lg:row-span-2" : "lg:col-span-2")}
              style={{ animationDelay: `${i * 55}ms` }}
            >
              {mode === "home" ? (
                <ProjectCard p={p} index={i} onOpen={handleOpen} />
              ) : (
                <ProjectCard p={p} index={i} />
              )}
            </div>
          ))}
        </div>

        {list.length === 0 && (
          <p className="font-mono mt-10 text-sm text-steel-500 uppercase">Nenhum projeto nesta categoria ainda.</p>
        )}

        {mode === "home" && (
          <Reveal className="mt-14 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[0.68rem] tracking-[0.22em] text-steel-500 uppercase">
              + trabalhos no Instagram {business.instagram.handle}
            </p>
            <Link
              to="/projetos"
              className="btn-press border-coal-600 hover:border-ember-500 hover:text-ember-400 font-display inline-flex items-center gap-3 border px-6 py-3.5 text-base tracking-[0.06em] text-paper-100 uppercase"
            >
              Ver todos os projetos <IconArrowUpRight className="h-4.5 w-4.5" />
            </Link>
          </Reveal>
        )}
      </div>

      {open && <Lightbox project={open} onClose={() => setOpen(null)} />}

      <style>{`
        .card-in { animation: card-in .55s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes card-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .card-in { animation: none; } }
      `}</style>
    </section>
  );
}
