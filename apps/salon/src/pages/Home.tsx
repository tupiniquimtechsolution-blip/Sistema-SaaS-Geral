import { Link } from 'react-router-dom';
import { Calendar, ChevronDown, ChevronUp, MapPin, Clock, Phone, Instagram, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { faqItems, businessInfo, isPendingValue, isPublicHandleConfigured, isWhatsAppConfigured } from '../lib/data';
import { heroImage, galleryImages, detailImages, environmentImages } from '../lib/media';
import { loadCatalog, type CatalogService } from '../lib/catalog';
import { formatCurrency } from '../lib/store';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [services, setServices] = useState<CatalogService[]>([]);

  useEffect(() => {
    void loadCatalog().then((catalog) => setServices(catalog.services));
  }, []);

  return (
    <div>
      {/* ═══════════════════════════════════════════
          HERO — Full-bleed editorial com foto real
         ═══════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-end">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Vanessa Braz — Beleza & Autoestima"
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24 w-full">
          <div className="max-w-2xl">
            <p className="text-white/70 text-sm uppercase tracking-[0.2em] mb-4 font-light">
              Beleza & Autoestima
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-light leading-[1.1] mb-6">
              Vanessa Braz
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-8 max-w-lg font-light">
              Um espaço para acompanhar informações confirmadas sobre serviços,
              disponibilidade e formas de agendamento.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/agendar"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-text font-medium rounded-none hover:bg-white/90 transition-all group"
              >
                <Calendar size={18} />
                Agendar Horário
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              {isWhatsAppConfigured(businessInfo.whatsapp) && (
                <a
                  href={`https://wa.me/${businessInfo.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/40 text-white font-medium rounded-none hover:bg-white/10 transition-all"
                >
                  <Phone size={18} />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/50">
          <span className="text-xs uppercase tracking-widest">Explorar</span>
          <div className="w-px h-8 bg-white/30 animate-pulse" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MANIFESTO — Sobre a marca
         ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-brand-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={detailImages[0]}
                  alt="Detalhe de procedimento"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p className="text-brand-accent text-sm uppercase tracking-[0.2em] mb-6">
                Nossa Essência
              </p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-brand-text font-light leading-tight mb-8">
                Beleza e autocuidado, no seu tempo.
              </h2>
              <div className="space-y-6 text-brand-muted leading-relaxed">
                <p>
                  Este espaço reúne a identidade visual de Vanessa Braz e informações que
                  podem ser consultadas antes do agendamento.
                </p>
                <p>
                  Detalhes sobre serviços, técnicas, estrutura e disponibilidade serão
                  publicados somente após confirmação.
                </p>
              </div>
              <div className="mt-10 flex items-center gap-8">
                <Link
                  to="/servicos"
                  className="text-brand-text font-medium underline underline-offset-4 hover:text-brand-primary transition-colors"
                >
                  Conheça os serviços →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SERVIÇOS — Layout editorial assimétrico
         ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <p className="text-brand-accent text-sm uppercase tracking-[0.2em] mb-4">
                Serviços
              </p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-brand-text font-light">
                Serviços e informações
              </h2>
            </div>
            <Link
              to="/servicos"
              className="mt-6 md:mt-0 text-brand-text font-medium underline underline-offset-4 hover:text-brand-primary transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          {services.length === 0 ? (
            <p className="text-brand-muted">Catálogo de serviços — PENDENTE_DE_CONFIRMACAO. Nenhum preço ou procedimento inventado é exibido.</p>
          ) : (
          <div className="grid md:grid-cols-2 gap-px bg-brand-surface">
            {services.slice(0, 4).map((service, idx) => (
              <div
                key={service.id}
                className={`bg-white p-8 md:p-12 group hover:bg-brand-surface/30 transition-colors ${
                  idx % 2 === 0 ? 'md:pr-16' : 'md:pl-16'
                }`}
              >
                <div className="flex flex-col h-full">
                  <span className="text-xs uppercase tracking-wider text-brand-accent mb-4">
                    {service.category}
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl text-brand-text font-light mb-4">
                    {service.name}
                  </h3>
                  <p className="text-brand-muted leading-relaxed mb-8 flex-grow">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-brand-surface">
                    <div>
                      <span className="text-2xl font-light text-brand-text">
                        {formatCurrency(service.price)}
                      </span>
                      <span className="text-sm text-brand-muted ml-2">
                        · {service.duration}min
                      </span>
                    </div>
                    <Link
                      to={`/agendar?service=${service.id}`}
                      className="text-sm font-medium text-brand-text underline underline-offset-4 hover:text-brand-primary transition-colors"
                    >
                      Agendar →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          GALERIA EDITORIAL — Proporções variadas
         ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-brand-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-brand-accent text-sm uppercase tracking-[0.2em] mb-4">
              Galeria
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-brand-text font-light">
              Imagens do acervo
            </h2>
          </div>

          {/* Bento grid editorial */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 auto-rows-[200px] md:auto-rows-[250px]">
            {/* Large feature */}
            <div className="col-span-2 row-span-2 overflow-hidden">
              <img
                src={galleryImages[0]?.src}
                alt={galleryImages[0]?.alt}
                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700"
                loading="lazy"
              />
            </div>
            {/* Regular items */}
            {galleryImages.slice(1, 7).map((img, idx) => (
              <div key={idx} className="overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/galeria"
              className="inline-flex items-center gap-2 px-8 py-4 border border-brand-text text-brand-text font-medium hover:bg-brand-text hover:text-white transition-all"
            >
              Ver galeria completa
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BASTIDORES — Full-bleed com vídeo/imagem
         ═══════════════════════════════════════════ */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src={environmentImages[0]}
          alt="Imagem do acervo Vanessa Braz"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white max-w-2xl px-4">
            <p className="text-sm uppercase tracking-[0.3em] mb-4 text-white/70">
              Acervo
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-light mb-6">
              Um olhar sobre o acervo
            </h2>
            <p className="text-white/80 text-lg font-light">
              Informações sobre local, estrutura e atendimento serão atualizadas quando confirmadas.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-accent text-sm uppercase tracking-[0.2em] mb-4">Relatos</p>
          <h2 className="font-display text-3xl md:text-4xl text-brand-text font-light mb-6">
            Informações em atualização
          </h2>
          <p className="text-brand-muted">
            Relatos serão publicados somente após confirmação de autoria e autorização de publicação.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FAQ — Accordion minimalista
         ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-brand-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-brand-accent text-sm uppercase tracking-[0.2em] mb-4">
              Dúvidas
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-brand-text font-light">
              Perguntas frequentes
            </h2>
          </div>

          <div className="divide-y divide-brand-surface">
            {faqItems.map((item, idx) => (
              <div key={idx}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between py-6 text-left group"
                  aria-expanded={openFaq === idx}
                >
                  <span className="text-brand-text font-medium pr-8 group-hover:text-brand-primary transition-colors">
                    {item.question}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp size={20} className="text-brand-accent flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-brand-muted flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="pb-6 animate-fade-in">
                    <p className="text-brand-muted leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA FINAL — Conversão
         ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-32 bg-brand-text">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl md:text-5xl text-white font-light mb-6">
            Pronta para se cuidar?
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto font-light">
            Acompanhe as informações confirmadas e, quando disponível, faça seu agendamento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/agendar"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-brand-text font-medium hover:bg-white/90 transition-all"
            >
              <Calendar size={18} />
              Agendar Agora
            </Link>
            {isWhatsAppConfigured(businessInfo.whatsapp) && (
              <a
                href={`https://wa.me/${businessInfo.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-white/30 text-white font-medium hover:bg-white/10 transition-all"
              >
                <Phone size={18} />
                Falar no WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LOCALIZAÇÃO — Info + mapa placeholder
         ═══════════════════════════════════════════ */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-brand-accent text-sm uppercase tracking-[0.2em] mb-4">
                Localização
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-brand-text font-light mb-8">
                Informações de localização
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="text-brand-accent mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-brand-text font-medium">Endereço</p>
                    <p className="text-brand-muted text-sm mt-1">
                      {isPendingValue(businessInfo.address) ? 'PENDENTE_DE_CONFIRMACAO' : businessInfo.address}
                    </p>
                    <p className="text-brand-muted text-sm">
                      {isPendingValue(businessInfo.city) || isPendingValue(businessInfo.state)
                        ? 'PENDENTE_DE_CONFIRMACAO'
                        : `${businessInfo.city}, ${businessInfo.state}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={20} className="text-brand-accent mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-brand-text font-medium">Horários</p>
                    <p className="text-brand-muted text-sm mt-1">PENDENTE_DE_CONFIRMACAO</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Instagram size={20} className="text-brand-accent mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-brand-text font-medium">Instagram</p>
                    <p className="text-brand-muted text-sm mt-1">
                      {isPublicHandleConfigured(businessInfo.instagram) ? businessInfo.instagram : 'PENDENTE_DE_CONFIRMACAO'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="aspect-square bg-brand-surface flex items-center justify-center">
              <p className="text-brand-muted text-sm">
                Mapa — INTEGRATION_PENDING
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
