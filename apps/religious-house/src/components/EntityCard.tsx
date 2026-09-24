import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ENTITY_VISUALS, getEntityVisual } from "../data/entityVisuals";
import { usePrefersReducedMotion } from "../hooks";
import { formatLong, formatShort, getUpcomingActivities, waLink } from "../lib/calendar";
import type { AgendaItem, EntityVisual } from "../types";
import { GoldArrow, GoldStar, Leaf, LeafSprig, LogoCircle } from "./Ornaments";
import { EventBadge, Reveal, SectionHeading } from "./ui";

/* =========================================================
 * EntityArtCard — o componente central do sistema dinâmico.
 * Desktop: arte em banner horizontal com o texto na metade
 * direita (área livre da arte). Mobile: arte acima e texto
 * em bloco marfim abaixo — nunca texto sobre a figura.
 * Sem arte oficial → fallback institucional elegante.
 * ========================================================= */

function TextContent({
  item,
  displayName,
  accent,
  action,
}: {
  item: AgendaItem;
  displayName: string;
  accent: string;
  action?: ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5">
        <EventBadge type={item.type} />
        {!item.confirmed && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/15 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-gold-700">
            <GoldStar size={9} /> A confirmar
          </span>
        )}
        {item.internal && (
          <span className="rounded-full bg-mint-100 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-[0.14em] text-forest-800">
            Agendamento bloqueado
          </span>
        )}
      </div>

      <p
        className="mt-4 font-body text-[11px] font-bold uppercase tracking-[0.22em]"
        style={{ color: accent }}
      >
        {item.weekdayLabel} · {formatLong(item.date)}
      </p>
      <h3 className="mt-2 font-display text-3xl font-semibold leading-tight text-forest-950 sm:text-4xl">
        {displayName}
      </h3>
      {item.time ? (
        <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-3.5 py-1 font-body text-[12px] font-bold text-gold-700">
          <GoldStar size={10} /> {item.time}
        </p>
      ) : item.type === "gira" || item.type === "festa" ? (
        <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-dashed border-gold-500/60 px-3.5 py-1 font-body text-[12px] font-semibold text-gold-700">
          <GoldStar size={10} /> Horário a confirmar pelo templo
        </p>
      ) : null}
      {item.description && (
        <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-sage">
          {item.description}
        </p>
      )}
      {action && <div className="mt-6 flex flex-wrap items-center gap-3">{action}</div>}
    </div>
  );
}

function InstitutionalCard({
  item,
  displayName,
  accent,
  action,
  className,
}: {
  item: AgendaItem;
  displayName: string;
  accent: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`card-temple relative overflow-hidden rounded-3xl bg-gradient-to-br from-mint-100 via-ivory to-mint-200/70 p-8 sm:p-10 ${className ?? ""}`}
    >
      <div className="pointer-events-none absolute -right-14 -top-16 opacity-20" aria-hidden>
        <LeafSprig color={accent} className="h-64 w-64" flip />
      </div>
      <div className="pointer-events-none absolute -bottom-10 -left-10 opacity-15" aria-hidden>
        <LeafSprig color="var(--color-forest-300)" className="h-48 w-48" />
      </div>
      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="shrink-0 self-center sm:self-auto">
          <LogoCircle size={92} />
        </div>
        <TextContent
          item={item}
          displayName={displayName}
          accent={accent}
          action={action}
        />
      </div>
    </article>
  );
}

