import { Camera } from 'lucide-react';
import { galleryImages } from '../lib/media';
import Gallery from '../components/Gallery';

export default function GalleryPage() {
  return (
    <div>
      {/* Header editorial */}
      <section className="pt-20 md:pt-32 pb-12 md:pb-16 bg-brand-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <Camera size={20} className="text-brand-accent" />
              <p className="text-brand-accent text-sm uppercase tracking-[0.2em]">
                Portfólio
              </p>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-brand-text font-light leading-tight mb-6">
              Acervo visual
            </h1>
            <p className="text-brand-muted text-lg leading-relaxed max-w-2xl">
              Uma seleção de imagens do acervo visual de Vanessa Braz. Informações sobre
              procedimentos e resultados são publicadas somente quando confirmadas.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="pb-20 md:pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Gallery images={galleryImages} columns={3} />

          {/* Info */}
          <div className="mt-20 text-center max-w-2xl mx-auto">
            <p className="text-brand-muted leading-relaxed">
              Esta seleção reúne {galleryImages.length} imagens do acervo. Novas informações
              editoriais serão incluídas somente após confirmação.
            </p>
            <div className="mt-8">
              <a
                href="/agendar"
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-text text-white font-medium hover:bg-brand-text/90 transition-all"
              >
                Agendar seu horário
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
