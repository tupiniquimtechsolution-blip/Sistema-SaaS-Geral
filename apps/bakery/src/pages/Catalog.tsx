import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "../core/store";
import { categories } from "../business/products";
import { track, useSEO } from "../core/utils";
import ProductCard from "../components/ProductCard";
import { IClose, IFilter, ILoaf, ISearch } from "../components/icons";

type Sort = "relevance" | "priceAsc" | "priceDesc" | "name";

export default function Catalog({ presetPromo = false }: { presetPromo?: boolean }) {
  const { business, products } = useApp();
  const params = useParams<{ slug?: string }>();
  const routeCat = params.slug ?? "";

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState(routeCat);
  const [fPromo, setFPromo] = useState(presetPromo);
  const [fBest, setFBest] = useState(false);
  const [fOnlyAvail, setFOnlyAvail] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("relevance");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => setCat(routeCat), [routeCat]);
  useEffect(() => setFPromo(presetPromo), [presetPromo]);

  const activeCat = categories.find((c) => c.slug === cat);
  useSEO(
    activeCat ? `${activeCat.name} | ${business.name}` : presetPromo ? `Promoções | ${business.name}` : `Cardápio | ${business.name}`,
    activeCat?.tagline ?? business.description
  );

  const allTags = ["vegano", "vegetariano", "sem glúten", "sem lactose", "integral", "origem única"];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (fPromo && !p.promotionalPrice) return false;
      if (fBest && !p.bestseller) return false;
      if (fOnlyAvail && !p.available) return false;
      if (tags.length && !tags.every((t) => p.tags?.includes(t))) return false;
      if (q) {
        const catName = categories.find((c) => c.slug === p.category)?.name ?? "";
        const hay = [p.name, p.shortDescription, p.description, catName, ...(p.tags ?? []), ...(p.ingredients ?? [])].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const price = (p: typeof list[number]) => p.promotionalPrice ?? p.price;
    if (sort === "priceAsc") list = [...list].sort((a, b) => price(a) - price(b));
    if (sort === "priceDesc") list = [...list].sort((a, b) => price(b) - price(a));
    if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "relevance") list = [...list].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || Number(b.bestseller ?? false) - Number(a.bestseller ?? false));
    return list;
  }, [products, cat, fPromo, fBest, fOnlyAvail, tags, search, sort]);

  const clearAll = () => {
    setSearch(""); setCat(""); setFPromo(false); setFBest(false); setFOnlyAvail(false); setTags([]); setSort("relevance");
  };

  const title = activeCat ? activeCat.name : presetPromo ? "Promoções do forno" : "O cardápio da casa";
  const subtitle = activeCat ? activeCat.tagline : presetPromo ? "Preços de fornada — enquanto durar." : "Tudo que sai daqui de dentro, todos os dias.";

  return (
    <main className="light-section min-h-screen pb-24 pt-32 md:pt-40">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <header className="max-w-2xl">
          <p className="flex items-center gap-2.5 text-[11.5px] font-extrabold uppercase tracking-[0.3em] text-terra">
            <span className="h-px w-8 bg-terra" /> {activeCat ? "categoria" : "cardápio"}
          </p>
          <h1 className="font-display mt-4 text-5xl font-medium leading-[1.02] md:text-7xl">{title}</h1>
          <p className="mt-4 text-[15.5px] text-inksoft">{subtitle}</p>
        </header>

        {/* busca */}
        <div className="relative mt-9 max-w-xl">
          <ISearch size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-inksoft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => track("search")}
            placeholder="Busque por pão, croissant, café, ingrediente…"
            className="field field-light !rounded-full !py-3.5 !pl-11 text-[15px] shadow-[0_16px_40px_-24px_rgba(60,35,15,0.5)]"
            aria-label="Buscar produtos"
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Limpar busca" className="absolute right-4 top-1/2 -translate-y-1/2 text-inksoft hover:text-terra">
              <IClose size={17} />
            </button>
          )}
        </div>

        {/* categorias */}
        <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          <button onClick={() => setCat("")} className={`chip ${cat === "" ? "on !border-ink !bg-ink !text-flour" : "!border-ink/15 !text-inksoft hover:!border-terra hover:!text-terra"}`}>
            Tudo
          </button>
          {categories.map((c) => (
            <button key={c.slug} onClick={() => setCat(c.slug)} className={`chip ${cat === c.slug ? "on !border-ink !bg-ink !text-flour" : "!border-ink/15 !text-inksoft hover:!border-terra hover:!text-terra"}`}>
              {c.name}
            </button>
          ))}
        </div>

        {/* filtros */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button onClick={() => setShowFilters((v) => !v)} className={`chip !border-ink/15 !text-inksoft ${showFilters ? "!border-terra !text-terra" : ""}`}>
            <IFilter size={15} /> filtros
          </button>
          <button onClick={() => setFPromo((v) => !v)} className={`chip ${fPromo ? "on !border-terra !bg-terra !text-flour" : "!border-ink/15 !text-inksoft hover:!border-terra hover:!text-terra"}`}>
            em promoção
          </button>
          <button onClick={() => setFBest((v) => !v)} className={`chip ${fBest ? "on !border-ink !bg-ink !text-flour" : "!border-ink/15 !text-inksoft hover:!border-terra hover:!text-terra"}`}>
            mais vendidos
          </button>
          <button onClick={() => setFOnlyAvail((v) => !v)} className={`chip ${fOnlyAvail ? "on !border-ink !bg-ink !text-flour" : "!border-ink/15 !text-inksoft hover:!border-terra hover:!text-terra"}`}>
            disponíveis
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="chip cursor-pointer !border-ink/15 !bg-transparent !text-inksoft"
            aria-label="Ordenar produtos"
          >
            <option value="relevance">relevância</option>
            <option value="priceAsc">menor preço</option>
            <option value="priceDesc">maior preço</option>
            <option value="name">nome A–Z</option>
          </select>
        </div>

        {showFilters && (
          <div className="anim-fade mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-inksoft">alimentação:</span>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))}
                className={`chip !py-1.5 text-[12px] ${tags.includes(t) ? "on !border-terra !bg-terra !text-flour" : "!border-ink/15 !text-inksoft hover:!border-terra hover:!text-terra"}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <p className="mt-8 text-[13px] font-bold uppercase tracking-wider text-inksoft">
          {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
        </p>

        {filtered.length === 0 ? (
          <div className="mt-10 flex flex-col items-center rounded-[var(--radius)] border border-dashed border-ink/20 py-20 text-center">
            <ILoaf size={44} className="text-terra/60" />
            <p className="font-display mt-4 text-2xl">Nada saiu do forno com esse nome…</p>
            <p className="mt-1.5 max-w-sm text-[14px] text-inksoft">Tente outra palavra — “sourdough”, “croissant”, “café” — ou limpe os filtros.</p>
            <button onClick={clearAll} className="btn btn-dark mt-6 !py-3 text-[13.5px]">Limpar tudo</button>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => (
              <div key={p.id} className="anim-rise" style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }}>
                <ProductCard product={p} eager={i < 4} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
