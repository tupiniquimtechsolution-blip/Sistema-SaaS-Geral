import { useEffect, useState, type ChangeEvent } from "react";
import { OFFICIAL_VANESSA_COMMIT, OFFICIAL_VANESSA_REPO, officialVanessaPhotos, officialVanessaVideos } from "./official-vanessa-media";
import "./vanessa-official-archive.css";

const PHOTO_BATCH = 18;
const VIDEO_BATCH = 4;
const PUBLIC_PHOTO_BATCH = 12;
// Editorial preview shortlist: one image per spaced shooting interval, rather than
// flooding visitors with nearby frames of the same treatment. Numbers are 1-based
// from the immutable official catalogue. Original files and hashes remain intact.
// Images 1 (already shown in About), 14 (logo) and 78 (hero reference) are omitted.
export const PUBLIC_GALLERY_PHOTO_NUMBERS = [
  2, 9, 17, 25, 33, 41, 49, 57, 65, 73,
  79, 88, 97, 106, 115, 124, 133, 143, 153,
] as const;
export const publicVanessaGalleryPhotos = PUBLIC_GALLERY_PHOTO_NUMBERS.map((number) => officialVanessaPhotos[number - 1]);

/**
 * Full editorial QA inventory of the official repository.
 * Selection is local to this browser and exports a review manifest; it does
 * NOT publish a photo, mutate the tenant, or grant likeness/usage consent.
 */
