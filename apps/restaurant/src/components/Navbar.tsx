import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { business } from "../config/business";
import { Logo } from "./ui";

const links = [
  { to: "/", label: "Início" },
  { to: "/cardapio", label: "Cardápio" },
  { to: "/sobre", label: "A casa" },
  { to: "/contato", label: "Reservas" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { count, setOpen: setCartOpen } = useCart();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "border-b border-line bg-bg/90 py-2.5 backdrop-blur-md" : "border-b border-transparent bg-transparent py-5"
        }`}
      >
        <div className="shell flex items-center justify-between gap-4">
          <Logo />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegação principal">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`group relative font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${
                  pathname === l.to ? "text-ember" : "text-sand hover:text-cream"
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px bg-ember transition-all duration-300 ${
                    pathname === l.to ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                  aria-hidden
                />
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center border border-line bg-panel/60 text-cream transition-all hover:border-ember hover:text-ember"
              aria-label={`Abrir pedido (${count} itens)`}
            >
              <ShoppingBag aria-hidden size={18} />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center bg-ember px-1 font-mono text-[10px] font-semibold text-bg">
                  {count}
                </span>
              )}
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center border border-line bg-panel/60 text-cream lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={open}
            >
              <Menu aria-hidden size={18} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="animate-fade fixed inset-0 z-[80] flex flex-col bg-bg lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          <div className="shell flex items-center justify-between py-5">
            <Logo />
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center border border-line text-cream"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
            >
              <X aria-hidden size={18} />
            </button>
          </div>
          <nav className="shell flex flex-1 flex-col justify-center gap-2" aria-label="Navegação mobile">
            {links.map((l, i) => (
              <div key={l.to} className="animate-rise" style={{ animationDelay: `${0.06 * i}s` }}>
                <Link
                  to={l.to}
                  className={`display-tight block border-b border-linesoft py-4 font-display text-4xl uppercase transition-colors ${
                    pathname === l.to ? "text-ember" : "text-cream hover:text-ember"
                  }`}
                >
                  {l.label}
                </Link>
              </div>
            ))}
          </nav>
          <div className="shell pb-10">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sand">
              {business.address.street} · {business.address.neighborhood}
            </p>
            <p className="mt-1 font-mono text-[11px] text-sand/70">
              Todos os dias 12h–23h · {business.contact.whatsappDisplay}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