export function EntityArtCard({
  item,
  action,
  className,
}: {
  item: AgendaItem;
  action?: ReactNode;
  className?: string;
}) {
  const visual = getEntityVisual(item.entity);
  const accent = visual?.accent ?? "var(--color-gold-500)";
  const displayName = visual?.name ?? item.title;

  if (!visual?.image) {
    return (
      <InstitutionalCard
        item={item}
        displayName={displayName}
        accent={accent}
        action={action}
        className={className}
      />
    );
  }

  return (
    <article
      className={`card-temple group relative overflow-hidden rounded-3xl bg-ivory ${className ?? ""}`}
    >
      <div className="sm:hidden">
        <div className="relative h-56 overflow-hidden">
          <img
            src={visual.image}
            alt={`Arte oficial — ${displayName}`}
            loading="lazy"
            className="h-full w-full object-cover"
            style={{ objectPosition: visual.focalMobile }}
          />
        </div>
        <div className="p-6">
          <TextContent
            item={item}
            displayName={displayName}
            accent={accent}
            action={action}
          />
        </div>
      </div>

      <div className="relative hidden min-h-[360px] sm:block">
        <img
          src={visual.image}
          alt={`Arte oficial — ${displayName}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          style={{ objectPosition: visual.focalDesktop }}
        />
        <div
          className="absolute inset-y-0 right-0 w-[56%] bg-gradient-to-l from-cream via-cream/90 to-cream/0"
          aria-hidden
        />
        <div className="absolute inset-y-0 right-0 flex w-[56%] flex-col justify-center py-10 pl-8 pr-10">
          <TextContent
            item={item}
            displayName={displayName}
            accent={accent}
            action={action}
          />
        </div>
      </div>
    </article>
  );
}

export function EntityArtMini({
  item,
  onClick,
}: {
  item: AgendaItem;
  onClick?: () => void;
}) {
  const visual = getEntityVisual(item.entity);
  const name = visual?.name ?? item.title;

  const inner = (
    <>
      {visual?.image ? (
        <img
          src={visual.image}
          alt={`Arte oficial — ${name}`}
          loading="lazy"
          className="h-full w-24 shrink-0 self-stretch object-cover object-[left_center] sm:w-32"
        />
      ) : (
        <div
          className="grid w-24 shrink-0 self-stretch place-items-center sm:w-32"
          style={{ background: `linear-gradient(160deg, var(--color-mint-100), color-mix(in oklab, ${visual?.accent ?? "var(--color-gold-500)"} 18%, var(--color-mint-200)))` }}
        >
          <LogoCircle size={52} />
        </div>
      )}
      <div className="min-w-0 flex-1 p-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-gold-700">
          {formatShort(item.date)} · {item.weekdayLabel}
        </p>
        <h4 className="mt-1 font-display text-lg font-semibold leading-tight text-forest-950">
          {name}
        </h4>
        {item.time && (
          <p className="mt-1 font-body text-[12px] font-semibold text-sage">{item.time}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {!item.confirmed && (
            <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.12em] text-gold-700">
              A confirmar
            </span>
          )}
          {item.internal && (
            <span className="rounded-full bg-mint-200 px-2.5 py-0.5 font-body text-[9px] font-bold uppercase tracking-[0.12em] text-forest-800">
              Atividade interna
            </span>
          )}
        </div>
      </div>
    </>
  );

  const cls =
    "group flex w-full items-stretch overflow-hidden rounded-2xl border border-forest-950/10 bg-cream text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/70 hover:shadow-[0_20px_44px_-24px_rgba(23,79,50,0.45)]";

  if (onClick) {
    return (
      <button onClick={onClick} className={cls} aria-label={`Ver ${name} no calendário`}>
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
}

export function UpcomingActivities({
  onPickDate,
}: {
  onPickDate: (iso: string) => void;
}) {
  const { giras, desenvolvimento, consultas } = getUpcomingActivities();

  return (
    <section aria-label="Próximas atividades" className="mt-12">
      <div className="grid gap-5 lg:grid-cols-3">
        <Reveal className="rounded-3xl border border-gold-500/25 bg-ivory p-6">
          <p className="eyebrow mb-4 flex items-center gap-2">
            <GoldStar size={10} /> Giras
          </p>
          {giras.length === 0 ? (
            <div>
              <p className="font-display text-xl font-semibold text-forest-950">
                Programação a confirmar
              </p>
              <p className="mt-2 font-body text-[13px] leading-relaxed text-sage">
                As giras acontecem aos sábados. Assim que a casa confirmar a
                próxima, ela aparece aqui e no calendário.
              </p>
              <a
                href={waLink("Axé. Gostaria de confirmar a data da próxima gira de sábado.")}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 font-body text-[13px] font-bold text-forest-950 transition-colors hover:text-gold-700"
              >
                Confirmar pelo WhatsApp <GoldArrow size={14} />
              </a>
            </div>
          ) : (
            <ul className="space-y-3">
              {giras.map((g) => (
                <li key={`${g.date}-${g.title}`}>
                  <EntityArtMini item={g} onClick={() => onPickDate(g.date)} />
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal delay={100} className="rounded-3xl border border-forest-300/60 bg-mint-100/70 p-6">
          <p className="eyebrow mb-4 flex items-center gap-2 !text-forest-800">
            <GoldStar size={10} className="!text-forest-600" /> Desenvolvimento
          </p>
          {desenvolvimento ? (
            <div className="space-y-3">
              <EntityArtMini item={desenvolvimento} onClick={() => onPickDate(desenvolvimento.date)} />
              <p className="px-1 font-body text-[12.5px] leading-relaxed text-sage">
                {desenvolvimento.description}
              </p>
            </div>
          ) : (
            <p className="font-body text-sm text-sage">
              Às sextas-feiras a corrente se desenvolve em atividade interna.
            </p>
          )}
        </Reveal>

        <Reveal delay={200} className="rounded-3xl border border-mulambo/30 bg-ivory p-6">
          <p className="eyebrow mb-4 flex items-center gap-2 !text-mulambo">
            <GoldStar size={10} /> Consultas
          </p>
          {consultas.length === 0 ? (
            <p className="font-body text-sm leading-relaxed text-sage">
              Nenhuma consulta futura cadastrada no momento — fale pelo
              WhatsApp para agendar.
            </p>
          ) : (
            <ul className="space-y-3">
              {consultas.map((c) => (
                <li key={c.date}>
                  <EntityArtMini item={c} onClick={() => onPickDate(c.date)} />
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 px-1 font-body text-[11px] leading-relaxed text-sage">
            Toque em uma data para abrir o dia no calendário e solicitar horário.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function LineageLightbox({
  items,
  index,
  onClose,
  onNav,
}: {
  items: EntityVisual[];
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const touchX = useRef<number | null>(null);
  const item = items[index];

  const prev = useCallback(
    () => onNav((index - 1 + items.length) % items.length),
    [index, items.length, onNav]
  );
  const next = useCallback(
    () => onNav((index + 1) % items.length),
    [index, items.length, onNav]
  );

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-[#0e2418]/97 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Arte — ${item.name}`}
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 48) (dx > 0 ? prev : next)();
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.24em] text-gold-300">
          {index + 1} / {items.length}
        </p>
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="grid size-10 place-items-center rounded-full border border-cream/30 text-cream transition-colors hover:border-gold-300 hover:text-gold-300"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-4 sm:px-16" onClick={(e) => e.stopPropagation()}>
        <button onClick={prev} aria-label="Anterior" className="absolute left-3 z-10 grid size-11 place-items-center rounded-full border border-cream/25 bg-forest-950/60 text-cream transition-all hover:border-gold-300 hover:text-gold-300 sm:left-6">
          <GoldArrow size={16} className="rotate-180" />
        </button>
        <img
          key={item.slug}
          src={item.image ?? ""}
          alt={`Arte oficial — ${item.name}`}
          className={`max-h-[74vh] max-w-full rounded-2xl border border-gold-500/40 object-contain shadow-2xl ${reduced ? "" : "anim-fadein"}`}
        />
        <button onClick={next} aria-label="Próxima" className="absolute right-3 z-10 grid size-11 place-items-center rounded-full border border-cream/25 bg-forest-950/60 text-cream transition-all hover:border-gold-300 hover:text-gold-300 sm:right-6">
          <GoldArrow size={16} />
        </button>
      </div>

      <div className="pb-8 text-center" onClick={(e) => e.stopPropagation()}>
        <p className="font-display text-3xl font-semibold text-cream">{item.name}</p>
        <p className="mt-1 font-body text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-300/80">
          Linha de trabalho da casa
        </p>
      </div>
    </div>
  );
}

