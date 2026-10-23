import { useEffect, useState } from "react";
import { loadPublicSalonConfig, type SalonRuntimeConfig } from "./business/saas-adapter";
import { loadPublicSalonPage, type PublicSalonPage } from "./business/public-cms";
import { createSupabaseBrowserClient } from "tupiniquim-database";
import { mapsSearchUrl, whatsappUrl } from "./config/template";
import VanessaShowcase from "./VanessaShowcase";
import { loadPublicSalonMedia, type PublicSalonPhoto } from "./business/public-media";

function ExternalLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

function RuntimeError({ code }: { code?: string }) {
  return (
    <main className="runtime-state" role="alert">
      <p className="eyebrow">SITE INDISPONÍVEL</p>
      <h1>Não foi possível carregar este espaço.</h1>
      <p>A configuração pública do tenant não pôde ser validada. Nenhum conteúdo de demonstração foi exibido no lugar do ambiente live.</p>
      {code && <small>Código: {code}</small>}
    </main>
  );
}

export default function App() {
  const [runtime, setRuntime] = useState<SalonRuntimeConfig | null>(null);
  const [published, setPublished] = useState<PublicSalonPage | null>(null);
  const [publicPhotos, setPublicPhotos] = useState<PublicSalonPhoto[]>([]);
  const [cmsUnavailable, setCmsUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const result = await loadPublicSalonConfig();
        if (!active) return;
        setRuntime(result);
        if (result.source !== "live") return;

        // Tenant ID comes only from the resolved public bootstrap, never URL params.
        const url = import.meta.env.VITE_SUPABASE_URL?.trim();
        const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
        if (!url || !publishableKey) throw new Error("Missing public Salon config");

        const publicClient = createSupabaseBrowserClient({
          url,
          publishableKey,
          authStorageKey: `tupiniquim-salon-public-cms-${result.config.slug}`,
        });
        const page = await loadPublicSalonPage(publicClient, result.config.tenantId);
        if (active) setPublished(page);
        // Public photos need both canonical media consent and tenant-scoped records.
        const photos = await loadPublicSalonMedia(publicClient, result.config.tenantId, result.config.mediaPublicationAuthorized);
        if (active) setPublicPhotos(photos);
      } catch {
        if (active) setCmsUnavailable(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (!runtime) {
    return (
      <main className="runtime-state" aria-busy="true" aria-live="polite">
        <p className="eyebrow">CARREGANDO</p>
        <h1>Preparando sua experiência.</h1>
      </main>
    );
  }

  if (runtime.source === "error") return <RuntimeError code={runtime.errorCode} />;

  // The original Vanessa editorial look is for explicit visual preview only.
  // Live QA and production remain tenant-scoped, default-deny SaaS Core runtimes.
  if (runtime.source === "preview") return <VanessaShowcase config={runtime.config} />;

  const config = runtime.config;
  if (config.mediaPublicationAuthorized && publicPhotos.length > 0) {
    return <VanessaShowcase config={config} photos={publicPhotos} published={published} />;
  }
  const contactUrl = whatsappUrl(config);
  // Preview routes render VanessaShowcase above; this branch is exclusively live.
  const isPreview = false;

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
            {isPreview ? (
              <p className="preview-note" role="status">
                Preview controlado. Serviços, preços e horários só serão publicados após confirmação.
              </p>
            ) : (
              <p className="preview-note" role="status">
                Dados públicos carregados do tenant canônico. Serviços, preços e horários não confirmados permanecem ocultos.
              </p>
            )}
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
            <p>O catálogo público será exibido somente quando serviços, duração e valores estiverem aprovados no SaaS Core.</p>
          </div>
          <div className="service-grid">
            {[
              ["01", "Catálogo do tenant", "Serviços e valores não confirmados não são inventados no site."],
              ["02", "Profissionais e agenda", "Disponibilidade online permanece desativada até existirem dados reais aprovados."],
              ["03", "Contato confirmado", "O WhatsApp oficial permanece disponível para solicitar atendimento."],
            ].map(([number, title, body]) => (
              <article className="service-card" key={number}>
                <span className="service-number">{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        {published?.status === "published" && (
          <section className="section" aria-label="Conteúdo publicado pelo Builder">
            <div className="section-heading compact">
              <p className="eyebrow">CONTEÚDO PUBLICADO</p>
              <h2>{published.title}</h2>
            </div>
            {published.sections.map((section) => (
              <article className="service-card" key={section.id}>
                {section.title && <h3>{section.title}</h3>}
                {section.text && <p>{section.text}</p>}
              </article>
            ))}
          </section>
        )}
        {cmsUnavailable && (
          <p className="preview-note" role="status">
            Conteúdo editorial adicional temporariamente indisponível.
          </p>
        )}

        <section className="section visual-section" id="galeria">
          <div className="section-heading compact">
            <p className="eyebrow">GALERIA</p>
            <h2>Uma identidade visual que não se perde na migração.</h2>
            <p>
              A biblioteca otimizada do projeto foi preservada. A publicação de imagens com pessoas permanece separada do gate técnico.
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
            <h2>{config.bookingEnabled ? "Agende pelo fluxo online." : "Solicite seu horário pelo canal confirmado."}</h2>
            <p>
              {config.bookingEnabled
                ? "A agenda online está habilitada para este tenant."
                : "A agenda online permanece bloqueada até serviços, profissionais e disponibilidade reais serem aprovados. O WhatsApp oficial segue disponível sem prometer horários inexistentes."}
            </p>
          </div>
          <div className="booking-card">
            <span className="booking-label">WhatsApp</span>
            <strong>{config.phoneDisplay || config.whatsapp}</strong>
            {config.whatsapp ? (
              <a className="button" href={contactUrl} target="_blank" rel="noopener noreferrer">Solicitar agendamento</a>
            ) : (
              <span className="button" aria-disabled="true">Contato indisponível</span>
            )}
            <small>{config.schedule ? `Horários: ${config.schedule}` : "Horários: a confirmar."}</small>
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
              {config.instagramUrl ? <ExternalLink href={config.instagramUrl}>{config.instagramHandle || "Instagram"}</ExternalLink> : <strong>A configurar</strong>}
            </div>
            <div>
              <span>WhatsApp</span>
              {config.whatsapp ? <ExternalLink href={contactUrl}>{config.phoneDisplay || config.whatsapp}</ExternalLink> : <strong>A configurar</strong>}
            </div>
            <div>
              <span>Endereço informado</span>
              {config.address ? <ExternalLink href={mapsSearchUrl(config.address)}>{config.address}</ExternalLink> : <strong>A confirmar</strong>}
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
        <p>Vertical Salon · Tupiniquim Vertical SaaS · {isPreview ? "Preview" : "Live tenant"}</p>
      </footer>

      {config.whatsapp && (
        <ExternalLink href={contactUrl} className="floating-whatsapp">WhatsApp</ExternalLink>
      )}
    </div>
  );
}
