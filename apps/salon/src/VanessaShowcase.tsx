import { useEffect, useRef, useState } from "react";
import type { SalonPublicConfig } from "./config/template";
import { mapsSearchUrl, whatsappUrl } from "./config/template";
import "./vanessa-showcase.css";
import "./vanessa-premium-theme.css";
import "./vanessa-50-ux.css";
import type { PublicSalonPhoto } from "./business/public-media";
import type { PublicSalonPage } from "./business/public-cms";
import SalonBooking, { FloatingWhatsApp } from "./SalonBooking";
import SalonInstallPrompt from "./SalonInstallPrompt";
import SalonWelcome from "./SalonWelcome";
import VanessaOfficialArchive from "./VanessaOfficialArchive";
import { officialVanessaPhotos, officialVanessaQaReviewAllowed } from "./official-vanessa-media";

/**
 * Vanessa editorial site in SaaS, with official VanessaBraz-Beleza-e-Autoestima
 * photographic and video archive shown only in controlled QA review.
 * Source design and media: tupiniquimtechsolution-blip/Vanessa-Braz
 *                       @ 74dd4b81964b92dd8e5730f55c04bbbc0d2314ea
 *
 * Do not use this gallery to infer tenant-scoped media authorization.
 * This component is mounted only by VITE_DEMO_MODE=true / preview.
 * Live tenant mode continues to resolve data and consent through SaaS Core.
 */
const source = "https://raw.githubusercontent.com/tupiniquimtechsolution-blip/Vanessa-Braz/74dd4b81964b92dd8e5730f55c04bbbc0d2314ea/apps/web/public/media/optimized/web/";
const images = [
  { file: "WhatsApp-Image-2026-09-12-at-10.23.51-121a8bba.webp", alt: "Fotografia do acervo original Vanessa Braz" },
  { file: "WhatsApp-Image-2026-09-12-at-10.24.30-df8e25a1.webp", alt: "Segunda fotografia do acervo original Vanessa Braz" },
  { file: "WhatsApp-Image-2026-09-12-at-10.26.30-1-fc3283cf.webp", alt: "Detalhe fotográfico do acervo Vanessa Braz" },
  { file: "WhatsApp-Image-2026-09-12-at-10.26.30-606cc281.webp", alt: "Fotografia de galeria do acervo Vanessa Braz" },
  { file: "WhatsApp-Image-2026-09-12-at-10.26.31-1-818d9a43.webp", alt: "Detalhe fotográfico do acervo original" },
  { file: "WhatsApp-Image-2026-09-12-at-10.26.31-d476f468.webp", alt: "Fotografia do acervo original da marca" },
  { file: "WhatsApp-Image-2026-09-12-at-10.26.32-1-8e7b7802.webp", alt: "Fotografia do acervo original Vanessa Braz" },
];
const imageUrl = (filename: string) => source + filename;

