import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BUSINESS } from "../config/business";
import { CATEGORY_META } from "../data/machines";
import type { Implement, Machine } from "../data/machines";
import { cx, formatBRL, machineMessage, waLink } from "../lib/utils";
import { useApp } from "../store/AppStore";
import { IcArrow, IcEngine, IcHeart, IcPin, IcScale, IcWhatsApp, StatusTag } from "./ui";

function HeartBtn({ id, className }: { id: string; className?: string }) {
  const { isFavorite, toggleFavorite } = useApp();
  const fav = isFavorite(id);
  return (
    <button
      onClick={() => toggleFavorite(id)}
      aria-pressed={fav}
      aria-label={fav ? "Remover das minhas peças" : "Salvar nas minhas peças"}
      title="Minhas peças"
      className={cx(
        "grid h-10 w-10 place-items-center border backdrop-blur-sm transition-all duration-200",
        fav
          ? "border-safety-500/60 bg-safety-500/15 text-safety-400"
          : "border-line-dark bg-coal-950/70 text-steel-300 hover:border-safety-400 hover:text-safety-400",
        className,
      )}
    >
      <IcHeart size={17} filled={fav} />
    </button>
  );
}

function CompareBtn({ id }: { id: string }) {
  const { inCompare, toggleCompare } = useApp();
  const on = inCompare(id);
  return (
    <button
      onClick={() => toggleCompare(id)}
      aria-pressed={on}
      title={on ? "Remover da comparação" : "Adicionar à comparação (até 3)"}
      aria-label={on ? "Remover da comparação" : "Adicionar à comparação"}
      className={cx(
        "grid h-[46px] w-[46px] shrink-0 place-items-center border transition-all duration-200",
        on
          ? "border-hz-400 bg-hz-400 text-coal-950"
          : "border-line-dark bg-coal-800 text-steel-300 hover:border-hz-400 hover:text-hz-300",
      )}
    >
      <IcScale size={18} />
    </button>
  );
}

