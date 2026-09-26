import { useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { business, applyTheme } from "./config/business";
import { StoreProvider } from "./lib/core";
import { Header, Footer, BottomNav, CartDrawer, SearchOverlay, WhatsAppFloat, FloatingCTA } from "./components/chrome";
import { Toasts, Btn, EmptyState } from "./components/ui";
import { IPaw } from "./components/icons";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Services from "./pages/Services";
import Booking from "./pages/Booking";
import { CartPage, CheckoutPage } from "./pages/CartCheckout";
import PetPage from "./pages/Pet";
import { AboutPage, ContactPage, LocationPage } from "./pages/Info";
import { OrdersPage, LoyaltyPage } from "./pages/Account";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <main className="max-w-3xl mx-auto px-4 pt-32">
      <EmptyState
        icon={<IPaw size={28} />}
        title="Página não encontrada"
        desc="Esse caminho cheira a osso enterrado no lugar errado. Vamos voltar para a toca?"
        action={<Btn to="/">Voltar ao início</Btn>}
      />
    </main>
  );
}

function Shell() {
  const f = business.features;
  return (
    <div className="grain min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          {f.ecommerce && <Route path="/produtos" element={<Shop />} />}
          {f.ecommerce && <Route path="/produtos/:slug" element={<ProductDetail />} />}
          {f.ecommerce && <Route path="/categoria/:slug" element={<Shop />} />}
          {f.grooming && <Route path="/servicos" element={<Services />} />}
          {f.booking && <Route path="/agendamento" element={<Booking />} />}
          {f.cart && <Route path="/carrinho" element={<CartPage />} />}
          {f.checkout && <Route path="/checkout" element={<CheckoutPage />} />}
          {f.petProfiles && <Route path="/meu-pet" element={<PetPage />} />}
          {f.loyalty && <Route path="/fidelidade" element={<LoyaltyPage />} />}
          <Route path="/meus-pedidos" element={<OrdersPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/localizacao" element={<LocationPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      <BottomNav />
      <FloatingCTA />
      {business.integrations.whatsapp.enabled && <WhatsAppFloat />}
      <CartDrawer />
      <SearchOverlay />
      <Toasts />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    applyTheme(business);
    // PWA: registra o service worker em produção
    if (import.meta.env.PROD && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <StoreProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </StoreProvider>
  );
}
