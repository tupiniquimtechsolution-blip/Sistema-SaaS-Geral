import { useEffect, useState } from "react";
import "./salon-install-prompt.css";

interface DeferredInstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
function isInstalled(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}
export default function SalonInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<DeferredInstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isMobile, setMobile] = useState(false);
  const [help, setHelp] = useState("");
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    setInstalled(isInstalled());
    setMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    try { setHidden(sessionStorage.getItem("salon-install-hidden") === "1"); } catch { /* ignore */ }
    const onBefore = (e: Event) => { e.preventDefault(); setInstallEvent(e as DeferredInstallEvent); };
    const onInstalled = () => { setInstalled(true); setInstallEvent(null); setHelp(""); };
    window.addEventListener("beforeinstallprompt", onBefore);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  if (installed || hidden || (!installEvent && !isMobile)) return null;
  async function onInstall() {
    if (installEvent) {
      try {
        await installEvent.prompt();
        const result = await installEvent.userChoice;
        if (result.outcome === "accepted") setInstallEvent(null);
      } catch { setHelp("Use o menu do navegador para adicionar o site à tela inicial."); }
      return;
    }
    setHelp(/iPhone|iPad|iPod/.test(navigator.userAgent)
      ? "No Safari, toque em Compartilhar e escolha Adicionar à Tela de Início."
      : "Abra o menu do navegador e escolha Instalar aplicativo ou Adicionar à tela inicial.");
  }
  function dismiss() {
    setHidden(true);
    try { sessionStorage.setItem("salon-install-hidden", "1"); } catch { /* ignore */ }
  }
  return <aside className="salon-install-prompt" aria-label="Instalar aplicativo do salão">
    <div className="salon-install-line">
      <button type="button" className="salon-install-button" onClick={() => void onInstall()}>Instalar aplicativo</button>
      <button type="button" className="salon-install-close" onClick={dismiss} aria-label="Ocultar opção de instalação">×</button>
    </div>
    {help && <p role="status">{help}</p>}
  </aside>;
}
