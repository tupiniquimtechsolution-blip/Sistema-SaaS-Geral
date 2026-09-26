import type { GalleryItem } from "../types";

/**
 * Catálogo de mídia 100% REAL do templo.
 *
 * Fonte oficial: pasta compartilhada do Google Drive
 * https://drive.google.com/drive/folders/1omygp4Toy5jhgew2bcGMXCdiDqUx06JB
 * (conteúdo do Instagram @caboclotupinamba_flechadourada + manual + logo).
 *
 * Nenhum asset gerado automaticamente — apenas arquivos enviados pelo templo.
 * Legendas e alts são genéricos de propósito: o conteúdo visual de cada arquivo
 * não foi inspecionado, então nada é atribuído a entidade, gira ou pessoa.
 */

/* ---------- helpers de Drive ---------- */

/** imagem pública do Drive (exige compartilhamento "qualquer pessoa com o link") */
export const driveUrl = (fileId: string) =>
  `https://lh3.googleusercontent.com/d/${fileId}`;

/** miniatura/preview servida pelo Drive (funciona para fotos E vídeos) */
export const driveThumb = (fileId: string, size = 1200) =>
  `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;

/** player incorporável do Drive (iframe, carrega sob demanda) */
export const drivePreview = (fileId: string) =>
  `https://drive.google.com/file/d/${fileId}/preview`;

/** página do arquivo no Drive */
export const driveOpen = (fileId: string) =>
  `https://drive.google.com/file/d/${fileId}/view?usp=drive_web`;

/* ---------- identidade oficial ---------- */

export const brand = {
  /** logo OFICIAL redondo do templo (arquivo enviado pelo templo) */
  logoRound: "1Mgk8mSQ18BlgQSuMiBadwmIGzAT-am2T",
  /** Manual para Novos Filhos (PDF) — jornada + dirigentes nas páginas 4 e 5 */
  manualNovosFilhos: "1c1yJb754sNlAfc5vM3_FYK0s39DwzYRE",
};

export const logoRoundUrl = driveThumb(brand.logoRound, 400);
export const manualUrl = driveOpen(brand.manualNovosFilhos);

/* ---------- fotos reais (Instagram oficial, via Drive) ---------- */

const PHOTO_IDS = [
  "1RYF6gliKC-Vt922i7NxoEuplBKhAJots",
  "1TRwfG3IfPfiTWupPQSI-RO6JR907gfhI",
  "1oE6Odc50URlH0UFD9oYY6ygrXUlnRTeY",
  "1ckPZC1fOr-jIab10nbULbrP2-BY_3CsR",
  "14ClTXqQNmsvQti4CJFQ29--j36SBmazC",
  "1L_9BWSePMuCti-zjizcd_LMpN3k3qLNu",
  "1XMQFXmsdUkArYFZoU6RAJYQLxQFqx6my",
  "11HOSVLmvxziQFj57nKkKk9u4u9R9yWg3",
  "1MnxJm987WJv8BiEQgmHBkLG0ByinUY-N",
  "1lUJaCys41cAw3hJ__c0CQe2BAG-tuUsB",
  "1cLpdIyPNcUAxV_xnk06JB_UCSdx5as2G",
  "1cVcKQgVL0oAYm_XWokqZvmWX1q-0tbCh",
  "1jmb5RqMwgVcqBjiCcUST_VSmOUtHG_Z1",
  "1vsYgbsTsNw58waZIC_VsS7AZA8wO8XQP",
  "1pOV8NepWqiVmxkMsXwTjDJbQ9THyjJRn",
  "11g7fRy5F0Bz0zSRRjL5TmAsGxuF1HOPL",
  "1le_XUyS59sUh4WIU_wPTKXKEOhE3SIUz",
  "1KAYPsrcLV5tJGGZzPizEwAPuH5a2rcv2",
  "1Z_TppvnoLU0jAVQ8H0Q3c4FpQw02KxwG",
  "1E2obbx5yOrBte4H0YCKsoROaU1d3ryB2",
  "18VeEHOQba1fVvT1RgxNu26aBls-KY9iG",
  "1jluEn3stHA2C0CA-4S7I9Bemq7bWGjQj",
  "1eAKPH6tAWPi7bRD5jG7zlHdm7_U9-IFU",
  "1KBjrA8gpzkXL-oxb9ke5FpvbMUbjMRgR",
  "1ap4FpNf_fdmdFz8JbrVvK3GDB2NyzkzI",
  "1k2xc13cn5veo1_RwVzBnJsTwASGJurjn",
];

