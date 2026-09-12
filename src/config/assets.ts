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
 *  COMO ATIVAR (1 passo):
 *  1. No Drive: selecionar tudo → "Fazer download" (gera um .zip).
 *  2. Descompactar e copiar os arquivos para public/client-assets/media/
 *     renomeando cada um conforme o MAPA abaixo (prefixo → slot local).
 *  Pronto: todas as imagens/vídeos reais aparecem no site automaticamente.
 *  Enquanto isso, os slots sem arquivo ficam com o fundo da marca
 *  (nenhuma imagem quebrada, nenhuma imagem gerada).
 *
 *  MAPA (prefixo real da pasta → slot local):
 *  logo.jpg                     → media/logo/logo.jpg
 *  1784984255 (portão preto)    → media/fotos/portoes/portao-deslizante.jpg
 *  portão social                → media/fotos/portoes/portao-social.jpg
 *  1774786200 (automação)       → media/fotos/automacao/motor.jpg
 *  1771634438/1771639042        → media/fotos/corrimaos/corrimao.jpg
 *  1771634656 (grades janela)   → media/fotos/grades/grade-janela.jpg
 *  1771634799 (porta/fecham.)   → media/fotos/portas-enrolar/porta.jpg
 *  1774112432 (portão verde)    → media/fotos/antes-depois/antes.jpg + depois.jpg
 *  1775044474 (instalação)      → media/fotos/oficina/fabricacao.jpg
 *  (bastidores/reels)           → media/social/*.jpg
 * ============================================================
 */

/** Base local das mídias da pasta do cliente (public/client-assets/media) */
const MEDIA = "/client-assets/media";
const FOTOS = `${MEDIA}/fotos`;

export const assets = {
  /**
   * Mídias reais da pasta do Drive (slots locais).
   * Mantidas as chaves `official.*` para compatibilidade — agora
   * apontam para os arquivos reais da pasta, não para o site.
   */
  official: {
    /** Hero slide 1 — portão preto instalado (1784984255) */
    heroSparks: `${FOTOS}/portoes/portao-deslizante.jpg`,
    /** Hero slide 2 — instalação com profissional em cena (1775044474) */
    heroWorkshop: `${FOTOS}/oficina/fabricacao.jpg`,
    /** Seção "Sob medida" — conjunto residencial claro (1771640508) */
    aboutImage: `${FOTOS}/portoes/portao-social.jpg`,
    /** Logo original da pasta (logo.jpg) */
    logoUrl: `${MEDIA}/logo/logo.jpg`,
  },

  hero: {
    main: `${FOTOS}/portoes/portao-deslizante.jpg`,
  },
  gates: {
    /** Portão preto residencial/condominial (1784984255) */
    sliding: `${FOTOS}/portoes/portao-deslizante.jpg`,
    /** Portão social (conjunto 1771640508) */
    social: `${FOTOS}/portoes/portao-social.jpg`,
  },
  automation: {
    /** Automação de portão (1774786200) */
    motor: `${FOTOS}/automacao/motor.jpg`,
  },
  railings: {
    /** Corrimão/guarda-corpo preto (1771634438 / 1771639042) */
    handrail: `${FOTOS}/corrimaos/corrimao.jpg`,
  },
  grids: {
    /** Grades de proteção em janela (1771634656) */
    window: `${FOTOS}/grades/grade-janela.jpg`,
  },
  rollingDoors: {
    /** Porta/fechamento metálico (1771634799) */
    storefront: `${FOTOS}/portas-enrolar/porta.jpg`,
  },
  beforeAfter: {
    /**
     * Par REAL do mesmo vão — portão verde de garagem (1774112432).
     * Use um frame "antes" e um "depois" do mesmo ângulo.
     */
    before: `${FOTOS}/antes-depois/antes.jpg`,
    after: `${FOTOS}/antes-depois/depois.jpg`,
  },
  workshop: {
    /** Bastidores de fabricação/instalação (1775044474) */
    fabrication: `${FOTOS}/oficina/fabricacao.jpg`,
  },

  /** Bastidores/reels — mídia real da pasta para os cards do Instagram */
  instagram: {
    reelAluminio: `${MEDIA}/social/reel-aluminio.jpg`,
    reforma: `${MEDIA}/social/reforma.jpg`,
    gradesCentro: `${MEDIA}/social/grades-centro.jpg`,
    servicoConcluido: `${MEDIA}/social/servico-concluido.jpg`,
    heroSolda: `${FOTOS}/oficina/fabricacao.jpg`,
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
