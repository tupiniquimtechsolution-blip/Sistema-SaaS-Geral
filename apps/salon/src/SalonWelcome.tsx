import { useEffect, useState } from "react";
import "./salon-welcome.css";

const SEEN_KEY = "vanessa-qa-welcome-shown-v1";

/** Brief branded introduction, strictly QA-only; it never gates navigation or booking. */
export default function SalonWelcome({
  enabled,
  logoUrl,
  brandName,
}: { enabled: boolean; logoUrl?: string | null; brandName: string }) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return sessionStorage.getItem(SEEN_KEY) !== "1"; }
    catch { return true; }
  });

  useEffect(() => {
    if (!enabled || !visible) return;
    try { sessionStorage.setItem(SEEN_KEY, "1"); }
    catch { /* private browsing or blocked storage */ }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setVisible(false), reducedMotion ? 700 : 1900);
    return () => window.clearTimeout(timer);
  }, [enabled, visible]);

  if (!enabled || !visible) return null;

  return <div className="salon-welcome" data-testid="salon-welcome" role="status" aria-live="polite">
    <div className="salon-welcome-content">
      {logoUrl
        ? <img className="salon-welcome-logo" src={logoUrl} alt={"Logo " + brandName} width="144" height="144" />
        : <span className="salon-welcome-fallback">{brandName}</span>}
      <p>Bem Vindo</p>
    </div>
    <button className="salon-welcome-skip" type="button" onClick={() => setVisible(false)}>
      Pular abertura
    </button>
  </div>;
}