const PHOTO_CAPTIONS = [
  "Registro da casa",
  "Momento de axé",
  "Nossa caminhada",
  "Fé e acolhimento",
  "Publicação oficial",
  "Axé em cada detalhe",
];

export const photos = PHOTO_IDS.map((id, i) => ({
  id,
  src: driveUrl(id),
  thumb: driveThumb(id, 900),
  alt: "Foto do acervo oficial do Templo de Umbanda Caboclo Tupinambá e Flecha Dourada",
  caption: PHOTO_CAPTIONS[i % PHOTO_CAPTIONS.length],
}));

/* ---------- vídeos reais (reels do Instagram oficial, via Drive) ---------- */

const VIDEO_IDS = [
  "1jJO23l2U-mNUDs5AzCObW8pHcWsaFINk",
  "1nMag_MGx-mTdT5ea5RXjWiGqgx8AgTOl",
  "12ghgvZdEVuYvOPZdrInsg01LHW4jCmme",
  "18hYZmg7DCInLLQKF_rrf0moI0jyxQd2i",
  "1ZKs0TfJ7tXOIQg8ibyfrTKju0bEDDeHc",
  "1xF4Spa0pRnG2ZQY_MB7FSKTPxqPUX4ia",
  "1yessyxl4cKpql6Tli-z6jyH0AjG-wDt5",
  "1qNnbu-ivb1pKdXZatV1Kq3htBP_Xnq9w",
  "1TrOQdAFoxd99Srk3xu7kt9or2hwZU8Jj",
];

const VIDEO_CAPTIONS = [
  "Registro da gira",
  "A força da gira",
  "Momentos da casa",
  "Tambor e ponto",
  "Nossa corrente",
  "Axé em movimento",
];

export const videos = VIDEO_IDS.map((id, i) => ({
  id,
  thumb: driveThumb(id, 900),
  preview: drivePreview(id),
  open: driveOpen(id),
  alt: "Vídeo do acervo oficial do Templo de Umbanda Caboclo Tupinambá e Flecha Dourada",
  caption: VIDEO_CAPTIONS[i % VIDEO_CAPTIONS.length],
}));

/* ---------- destaques usados pelas seções ---------- */

export const featured = {
  /** imagem emoldurada do Hero */
  heroPhoto: photos[0],
  /** fundo da cena de boas-vindas */
  welcomePhoto: photos[1],
  /** seção Nossa Casa */
  ourHousePhoto: photos[2],
  /** Quem Somos — apresentação */
  aboutPhoto: photos[3],
  /** fundo da seção A força da gira */
  giraBackdrop: photos[4],
  /** grade do Instagram */
  instagram: photos.slice(5, 13),
  /** vídeos em destaque na Home */
  homeVideos: videos.slice(0, 3),
};

/* ---------- galeria (fotos + vídeos reais) ---------- */

export const galleryItems: GalleryItem[] = [
  ...photos.map((p, i) => ({
    id: `foto-${p.id}`,
    src: p.thumb,
    alt: p.alt,
    caption: p.caption,
    category: "momentos" as const,
    kind: "image" as const,
  })),
  ...videos.map((v, i) => ({
    id: `video-${v.id}`,
    src: v.thumb,
    alt: v.alt,
    caption: v.caption,
    category: "videos" as const,
    kind: "video" as const,
    videoPreview: v.preview,
    videoOpen: v.open,
  })),
];
