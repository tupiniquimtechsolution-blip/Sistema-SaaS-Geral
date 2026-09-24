import { useMemo } from "react";
import { getSalonPreviewConfig } from "./business/saas-adapter";
import { mapsSearchUrl, whatsappUrl } from "./config/template";

function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

export default function App() {
  const runtime = useMemo(() => getSalonPreviewConfig(), []);
  const config = runtime.config;
  const contactUrl = whatsappUrl(config);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>

      <header className="header">
        <a className="brand" href="#inicio" aria-label={`${config.brandName} — início`}>
          <span className="brand-name">{config.brandName}</span>
          <span className="brand-tagline">{config.tagline}</span>
        </a>
        <nav className="nav" aria-label="Navegação principal">
          <a href="#servicos">Serviços</a>
          <a href="#galeria">Galeria</a>
          <a href="#agendar">Agendar</a>
          <a href="#contato">Contato</a>
        </nav>
        <a className="button button-small" href="#agendar">Agendar</a>
      </header>

      <main id="conteudo">
        <section className="hero" id="inicio">
          <div className="hero-copy">
            <p className="eyebrow">SALÃO · BELEZA · ESTÉTICA</p>
            <h1>Beleza que acompanha quem você é.</h1>
            <p className="lead">
              Uma experiência digital elegante, acolhedora e preparada para agendamento, relacionamento e evolução da sua marca.
            </p>
            <div className="hero-actions">
              <a className="button" href="#agendar">Quero agendar</a>
              {config.instagramUrl && (
                <ExternalLink className="text-link" href={config.instagramUrl}>Ver Instagram ↗</ExternalLink>
              )}
            </div>
            <p className="preview-note" role="status">
              Preview controlado do tenant Vanessa Braz. Serviços, preços e horários só serão publicados após confirmação.
            </p>
          </div>
          <div className="hero-art" aria-label="Área visual do salão">
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <div className="hero-card">
              <span>Beleza</span>
              <strong>&</strong>
              <span>Autoestima</span>
            </div>
          </div>
        </section>

        <section className="section" id="servicos">
          <div className="section-heading">
            <p className="eyebrow">SERVIÇOS</p>
            <h2>Atendimento pensado para cada pessoa.</h2>
            <p>O catálogo real será carregado pelo tenant a partir do SaaS Core. Nenhum serviço ou preço é inventado no template.</p>
          </div>
          <div className="service-grid">
            {[
              ["01", "Catálogo configurável", "Serviços, duração e valores vêm dos dados do tenant."],
              ["02", "Profissionais e agenda", "Disponibilidade é associada aos profissionais e protegida por regras de tenant."],
              ["03", "Relacionamento", "Contato, histórico e experiência da cliente fazem parte do fluxo compartilhado."],
            ].map(([number, title, body]) => (
              <article className="service-card" key={number}>
                <span className="service-number">{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section visual-section" id="galeria">
          <div className="section-heading compact">
            <p className="eyebrow">GALERIA</p>
            <h2>Uma identidade visual que não se perde na migração.</h2>
            <p>
              A biblioteca otimizada do projeto Vanessa foi preservada no repositório de origem. A publicação de imagens com pessoas permanece separada do gate visual.
            </p>
          </div>
          <div className="gallery-grid" aria-label="Espaços reservados para mídia autorizada">
            <div className="gallery-tile tile-large"><span>Hero / ambiente</span></div>
            <div className="gallery-tile"><span>Resultados</span></div>
            <div className="gallery-tile"><span>Detalhes</span></div>
          </div>
          {!config.mediaPublicationAuthorized && (
            <p className="media-gate">Mídia identificável: publicação pública aguardando autorização específica.</p>
          )}
        </section>

        <section className="booking-section" id="agendar">
          <div>
            <p className="eyebrow">AGENDAMENTO</p>
            <h2>Comece pelo canal já confirmado.</h2>
            <p>
              Enquanto o booking multi-tenant passa pelos gates finais de concorrência, RLS e cross-tenant, o contato confirmado permanece disponível sem prometer horários inexistentes.
            </p>
          </div>
          <div className="booking-card">
            <span className="booking-label">WhatsApp</span>
            <strong>{config.phoneDisplay}</strong>
            <a className="button" href={contactUrl} target="_blank" rel="noopener noreferrer">Solicitar agendamento</a>
            <small>Horários: a confirmar.</small>
          </div>
        </section>

        <section className="section contact-section" id="contato">
          <div className="section-heading compact">
            <p className="eyebrow">CONTATO</p>
            <h2>{config.brandName}</h2>
          </div>
          <div className="contact-grid">
            <div>
              <span>Instagram</span>
              {config.instagramUrl ? <ExternalLink href={config.instagramUrl}>{config.instagramHandle}</ExternalLink> : <strong>A configurar</strong>}
            </div>
            <div>
              <span>WhatsApp</span>
              <ExternalLink href={contactUrl}>{config.phoneDisplay}</ExternalLink>
            </div>
            <div>
              <span>Endereço informado</span>
              <ExternalLink href={mapsSearchUrl(config.address)}>{config.address}</ExternalLink>
            </div>
            <div>
              <span>Horários</span>
              <strong>{config.schedule || "A confirmar"}</strong>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>{config.brandName}</strong>
          <span>{config.tagline}</span>
        </div>
        <p>Vertical Salon · Tupiniquim Vertical SaaS · Preview</p>
      </footer>

      {config.whatsapp && (
        <ExternalLink href={contactUrl} className="floating-whatsapp">WhatsApp</ExternalLink>
      )}
    </div>
  );
}
