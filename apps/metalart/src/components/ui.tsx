import { useEffect, useRef, useState, type ReactNode, type SVGProps } from "react";
import { cn, isFinePointer, prefersReduced } from "../lib/motion";
import { assets as assetsCfg } from "../config/assets";

const assetsLogo = assetsCfg.logo;

/* ============ marca / logo ============ *
 *
 * Reprodução tipográfica fiel ao estilo da identidade oficial da
 * Metal & Art (wordmark condensado em caixa alta com o "&" em
 * destaque e a palavra SERRALHERIA espaçada abaixo). Desenhada em
 * código para manter nitidez em qualquer tamanho.
 *
 * >> SOLICITAR LOGOTIPO VETORIAL/ORIGINAL AO CLIENTE <<
 * Ao receber o arquivo oficial, salvá-lo em public/client-assets/logo/
 * (logo-original / logo-light / logo-dark / logo-symbol) e substituir
 * este componente — ver CLIENT_REPLACEMENT_GUIDE.md.
 */

export function SparkMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M16 2l2.7 11.3L30 16l-11.3 2.7L16 30l-2.7-11.3L2 16l11.3-2.7z"
        fill="currentColor"
      />
      <path
        d="M25.5 2.5l.8 3.2 3.2.8-3.2.8-.8 3.2-.8-3.2-3.2-.8 3.2-.8z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}

export function Logo({
  className,
  stacked = false,
  badge = false,
  compact = false,
}: {
  className?: string;
  stacked?: boolean;
  badge?: boolean;
  /** versão reduzida para o header — largura controlada e respiro */
  compact?: boolean;
}) {
  // Quando o arquivo oficial existir (public/client-assets/logo/),
  // ele assume o lugar da reprodução tipográfica automaticamente.
  const [broken, setBroken] = useState(false);
  const official = !broken && (assetsLogo?.original ?? null);

  if (official) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <img
          src={official}
          alt="Metal & Art Serralheria"
          onError={() => setBroken(true)}
          className={badge ? "h-20 w-auto" : compact ? "h-10 w-auto" : "h-11 w-auto"}
        />
      </span>
    );
  }

  // Variação "selo" — remete ao avatar oficial do perfil no Instagram
  if (badge) {
    return (
      <span
        className={cn(
          "inline-flex w-28 flex-col items-center gap-2 border border-paper-100/20 bg-coal-900 px-4 py-5 text-center",
          className
        )}
      >
        <SparkMark className="h-7 w-7 text-ember-500" />
        <span className="font-display text-[0.95rem] leading-[1.02] tracking-[0.05em] text-paper-100 uppercase">
          Metal <span className="text-ember-500">&amp;</span> Art
        </span>
        <span className="font-mono text-[0.45rem] tracking-[0.38em] text-steel-400 uppercase">
          Serralheria
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex select-none items-center gap-2.5 text-paper-100",
        stacked ? "flex-col items-start gap-1.5" : "",
        className
      )}
    >
      <SparkMark className={cn("shrink-0 text-ember-500", compact ? "h-5 w-5" : "h-6 w-6")} />
      <span className="leading-none">
        <span
          className={cn(
            "font-display block font-bold leading-none uppercase",
            compact ? "text-[1.02rem] tracking-[0.05em]" : "text-[1.22rem] tracking-[0.045em]"
          )}
        >
          Metal
          <span className="relative mx-[0.12em] inline-block text-[1.05em] text-ember-500">
            &amp;
            <SparkMark className="absolute -top-[0.45em] -right-[0.55em] h-[0.36em] w-[0.36em] text-weld-400" />
          </span>
          Art
        </span>
        <span
          className={cn(
            "block w-full bg-gradient-to-r from-ember-600 via-ember-500/55 to-transparent",
            compact ? "mt-[0.3em] h-px" : "mt-[0.34em] h-[2px]"
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "font-mono block tracking-[0.42em] text-steel-400 uppercase",
            compact ? "mt-[0.3em] text-[0.48rem]" : "mt-[0.32em] text-[0.55rem]"
          )}
        >
          Serralheria
        </span>
      </span>
    </span>
  );
}

/* ============ etiqueta de seção ============ */

