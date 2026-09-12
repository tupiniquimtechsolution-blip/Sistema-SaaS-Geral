import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Flame, Minus, Plus, Search, Sparkles } from "lucide-react";
import type { MenuItem, MenuTag } from "../config/menu";
import { getExtrasPrice, menuCategories } from "../config/menu";
import { useCart } from "../context/CartContext";
import { formatBRL } from "../lib/format";
import { ScrollReveal } from "./ui";

/* ============================================================
   CARDÁPIO — abas animadas (underline deslizante via CSS),
   busca, grid de produtos e modal do item. 100% nativo.
   ============================================================ */

const tagMeta: Record<MenuTag, { label: string; cls: string }> = {
  "mais-pedido": { label: "Mais pedido", cls: "bg-ember text-bg" },
  novo: { label: "Novo", cls: "bg-gold text-bg" },
  vegetariano: { label: "Vegetariano", cls: "bg-leaf text-bg" },
  picante: { label: "Picante", cls: "bg-chili text-bg" },
  "da-casa": { label: "Da casa", cls: "border border-ember/60 text-ember" },
};

export default function MenuBoard({ items, mode = "home" }: { items: MenuItem[]; mode?: "home" | "full" }) {
  const [active, setActive] = useState("destaques");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MenuItem | null>(null);

  const searching = query.trim().length > 0;
  const q = query.trim().toLowerCase();

  const visible = useMemo(() => {
    if (searching) {
      return items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.ingredients.some((ing) => ing.toLowerCase().includes(q)),
      );
    }
    if (active === "destaques") return items.filter((i) => i.featured);
    return items.filter((i) => i.category === active);
  }, [items, active, searching, q]);

  const categories = mode === "home" ? menuCategories : menuCategories.slice(1);

  return (
    <div>
      {/* filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div
          className="no-scrollbar -mx-[4vw] flex gap-2 overflow-x-auto px-[4vw] md:mx-0 md:flex-wrap md:px-0"
          role="tablist"
          aria-label="Categorias do cardápio"
        >
          {categories.map((c) => {
            const isActive = !searching && active === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActive(c.id);
                  setQuery("");
                }}
                className={`relative shrink-0 border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                  isActive ? "border-ember text-ember" : "border-line text-sand hover:border-sand/50 hover:text-cream"
                }`}
              >
                {isActive && <span className="absolute inset-x-2 -bottom-px h-[2px] bg-ember" aria-hidden />}
                {c.label}
              </button>
            );
          })}
        </div>
        <label className="relative block md:w-64">
          <span className="sr-only">Buscar no cardápio</span>
          <Search aria-hidden size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sand" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar no cardápio…"
            className="field pl-9"
          />
        </label>
      </div>

      {/* grid de produtos */}
      <div className="mt-10">
        {visible.length === 0 ? (
          <div className="border border-dashed border-line py-20 text-center">
            <Flame aria-hidden size={28} className="mx-auto text-ember/60" />
            <p className="mt-4 font-display text-2xl uppercase text-cream">Nada na chapa por aqui</p>
            <p className="mt-2 text-sm text-sand">Nenhum item encontrado para “{query}”. Tenta outra palavra?</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item, i) => (
              <ProductCard key={item.id} item={item} index={i} onOpen={() => setSelected(item)} />
            ))}
          </div>
        )}
      </div>

      {mode === "home" && !searching && (
        <ScrollReveal delay={0.1}>
          <div className="mt-12 text-center">
            <Link
              to="/cardapio"
              className="group inline-flex items-center gap-3 border border-cream/25 px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-cream transition-all duration-300 hover:border-ember hover:text-ember"
            >
              Cardápio completo ({items.length} itens)
              <ArrowRight aria-hidden size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>
        </ScrollReveal>
      )}

      <ItemModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function ProductCard({ item, index, onOpen }: { item: MenuItem; index: number; onOpen: () => void }) {
  return (
    <ScrollReveal delay={Math.min(index * 0.06, 0.4)} y={26}>
      <article className="group flex h-full flex-col overflow-hidden border border-line bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-ember/50 hover:shadow-lift">
        <button
          type="button"
          onClick={onOpen}
          className="relative block h-52 w-full overflow-hidden text-left"
          aria-label={`Ver detalhes de ${item.name}`}
        >
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
            style={{ transformOrigin: "center 60%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent opacity-80" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {(item.tags ?? []).map((t) => (
              <span key={t} className={`px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${tagMeta[t].cls}`}>
                {tagMeta[t].label}
              </span>
            ))}
          </div>
          {(item.extras?.length ?? 0) > 0 && (
            <span className="absolute right-3 top-3 flex items-center gap-1 bg-bg/80 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-gold backdrop-blur-sm">
              <Sparkles aria-hidden size={10} /> personalizável
            </span>
          )}
        </button>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-xl uppercase tracking-wide text-cream transition-colors group-hover:text-ember">
              {item.name}
            </h3>
            <p className="shrink-0 font-display text-xl text-gold">{formatBRL(item.price)}</p>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-sand">{item.description}</p>
          <p className="mt-3 text-xs leading-relaxed text-sand/70">{item.ingredients.join(" · ")}</p>

          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <button
              type="button"
              onClick={onOpen}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-sand underline-offset-4 transition-colors hover:text-cream hover:underline"
            >
              Detalhes
            </button>
            <QuickAdd item={item} />
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}

function QuickAdd({ item }: { item: MenuItem }) {
  const { add } = useCart();
  if ((item.extras?.length ?? 0) > 0) {
    return (
      <span className="pointer-events-none border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-sand">
        + extras no detalhe
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => add(item.id)}
      className="flex items-center gap-1.5 bg-ember px-3.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-bg transition-all duration-200 hover:bg-gold hover:shadow-ember active:scale-95"
    >
      <Plus aria-hidden size={12} strokeWidth={3} /> Adicionar
    </button>
  );
}

/* ------------------------- modal do item ------------------------- */

function ItemModal({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  const { add } = useCart();
  const [extras, setExtras] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const itemId = item?.id;

  useEffect(() => {
    if (!itemId) return;
    setExtras([]);
    setNote("");
    setQty(1);
  }, [itemId]);

  // trava o scroll e libera o fechamento por Esc
  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [item, onClose]);

  if (!item) return null;

  const extrasTotal = getExtrasPrice(item, extras);
  const unit = item.price + extrasTotal;

  const toggleExtra = (name: string) =>
    setExtras((prev) => (prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]));

  return (
    <div
      className="animate-fade fixed inset-0 z-[90] flex items-end justify-center bg-bg/80 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes de ${item.name}`}
      onClick={onClose}
    >
      <div
        className="animate-pop max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-line bg-panel sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 sm:h-64">
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center border border-line bg-bg/80 text-cream backdrop-blur-sm transition-colors hover:border-ember hover:text-ember"
            aria-label="Fechar detalhes"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
            <h3 className="display-tight font-display text-3xl uppercase text-cream">{item.name}</h3>
            <p className="font-display text-2xl text-gold">{formatBRL(item.price)}</p>
          </div>
        </div>

        <div className="p-6">
          <p className="text-sm leading-relaxed text-sand">{item.description}</p>
          <p className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs text-sand/70">
            {item.ingredients.map((ing) => (
              <span key={ing} className="border border-linesoft px-2 py-0.5">
                {ing}
              </span>
            ))}
          </p>

          {(item.extras?.length ?? 0) > 0 && (
            <fieldset className="mt-6">
              <legend className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">Adicionais</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {item.extras!.map((ex) => {
                  const on = extras.includes(ex.name);
                  return (
                    <button
                      key={ex.name}
                      type="button"
                      onClick={() => toggleExtra(ex.name)}
                      aria-pressed={on}
                      className={`flex items-center justify-between gap-3 border px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                        on ? "border-ember bg-ember/10 text-cream" : "border-line text-sand hover:border-sand/50"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`grid h-4 w-4 shrink-0 place-items-center border transition-colors ${
                            on ? "border-ember bg-ember text-bg" : "border-sand/50"
                          }`}
                        >
                          {on && <Check aria-hidden size={11} strokeWidth={3.5} />}
                        </span>
                        {ex.name}
                      </span>
                      <span className="font-mono text-xs text-gold">+{formatBRL(ex.price)}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <label className="mt-6 block">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">Observação</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ex.: ponto da carne, sem cebola, capricha no molho…"
              className="field mt-2 resize-none"
            />
          </label>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border border-line" role="group" aria-label="Quantidade">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center text-sand transition-colors hover:text-ember"
                aria-label="Diminuir quantidade"
              >
                <Minus aria-hidden size={15} />
              </button>
              <span className="w-10 text-center font-display text-lg text-cream" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
                className="grid h-11 w-11 place-items-center text-sand transition-colors hover:text-ember"
                aria-label="Aumentar quantidade"
              >
                <Plus aria-hidden size={15} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                add(item.id, extras, note.trim() || undefined, qty);
                onClose();
              }}
              className="flex flex-1 items-center justify-center gap-3 bg-ember px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-bg transition-all duration-300 hover:bg-gold hover:shadow-ember active:scale-[0.98]"
            >
              Adicionar · {formatBRL(unit * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
