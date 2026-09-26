import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { business, priceOf } from "../config/business";
import { brl, openStatus, track, useStore, whatsLink, buildOrderWhatsApp } from "../lib/core";
import { Btn, ProductArt, Stepper } from "./ui";
import {
  ICalendar, ICart, ILogo, IMenu, IPaw, ISearch, IUser, IWhatsApp, IX,
  IPhone, IPin, IClock, ITruck, IStore, IShield, IPix, ICard, IArrow, IChevron, IBag, IHeart,
} from "./icons";

const NAV = [
  { to: "/produtos", label: "Produtos" },
  { to: "/servicos", label: "Serviços" },
  { to: "/agendamento", label: "Agendamento" },
  { to: "/produtos?tag=ofertas", label: "Ofertas" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
];

/* ================= HEADER ================= */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { totals, setCartOpen, setSearchOpen } = useStore();
  const location = useLocation();
  const home = location.pathname === "/";
  const [bump, setBump] = useState(false);
  const prevCount = useRef(totals.count);

  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 36);
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (totals.count > prevCount.current) {
      setBump(true);
      const t = window.setTimeout(() => setBump(false), 550);
      prevCount.current = totals.count;
      return () => window.clearTimeout(t);
    }
    prevCount.current = totals.count;
  }, [totals.count]);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const transparent = home && !scrolled && !menuOpen;
  const textCls = transparent ? "text-cream" : "text-bark";

  return (
    <header className={`fixed top-0 inset-x-0 z-[90] transition-all duration-500 ${transparent ? "bg-transparent" : "bg-cream/92 backdrop-blur-md shadow-[0_1px_0_0_rgba(91,64,52,0.08),0_10px_30px_-18px_rgba(91,64,52,0.25)]"}`}>
      {/* progresso de leitura */}
      <div className="absolute top-0 left-0 h-[2.5px] bg-brand transition-[width] duration-150" style={{ width: `${progress * 100}%` }} aria-hidden />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-[72px]">
        <Link to="/" className="flex items-center gap-2.5" aria-label={`${business.name} — início`}>
          <ILogo size={38} />
          <span className={`font-display font-extrabold text-[19px] tracking-tight ${textCls}`}>
            {business.name.split(" ")[0]}<span className="text-brand">·Pet</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7" aria-label="Principal">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`link-underline font-display font-semibold text-[13.5px] transition-colors ${textCls} hover:text-brand-deep ${!transparent && "hover:text-brand-deep"}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button type="button" onClick={() => { setSearchOpen(true); track("search", {}); }} aria-label="Buscar produtos" className={`w-10 h-10 grid place-items-center rounded-full transition-colors ${textCls} hover:bg-bark/10`}>
            <ISearch size={19} />
          </button>
          <Link to="/meu-pet" aria-label="Meu pet" className={`hidden sm:grid w-10 h-10 place-items-center rounded-full transition-colors ${textCls} hover:bg-bark/10`}>
            <IUser size={19} />
          </Link>
          <button
            type="button" id="cart-target" onClick={() => setCartOpen(true)}
            aria-label={`Abrir carrinho, ${totals.count} itens`}
            className={`relative w-10 h-10 grid place-items-center rounded-full transition-colors ${textCls} hover:bg-bark/10`}
          >
            <ICart size={20} />
            {totals.count > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 min-w-[19px] h-[19px] px-1 grid place-items-center rounded-full bg-coral text-white text-[10.5px] font-display font-bold ${bump ? "badge-bump" : ""}`}>
                {totals.count}
              </span>
            )}
          </button>
          <Btn to="/agendamento" size="sm" className="hidden md:inline-flex ml-1">Agendar</Btn>
          <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} className={`lg:hidden w-10 h-10 grid place-items-center rounded-full ${textCls} hover:bg-bark/10`}>
            {menuOpen ? <IX size={20} /> : <IMenu size={20} />}
          </button>
        </div>
      </div>

      {/* menu mobile */}
      {menuOpen && (
        <nav className="lg:hidden pop-in bg-cream border-t border-line px-5 pb-6 pt-3 max-h-[75vh] overflow-y-auto no-bar" aria-label="Menu">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="flex items-center justify-between py-3.5 border-b border-line/70 font-display font-semibold text-ink text-[15px]">
              {n.label} <IChevron size={15} className="text-fog" />
            </Link>
          ))}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Btn to="/agendamento" variant="brand"><ICalendar size={16} /> Agendar</Btn>
            <Btn to="/meu-pet" variant="outline"><IPaw size={16} /> Meu pet</Btn>
          </div>
          <a href={whatsLink(business.contact.whatsapp, "Olá! Vim pelo site da " + business.name + ".")} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 text-leaf font-display font-bold text-sm py-2">
            <IWhatsApp size={17} /> Falar no WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}

/* ================= BUSCA ================= */
export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) window.setTimeout(() => inputRef.current?.focus(), 60);
    else setQ("");
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    if (searchOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) return null;
  const term = q.trim().toLowerCase();
  const products = term
    ? business.products.filter((p) =>
        [p.name, p.brand, p.category, ...p.species, ...(p.tags ?? [])].join(" ").toLowerCase().includes(term)
      ).slice(0, 6)
    : business.products.filter((p) => p.tags.includes("mais-vendidos")).slice(0, 4);
  const services = term ? business.services.filter((s) => s.name.toLowerCase().includes(term)).slice(0, 3) : [];
  const categories = term ? business.categories.filter((c) => c.name.toLowerCase().includes(term)).slice(0, 4) : [];

  return (
    <div className="fixed inset-0 z-[110] bg-ink/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Busca">
      <div className="pop-in max-w-2xl mx-auto mt-[8vh] mx-4 sm:mx-auto bg-cream rounded-[26px] rounded-bl-[8px] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
          <ISearch size={20} className="text-brand shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && term) {
                track("search", { term });
                setSearchOpen(false);
                navigate(`/produtos?q=${encodeURIComponent(q.trim())}`);
              }
            }}
            placeholder="Buscar ração, shampoo, tosa, marca…"
            className="flex-1 bg-transparent outline-none font-display text-ink text-[17px] placeholder:text-fog/55"
            aria-label="Campo de busca"
          />
          <button type="button" onClick={() => setSearchOpen(false)} aria-label="Fechar busca" className="w-9 h-9 grid place-items-center rounded-full hover:bg-sand text-bark">
            <IX size={17} />
          </button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto no-bar">
          <p className="eyebrow mb-3">{term ? "Resultados" : "Mais buscados"}</p>
          {products.length === 0 && services.length === 0 && categories.length === 0 && (
            <p className="text-fog text-sm py-6 text-center">Nada encontrado para “{q}”. Tente “ração”, “banho” ou “brinquedo”.</p>
          )}
          <div className="grid gap-2">
            {categories.map((c) => (
              <Link key={c.slug} to={`/categoria/${c.slug}`} onClick={() => setSearchOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-[14px] hover:bg-sand/70 transition-colors">
                <span className="font-display font-semibold text-ink text-sm">{c.name}</span>
                <span className="text-[11px] uppercase tracking-wider font-display font-bold text-fog">Categoria</span>
              </Link>
            ))}
            {products.map((p) => (
              <Link key={p.id} to={`/produtos/${p.slug}`} onClick={() => setSearchOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] hover:bg-sand/70 transition-colors">
                <div className="w-11 h-11 shrink-0 rounded-[12px] bg-sand grid place-items-center"><ProductArt kind={p.art} className="w-9" /></div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-ink text-sm truncate">{p.name}</p>
                  <p className="text-[12px] text-fog">{p.brand} · {brl(priceOf(p))}</p>
                </div>
              </Link>
            ))}
            {services.map((s) => (
              <Link key={s.id} to="/agendamento" onClick={() => setSearchOpen(false)} className="flex items-center justify-between px-3 py-2.5 rounded-[14px] hover:bg-mint/60 transition-colors">
                <span className="font-display font-semibold text-ink text-sm">{s.name}</span>
                <span className="text-[11px] uppercase tracking-wider font-display font-bold text-leaf">Agendar</span>
              </Link>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 w-full py-3 rounded-full border-[1.5px] border-bark/20 font-display font-bold text-sm text-bark hover:bg-bark hover:text-cream transition-colors disabled:opacity-40"
            disabled={!term}
            onClick={() => { track("search", { term }); setSearchOpen(false); navigate(`/produtos?q=${encodeURIComponent(q.trim())}`); }}
          >
            Ver todos os resultados
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= CARRINHO (DRAWER) ================= */
export function CartDrawer() {
  const { cartOpen, setCartOpen, totals, setQty, removeLine, coupon } = useStore();
  const loc = business.locations[0];

  return (
    <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${cartOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} aria-hidden={!cartOpen}>
      <button type="button" aria-label="Fechar carrinho" className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={() => setCartOpen(false)} />
      <aside
        role="dialog" aria-label="Carrinho de compras"
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-cream shadow-2xl flex flex-col transition-transform duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)] ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-display font-extrabold text-ink text-lg flex items-center gap-2">
            <ICart size={20} className="text-brand" /> Seu carrinho
            {totals.count > 0 && <span className="text-[12px] bg-sand text-bark rounded-full px-2 py-0.5 font-bold">{totals.count}</span>}
          </h2>
          <button type="button" onClick={() => setCartOpen(false)} aria-label="Fechar" className="w-9 h-9 grid place-items-center rounded-full hover:bg-sand text-bark"><IX size={18} /></button>
        </div>

        {totals.lines.length === 0 ? (
          <div className="flex-1 grid place-items-center p-8 text-center">
            <div>
              <div className="mx-auto w-16 h-16 rounded-full bg-sand grid place-items-center text-bark mb-4"><IBag size={26} /></div>
              <p className="font-display font-bold text-ink text-lg">Carrinho vazio</p>
              <p className="text-fog text-sm mt-1">Seu pet merece um agrado hoje.</p>
              <Btn to="/produtos" className="mt-5" onClick={() => setCartOpen(false)}>Ver produtos</Btn>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto no-bar px-5 py-4 grid gap-3">
              {totals.lines.map(({ line, product, variation, unit }) => (
                <div key={`${line.productId}-${line.variationId ?? "base"}`} className="flex gap-3 bg-white border border-line rounded-[18px] p-3">
                  <div className="w-16 h-16 shrink-0 rounded-[12px] bg-sand/70 grid place-items-center">
                    <ProductArt kind={product.art} className="w-13 max-w-[52px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-ink text-[13.5px] leading-tight truncate">{product.name}</p>
                    <p className="text-[11.5px] text-fog">{variation ? `Tamanho ${variation} · ` : ""}{brl(unit)}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <Stepper small value={line.qty} onChange={(v) => setQty(line.productId, line.variationId, v)} />
                      <button type="button" onClick={() => removeLine(line.productId, line.variationId)} className="text-[11.5px] font-display font-bold text-coral hover:underline">Remover</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line px-5 py-4 bg-white/60">
              <div className="flex justify-between text-sm text-fog"><span>Subtotal</span><span className="font-display font-bold text-ink">{brl(totals.subtotal)}</span></div>
              {coupon && <div className="flex justify-between text-sm text-leaf mt-1"><span>Cupom {coupon.code}</span><span className="font-display font-bold">−{brl(totals.discount)}</span></div>}
              <div className="flex justify-between text-sm text-fog mt-1">
                <span>Entrega</span>
                <span className="font-display font-bold text-ink">{totals.shipping === 0 ? "Grátis" : brl(totals.shipping)}</span>
              </div>
              {totals.shipping > 0 && (
                <p className="text-[11.5px] text-fog mt-1.5 flex items-center gap-1.5"><ITruck size={13} className="text-leaf" /> Grátis acima de {brl(business.delivery.freeAbove)}</p>
              )}
              <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-line">
                <span className="font-display font-bold text-ink">Total</span>
                <span className="font-display font-extrabold text-ink text-2xl">{brl(totals.total)}</span>
              </div>
              <div className="mt-4 grid gap-2.5">
                <Btn to="/carrinho" onClick={() => setCartOpen(false)} className="w-full">Ir para o carrinho</Btn>
                <a
                  href={whatsLink(
                    loc.whatsapp,
                    buildOrderWhatsApp(
                      totals.lines.map((l) => ({ name: l.product.name, variation: l.variation, qty: l.line.qty, total: l.total })),
                      totals.total, "Entrega/retirada: a combinar", "", ""
                    )
                  )}
                  target="_blank" rel="noreferrer"
                  onClick={() => track("click_whatsapp", { from: "cart_drawer" })}
                  className="w-full inline-flex items-center justify-center gap-2 font-display font-semibold text-sm px-6 py-3 rounded-full text-leaf-deep border-[1.5px] border-leaf/40 hover:bg-leaf hover:text-white transition-colors"
                >
                  <IWhatsApp size={17} /> Finalizar pelo WhatsApp
                </a>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/* ================= RODAPÉ ================= */
export function Footer() {
  const status = openStatus();
  const loc = business.locations[0];
  const year = new Date().getFullYear();
  return (
    <footer className="bg-bark text-cream/85 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid gap-10 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <ILogo size={40} />
            <span className="font-display font-extrabold text-xl text-cream">{business.name}</span>
          </div>
          <p className="mt-4 text-[14px] leading-relaxed text-cream/65 max-w-xs">{business.subheadline}</p>
          <div className="mt-5 flex items-center gap-2 text-[13px]">
            <span className={`w-2 h-2 rounded-full ${status.open ? "bg-mint" : "bg-coral"}`} aria-hidden />
            <span className="font-display font-semibold text-cream">{status.label}</span>
          </div>
        </div>
        <nav aria-label="Loja">
          <p className="font-display font-bold text-cream text-[13px] uppercase tracking-[0.18em] mb-4">Loja</p>
          <ul className="grid gap-2.5 text-[14px]">
            <li><Link className="hover:text-brand transition-colors" to="/produtos">Todos os produtos</Link></li>
            <li><Link className="hover:text-brand transition-colors" to="/produtos?tag=ofertas">Ofertas da semana</Link></li>
            <li><Link className="hover:text-brand transition-colors" to="/produtos?assinatura=1">Assinatura recorrente</Link></li>
            <li><Link className="hover:text-brand transition-colors" to="/meus-pedidos">Meus pedidos</Link></li>
            <li><Link className="hover:text-brand transition-colors" to="/fidelidade">Clube Pet</Link></li>
          </ul>
        </nav>
        <nav aria-label="Serviços">
          <p className="font-display font-bold text-cream text-[13px] uppercase tracking-[0.18em] mb-4">Serviços</p>
          <ul className="grid gap-2.5 text-[14px]">
            {business.services.slice(0, 4).map((s) => (
              <li key={s.id}><Link className="hover:text-brand transition-colors" to="/agendamento">{s.name}</Link></li>
            ))}
            <li><Link className="hover:text-brand transition-colors" to="/agendamento">Agendar horário</Link></li>
            <li><Link className="hover:text-brand transition-colors" to="/meu-pet">Perfil do pet</Link></li>
          </ul>
        </nav>
        <div>
          <p className="font-display font-bold text-cream text-[13px] uppercase tracking-[0.18em] mb-4">Onde estamos</p>
          <address className="not-italic text-[14px] grid gap-3">
            <span className="flex gap-2.5"><IPin size={17} className="text-brand shrink-0 mt-0.5" /> {loc.address} · {loc.district}<br />{loc.city}</span>
            <span className="flex gap-2.5 items-center"><IPhone size={16} className="text-brand shrink-0" /> {loc.phone}</span>
            <span className="flex gap-2.5 items-center"><IClock size={16} className="text-brand shrink-0" /> Seg–Sex {loc.hours[1]?.open}–{loc.hours[1]?.close} · Sáb {loc.hours[6]?.open}–{loc.hours[6]?.close}</span>
          </address>
          <div className="mt-5">
            <a
              href={whatsLink(business.contact.whatsapp, `Olá! Vim pelo site da ${business.name}.`)}
              target="_blank" rel="noreferrer"
              onClick={() => track("click_whatsapp", { from: "footer" })}
              className="inline-flex items-center gap-2 bg-leaf hover:bg-leaf-deep text-white font-display font-bold text-sm px-5 py-2.5 rounded-full transition-colors"
            >
              <IWhatsApp size={17} /> WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-cream/12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-cream/55">
          <p>© {year} {business.name}. Feito com carinho — e muitos pelos na roupa.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5"><IShield size={14} /> Compra segura</span>
            <span className="inline-flex items-center gap-1.5"><IPix size={14} /> Pix</span>
            <span className="inline-flex items-center gap-1.5"><ICard size={14} /> Cartões</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ================= BOTTOM NAV (mobile-first, jeito de app) ================= */
export function BottomNav() {
  const { totals, setCartOpen } = useStore();
  const item = "flex flex-col items-center gap-0.5 text-[10px] font-display font-semibold transition-colors";
  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-[90] bg-cream/95 backdrop-blur-md border-t border-line pb-[env(safe-area-inset-bottom)]" aria-label="Navegação inferior">
      <div className="grid grid-cols-5 items-end px-1 pt-1.5">
        <NavLink to="/" end className={({ isActive }) => `${item} ${isActive ? "text-brand-deep" : "text-fog"}`}>
          {({ isActive }) => (<><IPaw size={20} className={isActive ? "text-brand" : ""} />Início</>)}
        </NavLink>
        <NavLink to="/produtos" className={({ isActive }) => `${item} ${isActive ? "text-brand-deep" : "text-fog"}`}>
          {({ isActive }) => (<><IBag size={20} className={isActive ? "text-brand" : ""} />Produtos</>)}
        </NavLink>
        <NavLink to="/agendamento" className="flex flex-col items-center -mt-6" aria-label="Agendar banho e tosa">
          {({ isActive }) => (
            <>
              <span className={`w-14 h-14 grid place-items-center rounded-full bg-brand text-white shadow-[0_10px_24px_-6px_rgba(231,136,74,0.7)] border-4 border-cream transition-transform active:scale-95 ${isActive ? "scale-105" : ""}`}>
                <ICalendar size={22} />
              </span>
              <span className={`text-[10px] font-display font-semibold mt-0.5 ${isActive ? "text-brand-deep" : "text-fog"}`}>Agendar</span>
            </>
          )}
        </NavLink>
        <NavLink to="/meus-pedidos" className={({ isActive }) => `${item} ${isActive ? "text-brand-deep" : "text-fog"}`}>
          {({ isActive }) => (<><ITruck size={20} className={isActive ? "text-brand" : ""} />Pedidos</>)}
        </NavLink>
        <button type="button" onClick={() => setCartOpen(true)} className={`${item} text-fog relative`} aria-label={`Carrinho, ${totals.count} itens`}>
          <span className="relative">
            <ICart size={20} />
            {totals.count > 0 && <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-0.5 grid place-items-center rounded-full bg-coral text-white text-[9px] font-bold">{totals.count}</span>}
          </span>
          Carrinho
        </button>
      </div>
    </nav>
  );
}

/* ================= WHATSAPP FLUTUANTE ================= */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsLink(business.contact.whatsapp, `Olá! Vim pelo site da ${business.name} e preciso de ajuda.`)}
      target="_blank" rel="noreferrer"
      onClick={() => track("click_whatsapp", { from: "floating" })}
      aria-label="Falar com a loja no WhatsApp"
      className="fixed z-[85] right-4 bottom-[86px] sm:bottom-6 sm:right-6 w-13 h-13 sm:w-14 sm:h-14 grid place-items-center rounded-full bg-leaf text-white shadow-[0_14px_30px_-8px_rgba(86,140,118,0.7)] hover:scale-108 hover:bg-leaf-deep transition-all"
    >
      <IWhatsApp size={24} />
      <span className="absolute inset-0 rounded-full border-2 border-leaf animate-ping opacity-25 motion-reduce:hidden" aria-hidden />
    </a>
  );
}

/* ================= CTA CONTEXTUAL FLUTUANTE ================= */
export function FloatingCTA() {
  const location = useLocation();
  const { totals, setCartOpen } = useStore();
  const p = location.pathname;
  if (p.startsWith("/carrinho") || p.startsWith("/checkout") || p.startsWith("/agendamento")) return null;
  const isShop = p.startsWith("/produtos") || p.startsWith("/categoria");
  return (
    <div className="sm:hidden fixed z-[84] left-4 right-20 bottom-[86px]">
      {isShop && totals.count > 0 ? (
        <button type="button" onClick={() => setCartOpen(true)} className="pop-in w-full flex items-center justify-between bg-bark text-cream font-display font-bold text-sm px-5 py-3.5 rounded-full shadow-2xl active:scale-[0.98] transition-transform">
          <span className="inline-flex items-center gap-2"><ICart size={17} /> Ver carrinho</span>
          <span className="bg-brand text-white rounded-full px-2.5 py-0.5 text-[12px]">{totals.count}</span>
        </button>
      ) : p.startsWith("/servicos") ? (
        <Link to="/agendamento" className="pop-in w-full flex items-center justify-center gap-2 bg-brand text-white font-display font-bold text-sm px-5 py-3.5 rounded-full shadow-2xl active:scale-[0.98] transition-transform">
          <ICalendar size={17} /> Escolher horário
        </Link>
      ) : (
        <Link to="/agendamento" className="pop-in w-full flex items-center justify-center gap-2 bg-brand text-white font-display font-bold text-sm px-5 py-3.5 rounded-full shadow-2xl active:scale-[0.98] transition-transform">
          <ICalendar size={17} /> Agendar banho e tosa
        </Link>
      )}
    </div>
  );
}

/* ================= BARRA DE CONFIANÇA ================= */
export function TrustStrip({ light = false }: { light?: boolean }) {
  const items = [
    { icon: <IShield size={18} />, label: "Pagamento seguro" },
    { icon: <ITruck size={18} />, label: "Delivery no mesmo dia" },
    { icon: <IStore size={18} />, label: "Retire na loja" },
    { icon: <IWhatsApp size={18} />, label: "Atendimento humano" },
    { icon: <IHeart size={18} />, label: "Feito por quem ama pets" },
  ];
  return (
    <ul className={`flex flex-wrap items-center gap-x-7 gap-y-2 ${light ? "text-cream/80" : "text-fog"}`} aria-label="Garantias da loja">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2 text-[12.5px] font-display font-semibold">
          <span className="text-brand">{i.icon}</span>{i.label}
        </li>
      ))}
    </ul>
  );
}

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1.5 font-display font-semibold text-[13px] text-fog hover:text-brand-deep transition-colors">
      <IArrow size={14} className="rotate-180" /> {label}
    </Link>
  );
}
