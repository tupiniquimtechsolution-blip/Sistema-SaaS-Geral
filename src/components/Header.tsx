import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../core/store";
import { isOpenNow, track } from "../core/utils";
import { IBasket, ILoaf, ISearch } from "./icons";

export default function Header() {
  const { business, cartCount, cartBump, setCartOpen } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const open = isOpenNow(business.openingHours);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const nav = [
    { to: "/produtos", label: "Cardápio" },
    { to: "/encomendas", label: "Encomendas" },
    { to: "/sobre", label: "Nossa casa" },
    { to: "/contato", label: "Contato" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* barra de anúncio */}
      <div className="flex items-center justify-center gap-3 bg-accent px-4 py-1.5 text-[12.5px] font-bold text-accent-ink">
        <span className="hidden sm:inline">{business.announcement}</span>
        <span className="sm:hidden">{business.announcement.split("—")[0]}</span>
        <span className="hidden items-center gap-1.5 rounded-full bg-accent-ink/10 px-2.5 py-0.5 text-[11px] md:flex">
          <span className={`h-1.5 w-1.5 rounded-full ${open.open ? "bg-emerald-700 pulse-dot" : "bg-accent-ink/50"}`} />
          {open.label}
        </span>
      </div>

      <div
        className={`transition-all duration-500 ${
          scrolled ? "border-b border-line bg-bg/92 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.7)] backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-[72px] md:px-8">
          <Link to="/" className="group flex items-center gap-3" aria-label={`${business.name} — início`}>
            <span className="grid h-10 w-10 place-items-center rounded-[calc(var(--radius)*0.8)] bg-accent text-accent-ink transition-transform duration-300 group-hover:-rotate-6">
              <ILoaf size={22} />
            </span>
            <span className="leading-none">
              <span className="font-display block text-[22px] font-semibold tracking-tight text-paper">{business.name}</span>
              <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.28em] text-dim">{business.tagline}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Principal">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="u-link text-[14.5px] font-semibold text-paper/85 hover:text-paper">
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => { track("search"); navigate("/produtos"); }}
              aria-label="Buscar produtos"
              className="grid h-11 w-11 place-items-center rounded-full border border-transparent text-paper/80 transition-all hover:border-line hover:text-accent"
            >
              <ISearch size={20} />
            </button>

            <button
              data-cart-target
              onClick={() => setCartOpen(true)}
              aria-label={`Abrir carrinho, ${cartCount} itens`}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-line text-paper transition-all hover:border-accent hover:text-accent"
            >
              <IBasket size={20} />
              {cartCount > 0 && (
                <span
                  key={cartBump}
                  className="bump absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-extrabold text-accent-ink"
                >
                  {cartCount}
                </span>
              )}
            </button>

            <Link to="/produtos" className="btn btn-primary hidden !px-6 !py-2.5 text-[13.5px] md:inline-flex">
              {business.cta.primary}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