export function SectionTag({
  index,
  label,
  light = false,
  className,
}: {
  index: string;
  label: string;
  light?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono flex items-center gap-3 text-[0.68rem] tracking-[0.3em] uppercase",
        light ? "text-arc-700" : "text-steel-400",
        className
      )}
    >
      <span className={light ? "text-ember-600" : "text-ember-500"}>[ {index} ]</span>
      {label}
      <span
        className={cn("h-px w-10", light ? "bg-arc-700/50" : "bg-coal-600")}
        aria-hidden="true"
      />
    </p>
  );
}

/* ============ separador "solda" ============ */

export function WeldDivider({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    const line = lineRef.current;
    const dot = dotRef.current;
    if (!wrap || !line || !dot || prefersReduced()) {
      if (line) line.style.transform = "scaleX(1)";
      if (dot) dot.style.opacity = "0";
      return;
    }
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = wrap.getBoundingClientRect();
        const vh = window.innerHeight;
        const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.7)));
        line.style.transform = `scaleX(${p})`;
        dot.style.left = `${p * 100}%`;
        dot.style.opacity = p > 0.02 && p < 0.98 ? "1" : "0";
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={wrapRef} className={cn("relative h-px w-full", className)} aria-hidden="true">
      <div className="absolute inset-0 bg-coal-700/60" />
      <div
        ref={lineRef}
        className="absolute inset-0 origin-left bg-gradient-to-r from-coal-600 via-ember-600 to-ember-500"
        style={{ transform: "scaleX(0)" }}
      />
      <div
        ref={dotRef}
        className="weld-dot absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-weld-400"
        style={{ left: "0%", opacity: 0 }}
      />
    </div>
  );
}

/* ============ marquee ============ */

export function Marquee({
  items,
  className,
  itemClassName,
  separator = "✳",
}: {
  items: string[];
  className?: string;
  itemClassName?: string;
  separator?: string;
}) {
  const row = (key: string, hidden = false) => (
    <div
      key={key}
      aria-hidden={hidden || undefined}
      className={cn("flex shrink-0 items-center", itemClassName)}
    >
      {items.map((it, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6">{it}</span>
          <span className="text-ember-500" aria-hidden="true">
            {separator}
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("marquee", className)}>
      <div className="marquee-track">
        {row("a")}
        {row("b", true)}
      </div>
    </div>
  );
}

/* ============ cursor customizado (desktop) ============ */

export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isFinePointer() || prefersReduced()) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!ring || !label) return;

    let x = -100;
    let y = -100;
    let tx = x;
    let ty = y;
    let raf = 0;
    let labelMode = "";

    const apply = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(apply);
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const t = (e.target as HTMLElement | null)?.closest?.("[data-cursor]");
      const mode = t?.getAttribute("data-cursor") ?? "";
      if (mode !== labelMode) {
        labelMode = mode;
        label.textContent = mode;
        const active = mode !== "";
        ring.classList.toggle("cursor-active", active);
      }
    };
    const onLeave = () => {
      tx = -100;
      ty = -100;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(apply);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={ringRef} className="ma-cursor" aria-hidden="true">
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div className="cursor-ring h-3 w-3 rounded-full border border-ember-400/90 bg-ember-500/20 transition-all duration-300" />
        <div
          ref={labelRef}
          className="cursor-label absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[0.6rem] font-medium tracking-[0.2em] whitespace-nowrap text-coal-950 uppercase opacity-0 transition-opacity duration-200"
        />
      </div>
      <style>{`
        .cursor-active .cursor-ring { width: 3.4rem; height: 3.4rem; background: var(--color-ember-500); border-color: var(--color-ember-500); }
        .cursor-active .cursor-label { opacity: 1; }
      `}</style>
    </div>
  );
}

/* ============ ícones (desenho próprio) ============ */

type IP = SVGProps<SVGSVGElement>;
const base = (p: IP) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "square" as const,
  "aria-hidden": true,
  ...p,
});