export default function VanessaShowcase({ config, photos, published }: { config: SalonPublicConfig; photos?: PublicSalonPhoto[]; published?: PublicSalonPage | null }) {
  const [galleryOpen, setGalleryOpen] = useState<number | null>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [showReturnTop, setShowReturnTop] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const copyAddress = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setAddressCopied(true);
    } catch {
      setAddressCopied(false);
    }
  };
  const [activeSection, setActiveSection] = useState("inicio");
  useEffect(() => {
    let scheduled = false;
    const update = () => {
      scheduled = false;
      setShowReturnTop(window.scrollY > 650);
      const markers = ["inicio", "espaco", "sobre", "servicos", "salon-service-label", "galeria", "salon-calendar", "contato"];
      const active = markers.map((id) => document.getElementById(id))
        .filter((node): node is HTMLElement => Boolean(node))
        .filter((node) => node.getBoundingClientRect().top <= 185)
        .at(-1);
      if (active) setActiveSection(active.id);
    };
    const onScroll = () => {
      if (!scheduled) { scheduled = true; window.requestAnimationFrame(update); }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onScroll);
    };
  }, []);
  const navActive = (id: string) => {
    if (id === "salon-service-label") return activeSection === "servicos" || activeSection === id;
    return activeSection === id;
  };
  const whatsapp = whatsappUrl(config);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    try {
      const saved = window.localStorage.getItem("vanessa-theme-v1");
      if (saved === "light" || saved === "dark") return saved;
    } catch { /* private browsing */ }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    try { window.localStorage.setItem("vanessa-theme-v1", theme); } catch { /* unavailable */ }
    const color = theme === "dark" ? "#201b1d" : "#fbf6f0";
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", color);
  }, [theme]);
  // Live uses only the approved tenant-scoped Storage projection; the original GitHub
  // photo library is confined to the explicit QA visual review branch.
  const officialReview = !photos?.length && officialVanessaQaReviewAllowed(import.meta.env, config.slug);
  const gallery = photos?.length ? photos.map((p) => ({ src: p.src, alt: p.alt }))
    : officialReview ? officialVanessaPhotos.map((p, i) => ({ src: p.url, alt: "Fotografia oficial Vanessa Braz " + (i + 1) }))
    : images.map((p) => ({ src: imageUrl(p.file), alt: p.alt }));
  const visualReview = !photos?.length;
  // This query switch only reveals local QA curation controls; it is NOT an auth gate.
  // No tenant mutation or commercial media publication is available through the archive.
  const showEditorialControls = officialReview && typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("curadoria") === "1";
  const salonDisplayName = officialReview && config.slug === "vanessa-braz"
    ? "Vanessa Braz — Beleza & Autoestima"
    : config.brandName;
  // Photo numbers are 1-based as shown in the QA gallery.
  const logoUrl = officialReview ? officialVanessaPhotos[13]?.url : null;
  const heroAsset = officialReview ? gallery[77] ?? gallery[0] : gallery[0];
  const [droneImageAvailable, setDroneImageAvailable] = useState(false);
  // QA-only: the approved overhead image is a separate space-tour visual when
  // /public/media/espaco-vanessa-vista-superior.webp is committed to this branch.
  // Cloudflare SPA fallback may return index.html with 200 for missing files:
  // validate response MIME to avoid treating fallback HTML as a real image.
  useEffect(() => {
    if (!officialReview) return;
    const controller = new AbortController();
    fetch("/media/espaco-vanessa-vista-superior.webp", {
      method: "HEAD", signal: controller.signal, cache: "no-store",
    }).then((response) => {
      const type = response.headers.get("content-type") ?? "";
      if (response.ok && type.includes("image/webp")) setDroneImageAvailable(true);
    }).catch(() => undefined);
    return () => controller.abort();
  }, [officialReview]);
  const displayedHero = officialReview && droneImageAvailable
    ? { src: "/media/espaco-vanessa-vista-superior.webp", alt: "Vista superior do salão de beleza Vanessa Braz" }
    : heroAsset;
  // The address comes from the verified business listing; QA review only.
  const contactAddress = officialReview && config.slug === "vanessa-braz"
    ? "Rua Redenção, 88 - Chácara Tatuapé, São Paulo - SP, 03060-010"
    : config.address;

  return (
    <div className="vanessa-showcase" data-theme={theme}>
      <SalonWelcome enabled={officialReview} logoUrl={logoUrl} brandName={salonDisplayName} />
      <a className="vanessa-skip" href="#conteudo">Ir para o conteúdo</a>
      <header className="vanessa-header">
        <a className="vanessa-logo" href="#inicio" aria-label={config.brandName + " — início"}>{logoUrl ? <img src={logoUrl} alt={"Logo " + config.brandName} width="64" height="64" /> : config.brandName}</a>
        <nav aria-label="Navegação principal do salão">
          <a href="#inicio" aria-current={navActive("inicio") ? "location" : undefined}>Início</a>
          <a href="#sobre" aria-current={navActive("sobre") ? "location" : undefined}>Sobre</a>
          <a href="#salon-service-label" aria-current={navActive("salon-service-label") ? "location" : undefined}>Serviços</a>
          <a href="#galeria" aria-current={navActive("galeria") ? "location" : undefined}>Galeria</a>
          <a href="#salon-calendar" aria-current={navActive("salon-calendar") ? "location" : undefined}>Agendamento</a>
          <a href="#contato" aria-current={navActive("contato") ? "location" : undefined}>Contato</a>
        </nav>
        <details ref={menuRef} className="vanessa-mobile-menu" onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) menuRef.current?.removeAttribute("open");
        }}>
          <summary aria-label="Abrir ou fechar menu de navegação">Menu <span aria-hidden="true">☰</span></summary>
          <div>
            <a href="#inicio">Início</a>
            <a href="#sobre">Sobre</a>
            <a href="#salon-service-label">Serviços</a>
            <a href="#galeria">Galeria</a>
            <a href="#salon-calendar">Agendamento</a>
            <a href="#contato">Contato</a>
          </div>
        </details>
        <button
          className="vanessa-theme-toggle"
          type="button"
          onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
          title={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
          aria-pressed={theme === "dark"}
        >
          <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          <span className="vanessa-theme-label">{theme === "dark" ? "Tema claro" : "Tema escuro"}</span>
        </button>
        <a className="vanessa-nav-cta" href="#salon-calendar" aria-label="Ir diretamente ao calendário de agendamento">Agendar</a>
      </header>

      <main id="conteudo" tabIndex={-1}>
        <section className="vanessa-hero" id="inicio">
          <div className="vanessa-hero-arch" aria-hidden="true" />
          <div className="vanessa-hero-copy">
            <div className="vanessa-hero-card">
              <p className="vanessa-eyebrow">UM CONVITE AO SEU BEM-ESTAR</p>
              <h1>{salonDisplayName}</h1>
              <p>Seu momento de beleza e autocuidado começa aqui. Conheça nosso espaço e converse com a equipe para escolher seu atendimento.</p>
              <div className="vanessa-actions">
                <a className="vanessa-cta-light" href="#salon-calendar">Solicitar horário <span aria-hidden="true">↗</span></a>
                <a className="vanessa-cta-outline" href="#espaco">Conhecer o espaço</a>
              </div>
            </div>
          </div>
          <a href="#espaco" className="vanessa-explore">EXPLORE O ESPAÇO <span aria-hidden="true">↓</span></a>
        </section>

        <section className="vanessa-space-tour" id="espaco" aria-labelledby="vanessa-space-title">
          <div className="vanessa-space-heading">
            <div>
              <p className="vanessa-eyebrow">NOSSO ESPAÇO</p>
              <h2 id="vanessa-space-title">Um espaço pensado para receber você.</h2>
            </div>
            <p>Um salão acolhedor, preparado para oferecer uma experiência de cuidado, beleza e bem-estar.</p>
          </div>
          <figure className="vanessa-space-figure">
            <img className="vanessa-hero-img" src={displayedHero.src} alt={displayedHero.alt} loading="lazy" decoding="async" onError={() => setDroneImageAvailable(false)} />
            {officialReview && droneImageAvailable && <figcaption>Vista ilustrativa do ambiente baseada em fotografia do salão.</figcaption>}
          </figure>
          <a className="vanessa-space-link" href="#galeria">Conhecer a galeria <span aria-hidden="true">↗</span></a>
        </section>

        <section className="vanessa-editorial vanessa-essence" id="sobre">
          <figure className="vanessa-essence-photo">
            <img src={gallery[0].src} alt={gallery[0].alt} loading="lazy" decoding="async" />
          </figure>
          <div className="vanessa-essence-content">
            <h2>Um momento para cuidar de você.</h2>
            <p>Bem-estar, autoestima e cuidado em um só lugar.</p>
            <a href="#salon-service-label" className="vanessa-inline-link">Conheça nossos serviços <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section className="vanessa-editorial vanessa-services" id="servicos">
          <div className="vanessa-section-heading">
            <div>
              <h2>Seu cuidado, no seu ritmo.</h2>
            </div>
            <p>Escolha o tipo de cuidado, o dia e o horário de sua preferência. Converse com nossos profissionais para confirmar os detalhes do atendimento.</p>
          </div>
          <div className="vanessa-services-action">
            <a href="#salon-calendar" className="vanessa-space-link">Agende seu horário <span aria-hidden="true">↗</span></a>
            <span>Atendimento combinado diretamente com nossa equipe.</span>
          </div>
        </section>

        {published?.status === "published" && (
          <section className="vanessa-editorial" aria-label="Conteúdo publicado pelo Builder">
            <p className="vanessa-eyebrow">CONTEÚDO PUBLICADO</p>
            <h2>{published.title}</h2>
            {published.sections.map((section) => (
              <article key={section.id}>
                {section.title && <h3>{section.title}</h3>}
                {section.text && <p>{section.text}</p>}
              </article>
            ))}
          </section>
        )}

        {officialReview ? <VanessaOfficialArchive instagramUrl={config.instagramUrl} reviewToolsEnabled={showEditorialControls} /> : <section className="vanessa-editorial vanessa-gallery" id="galeria">
          <p className="vanessa-eyebrow">GALERIA</p>
          <h2>Imagens do acervo</h2>
          <p className="vanessa-gallery-note">{visualReview ? "Acervo visual original da Vanessa, exibido apenas neste preview de revisão. Publicação definitiva requer autorização de mídia e vínculo ao tenant." : "Acervo público aprovado no SaaS para este espaço."}</p>
          <div className="vanessa-grid">
            {gallery.slice(1, 7).map((asset, index) => (
              <button className={index === 0 ? "vanessa-gallery-main" : ""} key={asset.src} type="button" onClick={() => setGalleryOpen(index + 1)} aria-label={"Ver fotografia do acervo " + (index + 1)}>
                <img src={asset.src} alt={asset.alt} loading="lazy" />
              </button>
            ))}
          </div>
        </section>}

        <section className="vanessa-book" id="agendar">
          <div className="vanessa-book-copy"><h2>Seu próximo momento de autocuidado.</h2><p>Escolha o cuidado, o dia e o horário de preferência. Converse com nossos profissionais pelo WhatsApp para confirmar a disponibilidade e os detalhes.</p></div>
          <SalonBooking config={config} />
        </section>

        <section className="vanessa-faq" id="duvidas" aria-labelledby="vanessa-faq-title">
          <div className="vanessa-faq-intro">
            <p className="vanessa-eyebrow">DÚVIDAS FREQUENTES</p>
            <h2 id="vanessa-faq-title">Tudo mais simples para você.</h2>
            <p>Informações importantes para solicitar seu atendimento com tranquilidade.</p>
            <a href="#salon-service-label" className="vanessa-inline-link">Escolher um cuidado <span aria-hidden="true">↗</span></a>
          </div>
          <div className="vanessa-faq-questions">
            <details><summary>Como faço para solicitar um horário?</summary>
              <p>Escolha a área de interesse, a data e o horário de preferência. Depois, revise sua mensagem e envie pelo WhatsApp.</p>
            </details>
            <details><summary>O horário fica reservado automaticamente?</summary>
              <p>Não. A solicitação abre uma conversa com nossa equipe, que confirma a disponibilidade e os detalhes com você.</p>
            </details>
            <details><summary>Posso tirar dúvidas antes de escolher?</summary>
              <p>Sim. Você pode usar o botão do WhatsApp para conversar diretamente com o salão, mesmo sem preencher o formulário.</p>
            </details>
            <details><summary>Preciso criar uma conta para conhecer o salão?</summary>
              <p>Não. Você pode navegar pelo espaço, pelas imagens e pelas informações públicas sem fazer login.</p>
            </details>
          </div>
        </section>

        <section className="vanessa-editorial vanessa-contact" id="contato">
          <p className="vanessa-eyebrow">FALE COM A GENTE</p>
          <h2>Será um prazer receber você.</h2>
          <p className="vanessa-contact-intro">Precisa de informações? Nossa equipe atende suas dúvidas e combina os detalhes do atendimento com você.</p>
          <div className="vanessa-contact-actions">
            {config.instagramUrl && <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir Instagram do salão">Instagram ↗</a>}
            {config.whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Conversar com o salão pelo WhatsApp">WhatsApp · {config.phoneDisplay || config.whatsapp} ↗</a>}
          </div>
          {contactAddress && <div className="vanessa-location">
            <div>
              <p className="vanessa-eyebrow">LOCALIZAÇÃO</p>
              <h2>Encontre nosso salão</h2>
              <address>{contactAddress}</address>
              <div className="vanessa-location-actions">
                <a className="vanessa-cta-light" href={mapsSearchUrl(contactAddress)} target="_blank" rel="noopener noreferrer">Traçar rota no Google Maps ↗</a>
                <button type="button" className="vanessa-copy-address" onClick={() => void copyAddress(contactAddress)}>Copiar endereço</button>
                <button type="button" className="vanessa-copy-address" onClick={() => setShowMap((shown) => !shown)}
                  aria-expanded={showMap} aria-controls="vanessa-contact-map">{showMap ? "Ocultar mapa" : "Visualizar mapa"}</button>
              </div>
              {addressCopied && <p role="status" className="vanessa-copy-result">Endereço copiado.</p>}
            </div>
            <div className="vanessa-map-panel" id="vanessa-contact-map">
              {showMap ? <iframe title="Mapa da localização do salão Vanessa Braz" loading="lazy"
                referrerPolicy="no-referrer" src={"https://maps.google.com/maps?q=" + encodeURIComponent(contactAddress) + "&output=embed"} /> :
                <div className="vanessa-map-placeholder">
                  <span aria-hidden="true">⌖</span>
                  <p>{contactAddress}</p>
                  <p>Abra o mapa quando quiser consultar a localização.</p>
                </div>}
            </div>
          </div>}
        </section>
      </main>

      <footer className="vanessa-footer" aria-label="Informações do salão">
        <nav aria-label="Mapa do site" className="vanessa-footer-links">
          <strong>Explore o site</strong>
          <a href="#inicio">Início</a><a href="#sobre">Sobre</a><a href="#salon-service-label">Serviços</a>
          <a href="#galeria">Galeria</a><a href="#salon-calendar">Agendamento</a><a href="#contato">Contato</a>
        </nav>
        <small>© {new Date().getFullYear()} {salonDisplayName}. Todos os direitos reservados.</small>
      </footer>
      {showReturnTop && <a className="vanessa-back-top" href="#inicio" aria-label="Voltar ao início da página">
        <span aria-hidden="true">↑</span><span className="vanessa-back-top-text">Voltar ao início</span>
      </a>}
      <SalonInstallPrompt />
      <FloatingWhatsApp config={config} />

      {galleryOpen !== null && (
        <div className="vanessa-lightbox" role="dialog" aria-modal="true" aria-label="Fotografia ampliada">
          <button type="button" onClick={() => setGalleryOpen(null)} aria-label="Fechar galeria">Fechar ×</button>
          <img src={gallery[galleryOpen].src} alt={gallery[galleryOpen].alt} />
        </div>
      )}
    </div>
  );
}
