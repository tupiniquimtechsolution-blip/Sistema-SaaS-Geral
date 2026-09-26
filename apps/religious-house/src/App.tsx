import { useEffect, useState } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { BookingProvider } from "./components/BookingModal";
import Header from "./components/Header";
import { Footer, WhatsAppButton } from "./components/SiteChrome";
import Calendario from "./pages/Calendario";
import Home from "./pages/Home";
import { Atendimentos, Contato, Galeria, QuemSomos } from "./pages/InnerPages";
import { templeConfig } from "./data/templeConfig";

/* ---------- progresso de scroll (filete dourado) ---------- */
function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        setP(max > 0 ? el.scrollTop / max : 0);
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    on();
    return () => {
      window.removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-[3px]" aria-hidden>
      <div
        className="h-full origin-left bg-gradient-to-r from-gold-700 via-gold-500 to-gold-300"
        style={{ transform: `scaleX(${p})` }}
      />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

/* ---------- SEO por rota + JSON-LD na home ---------- */
const ROUTE_META: Record<string, { title: string; desc: string }> = {
  "/": {
    title: "Templo de Umbanda Caboclo Tupinambá e Flecha Dourada | São Paulo",
    desc: "Templo de Umbanda na Zona Leste de São Paulo: giras aos sábados, consultas com Maria Mulambo às quartas e acolhimento espiritual. Agende pelo WhatsApp.",
  },
  "/quem-somos": {
    title: "Quem Somos | Templo de Umbanda Caboclo Tupinambá",
    desc: "Conheça a casa, a missão e as entidades que dão nome ao Templo de Umbanda Caboclo Tupinambá e Caboclo Flecha Dourada, em São Paulo.",
  },
  "/calendario": {
    title: "Calendário de Giras | Templo Caboclo Tupinambá",
    desc: "Próximas giras de sábado, desenvolvimento da corrente às sextas e consultas com Maria Mulambo às quartas. Veja o calendário do templo.",
  },
  "/atendimentos": {
    title: "Atendimentos | Templo Caboclo Tupinambá e Flecha Dourada",
    desc: "Consulta com Maria Mulambo, Jogo de Búzios, trabalhos espirituais e orientação. Agende seu atendimento pelo WhatsApp.",
  },
  "/galeria": {
    title: "Galeria | Templo de Umbanda Caboclo Tupinambá",
    desc: "Artes e registros que compõem a identidade do Templo de Umbanda Caboclo Tupinambá e Caboclo Flecha Dourada.",
  },
  "/contato": {
    title: "Contato e Localização | Templo Caboclo Tupinambá",
    desc: "Av. Osvaldo Pucci, 883 — Jardim Nossa Senhora do Carmo, São Paulo. Fale pelo WhatsApp (11) 97596-5824 ou visite nossa casa.",
  },
};

function HeadManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const meta = ROUTE_META[pathname] ?? ROUTE_META["/"];
    document.title = meta.title;
    let el = document.querySelector('meta[name="description"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "description");
      document.head.appendChild(el);
    }
    el.setAttribute("content", meta.desc);

    const JSONLD_ID = "temple-jsonld";
    document.getElementById(JSONLD_ID)?.remove();
    if (pathname === "/") {
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = JSONLD_ID;
      s.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ReligiousOrganization",
        name: templeConfig.name,
        telephone: "+55 11 97596-5824",
        address: {
          "@type": "PostalAddress",
          streetAddress: templeConfig.address.street,
          addressLocality: templeConfig.address.city,
          addressRegion: templeConfig.address.state,
          postalCode: templeConfig.address.zip,
          addressCountry: "BR",
        },
        sameAs: [templeConfig.instagram],
      });
      document.head.appendChild(s);
    }
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <BookingProvider>
        <ScrollToTop />
        <HeadManager />
        <div className="ambient noise relative min-h-screen overflow-x-clip">
          <ScrollProgress />
          <Header />
          <main id="conteudo">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quem-somos" element={<QuemSomos />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/atendimentos" element={<Atendimentos />} />
              <Route path="/galeria" element={<Galeria />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppButton />
        </div>
      </BookingProvider>
    </HashRouter>
  );
}
