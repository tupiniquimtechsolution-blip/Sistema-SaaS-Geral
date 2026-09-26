import { useCallback, useEffect, useRef, useState } from "react";
import { galleryItems } from "../data/media";
import { usePrefersReducedMotion } from "../hooks";
import type { GalleryItem } from "../types";
import { GoldArrow, GoldStar } from "./Ornaments";
import { Reveal } from "./ui";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "momentos", label: "Momentos" },
  { id: "videos", label: "Vídeos" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

/* ---------- Lightbox ---------- */
function Lightbox({
  items,
  index,
  onClose,
  onNav,
}: {
  items: GalleryItem[];
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
      className="fixed inset-0 z-[70] flex flex-col bg-[#0c2417]/97 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={item.caption}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 48) (dx > 0 ? prev : next)();
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.25em] text-mint-200/70">
          {index + 1} / {items.length}
        </p>
        <button
          onClick={onClose}
          aria-label="Fechar galeria"
          className="grid size-11 place-items-center rounded-full border border-gold-500/50 text-gold-300 transition-colors hover:bg-gold-500/10"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 sm:px-16">
        <button
          onClick={prev}
          aria-label="Imagem anterior"
          className="absolute left-3 z-10 grid size-12 place-items-center rounded-full border border-cream/30 text-cream transition-all hover:border-gold-500 hover:text-gold-300 sm:left-6"
        >
          <GoldArrow size={18} className="rotate-180" />
        </button>
        {item.kind === "video" && item.videoPreview ? (
          <div
            key={item.id}
            className={`grid h-[70vh] w-full place-items-center ${
              reduced ? "" : "anim-fadein"
            }`}
          >
            <iframe
              src={item.videoPreview}
              title={item.caption}
              className="block h-[min(58vh,640px)] w-[min(88vw,360px)] rounded-lg border border-gold-500/30 shadow-2xl"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <img
            key={item.id}
            src={item.src}
            alt={item.alt}
            className={`max-h-[70vh] max-w-full rounded-lg border border-gold-500/30 object-contain shadow-2xl ${
              reduced ? "" : "anim-fadein"
            }`}
          />
        )}
        <button
          onClick={next}
          aria-label="Próxima imagem"
          className="absolute right-3 z-10 grid size-12 place-items-center rounded-full border border-cream/30 text-cream transition-all hover:border-gold-500 hover:text-gold-300 sm:right-6"
        >
          <GoldArrow size={18} />
        </button>
      </div>

      <p className="px-6 pb-8 pt-4 text-center font-display text-xl italic text-gold-300">
        {item.caption}
      </p>
    </div>
  );
}

/* ---------- grade masonry ---------- */
export default function Gallery({
  limit,
  showFilters = true,
}: {
  limit?: number;
  showFilters?: boolean;
}) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const items =
    filter === "all"
      ? galleryItems
      : galleryItems.filter((g) => g.category === filter);
  const visible = limit ? items.slice(0, limit) : items;

  const openLightbox = (i: number) => setLightbox(i);

  return (
    <div>
      {showFilters && (
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFilter(f.id);
                setLightbox(null);
              }}
              aria-pressed={filter === f.id}
              className={`rounded-full border px-4 py-1.5 font-body text-[12px] font-semibold tracking-[0.05em] transition-all ${
                filter === f.id
                  ? "border-forest-950 bg-forest-950 text-gold-300"
                  : "border-forest-950/25 bg-cream text-sage hover:border-gold-500 hover:text-gold-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyCategory label={filter === "videos" ? "vídeos" : "fotos"} />
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>figure]:mb-5">
          {visible.map((g, i) => (
            <Reveal
              as="figure"
              key={g.id}
              delay={(i % 3) * 90}
              className="group relative cursor-zoom-in overflow-hidden rounded-xl border border-gold-500/25 bg-cream break-inside-avoid"
            >
              <button
                onClick={() => openLightbox(i)}
                className="relative block w-full"
                aria-label={
                  g.kind === "video" ? `Assistir: ${g.caption}` : `Ampliar: ${g.caption}`
                }
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
                    i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-square" : "aspect-[4/3]"
                  }`}
                />
                {g.kind === "video" && (
                  <span className="absolute inset-0 grid place-items-center" aria-hidden>
                    <span className="grid size-12 place-items-center rounded-full border border-gold-300/70 bg-forest-950/55 text-gold-300 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.5v13l11-6.5-11-6.5z" />
                      </svg>
                    </span>
                  </span>
                )}
              </button>
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-forest-950/80 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <span className="font-display text-lg italic leading-tight text-cream">
                  {g.caption}
                </span>
                <GoldStar size={12} className="shrink-0 text-gold-300" />
              </figcaption>
            </Reveal>
          ))}
        </div>
      )}

      {lightbox !== null && visible[lightbox] && (
        <Lightbox
          items={visible}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNav={setLightbox}
        />
      )}
    </div>
  );
}

/** placeholder elegante para categorias ainda sem conteúdo real (lotes 2/3) */
export function EmptyCategory({ label }: { label: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-gold-500/40 bg-mint-100/60 px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex max-w-[220px] items-center justify-center gap-3 text-gold-500" aria-hidden>
        <span className="h-px flex-1 bg-current opacity-50" />
        <GoldStar size={16} />
        <span className="h-px flex-1 bg-current opacity-50" />
      </div>
      <p className="font-display text-2xl font-medium italic text-forest-950">
        Em breve
      </p>
      <p className="mt-2 max-w-sm font-body text-sm leading-relaxed text-sage">
        As {label} reais da casa estão sendo preparadas e chegarão em breve por
        aqui. Enquanto isso, acompanhe nossa caminhada pelo Instagram.
      </p>
    </div>
  );
}
