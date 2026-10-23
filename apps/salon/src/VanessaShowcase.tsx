import { useState } from "react";
import type { SalonPublicConfig } from "./config/template";
import { mapsSearchUrl, whatsappUrl } from "./config/template";
import "./vanessa-showcase.css";
import type { PublicSalonPhoto } from "./business/public-media";
import type { PublicSalonPage } from "./business/public-cms";
import SalonBooking, { FloatingWhatsApp } from "./SalonBooking";

/**
 * Faithful QA visual preview of the upstream Vanessa-Braz editorial landing.
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
  const whatsapp = whatsappUrl(config);
  // Live uses only the approved tenant-scoped Storage projection; the original GitHub
  // photo library is confined to the explicit QA visual review branch.
  const gallery = photos?.length ? photos.map((p) => ({ src: p.src, alt: p.alt })) : images.map((p) => ({ src: imageUrl(p.file), alt: p.alt }));
  const visualReview = !photos?.length;

  return (
    <div className="vanessa-showcase">
      <a className="vanessa-skip" href="#conteudo">Ir para o conteúdo</a>
      <header className="vanessa-header">
        <a className="vanessa-logo" href="#inicio" aria-label={config.brandName + " — início"}>{config.brandName}</a>
        <nav aria-label="Navegação principal">
          <a href="#inicio">Início</a>
          <a href="#servicos">Serviços</a>
          <a href="#galeria">Galeria</a>
          <a href="#agendar">Agendar</a>
          <a href="#contato">Contato</a>
        </nav>
        <a className="vanessa-nav-cta" href="#agendar">Agendar</a>
      </header>

      <main id="conteudo">
        <section className="vanessa-hero" id="inicio">
          <img className="vanessa-hero-img" src={gallery[0].src} alt={gallery[0].alt} fetchPriority="high" />
          <div className="vanessa-shade" />
          <div className="vanessa-hero-copy">
            <p className="vanessa-eyebrow">BELEZA &amp; AUTOESTIMA</p>
            <h1>{config.brandName}</h1>
            <p>Um espaço para acompanhar informações confirmadas sobre serviços, disponibilidade e formas de agendamento.</p>
            <div className="vanessa-actions">
              <a className="vanessa-cta-light" href="#agendar">Agendar horário <span aria-hidden="true">↗</span></a>
              {config.whatsapp && <a className="vanessa-cta-outline" href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
            </div>
          </div>
          <span className="vanessa-explore">EXPLORE · ↓</span>
        </section>

        <section className="vanessa-editorial vanessa-essence">
          <img src={gallery[Math.min(2, gallery.length - 1)].src} alt={gallery[Math.min(2, gallery.length - 1)].alt} loading="lazy" />
          <div>
            <p className="vanessa-eyebrow">NOSSA ESSÊNCIA</p>
            <h2>Beleza e autocuidado, no seu tempo.</h2>
            <p>Este espaço reúne a identidade visual de {config.brandName} e informações que podem ser consultadas antes do agendamento.</p>
            <p>Detalhes sobre serviços, técnicas, estrutura e disponibilidade serão publicados somente após confirmação.</p>
            <a href="#servicos" className="vanessa-inline-link">Conheça os serviços →</a>
          </div>
        </section>

        <section className="vanessa-editorial vanessa-services" id="servicos">
          <p className="vanessa-eyebrow">SERVIÇOS</p>
          <h2>Serviços e informações</h2>
          <p>O catálogo está aguardando confirmação de serviços, preços e horários. Nenhum procedimento ou valor foi inventado para este preview.</p>
          <div className="vanessa-info-list">
            <div><span>01</span><strong>Informações confirmadas</strong><p>Serviços e valores serão exibidos após aprovação no SaaS Core.</p></div>
            <div><span>02</span><strong>Escolha de data</strong><p>Escolha o dia e horário de preferência e solicite a confirmação pelo WhatsApp.</p></div>
            <div><span>03</span><strong>Mensagem personalizada</strong><p>Informe o serviço e acrescente observações antes de abrir o WhatsApp.</p></div>
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

        <section className="vanessa-editorial vanessa-gallery" id="galeria">
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
        </section>

        <section className="vanessa-ambient">
          <img src={gallery[Math.min(1, gallery.length - 1)].src} alt={gallery[Math.min(1, gallery.length - 1)].alt} loading="lazy" />
          <div><p className="vanessa-eyebrow">ACERVO</p><h2>Um olhar sobre o acervo</h2><p>Uma experiência visual a ser preservada na integração com o SaaS.</p></div>
        </section>

        <section className="vanessa-book" id="agendar">
          <div><p className="vanessa-eyebrow">AGENDAMENTO</p><h2>Escolha seu dia, horário e serviço.</h2><p>Personalize sua solicitação e envie pelo WhatsApp. A equipe confirma os horários e os detalhes do atendimento diretamente na conversa.</p></div>
          <SalonBooking config={config} />
        </section>

        <section className="vanessa-editorial vanessa-contact" id="contato">
          <p className="vanessa-eyebrow">CONTATO</p><h2>{config.brandName}</h2>
          <div className="vanessa-contact-columns">
            <div><small>INSTAGRAM</small>{config.instagramUrl && <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer">{config.instagramHandle}</a>}</div>
            <div><small>WHATSAPP</small>{config.whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer">{config.phoneDisplay}</a>}</div>
            <div><small>ENDEREÇO</small>{config.address && <a href={mapsSearchUrl(config.address)} target="_blank" rel="noopener noreferrer">{config.address}</a>}</div>
            <div><small>HORÁRIOS</small><span>A confirmar</span></div>
          </div>
        </section>
      </main>

      <footer className="vanessa-footer"><strong>{config.brandName}</strong><p>{visualReview ? "Preview controlado" : "Live tenant"} · {config.tagline} · Serviços, preços e horários sujeitos a confirmação.</p><small>Vertical Salon / Integração SaaS — {visualReview ? "Preview" : "Conteúdo público autorizado"}</small></footer>
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
