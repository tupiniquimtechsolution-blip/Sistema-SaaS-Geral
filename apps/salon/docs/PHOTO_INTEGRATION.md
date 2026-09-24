# Guia de Integração — Fotos Google Drive

## STATUS
As fotos reais da Vanessa Braz estão disponíveis no Google Drive:
https://drive.google.com/drive/folders/16dGWA3s7DInFaQQ1y76Sij8SWNpfEbMI

São **100+ fotos** de trabalhos reais (sobrancelhas, cílios, tratamentos faciais, etc.)

## COMO INTEGRAR

### Opção 1: Download Local (Recomendado para produção)
1. Baixar todas as fotos do Google Drive
2. Colocar em `public/images/gallery/`
3. Atualizar `src/lib/media.ts` com os caminhos locais

```typescript
export const galleryImages = [
  { src: '/images/gallery/foto1.jpg', alt: 'Design de sobrancelhas', category: 'Sobrancelhas' },
  { src: '/images/gallery/foto2.jpg', alt: 'Extensão de cílios', category: 'Cílios' },
  // ... mais fotos
];
```

### Opção 2: Supabase Storage (Recomendado para escalabilidade)
1. Criar bucket `gallery` no Supabase Storage
2. Upload das fotos via dashboard ou script
3. Usar URLs públicas do Supabase

```typescript
const SUPABASE_STORAGE_URL = 'https://xxx.supabase.co/storage/v1/object/public/gallery/';

export const galleryImages = [
  { src: `${SUPABASE_STORAGE_URL}/foto1.jpg`, alt: '...', category: '...' },
];
```

### Opção 3: CDN (Vercel Blob, Cloudinary, etc.)
1. Upload para serviço de CDN
2. Usar URLs otimizadas automaticamente

## ESTRUTURA DE PASTAS (quando fotos forem adicionadas)
```
public/
└── images/
    ├── hero.jpg
    ├── gallery/
    │   ├── sobrancelhas/
    │   │   ├── 001.jpg
    │   │   ├── 002.jpg
    │   │   └── ...
    │   ├── cilios/
    │   │   ├── 001.jpg
    │   │   └── ...
    │   ├── facial/
    │   │   └── ...
    │   └── corporal/
    │       └── ...
    └── about/
        └── vanessa.jpg
```

## OTIMIZAÇÃO
Antes de publicar:
- Redimensionar para max 1200px (largura)
- Converter para WebP/AVIF
- Comprimir (qualidade 80-85%)
- Lazy loading já implementado no componente Gallery

## COMPONENTES ATUALIZADOS
- ✅ `src/components/Gallery.tsx` — Galeria com lightbox
- ✅ `src/pages/Gallery.tsx` — Página de galeria com filtros
- ✅ `src/pages/Home.tsx` — Seção de resultados na home
- ✅ `src/pages/Services.tsx` — Imagens nos cards de serviço
- ✅ `src/lib/media.ts` — Configuração centralizada de mídias

## NOTA
Atualmente o site usa imagens geradas por IA como placeholder.
Quando as fotos reais forem adicionadas, basta atualizar o arquivo `src/lib/media.ts`.