export default function VanessaOfficialArchive({
  instagramUrl, reviewToolsEnabled = false,
}: { instagramUrl?: string; reviewToolsEnabled?: boolean }) {
  const [photoLimit, setPhotoLimit] = useState(PHOTO_BATCH);
  const [publicLimit, setPublicLimit] = useState(PUBLIC_PHOTO_BATCH);
  const visiblePhotos = reviewToolsEnabled ? officialVanessaPhotos : publicVanessaGalleryPhotos;
  const displayedPhotoLimit = reviewToolsEnabled ? photoLimit : publicLimit;
  const [videoLimit, setVideoLimit] = useState(VIDEO_BATCH);
  const [picked, setPicked] = useState<Set<string>>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem("vanessa-qa-selected-media-v1") || "[]");
      const allowed = new Set([...officialVanessaPhotos, ...officialVanessaVideos].map((asset) => asset.sha256));
      return new Set(Array.isArray(saved) ? saved.filter((v): v is string => typeof v === "string" && allowed.has(v)) : []);
    } catch { return new Set(); }
  });
  const [importStatus, setImportStatus] = useState("");
  const [zoom, setZoom] = useState<number | null>(null);
  const [showCuration, setShowCuration] = useState(false);

  useEffect(() => {
    if (zoom === null) return;
    function close(e: KeyboardEvent) {
      if (e.key === "Escape") setZoom(null);
      if (e.key === "ArrowRight") setZoom((i) => i === null ? null : (i + 1) % visiblePhotos.length);
      if (e.key === "ArrowLeft") setZoom((i) => i === null ? null : (i - 1 + visiblePhotos.length) % visiblePhotos.length);
    }
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [zoom, visiblePhotos]);

  useEffect(() => {
    try { localStorage.setItem("vanessa-qa-selected-media-v1", JSON.stringify([...picked])); } catch { /* local storage unavailable */ }
  }, [picked]);

  async function importReview(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== "object") throw Error("Invalid manifest");
      const manifest = parsed as { source_repository?: unknown; source_commit?: unknown; selections?: unknown };
      if (manifest.source_repository !== OFFICIAL_VANESSA_REPO || manifest.source_commit !== OFFICIAL_VANESSA_COMMIT || !Array.isArray(manifest.selections)) {
        throw Error("Wrong source");
      }
      const allowed = new Set([...officialVanessaPhotos, ...officialVanessaVideos].map((asset) => asset.sha256));
      const hashes = manifest.selections.map((asset: unknown) => asset && typeof asset === "object" && "sha256" in asset ? (asset as {sha256: unknown}).sha256 : null);
      if (hashes.some((hash) => typeof hash !== "string" || !allowed.has(hash))) throw Error("Unknown media");
      setPicked(new Set(hashes as string[]));
      setImportStatus("Seleção importada e preservada neste navegador.");
    } catch {
      setImportStatus("Arquivo incompatível com o acervo oficial. Nenhuma seleção foi alterada.");
    }
    event.currentTarget.value = "";
  }

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
        <h2>Galeria</h2>
        {reviewToolsEnabled && <p className="vanessa-archive-lead">Curadoria local de QA: {officialVanessaPhotos.length} fotografias e {officialVanessaVideos.length} vídeos disponíveis para selecionar.</p>}
        {reviewToolsEnabled && <div className="vanessa-archive-toolbar">
          <span>{picked.size} mídias selecionadas para revisão</span>
          <button type="button" onClick={() => setShowCuration((open) => !open)}
            aria-expanded={showCuration} aria-controls="vanessa-curation-help">
            {showCuration ? "Ocultar orientação" : "Como selecionar"}
          </button>
          <label className="vanessa-import-selection">
            Importar seleção
            <input type="file" accept=".json,application/json" onChange={importReview} aria-label="Importar seleção JSON" />
          </label>
          <button type="button" onClick={exportReview} disabled={picked.size === 0}>
            Baixar minha seleção
          </button>
        </div>}
        {reviewToolsEnabled && importStatus && <p role="status" className="vanessa-archive-info">{importStatus}</p>}
        {reviewToolsEnabled && showCuration && <p id="vanessa-curation-help" className="vanessa-archive-info">
          Marque cada foto ou vídeo que deseja manter. O botão de download salva uma lista para revisão editorial.
          Isso não envia nada ao servidor nem autoriza automaticamente a publicação de imagens de clientes.
        </p>}
        <div className="vanessa-official-grid">
          {visiblePhotos.slice(0, displayedPhotoLimit).map((asset, i) => (
            <article className="vanessa-archive-tile" key={asset.sha256}>
              <button type="button" className="vanessa-archive-view" aria-label={"Ampliar fotografia " + (i + 1)}
                onClick={() => setZoom(i)}>
                <img src={asset.url} alt={"Fotografia " + (i + 1) + " do salão"} loading="lazy"
                  decoding="async" />
                <span className="vanessa-archive-magnify" aria-hidden="true">↗</span>
              </button>
              {reviewToolsEnabled && <label className="vanessa-archive-pick">
                <input type="checkbox" checked={picked.has(asset.sha256)} onChange={() => toggle(asset.sha256)} />
                Selecionar foto {i + 1}
              </label>}
            </article>
          ))}
        </div>
        <div className="vanessa-archive-more">
          {reviewToolsEnabled && <span>Mostrando {Math.min(photoLimit, officialVanessaPhotos.length)} de {officialVanessaPhotos.length} fotografias</span>}
          {displayedPhotoLimit < visiblePhotos.length &&
            <button type="button" onClick={() => reviewToolsEnabled
              ? setPhotoLimit((count) => Math.min(count + PHOTO_BATCH, officialVanessaPhotos.length))
              : setPublicLimit((count) => Math.min(count + PUBLIC_PHOTO_BATCH, visiblePhotos.length))}>
              Mostrar mais fotografias
            </button>}
        </div>
      </section>

      <section className="vanessa-editorial vanessa-official-videos" id="videos">
        <h2>Vídeos</h2>
        {reviewToolsEnabled && <p className="vanessa-archive-lead">Curadoria local de QA. Reproduza os vídeos e selecione quais devem ser analisados para publicação.</p>}
        <div className="vanessa-videos-grid">
          {officialVanessaVideos.slice(0, videoLimit).map((asset, i) => (
            <article className="vanessa-video-tile" key={asset.sha256}>
              <video controls preload="none" playsInline aria-label={"Vídeo do salão " + (i + 1)}>
                <source src={asset.url} type="video/mp4" />
                Seu navegador não suporta este vídeo.
              </video>
              <div className="vanessa-video-caption">
                <span>Vídeo {i + 1} do acervo</span>
                {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir perfil do salão no Instagram">Abrir Instagram ↗</a>}
              </div>
              {reviewToolsEnabled && <label className="vanessa-archive-pick">
                <input type="checkbox" checked={picked.has(asset.sha256)} onChange={() => toggle(asset.sha256)} />
                Selecionar vídeo {i + 1}
              </label>}
            </article>
          ))}
        </div>
        <div className="vanessa-archive-more">
          {reviewToolsEnabled && <span>Mostrando {Math.min(videoLimit, officialVanessaVideos.length)} de {officialVanessaVideos.length} vídeos</span>}
          {videoLimit < officialVanessaVideos.length &&
            <button type="button" onClick={() => setVideoLimit((count) => Math.min(count + VIDEO_BATCH, officialVanessaVideos.length))}>
              Mostrar mais vídeos
            </button>}
        </div>
        {reviewToolsEnabled && <p className="vanessa-archive-info">
          Este modo de curadoria não fornece autenticação nem autoriza publicação comercial de mídias.
        </p>}
      </section>

      {zoom !== null && (
        <div className="vanessa-archive-lightbox" role="dialog" aria-modal="true" aria-label="Foto ampliada">
          <button type="button" className="vanessa-archive-close" onClick={() => setZoom(null)} aria-label="Fechar fotografia">Fechar ×</button>
          <button type="button" className="vanessa-archive-previous" aria-label="Fotografia anterior"
            onClick={() => setZoom((zoom - 1 + visiblePhotos.length) % visiblePhotos.length)}>‹</button>
          <img src={visiblePhotos[zoom].url} alt={"Fotografia do salão " + (zoom + 1)} />
          <button type="button" className="vanessa-archive-next" aria-label="Próxima fotografia"
            onClick={() => setZoom((zoom + 1) % visiblePhotos.length)}>›</button>
          <span className="vanessa-archive-counter">{zoom + 1} / {visiblePhotos.length}</span>
        </div>
      )}
    </>
  );
}
