/**
 * ============================================================
 *  ARQUIVO CENTRAL DE ASSETS — METAL & ART SERRALHERIA
 * ============================================================
 *  MÍDIA OFICIAL = pasta do Google Drive fornecida pelo cliente:
 *  https://drive.google.com/drive/folders/1kdx8AvTpfgRugHaptm32c5k3GpL0W6Xi
 *  (51 arquivos: 1 logo + 36 fotos + 14 vídeos — inventário no guia
 *   de identidade e em ASSET_AUDIT.md)
 *
 *  >> REGRA: usar SOMENTE as mídias dessa pasta. ZERO imagens
 *     geradas/banco. Nenhum arquivo fora dela deve ser referenciado. <<
 *
 *  Release Candidate: fotos originais presentes em media/photos/*.jpg
 *  e selecionadas pelo prefixo documentado em ASSET_AUDIT.md.
 *  Slots que dependem de frames validados, thumbnails ou imagens ainda
 *  não entregues ficam vazios: o componente VerifiedImage não os carrega.
 *  Sem fotografias artificiais, renomes arbitrários ou mídia de terceiros.
 * ============================================================
 */

/** Base local das mídias da pasta do cliente (public/client-assets/media) */
const MEDIA = "/client-assets/media";
const FOTOS = `${MEDIA}/photos`;

export const assets = {
  /**
   * Mídias reais da pasta oficial que já estão versionadas no projeto.
   * Mantidas as chaves `official.*` para compatibilidade — agora
   * apontam para os arquivos reais da pasta, não para o site.
   */
  official: {
    /** Hero slide 1 — portão preto instalado (1784984255) */
    heroSparks: `${FOTOS}/serralheriametaleart_1784984255_3949056512797263160_39911767544.jpg`,
    /** Vídeo 1775044474 existe, mas seu poster JPG ainda não foi validado. */
    heroWorkshop: "",
    /** Seção "Sob medida" — conjunto residencial claro (1771640508) */
    aboutImage: `${FOTOS}/serralheriametaleart_1771640508_3837120832259104449_39911767544.jpg`,
    /** Logo original da pasta (logo.jpg) */
    logoUrl: `${MEDIA}/logo/logo.jpg`,
  },

  hero: {
    main: `${FOTOS}/serralheriametaleart_1784984255_3949056512797263160_39911767544.jpg`,
  },
  gates: {
    /** Portão preto residencial/condominial (1784984255) */
    sliding: `${FOTOS}/serralheriametaleart_1784984255_3949056512797263160_39911767544.jpg`,
    /** Portão social (conjunto 1771640508) */
    social: `${FOTOS}/serralheriametaleart_1771640508_3837120832259104449_39911767544.jpg`,
  },
  automation: {
    /** Somente o vídeo 1774786200 existe; fotografia específica pendente. */
    motor: "",
  },
  railings: {
    /** Corrimão/guarda-corpo preto (1771634438 / 1771639042) */
    handrail: `${FOTOS}/serralheriametaleart_1771634800_3837072955478564876_39911767544.jpg`,
  },
  grids: {
    /** Grades de proteção em janela (1771634656) */
    window: `${FOTOS}/serralheriametaleart_1771634656_3837071934794659759_39911767544.jpg`,
  },
  rollingDoors: {
    /** Porta/fechamento metálico (1771634799) */
    storefront: `${FOTOS}/serralheriametaleart_1771634799_3837072918266651562_39911767544.jpg`,
  },
  beforeAfter: {
    /** Par real do mesmo vão exige extração e revisão visual de 1774112432. */
    before: "",
    after: "",
  },
  workshop: {
    /** Somente o vídeo 1775044474 existe; fotografia específica pendente. */
    fabrication: "",
  },

  /** Links sociais mantidos; miniaturas específicas ainda não estão verificadas. */
  instagram: {
    reelAluminio: "",
    reforma: "",
    gradesCentro: "",
    servicoConcluido: "",
    heroSolda: "",
  },

  logo: {
    /** Logo oficial da pasta (logo.jpg) — o componente Logo o usa automaticamente */
    original: `${MEDIA}/logo/logo.jpg`,
    note: "Arquivo logo.jpg da pasta oficial do cliente",
  },

  /**
   * Vídeos reais da pasta (MP4). Ative apontando para os arquivos
   * locais após o download (ex.: media/videos/1775044474.mp4).
   */
  video: {
    hero: null as string | null,
    note: "VÍDEOS REAIS DA PASTA: usar 1775044474 (instalação) e recortes de 1774786200 (automação)",
  },
} as const;
