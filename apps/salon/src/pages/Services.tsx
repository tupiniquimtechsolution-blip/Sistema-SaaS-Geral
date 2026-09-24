import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatCurrency } from '../lib/store';
import { detailImages } from '../lib/media';
import { loadCatalog, type CatalogService } from '../lib/catalog';

export default function Services() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [services, setServices] = useState<CatalogService[]>([]);

  useEffect(() => {
    void loadCatalog().then((catalog) => setServices(catalog.services));
  }, []);

  const categories = [...new Set(services.map((item) => item.category))];
  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter((item) => item.category === activeCategory);

  return (
    <div>
      <section className="pt-20 md:pt-32 pb-12 md:pb-16 bg-brand-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-brand-accent text-sm uppercase tracking-[0.2em] mb-4">
              Serviços
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-brand-text font-light leading-tight mb-6">
              Catálogo de serviços
            </h1>
            <p className="text-brand-muted text-lg leading-relaxed max-w-2xl">
              O catálogo público só lista procedimentos e preços confirmados no banco. Nada inventado entra em produção.
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-16 md:top-20 z-40 bg-white/95 backdrop-blur-sm border-b border-brand-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'text-brand-text border-b-2 border-brand-text'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'text-brand-text border-b-2 border-brand-text'
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredServices.length === 0 ? (
            <p className="text-brand-muted py-12">Catálogo — PENDENTE_DE_CONFIRMACAO.</p>
          ) : (
            <div className="divide-y divide-brand-surface">
              {filteredServices.map((service, idx) => (
                <div
                  key={service.id}
                  className="grid md:grid-cols-12 gap-6 md:gap-12 py-10 md:py-14 items-center group"
                >
                  <div className="md:col-span-4 order-2 md:order-1">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={detailImages[idx % detailImages.length]}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-7 md:col-start-6 order-1 md:order-2">
                    <span className="text-xs uppercase tracking-wider text-brand-accent mb-3 block">
                      {service.category}
                    </span>
                    <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-brand-text font-light mb-4">
                      {service.name}
                    </h2>
                    <p className="text-brand-muted leading-relaxed mb-6 max-w-lg">
                      {service.description}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-2xl font-light text-brand-text">
                            {formatCurrency(service.price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-brand-muted">
                          <Clock size={14} />
                          {service.duration} min
                        </div>
                      </div>
                      <Link
                        to={`/agendar?service=${service.id}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-brand-text underline underline-offset-4 hover:text-brand-primary transition-colors group/link"
                      >
                        Agendar este serviço
                        <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
