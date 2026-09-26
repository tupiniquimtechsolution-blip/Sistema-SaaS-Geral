import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { business } from "../config/business";
import type { Species } from "../config/business";
import { Reveal, usePageMeta, track } from "../lib/core";
import { Btn, EmptyState } from "../components/ui";
import { ProductCard } from "../components/ProductCard";
import { IFilter, ISearch, IX, IPaw, IChevron } from "../components/icons";

type Sort = "relevancia" | "menor" | "maior" | "avaliacao";

export default function Shop() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const tag = params.get("tag") ?? "";
  const assinatura = params.get("assinatura") === "1";
  const category = slug ?? params.get("categoria") ?? "";

  const [species, setSpecies] = useState<"" | Species>("");
  const [brand, setBrand] = useState("");
  const [maxPrice, setMaxPrice] = useState(300);
  const [sort, setSort] = useState<Sort>("relevancia");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const catName = business.categories.find((c) => c.slug === category)?.name;
  const title = catName
    ? `${catName} | ${business.name}`
    : tag === "ofertas"
      ? `Ofertas da semana | ${business.name}`
      : q
        ? `Busca: ${q} | ${business.name}`
        : `Produtos para cães e gatos | ${business.name}`;
  usePageMeta(title, "Catálogo completo: ração, petiscos, brinquedos, higiene, camas e passeio. Delivery no mesmo dia em São Paulo.");

  const brands = useMemo(() => Array.from(new Set(business.products.map((p) => p.brand))).sort(), []);

  const filtered = useMemo(() => {
    let list = business.products.filter((p) => p.available);
    if (category) list = list.filter((p) => p.category === category);
    if (tag) list = list.filter((p) => p.tags.includes(tag));
    if (assinatura) list = list.filter((p) => p.subscriptionEligible);
    if (species) list = list.filter((p) => p.species.includes(species));
    if (brand) list = list.filter((p) => p.brand === brand);
    if (q.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter((p) => [p.name, p.brand, p.category, ...p.species].join(" ").toLowerCase().includes(term));
    }
    const price = (p: (typeof list)[number]) => p.promotionalPrice ?? p.price;
    list = list.filter((p) => price(p) <= maxPrice);
    if (sort === "menor") list = [...list].sort((a, b) => price(a) - price(b));
    if (sort === "maior") list = [...list].sort((a, b) => price(b) - price(a));
    if (sort === "avaliacao") list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return list;
  }, [category, tag, assinatura, species, brand, maxPrice, q, sort]);

  const activeFilters = [
    species ? { label: species === "caes" ? "Cães" : "Gatos", clear: () => setSpecies("") } : null,
    brand ? { label: brand, clear: () => setBrand("") } : null,
    q ? { label: `“${q}”`, clear: () => { params.delete("q"); setParams(params, { replace: true }); track("search", { term: q }); } } : null,
    tag ? { label: tag === "ofertas" ? "Ofertas" : tag, clear: () => { params.delete("tag"); setParams(params, { replace: true }); } } : null,
    assinatura ? { label: "Assinatura", clear: () => { params.delete("assinatura"); setParams(params, { replace: true }); } } : null,
  ].filter(Boolean) as { label: string; clear: () => void }[];

  const catChips = [
    { slug: "", name: "Tudo" },
    ...business.categories.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-8">
      {/* cabeçalho */}
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow flex items-center gap-3"><span className="h-px w-8 bg-brand inline-block" aria-hidden /> Catálogo da casa</p>
            <h1 className="font-display font-extrabold display-tight text-[clamp(2rem,4.6vw,3.2rem)] text-ink mt-2">
              {catName ?? (tag === "ofertas" ? "Ofertas da semana" : assinatura ? "Entrega recorrente" : q ? `Busca por “${q}”` : "Nossos produtos")}
            </h1>
            <p className="text-fog mt-2 text-[15px]">{filtered.length} {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"} · curadoria feita pela nossa equipe</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="sr-only" htmlFor="sort">Ordenar por</label>
            <select
              id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}
              className="bg-white border-[1.5px] border-bark/15 rounded-full px-4 py-2.5 font-display font-semibold text-[13.5px] text-bark focus:outline-none focus:border-brand cursor-pointer"
            >
              <option value="relevancia">Relevância</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
              <option value="avaliacao">Melhor avaliados</option>
            </select>
            <button type="button" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen} className="lg:hidden inline-flex items-center gap-2 bg-bark text-cream font-display font-bold text-[13.5px] px-4 py-2.5 rounded-full">
              <IFilter size={15} /> Filtros {activeFilters.length > 0 && `(${activeFilters.length})`}
            </button>
          </div>
        </div>
      </Reveal>

      {/* chips de categoria */}
      <div className="mt-7 flex gap-2 overflow-x-auto no-bar -mx-4 px-4 pb-1">
        {catChips.map((c) => {
          const active = (c.slug === "" && !category) || c.slug === category;
          return (
            <Link
              key={c.slug} to={c.slug ? `/categoria/${c.slug}` : "/produtos"}
              className={`shrink-0 px-4 py-2 rounded-full font-display font-semibold text-[13px] transition-all ${active ? "bg-bark text-cream shadow-md" : "bg-white border border-line text-bark hover:border-bark/40"}`}
            >
              {c.name}
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid lg:grid-cols-[240px_1fr] gap-8 items-start">
        {/* filtros */}
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block bg-white border border-line rounded-[22px] rounded-bl-[6px] p-5 lg:sticky lg:top-24`} aria-label="Filtros">
          <div className="flex items-center justify-between lg:hidden mb-3">
            <p className="font-display font-bold text-ink">Filtros</p>
            <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Fechar filtros" className="w-8 h-8 grid place-items-center rounded-full hover:bg-sand"><IX size={16} /></button>
          </div>

          <fieldset>
            <legend className="font-display font-bold text-[13px] uppercase tracking-[0.14em] text-bark">Tipo de pet</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {([["", "Todos"], ["caes", "Cães"], ["gatos", "Gatos"]] as const).map(([val, label]) => (
                <button
                  key={val} type="button" aria-pressed={species === val}
                  onClick={() => setSpecies(val)}
                  className={`py-2 rounded-full text-[13px] font-display font-semibold transition-all ${species === val ? "bg-brand text-white" : "bg-sand/60 text-bark hover:bg-sand"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="font-display font-bold text-[13px] uppercase tracking-[0.14em] text-bark">Marca</legend>
            <div className="mt-3 grid gap-1.5">
              {brands.map((b) => (
                <label key={b} className="flex items-center gap-2.5 cursor-pointer group py-0.5">
                  <input type="radio" name="brand" checked={brand === b} onChange={() => setBrand(b)} className="sr-only peer" />
                  <span className={`w-4 h-4 rounded-full border-[1.5px] grid place-items-center transition-colors ${brand === b ? "border-brand" : "border-bark/30 group-hover:border-bark/60"}`}>
                    {brand === b && <span className="w-2 h-2 rounded-full bg-brand" />}
                  </span>
                  <span className="text-[14px] text-ink">{b}</span>
                </label>
              ))}
              {brand && (
                <button type="button" onClick={() => setBrand("")} className="text-left text-[12.5px] font-display font-bold text-coral mt-1">Limpar marca</button>
              )}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="font-display font-bold text-[13px] uppercase tracking-[0.14em] text-bark">Preço até</legend>
            <input
              type="range" min={20} max={300} step={10} value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--t-brand)]"
              aria-label="Preço máximo"
            />
            <p className="mt-1.5 font-display font-bold text-sm text-ink">R$ {maxPrice}</p>
          </fieldset>

          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={() => { setSpecies(""); setBrand(""); setMaxPrice(300); activeFilters.forEach((f) => f.clear()); }}
              className="mt-6 w-full py-2.5 rounded-full border-[1.5px] border-coral/50 text-coral font-display font-bold text-[13px] hover:bg-coral hover:text-white transition-colors"
            >
              Limpar tudo
            </button>
          )}
        </aside>

        {/* grade */}
        <div>
          {activeFilters.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {activeFilters.map((f) => (
                <button key={f.label} type="button" onClick={f.clear} className="inline-flex items-center gap-1.5 bg-bark text-cream text-[12px] font-display font-bold rounded-full pl-3 pr-2 py-1.5 hover:bg-coral transition-colors">
                  {f.label} <IX size={12} />
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              icon={<ISearch size={28} />}
              title="Nada por aqui…"
              desc="Não encontramos produtos com esses filtros. Tente ampliar a busca ou fale com a gente — conseguimos encomendar para você."
              action={
                <div className="flex gap-3 justify-center flex-wrap">
                  <Btn variant="outline" onClick={() => { setSpecies(""); setBrand(""); setMaxPrice(300); activeFilters.forEach((f) => f.clear()); }}>Limpar filtros</Btn>
                  <Btn to="/contato">Falar com a loja</Btn>
                </div>
              }
            />
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 70}><ProductCard product={p} /></Reveal>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* selo informativo */}
      <Reveal className="mt-14">
        <div className="bg-mint/45 border border-leaf/20 rounded-[22px] rounded-bl-[6px] px-6 py-5 flex items-start sm:items-center gap-4 flex-col sm:flex-row sm:justify-between">
          <p className="flex items-center gap-3 text-leaf-deep font-display font-semibold text-[14.5px]">
            <IPaw size={20} /> Não achou o que seu pet come? A gente encomenda sem custo extra.
          </p>
          <Link to="/contato" className="inline-flex items-center gap-1.5 font-display font-bold text-sm text-leaf-deep hover:text-brand-deep transition-colors shrink-0">
            Pedir encomenda <IChevron size={14} />
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