export function MachineCard({ m, delay = 0 }: { m: Machine; delay?: number }) {
  const sold = m.status === "vendida";
  return (
    <article
      className={cx(
        "group relative flex flex-col border border-line-dark bg-coal-900 transition-all duration-300",
        sold ? "opacity-75" : "hover:-translate-y-1.5 hover:border-steel-500 hover:shadow-plate",
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line-dark bg-coal-800">
        <Link to={`/pecas/${m.slug}`} tabIndex={-1} aria-hidden="true" className="block h-full">
          <img
            src={m.images[0]}
            alt={`${m.model} — ${m.brand} (${m.code})`}
            loading="lazy"
            className={cx(
              "h-full w-full bg-white object-contain p-5 transition-transform duration-700 ease-out",
              sold ? "grayscale" : "group-hover:scale-[1.07]",
            )}
          />
        </Link>
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-col gap-2">
            <span
              className={cx(
                "clip-cut-sm px-2.5 py-1 font-cond text-[12px] font-bold uppercase tracking-[0.18em]",
                m.condition === "original" ? "bg-hz-400 text-coal-950" : "bg-coal-950/85 text-bone-100 backdrop-blur-sm",
              )}
            >
              {m.condition === "original" ? "Original" : "Compatível"}
            </span>
            <StatusTag status={m.status} />
          </div>
          <HeartBtn id={m.id} />
        </div>
        {!sold && (
          <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-hz-400 py-2 text-center font-cond text-[13px] font-bold uppercase tracking-[0.2em] text-coal-950 transition-transform duration-300 group-hover:translate-y-0">
            Ver ficha completa →
          </div>
        )}
        {sold && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-coal-950/40">
            <span className="-rotate-6 border-2 border-safety-400 bg-coal-950/90 px-6 py-2 font-display text-2xl uppercase tracking-[0.14em] text-safety-400">
              Esgotada
            </span>
          </div>
        )}
        <span className="clip-cut-sm absolute bottom-3 left-3 z-10 bg-coal-950/92 px-3 py-1.5 font-cond text-[12px] font-bold uppercase tracking-[0.2em] text-steel-300 backdrop-blur-sm">
          {m.code}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-cond text-[12px] font-semibold uppercase tracking-[0.24em] text-steel-400">
          {m.brand} · {m.oem}
        </p>
        <h3 className="mt-1 font-display text-[24px] leading-tight uppercase">
          <Link to={`/pecas/${m.slug}`} className="transition-colors hover:text-hz-300">
            {m.model}
          </Link>
        </h3>

        <dl className="mt-4 space-y-1.5 border-y border-line-dark py-3.5 text-[14px] text-steel-200">
          <div className="flex items-center gap-2">
            <IcEngine size={15} className="shrink-0 text-hz-400" />
            <dt className="sr-only">Aplicação</dt>
            <dd className="font-cond font-semibold tracking-wide">Aplica: {m.application}</dd>
          </div>
          <div className="flex items-center gap-2">
            <IcPin size={15} className="shrink-0 text-hz-400" />
            <dt className="sr-only">Categoria e local</dt>
            <dd className="font-cond font-semibold tracking-wide">
              {CATEGORY_META[m.category].label} · {m.location}
            </dd>
          </div>
        </dl>

        {m.badges.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {m.badges.map((b) => (
              <li key={b} className="border border-agri-500/40 bg-agri-500/10 px-2 py-0.5 font-cond text-[11px] font-semibold uppercase tracking-[0.14em] text-agri-300">
                {b}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 border-t border-line-dark pt-4">
          {m.price ? (
            <p className="font-cond text-[24px] font-bold leading-none text-hz-300">{formatBRL(m.price)}</p>
          ) : (
            <p className="font-cond text-[16px] font-semibold uppercase tracking-[0.16em] text-bone-100">Preço sob consulta</p>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-5">
          {sold ? (
            <a
              href={waLink(BUSINESS.whatsapp, `Olá! A peça ${m.model} (${m.code}) está esgotada no site. Podem me avisar quando chegar outra?`)}
              target="_blank"
              rel="noreferrer"
              className="clip-cut-sm flex flex-1 items-center justify-center gap-2 bg-coal-700 px-4 py-3 font-cond text-[13px] font-bold uppercase tracking-[0.16em] text-bone-100 transition-colors hover:bg-coal-600"
            >
              <IcWhatsApp size={16} /> Avisar quando chegar
            </a>
          ) : (
            <>
              <Link
                to={`/pecas/${m.slug}`}
                className="clip-cut-sm flex flex-1 items-center justify-center gap-2 border border-steel-500 px-4 py-3 font-cond text-[13px] font-bold uppercase tracking-[0.16em] text-bone-100 transition-all duration-200 hover:border-hz-400 hover:text-hz-300"
              >
                Detalhes <IcArrow size={15} />
              </Link>
              <a
                href={waLink(BUSINESS.whatsapp, machineMessage(m))}
                target="_blank"
                rel="noreferrer"
                aria-label={`Falar no WhatsApp sobre ${m.model}`}
                title="Orçamento via WhatsApp"
                className="grid h-[46px] w-[46px] shrink-0 place-items-center bg-[#1f9d44] text-bone-100 transition-all duration-200 hover:bg-[#23b34d]"
              >
                <IcWhatsApp size={19} />
              </a>
              <CompareBtn id={m.id} />
            </>
          )}
        </div>
      </div>
    </article>
  );
}

/* ---------------- Motores (SVG técnico) ---------------- */

function EngineGlyph({ glyph }: { glyph: Implement["glyph"] }) {
  const paths: Record<Implement["glyph"], ReactNode> = {
    motor: (
      <>
        <path d="M7 9V6h8v3h3l2 3h3v8h-3l-2 2H8l-3-3H3v-7h2l2-3Z" />
        <path d="M10 6V3h6" />
        <path d="M9 13h7M9 16h7" />
      </>
    ),
    bomba: (
      <>
        <circle cx="12" cy="12" r="7" />
        <path d="M12 5v7l4 3M19 12h3M12 19v3" />
      </>
    ),
    filtro: (
      <>
        <path d="M5 4h14v4l-5 5v6l-4 2v-8L5 8V4Z" />
      </>
    ),
    engrenagem: (
      <>
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.2 2.2m8.4 8.4 2.2 2.2m0-12.8-2.2 2.2M7.8 16.2l-2.2 2.2" />
      </>
    ),
    rodado: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 4v5m0 6v5M4 12h5m6 0h5" />
      </>
    ),
    tanque: (
      <>
        <rect x="5" y="7" width="14" height="13" rx="1" />
        <path d="M9 7V4h6v3M9 12h6" />
      </>
    ),
    vedacao: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" />
      </>
    ),
    transmissao: (
      <>
        <circle cx="7" cy="8" r="3.5" />
        <circle cx="16" cy="16" r="4.5" />
        <path d="M9.5 10.5 13 14" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" className="h-24 w-24 text-hz-400 transition-colors duration-300 group-hover:text-hz-300" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      {paths[glyph]}
    </svg>
  );
}

export function ImplementCard({ it, delay = 0 }: { it: Implement; delay?: number }) {
  const msg = `Olá! Tenho interesse em motor / peça:\n\n• Marca: ${it.brand}\n• Modelo: ${it.model}\n• Aplicação: ${it.compat}\n\nEncontrei no site da ${BUSINESS.name}. Pode me passar preço e prazo?`;
  return (
    <article
      className="group relative flex flex-col border border-line-dark bg-coal-900 transition-all duration-300 hover:-translate-y-1.5 hover:border-steel-500 hover:shadow-plate"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-line-dark bg-coal-800"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-line-dark) 1px, transparent 1px), linear-gradient(90deg, var(--color-line-dark) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      >
        <EngineGlyph glyph={it.glyph} />
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <span className="clip-cut-sm bg-hz-400 px-2.5 py-1 font-cond text-[12px] font-bold uppercase tracking-[0.18em] text-coal-950">{it.type}</span>
          <span className="bg-coal-950/85 px-2.5 py-1 font-cond text-[11px] font-bold uppercase tracking-[0.18em] text-steel-200">{it.condition}</span>
        </div>
        <HeartBtn id={it.id} className="absolute right-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-cond text-[12px] font-semibold uppercase tracking-[0.24em] text-steel-400">{it.brand}</p>
        <h3 className="mt-1 font-display text-[24px] leading-tight uppercase">{it.model}</h3>
        <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed text-steel-300">{it.description}</p>
        <p className="mt-3 font-cond text-[13px] font-semibold uppercase tracking-[0.14em] text-agri-300">Aplicação: {it.compat}</p>
        <div className="mt-4 border-t border-line-dark pt-4">
          {it.price ? (
            <p className="font-cond text-[22px] font-bold text-hz-300">{formatBRL(it.price)}</p>
          ) : (
            <p className="font-cond text-[15px] font-semibold uppercase tracking-[0.16em] text-bone-100">Preço sob consulta</p>
          )}
        </div>
        <div className="mt-auto flex gap-2 pt-4">
          <a
            href={waLink(BUSINESS.whatsapp, msg)}
            target="_blank"
            rel="noreferrer"
            className="clip-cut-sm flex flex-1 items-center justify-center gap-2 bg-[#1f9d44] px-4 py-3 font-cond text-[13px] font-bold uppercase tracking-[0.16em] text-bone-100 transition-colors hover:bg-[#23b34d]"
          >
            <IcWhatsApp size={16} /> WhatsApp
          </a>
          <CompareBtn id={it.id} />
        </div>
      </div>
    </article>
  );
}
