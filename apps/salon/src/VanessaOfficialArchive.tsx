import { useEffect, useState } from "react";
import { OFFICIAL_VANESSA_COMMIT, OFFICIAL_VANESSA_REPO, officialVanessaPhotos, officialVanessaVideos } from "./official-vanessa-media";
import "./vanessa-official-archive.css";

const PHOTO_BATCH = 18;
const VIDEO_BATCH = 4;

/**
 * Full editorial QA inventory of the official repository.
 * Selection is local to this browser and exports a review manifest; it does
 * NOT publish a photo, mutate the tenant, or grant likeness/usage consent.
 */
export default function VanessaOfficialArchive() {
  const [photoLimit, setPhotoLimit] = useState(PHOTO_BATCH);
  const [videoLimit, setVideoLimit] = useState(VIDEO_BATCH);
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  const [zoom, setZoom] = useState<number | null>(null);
  const [showCuration, setShowCuration] = useState(false);

  useEffect(() => {
    if (zoom === null) return;
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") setZoom(null);
      if (e.key === "ArrowRight") setZoom((i) => i === null ? null : (i + 1) % officialVanessaPhotos.length);
      if (e.key === "ArrowLeft") setZoom((i) => i === null ? null : (i - 1 + officialVanessaPhotos.length) % officialVanessaPhotos.length);
    }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [zoom]);

  function toggle(key: string) {
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function exportReview() {
    const items = [...officialVanessaPhotos, ...officialVanessaVideos].filter((asset) => picked.has(asset.sha256))
      .map(({ name, kind, sha256 }) => ({ name, kind, sha256 }));
    const result = JSON.stringify({
      type: "salon-editorial-curation",
      status: "review-only-not-media-publication-consent",
      source_repository: OFFICIAL_VANESSA_REPO,
      source_commit: OFFICIAL_VANESSA_COMMIT,
      selections: items
    }, null, 2);
    const href = URL.createObjectURL(new Blob([result], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "vanessa-braz-selecao-acervo.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(href), 1500);
  }

  return (
    <>
      <section className="vanessa-editorial vanessa-full-gallery" id="galeria">
        <p className="vanessa-eyebrow">GALERIA OFICIAL · REVISÃO DE QA</p>
        <h2>Acervo de fotografias</h2>
        <p className="vanessa-archive-lead">
          {officialVanessaPhotos.length} fotografias distintas do repositório oficial, sem arquivos repetidos.
          Você pode conferir e selecionar as que deseja utilizar no site definitivo.
        </p>
        <div className="vanessa-archive-toolbar">
          <span>{picked.size} mídias selecionadas para revisão</span>
          <button type="button" onClick={() => setShowCuration((open) => !open)}
            aria-expanded={showCuration} aria-controls="vanessa-curation-help">
            {showCuration ? "Ocultar orientação" : "Como selecionar"}
          </button>
          <button type="button" onClick={exportReview} disabled={picked.size === 0}>
            Baixar minha seleção
          </button>
        </div>
        {showCuration && <p id="vanessa-curation-help" className="vanessa-archive-info">
          Marque cada foto ou vídeo que deseja manter. O botão de download salva uma lista para revisão editorial.
          Isso não envia nada ao servidor nem autoriza automaticamente a publicação de imagens de clientes.
        </p>}
        <div className="vanessa-official-grid">
          {officialVanessaPhotos.slice(0, photoLimit).map((asset, i) => (
            <article className="vanessa-archive-tile" key={asset.sha256}>
              <button type="button" className="vanessa-archive-view" aria-label={"Ampliar fotografia " + (i + 1)}
                onClick={() => setZoom(i)}>
                <img src={asset.url} alt={"Fotografia " + (i + 1) + " do acervo oficial Vanessa Braz"} loading="lazy"
                  decoding="async" />
                <span className="vanessa-archive-magnify" aria-hidden="true">↗</span>
              </button>
              <label className="vanessa-archive-pick">
                <input type="checkbox" checked={picked.has(asset.sha256)} onChange={() => toggle(asset.sha256)} />
                Selecionar foto {i + 1}
              </label>
            </article>
          ))}
        </div>
        <div className="vanessa-archive-more">
          <span>Mostrando {Math.min(photoLimit, officialVanessaPhotos.length)} de {officialVanessaPhotos.length} fotografias</span>
          {photoLimit < officialVanessaPhotos.length &&
            <button type="button" onClick={() => setPhotoLimit((count) => Math.min(count + PHOTO_BATCH, officialVanessaPhotos.length))}>
              Mostrar mais fotografias
            </button>}
        </div>
      </section>

      <section className="vanessa-editorial vanessa-official-videos" id="videos">
        <p className="vanessa-eyebrow">VÍDEOS REAIS</p>
        <h2>Bastidores em movimento</h2>
        <p className="vanessa-archive-lead">Os {officialVanessaVideos.length} vídeos do repositório oficial estão disponíveis para revisão. Reprodução apenas após sua ação, sem áudio automático.</p>
        <div className="vanessa-videos-grid">
          {officialVanessaVideos.slice(0, videoLimit).map((asset, i) => (
            <article className="vanessa-video-tile" key={asset.sha256}>
              <video controls preload="none" playsInline aria-label={"Vídeo do acervo oficial " + (i + 1)}>
                <source src={asset.url} type="video/mp4" />
                Seu navegador não suporta este vídeo.
              </video>
              <label className="vanessa-archive-pick">
                <input type="checkbox" checked={picked.has(asset.sha256)} onChange={() => toggle(asset.sha256)} />
                Selecionar vídeo {i + 1}
              </label>
            </article>
          ))}
        </div>
        <div className="vanessa-archive-more">
          <span>Mostrando {Math.min(videoLimit, officialVanessaVideos.length)} de {officialVanessaVideos.length} vídeos</span>
          {videoLimit < officialVanessaVideos.length &&
            <button type="button" onClick={() => setVideoLimit((count) => Math.min(count + VIDEO_BATCH, officialVanessaVideos.length))}>
              Mostrar mais vídeos
            </button>}
        </div>
        <p className="vanessa-archive-info">
          O acervo é carregado do repositório oficial no GitHub para análise em QA.
          Apenas mídia revisada e com autorização adequada poderá integrar a publicação comercial.
        </p>
      </section>

      {zoom !== null && (
        <div className="vanessa-archive-lightbox" role="dialog" aria-modal="true" aria-label="Foto oficial ampliada">
          <button type="button" className="vanessa-archive-close" onClick={() => setZoom(null)} aria-label="Fechar fotografia">Fechar ×</button>
          <button type="button" className="vanessa-archive-previous" aria-label="Fotografia anterior"
            onClick={() => setZoom((zoom - 1 + officialVanessaPhotos.length) % officialVanessaPhotos.length)}>‹</button>
          <img src={officialVanessaPhotos[zoom].url} alt={"Fotografia do acervo oficial " + (zoom + 1)} />
          <button type="button" className="vanessa-archive-next" aria-label="Próxima fotografia"
            onClick={() => setZoom((zoom + 1) % officialVanessaPhotos.length)}>›</button>
          <span className="vanessa-archive-counter">{zoom + 1} / {officialVanessaPhotos.length}</span>
        </div>
      )}
    </>
  );
}
