import { Link, useLocation } from "react-router-dom";
import { useApp } from "../core/store";
import { IBasket, ICalendar, ICroissant, ILoaf, INote } from "./icons";

export default function MobileNav() {
  const { cartCount, cartBump, setCartOpen } = useApp();
  const { pathname } = useLocation();

  const item = (active: boolean) =>
    `flex flex-col items-center gap-1 py-2 text-[10.5px] font-bold transition-colors ${
      active ? "text-accent" : "text-dim hover:text-paper"
    }`;

  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/94 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="grid grid-cols-5">
        <Link to="/" className={item(pathname === "/")}>
          <ILoaf size={21} />
          Início
        </Link>
        <Link to="/produtos" className={item(pathname.startsWith("/produtos") || pathname.startsWith("/categoria"))}>
          <ICroissant size={21} />
          Cardápio
        </Link>
        <button onClick={() => setCartOpen(true)} className="relative flex flex-col items-center gap-1 py-2 text-[10.5px] font-bold text-accent" aria-label={`Carrinho, ${cartCount} itens`}>
          <span className="relative -mt-5 grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-ink shadow-[0_10px_26px_-8px_var(--accent)]">
            <IBasket size={22} />
            {cartCount > 0 && (
              <span key={cartBump} className="bump absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border-2 border-bg bg-terra px-1 text-[10.5px] font-extrabold text-flour">
                {cartCount}
              </span>
            )}
          </span>
          Carrinho
        </button>
        <Link to="/encomendas" className={item(pathname.startsWith("/encomendas"))}>
          <ICalendar size={21} />
          Encomendas
        </Link>
        <Link to="/meus-pedidos" className={item(pathname.startsWith("/meus-pedidos") || pathname.startsWith("/pedido"))}>
          <INote size={21} />
          Pedidos
        </Link>
      </div>
    </nav>
  );
}