const TILE_ASPECTS = [
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[4/5]",
  "aspect-[5/6]",
  "aspect-square",
  "aspect-[3/4]",
];

export function LineageSection() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const withArt = ENTITY_VISUALS.filter((v) => v.image);

  return (
    <section className="py-16 sm:py-20" aria-label="Nossas linhas de trabalho">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Nossas linhas"
          title={
            <>
              As linhas que <em className="text-gold-700">trabalham na casa</em>
            </>
          }
          subtitle="Cada linha de trabalho é recebida com respeito e fundamento. Toque em uma arte para vê-la de perto."
        />

        <div className="mt-12 columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
          {withArt.map((v, i) => (
            <Reveal
              key={v.slug}
              delay={(i % 4) * 80}
              className="group relative block w-full break-inside-avoid"
            >
              <button
                onClick={() => setLightbox(i)}
                className={`relative block w-full overflow-hidden rounded-2xl border border-forest-950/15 bg-ivory text-left shadow-[0_14px_34px_-24px_rgba(23,79,50,0.4)] transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/70 hover:shadow-[0_24px_48px_-24px_rgba(23,79,50,0.5)] ${TILE_ASPECTS[i % TILE_ASPECTS.length]}`}
                aria-label={`Ver arte — ${v.name}`}
              >
                <img
                  src={v.image}
                  alt={`Arte oficial — ${v.name}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover object-[left_center] transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-transparent" aria-hidden />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5">
                  <span className="font-display text-lg font-semibold leading-tight text-cream sm:text-xl">
                    {v.name}
                  </span>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-gold-300/60 text-gold-300 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <GoldStar size={11} />
                  </span>
                </span>
                <span
                  className="pointer-events-none absolute inset-x-3.5 bottom-1.5 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ background: `linear-gradient(90deg, ${v.accent}, transparent)` }}
                  aria-hidden
                />
              </button>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 text-gold-500" aria-hidden>
          <Leaf className="w-7 -rotate-12" />
          <GoldStar size={13} />
          <Leaf className="w-7 rotate-12 scale-x-[-1]" />
        </div>
      </div>

      {lightbox !== null && (
        <LineageLightbox
          items={withArt}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNav={setLightbox}
        />
      )}
    </section>
  );
}
