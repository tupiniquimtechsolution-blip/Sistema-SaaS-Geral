import { Component, useEffect } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { themeCss } from "./config/theme";
import Navbar from "./components/Navbar";
import { Footer, FloatingWhatsApp } from "./components/Footer";
import { CartDrawer, MobileOrderBar } from "./components/CartDrawer";
import Home from "./pages/Home";
import MenuPage from "./pages/MenuPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";

/** Garante topo da página a cada troca de rota */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

/**
 * ErrorBoundary — componente de classe (sem hooks), captura erros de
 * renderização e exibe um fallback elegante em vez de tela em branco.
 */
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Porto Baa'R Black] erro capturado:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0d0b09] px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#ff6b2c]">Erro na chapa</p>
          <h1 className="font-display text-4xl uppercase text-[#f2ead9] sm:text-5xl">Algo queimou por aqui</h1>
          <p className="max-w-md text-sm leading-relaxed text-[#a89b8a]">
            Encontramos um problema ao renderizar a página. Recarregue para tentar novamente — se persistir, limpe o cache
            do navegador.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-[#ff6b2c] px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#0d0b09] transition-colors hover:bg-[#e3a83e]"
          >
            Recarregar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <HashRouter>
          {/* identidade visual injetada de src/config/theme.ts */}
          <style>{themeCss()}</style>
          <ScrollToTop />
          <div className="grain min-h-screen bg-bg font-body text-cream">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cardapio" element={<MenuPage />} />
                <Route path="/sobre" element={<AboutPage />} />
                <Route path="/contato" element={<ContactPage />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
            <CartDrawer />
            <MobileOrderBar />
            <FloatingWhatsApp />
          </div>
        </HashRouter>
      </CartProvider>
    </ErrorBoundary>
  );
}
