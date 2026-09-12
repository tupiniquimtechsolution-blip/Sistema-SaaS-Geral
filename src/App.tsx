import { useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { AppProvider } from "./store/AppStore";
import { PageShell, ScrollToTop } from "./components/Chrome";
import { CompareModal, CompareTray, QuoteModal } from "./components/overlays";
import { prefersReducedMotion } from "./lib/utils";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import MachineDetail from "./pages/MachineDetail";
import Company from "./pages/Company";
import Contents from "./pages/Contents";
import Deck from "./pages/Deck";
import { ContactPage, FinancingPage, TradeInPage } from "./pages/Forms";

gsap.registerPlugin(ScrollTrigger);

/** Smooth scroll global — desligado em reduced-motion e na rota de apresentação (deck usa scroll próprio + print) */
function LenisController() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === "/apresentacao") return;
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", () => ScrollTrigger.update());
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <LenisController />
        <ScrollToTop />
        <PageShell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pecas" element={<Catalog mode="all" />} />
            <Route path="/pecas/:slug" element={<MachineDetail />} />
            <Route path="/originais" element={<Catalog mode="originais" />} />
            <Route path="/compativeis" element={<Catalog mode="compativeis" />} />
            <Route path="/motores" element={<Catalog mode="motores" />} />
            <Route path="/minhas-pecas" element={<Catalog mode="favoritas" />} />
            <Route path="/orcamento" element={<FinancingPage />} />
            <Route path="/busca" element={<TradeInPage />} />
            <Route path="/empresa" element={<Company />} />
            <Route path="/contato" element={<ContactPage />} />
            <Route path="/conteudos" element={<Contents />} />
            <Route path="/apresentacao" element={<Deck />} />
            <Route path="*" element={<Catalog mode="all" />} />
          </Routes>
        </PageShell>
        <QuoteModal />
        <CompareTray />
        <CompareModal />
      </HashRouter>
    </AppProvider>
  );
}