export const IconArrowUpRight = (p: IP) => (
  <svg {...base(p)}>
    <path d="M6 18L18 6M9 6h9v9" />
  </svg>
);
export const IconArrowRight = (p: IP) => (
  <svg {...base(p)}>
    <path d="M3 12h17M14 5l7 7-7 7" />
  </svg>
);
export const IconChevronL = (p: IP) => (
  <svg {...base(p)}>
    <path d="M15 4l-8 8 8 8" />
  </svg>
);
export const IconChevronR = (p: IP) => (
  <svg {...base(p)}>
    <path d="M9 4l8 8-8 8" />
  </svg>
);
export const IconClose = (p: IP) => (
  <svg {...base(p)}>
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
);
export const IconPlus = (p: IP) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconWhatsApp = (p: IP) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.3-.7.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.5-1 .1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.9.9-1.2 2.1-.7 3.4.7 1.9 2.2 3.5 4 4.5 2.4 1.3 3.6 1.2 4.6 1 .7-.1 1.5-.7 1.7-1.3.2-.7.2-1.2.1-1.3 0-.2-.2-.2-.5-.3Z" />
  </svg>
);
export const IconPhone = (p: IP) => (
  <svg {...base(p)}>
    <path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2Z" />
  </svg>
);
export const IconMail = (p: IP) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);
export const IconPin = (p: IP) => (
  <svg {...base(p)}>
    <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
export const IconClock = (p: IP) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);
export const IconRuler = (p: IP) => (
  <svg {...base(p)}>
    <rect x="2.5" y="9" width="19" height="6" />
    <path d="M6.5 9v3M10.5 9v3M14.5 9v3M18.5 9v3" />
  </svg>
);
export const IconFlame = (p: IP) => (
  <svg {...base(p)}>
    <path d="M12 3c1 3 5 5 5 9a5 5 0 0 1-10 0c0-2 .8-3.4 2-4.5 0 1.5.7 2.5 1.8 3C10.4 8 10.6 5 12 3Z" />
  </svg>
);
export const IconShield = (p: IP) => (
  <svg {...base(p)}>
    <path d="M12 3l7 2.5V11c0 5-3 8.5-7 10-4-1.5-7-5-7-10V5.5Z" />
    <path d="M9 11.5l2 2 4-4.5" />
  </svg>
);
export const IconGear = (p: IP) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 2.5V6M12 18v3.5M2.5 12H6M18 12h3.5M5 5l2.5 2.5M16.5 16.5L19 19M19 5l-2.5 2.5M7.5 16.5L5 19" />
  </svg>
);
export const IconBolt = (p: IP) => (
  <svg {...base(p)}>
    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" />
  </svg>
);
export const IconInstagram = (p: IP) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);
export const IconGoogle = (p: IP) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z" />
    <path d="M12 21.5c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 21.5Z" opacity=".75" />
    <path d="M6.5 13.5a6 6 0 0 1 0-3.8V7.1H3.2a10 10 0 0 0 0 9Z" opacity=".5" />
    <path d="M12 6c1.5 0 2.8.5 3.8 1.5L18.7 4.6A9.9 9.9 0 0 0 12 2 10 10 0 0 0 3.2 7.1l3.3 2.6A5.9 5.9 0 0 1 12 6Z" opacity=".9" />
  </svg>
);
export const IconStar = (p: IP) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" />
  </svg>
);
export const IconCheck = (p: IP) => (
  <svg {...base(p)}>
    <path d="M4 12.5l5.5 5.5L20 6.5" />
  </svg>
);
export const IconCamera = (p: IP) => (
  <svg {...base(p)}>
    <path d="M3 8h4l2-3h6l2 3h4v12H3z" />
    <circle cx="12" cy="13.5" r="3.5" />
  </svg>
);
export const IconDrag = (p: IP) => (
  <svg {...base(p)}>
    <path d="M8 12H2M4 9l-2.5 3L4 15M16 12h6M20 9l2.5 3L20 15" />
  </svg>
);
export const IconMenu = (p: IP) => (
  <svg {...base(p)}>
    <path d="M3 7h18M3 12h12M3 17h18" />
  </svg>
);

/* ============ botão magnético ============ */

export function Magnetic({
  children,
  className,
  strength = 0.25,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer() || prefersReduced()) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    };
    const onLeave = () => {
      el.style.transform = "translate(0,0)";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);
  return (
    <div
      ref={ref}
      className={cn("inline-block transition-transform duration-200 ease-out will-change-transform", className)}
    >
      {children}
    </div>
  );
}
