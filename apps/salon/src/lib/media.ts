// Catálogo de mídias do acervo fornecido — Vanessa Braz
// Fonte de verdade: apps/web/public/media/source/.
// Derivados WebP auditados: apps/web/public/media/optimized/web/.

const SOURCE_BASE = '/media/source';
const OPTIMIZED_BASE = '/media/optimized/web';

function sourceImage(name: string): string {
  return `${SOURCE_BASE}/images/${encodeURIComponent(name)}`;
}

function optimizedImage(name: string): string {
  return `${OPTIMIZED_BASE}/${name}`;
}

function video(name: string): string {
  return `${SOURCE_BASE}/videos/${encodeURIComponent(name)}`;
}

// Lote otimizado integrado da branch media/automated-image-pipeline-next4.
// Estes arquivos são derivados determinísticos WebP das fotos reais; NÃO são super-resolução por IA.
const optimized = {
  hero1: optimizedImage('WhatsApp-Image-2026-09-12-at-10.23.51-121a8bba.webp'),
  hero2: optimizedImage('WhatsApp-Image-2026-09-12-at-10.24.30-df8e25a1.webp'),
  detail30: optimizedImage('WhatsApp-Image-2026-09-12-at-10.26.30-1-fc3283cf.webp'),
  gallery30: optimizedImage('WhatsApp-Image-2026-09-12-at-10.26.30-606cc281.webp'),
  detail31: optimizedImage('WhatsApp-Image-2026-09-12-at-10.26.31-1-818d9a43.webp'),
  gallery31: optimizedImage('WhatsApp-Image-2026-09-12-at-10.26.31-d476f468.webp'),
  detail32: optimizedImage('WhatsApp-Image-2026-09-12-at-10.26.32-1-8e7b7802.webp'),
  detail32b: optimizedImage('WhatsApp-Image-2026-09-12-at-10.26.32-2-a77d59e9.webp'),
};

export const media = {
  hero: [
    optimized.hero1,
    optimized.hero2,
    sourceImage('WhatsApp Image 2026-09-12 at 10.23.51.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.24.30.jpeg'),
  ],
  gallery: [
    optimized.gallery30,
    optimized.gallery31,
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.32.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.34.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.35.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.38.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.39 (1).jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.42.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.45.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.47 (1).jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.50.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.52.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.04.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.07.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.29.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.34.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.38.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.44.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.45.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.48.jpeg'),
  ],
  details: [
    optimized.detail30,
    optimized.detail31,
    optimized.detail32,
    optimized.detail32b,
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.33.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.36.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.40.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.43.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.46.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.49.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.51.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.26.54.jpeg'),
  ],
  environment: [
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.05.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.06.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.08.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.09.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.30.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.31.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.32.jpeg'),
    sourceImage('WhatsApp Image 2026-09-12 at 10.53.33.jpeg'),
  ],
  videos: [
    video('WhatsApp Video 2026-09-12 at 10.24.25.mp4'),
    video('WhatsApp Video 2026-09-12 at 10.26.29.mp4'),
    video('WhatsApp Video 2026-09-12 at 10.26.34.mp4'),
    video('WhatsApp Video 2026-09-12 at 10.53.29.mp4'),
  ],
};

export const heroImage = media.hero[0];

export const galleryImages = media.gallery.map((src, index) => ({
  src,
  alt: `Imagem do acervo Vanessa Braz — ${index + 1}`,
  category: 'Acervo',
}));

export const detailImages = media.details;
export const environmentImages = media.environment;

export const mediaStats = {
  total: 185,
  images: 157,
  videos: 28,
  optimizedBatchIntegrated: 8,
  source: 'Google Drive → GitHub',
  importedAt: '2026-09-12T15:24:22.405828+00:00',
};
