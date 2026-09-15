import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BUSINESS } from "../config/business";
import { CATEGORY_META, IMPLEMENTS, MACHINES } from "../data/machines";
import type { Category, Machine } from "../data/machines";
import { cx, usePageMeta } from "../lib/utils";
import { useApp } from "../store/AppStore";
import { ImplementCard, MachineCard } from "../components/MachineCard";
import { Btn, IcChevronD, IcFilter, IcHeart, IcSearch, IcX, Kicker, Reveal } from "../components/ui";

export type CatalogMode = "all" | "originais" | "compativeis" | "motores" | "favoritas";

const MODE_META: Record<CatalogMode, { kicker: string; title: string; sub: string }> = {
  all: {
    kicker: "Estoque online",
    title: "Todas as peças",
    sub: "Bombas, rolamentos, duocones, filtros, engrenagens e muito mais para o seu rolo compactador — com código, aplicação e preço na mesa.",
  },
  originais: {
    kicker: "Linha genuína",
    title: "Peças originais",
    sub: "Peças com procedência de fábrica e garantia. Para quem não abre mão do especificado no manual.",
  },
  compativeis: {
    kicker: "Custo inteligente",
    title: "Peças compatíveis",
    sub: "Alternativas revisadas e selecionadas pela nossa equipe técnica, com qualidade conferida peça a peça.",
  },
  motores: {
    kicker: "Coração da máquina",
    title: "Motores",
    sub: "Perkins, MWM, Cummins, Deutz, Kubota e Mercedes-Benz: motores completos e peças com pronta entrega.",
  },
  favoritas: {
    kicker: "Minhas peças",
    title: "Sua lista salva",
    sub: "Peças que você marcou com o coração ficam guardadas neste navegador — pronto para montar o pedido.",
  },
};

const BADGE_OPTIONS = ["Pronta entrega", "Mais vendido", "Testada em bancada", "Peça de grande porte"];

interface Filters {
  q: string;
  categorias: Category[];
  marcas: string[];
  condition: "" | "original" | "compativel";
  status: "" | "disponivel" | "reservada" | "vendida";
  preco: "" | "ate500" | "500a2000" | "2000mais" | "consulta";
  badges: string[];
}

const EMPTY: Filters = { q: "", categorias: [], marcas: [], condition: "", status: "", preco: "", badges: [] };
type SortKey = "relevancia" | "menor-preco" | "maior-preco" | "az";

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-line-dark py-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between" aria-expanded={open}>
        <span className="font-cond text-[13px] font-bold uppercase tracking-[0.2em] text-bone-100">{title}</span>
        <IcChevronD size={16} className={cx("text-steel-400 transition-transform duration-300", !open && "-rotate-90")} />
      </button>
      <div className={cx("grid transition-all duration-300", open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function CheckRow({ label, checked, onToggle, count }: { label: string; checked: boolean; onToggle: () => void; count?: number }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 py-1.5">
      <input type="checkbox" checked={checked} onChange={onToggle} className="peer sr-only" />
      <span
        className={cx(
          "grid h-5 w-5 shrink-0 place-items-center border transition-all duration-200",
          checked ? "border-hz-400 bg-hz-400 text-coal-950" : "border-steel-500 bg-transparent group-hover:border-hz-400",
        )}
        aria-hidden="true"
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4">
            <path d="m4 12 5 5L20 6" />
          </svg>
        )}
      </span>
      <span className={cx("text-[14px] transition-colors", checked ? "text-bone-100" : "text-steel-300 group-hover:text-bone-100")}>{label}</span>
      {count != null && <span className="ml-auto font-cond text-[12px] text-steel-500">{count}</span>}
    </label>
  );
}

const selectCls =
  "w-full border border-line-dark bg-coal-800 px-3 py-2.5 font-cond text-[13px] font-semibold uppercase tracking-[0.1em] text-bone-100 focus:border-hz-400 focus:outline-none";

