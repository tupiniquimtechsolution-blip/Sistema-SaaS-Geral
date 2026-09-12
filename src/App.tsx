import { useEffect, useState } from "react";
import { HashRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppProvider, useApp } from "./core/store";
import { track } from "./core/utils";
import Header from "./components/Header";
import MobileNav from "./components/MobileNav";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductPage from "./pages/ProductPage";
import Checkout from "./pages/Checkout";
import Encomendas from "./pages/Encomendas";
import { Sobre, Contato, MeusPedidos, PedidoDetalhe } from "./pages/StaticPages";
import Admin from "./pages/Admin";
import { IClose, ISpark } from "./components/icons";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [pathname]);
  return null;
}

/* animação do item voando até o carrinho */
function FlyLayer() {
  const { flySignal } = useApp();
  useEffect(() => {
    if (!flySignal) return;
    const targetEl = document.querySelector("[data-cart-target]");
    const target = targetEl?.getBoundingClientRect();
    if (!target) return;
    const from = flySignal.from;
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = `position:fixed;z-index:120;left:${from.left + from.width / 2}px;top:${from.top + from.height / 2}px;width:16px;height:16px;border-radius:50%;background:var(--accent);box-shadow:0 6px 18px rgba(0,0,0,0.5), inset 0 -3px 6px rgba(0,0,0,0.25);pointer-events:none;`;
    document.body.appendChild(el);
    const dx = target.left + target.width / 2 - (from.left + from.width / 2);
    const dy = target.top + target.height / 2 - (from.top + from.height / 2);
    const anim = el.animate(
      [
        { transform: "translate(-50%,-50%) scale(1)", opacity: "1" },
        { transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - 90}px)) scale(0.9)`, opacity: "1", offset: 0.55 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.25)`, opacity: "0.5" },
      ],
      { duration: 700, easing: "cubic-bezier(0.3, 0.7, 0.35, 1)" }
    );
    anim.onfinish = () => el.remove();
    anim.oncancel = () => el.remove();
  }, [flySignal]);
  return null;
}

function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed left-1/2 top-24 z-[90] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 380 }}
            className="flex items-center gap-2.5 rounded-full border border-line bg-espresso/95 py-2.5 pl-4 pr-5 shadow-[0_16px_40px_-14px_rgba(0,0,0,0.7)] backdrop-blur-sm"
            role="status"
          >
            <span className={`h-2 w-2 rounded-full ${t.tone === "success" ? "bg-accent" : "bg-caramel"}`} />
            <p className="text-[13.5px] font-bold text-paper">{t.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* convite "Adicionar à tela inicial" (PWA) */
type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function PwaPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const fn = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); };
    window.addEventListener("beforeinstallprompt", fn);
    return () => window.removeEventListener("beforeinstallprompt", fn);
  }, []);

  if (!evt || hidden) return null;
  return (
    <div className="fixed bottom-20 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 md:bottom-6">
      <div className="anim-rise flex items-center gap-3.5 rounded-[var(--radius)] border border-line bg-espresso/95 p-3.5 shadow-[0_24px_50px_-16px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[calc(var(--radius)*0.7)] bg-accent text-accent-ink"><ISpark size={22} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-extrabold text-paper">Leve a Fornalha no bolso</p>
          <p className="truncate text-[12px] text-dim">Instale o app e peça em dois toques.</p>
        </div>
        <button
          onClick={async () => { track("pwa_install"); await evt.prompt(); setHidden(true); }}
          className="btn btn-primary !px-4 !py-2 text-[12.5px]"
        >
          Instalar
        </button>
        <button onClick={() => setHidden(true)} aria-label="Dispensar" className="text-dim hover:text-paper"><IClose size={16} /></button>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <p className="font-display text-8xl font-light italic text-caramel/70">404</p>
      <h1 className="font-display mt-3 text-3xl text-paper">Esta página queimou no forno.</h1>
      <p className="mt-2 text-dim">Mas o cardápio segue fresquinho.</p>
      <Link to="/" className="btn btn-primary mt-7">Voltar ao início</Link>
    </main>
  );
}

function Shell() {
  return (
    <div className="grain min-h-screen bg-bg font-body text-paper">
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/produtos" element={<Catalog />} />
        <Route path="/ofertas" element={<Catalog presetPromo />} />
        <Route path="/categoria/:slug" element={<Catalog />} />
        <Route path="/produto/:slug" element={<ProductPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/encomendas" element={<Encomendas />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/localizacao" element={<Contato />} />
        <Route path="/meus-pedidos" element={<MeusPedidos />} />
        <Route path="/pedido/:code" element={<PedidoDetalhe />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <MobileNav />
      <CartDrawer />
      <Toasts />
      <FlyLayer />
      <PwaPrompt />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("/sw.js").catch(() => { /* offline opcional */ });
    }
  }, []);

  return (
    <AppProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </AppProvider>
  );
}