function FiltersPanel({ f, setF, scope }: { f: Filters; setF: (f: Filters) => void; scope: Machine[] }) {
  const marcas = [...new Set(scope.map((m) => m.brand))];
  const activeCount =
    f.categorias.length + f.marcas.length + f.badges.length + (f.condition ? 1 : 0) + (f.status ? 1 : 0) + (f.preco ? 1 : 0);
  const toggleIn = <T,>(arr: T[], v: T): T[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-cond text-[14px] font-bold uppercase tracking-[0.24em] text-hz-300">Filtros</p>
        {activeCount > 0 && (
          <button onClick={() => setF({ ...EMPTY, q: f.q })} className="font-cond text-[12px] font-bold uppercase tracking-[0.16em] text-safety-400 hover:text-safety-500">
            Limpar ({activeCount})
          </button>
        )}
      </div>

      <FilterGroup title="Família da peça">
        {(Object.keys(CATEGORY_META) as Category[]).map((c) => (
          <CheckRow
            key={c}
            label={CATEGORY_META[c].plural}
            count={scope.filter((m) => m.category === c).length}
            checked={f.categorias.includes(c)}
            onToggle={() => setF({ ...f, categorias: toggleIn(f.categorias, c) })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Marca do rolo">
        {marcas.map((m) => (
          <CheckRow key={m} label={m} count={scope.filter((x) => x.brand === m).length} checked={f.marcas.includes(m)} onToggle={() => setF({ ...f, marcas: toggleIn(f.marcas, m) })} />
        ))}
      </FilterGroup>

      <FilterGroup title="Tipo">
        {(["original", "compativel"] as const).map((c) => (
          <CheckRow key={c} label={c === "original" ? "Original" : "Compatível"} checked={f.condition === c} onToggle={() => setF({ ...f, condition: f.condition === c ? "" : c })} />
        ))}
      </FilterGroup>

      <FilterGroup title="Preço">
        <select className={selectCls} value={f.preco} onChange={(e) => setF({ ...f, preco: e.target.value as Filters["preco"] })} aria-label="Faixa de preço">
          <option value="">Qualquer valor</option>
          <option value="ate500">Até R$ 500</option>
          <option value="500a2000">R$ 500 – 2.000</option>
          <option value="2000mais">Acima de R$ 2.000</option>
          <option value="consulta">Somente "sob consulta"</option>
        </select>
      </FilterGroup>

      <FilterGroup title="Situação">
        {(["disponivel", "reservada", "vendida"] as const).map((s) => (
          <CheckRow
            key={s}
            label={s === "disponivel" ? "Em estoque" : s === "reservada" ? "Reservada" : "Esgotada"}
            checked={f.status === s}
            onToggle={() => setF({ ...f, status: f.status === s ? "" : s })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Selos">
        {BADGE_OPTIONS.filter((b) => scope.some((m) => m.badges.includes(b))).map((b) => (
          <CheckRow key={b} label={b} checked={f.badges.includes(b)} onToggle={() => setF({ ...f, badges: toggleIn(f.badges, b) })} />
        ))}
      </FilterGroup>
    </div>
  );
}

const SEO_COPY: Record<CatalogMode, string> = {
  all: `A ${BUSINESS.name} distribui peças para rolos compactadores em ${BUSINESS.address.city}/${BUSINESS.address.state} desde ${BUSINESS.founded}: bombas hidráulicas, rolamentos, duocones, filtros, engrenagens, caixas de transmissão, rodas, pneus e vedações para Dynapac, Muller, Hamm, Tema-Terra, Caterpillar, Bomag e outras marcas. Estoque próprio com mais de 30.000 itens e envio para todo o Brasil.`,
  originais: `Peças originais para rolo compactador com procedência de fábrica: Dynapac, Hamm, Muller, Bomag e mais. Peça com nota, garantia e despacho rápido a partir de ${BUSINESS.address.city}/${BUSINESS.address.state}.`,
  compativeis: `Peças compatíveis revisadas para rolos compactadores: alternativa com qualidade conferida e preço justo. Duocone, kit de vedações, filtros e mais com pronta entrega.`,
  motores: `Motores para rolos compactadores e equipamentos pesados: Perkins, MWM, Cummins, Deutz, Kubota e Mercedes-Benz. Peças de motor com pronta entrega em São Paulo e envio para todo o Brasil.`,
  favoritas: "Sua lista de peças salvas — disponível neste navegador.",
};

export default function Catalog({ mode }: { mode: CatalogMode }) {
  const meta = MODE_META[mode];
  const [params] = useSearchParams();
  const { favorites } = useApp();
  const [drawer, setDrawer] = useState(false);
  const [sort, setSort] = useState<SortKey>("relevancia");
  const [implType, setImplType] = useState("");

  const scope = useMemo(() => {
    if (mode === "originais") return MACHINES.filter((m) => m.condition === "original");
    if (mode === "compativeis") return MACHINES.filter((m) => m.condition === "compativel");
    return MACHINES;
  }, [mode]);

  const [filters, setFilters] = useState<Filters>(() => {
    const cat = params.get("categoria");
    const valid: string[] = Object.keys(CATEGORY_META);
    return { ...EMPTY, categorias: cat && valid.includes(cat) ? [cat as Category] : [] };
  });

  usePageMeta(`${meta.title} — ${BUSINESS.name} | ${BUSINESS.address.city}/${BUSINESS.address.state}`, SEO_COPY[mode]);

  const results = useMemo(() => {
    let list: Machine[] = scope;
    if (mode === "favoritas") list = list.filter((m) => favorites.includes(m.id));

    const q = filters.q.trim().toLowerCase();
    if (q)
      list = list.filter((m) =>
        [m.brand, m.oem, m.model, m.code, CATEGORY_META[m.category].label, CATEGORY_META[m.category].plural, m.application].join(" ").toLowerCase().includes(q),
      );
    if (filters.categorias.length) list = list.filter((m) => filters.categorias.includes(m.category));
    if (filters.condition) list = list.filter((m) => m.condition === filters.condition);
    if (filters.marcas.length) list = list.filter((m) => filters.marcas.includes(m.brand));
    if (filters.status) list = list.filter((m) => m.status === filters.status);
    if (filters.preco)
      list = list.filter((m) => {
        if (filters.preco === "consulta") return m.price === null;
        if (m.price === null) return false;
        if (filters.preco === "ate500") return m.price <= 500;
        if (filters.preco === "500a2000") return m.price > 500 && m.price <= 2000;
        return m.price > 2000;
      });
    if (filters.badges.length) list = list.filter((m) => filters.badges.every((b) => m.badges.includes(b)));

    const sorted = [...list];
    switch (sort) {
      case "menor-preco":
        sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "maior-preco":
        sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
        break;
      case "az":
        sorted.sort((a, b) => a.model.localeCompare(b.model, "pt-BR"));
        break;
      default:
        sorted.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
    }
    return sorted;
  }, [mode, scope, favorites, filters, sort]);

  const implResults = useMemo(() => {
    let list = IMPLEMENTS;
    const q = filters.q.trim().toLowerCase();
    if (q) list = list.filter((i) => [i.brand, i.model, i.type, i.compat].join(" ").toLowerCase().includes(q));
    if (implType) list = list.filter((i) => i.brand === implType);
    return list;
  }, [filters.q, implType]);

  const isMotor = mode === "motores";
  const count = isMotor ? implResults.length : results.length;

  return (
    <div className="pt-[120px] lg:pt-[150px]">
      <header className="border-b border-line-dark bg-coal-900">
        <div className="hazard-thin h-1.5 w-full opacity-60" aria-hidden="true" />
        <div className="mx-auto max-w-(--container-site) px-6 py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Reveal>
                <Kicker>{meta.kicker}</Kicker>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,4.5rem)] uppercase leading-[0.92]">{meta.title}</h1>
              </Reveal>
              <Reveal delay={150}>
                <p className="mt-4 text-lg text-steel-300">{meta.sub}</p>
              </Reveal>
            </div>
            <Reveal delay={200}>
              <p className="border border-line-dark bg-coal-950 px-5 py-3 font-cond text-sm font-bold uppercase tracking-[0.2em] text-bone-100">
                <span className="text-hz-300">{count}</span> {isMotor ? "motor" + (count === 1 ? "" : "es") : "peça" + (count === 1 ? "" : "s")}
              </p>
            </Reveal>
          </div>

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <IcSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel-400" />
              <input
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder={isMotor ? "Buscar motor, marca ou aplicação…" : "Buscar por nome, código (ex.: LM-0143), marca ou aplicação…"}
                aria-label="Buscar no catálogo"
                className="w-full border border-line-dark bg-coal-950 py-3.5 pl-12 pr-4 text-[15px] text-bone-100 placeholder:text-steel-500 transition-colors focus:border-hz-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={cx(selectCls, "py-3.5")} aria-label="Ordenar resultados">
                <option value="relevancia">Destaques primeiro</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
                <option value="az">A — Z</option>
              </select>
              {!isMotor && (
                <button
                  onClick={() => setDrawer(true)}
                  className="flex items-center gap-2 border border-line-dark bg-coal-950 px-5 font-cond text-[13px] font-bold uppercase tracking-[0.16em] text-bone-100 transition-colors hover:border-hz-400 hover:text-hz-300 lg:hidden"
                >
                  <IcFilter size={17} /> Filtrar
                </button>
              )}
            </div>
          </div>

          {isMotor && (
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => setImplType("")}
                className={cx("px-3.5 py-1.5 font-cond text-[12px] font-bold uppercase tracking-[0.16em] transition-colors", !implType ? "bg-hz-400 text-coal-950" : "border border-line-dark text-steel-300 hover:border-hz-400 hover:text-hz-300")}
              >
                Todos
              </button>
              {[...new Set(IMPLEMENTS.map((i) => i.brand))].map((t) => (
                <button
                  key={t}
                  onClick={() => setImplType(implType === t ? "" : t)}
                  className={cx("px-3.5 py-1.5 font-cond text-[12px] font-bold uppercase tracking-[0.16em] transition-colors", implType === t ? "bg-hz-400 text-coal-950" : "border border-line-dark text-steel-300 hover:border-hz-400 hover:text-hz-300")}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-(--container-site) px-6 py-12 md:py-16">
        <div className={cx(!isMotor && "grid gap-10 lg:grid-cols-[260px_1fr]")}>
          {!isMotor && (
            <aside className="hidden lg:block" aria-label="Filtros do catálogo">
              <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
                <FiltersPanel f={filters} setF={setFilters} scope={scope} />
              </div>
            </aside>
          )}

          <div>
            {count === 0 ? (
              <div className="grid place-items-center border border-dashed border-steel-500 px-6 py-24 text-center">
                {mode === "favoritas" ? (
                  <>
                    <IcHeart size={44} className="text-steel-500" />
                    <h2 className="mt-5 font-display text-3xl uppercase">Nenhuma peça salva ainda</h2>
                    <p className="mt-3 max-w-sm text-[15px] text-steel-300">Toque no coração de qualquer card para guardar a peça aqui — depois é só pedir o orçamento da lista toda.</p>
                    <Btn to="/pecas" className="mt-7">Ver o estoque</Btn>
                  </>
                ) : (
                  <>
                    <IcSearch size={44} className="text-steel-500" />
                    <h2 className="mt-5 font-display text-3xl uppercase">Nada encontrado com esses filtros</h2>
                    <p className="mt-3 max-w-sm text-[15px] text-steel-300">Lembre: o site mostra só uma amostra — são mais de 30.000 itens no estoque físico. Se não achou, a gente encontra.</p>
                    <div className="mt-7 flex flex-wrap justify-center gap-3">
                      <Btn tone="outline" onClick={() => setFilters({ ...EMPTY })}>Limpar filtros</Btn>
                      <Btn to="/busca">Não achou a peça?</Btn>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {isMotor
                  ? implResults.map((it, i) => <ImplementCard key={it.id} it={it} delay={(i % 3) * 70} />)
                  : results.map((m, i) => <MachineCard key={m.id} m={m} delay={(i % 3) * 70} />)}
              </div>
            )}
          </div>
        </div>

        <Reveal className="mt-16 border-t border-line-dark pt-8">
          <p className="max-w-4xl text-[14px] leading-relaxed text-steel-400">{SEO_COPY[mode]}</p>
        </Reveal>
      </div>

      {/* drawer mobile */}
      <div className={cx("fixed inset-0 z-[75] lg:hidden", drawer ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!drawer}>
        <div className={cx("absolute inset-0 bg-coal-950/70 transition-opacity duration-300", drawer ? "opacity-100" : "opacity-0")} onClick={() => setDrawer(false)} />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filtros"
          className={cx("absolute bottom-0 right-0 top-0 flex w-[86vw] max-w-[340px] flex-col border-l border-line-dark bg-coal-900 transition-transform duration-300", drawer ? "translate-x-0" : "translate-x-full")}
        >
          <div className="flex items-center justify-between border-b border-line-dark px-5 py-4">
            <p className="font-display text-xl uppercase">Filtros</p>
            <button onClick={() => setDrawer(false)} className="grid h-10 w-10 place-items-center border border-line-dark text-bone-100 hover:border-hz-400 hover:text-hz-300" aria-label="Fechar filtros">
              <IcX size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-6">
            <FiltersPanel f={filters} setF={setFilters} scope={scope} />
          </div>
          <div className="border-t border-line-dark p-4">
            <Btn className="w-full" onClick={() => setDrawer(false)}>
              Ver {count} {count === 1 ? "peça" : "peças"}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
