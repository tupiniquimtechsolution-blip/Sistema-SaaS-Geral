import { useEffect, useRef } from "react";
import type { ReactNode, ButtonHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { brl, useStore } from "../lib/core";
import type { ArtKind } from "../config/business";
import { IStar, IX, IPlus, IMinus, ICheck, IArrow } from "./icons";

/* ============ BOTÃO ============ */
type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "brand" | "bark" | "outline" | "light" | "leaf" | "ghost";
  size?: "sm" | "md" | "lg";
  to?: string;
};
export function Btn({ variant = "brand", size = "md", to, className = "", children, ...rest }: BtnProps) {
  const base =
    "group/btn inline-flex items-center justify-center gap-2 font-display font-semibold transition-all duration-300 select-none whitespace-nowrap " +
    "active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none ";
  const sizes = {
    sm: "text-[13px] px-4 py-2 rounded-full",
    md: "text-sm px-6 py-3 rounded-full",
    lg: "text-[15px] px-8 py-4 rounded-full",
  }[size];
  const variants = {
    brand: "bg-brand text-white shadow-[0_10px_30px_-8px_rgba(231,136,74,0.65)] hover:bg-brand-deep hover:shadow-[0_14px_34px_-8px_rgba(201,106,50,0.7)] hover:-translate-y-0.5",
    bark: "bg-bark text-cream shadow-[0_10px_30px_-10px_rgba(91,64,52,0.6)] hover:bg-ink hover:-translate-y-0.5",
    outline: "border-[1.5px] border-bark/25 text-bark hover:border-bark hover:bg-bark hover:text-cream",
    light: "bg-cream/95 text-bark shadow-[0_10px_30px_-12px_rgba(47,40,37,0.45)] hover:bg-white hover:-translate-y-0.5",
    leaf: "bg-leaf text-white shadow-[0_10px_30px_-8px_rgba(86,140,118,0.6)] hover:bg-leaf-deep hover:-translate-y-0.5",
    ghost: "text-bark hover:bg-bark/8",
  }[variant];
  const cls = `${base}${sizes} ${variants} ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return <button type="button" className={cls} {...rest}>{children}</button>;
}

/* ============ CABEÇALHO DE SEÇÃO ============ */
export function SectionHead({ eyebrow, title, desc, align = "left", light = false }: {
  eyebrow: string; title: ReactNode; desc?: string; align?: "left" | "center"; light?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className={`eyebrow flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
        <span className="h-px w-8 bg-brand inline-block" aria-hidden />
        {eyebrow}
      </p>
      <h2 className={`font-display font-extrabold display-tight text-[clamp(1.75rem,4vw,3rem)] mt-3 ${light ? "text-cream" : "text-ink"}`}>
        {title}
      </h2>
      {desc && <p className={`mt-4 text-[15.5px] leading-relaxed ${light ? "text-cream/75" : "text-fog"}`}>{desc}</p>}
    </div>
  );
}

/* ============ PREÇO ============ */
export function Price({ value, old, big = false }: { value: number; old?: number; big?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-2 flex-wrap">
      {old && <span className={`text-fog line-through ${big ? "text-base" : "text-xs"}`}>{brl(old)}</span>}
      <span className={`font-display font-bold text-ink ${big ? "text-3xl" : "text-[17px]"}`}>{brl(value)}</span>
    </span>
  );
}

/* ============ RATING ============ */
export function Rating({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-fog">
      <IStar size={14} className="text-brand" />
      <span className="font-display font-semibold text-ink">{value.toFixed(1)}</span>
      {count !== undefined && <span>· {count} avaliações</span>}
    </span>
  );
}

/* ============ STEPPER ============ */
export function Stepper({ value, onChange, small = false }: { value: number; onChange: (v: number) => void; small?: boolean }) {
  const btn = `grid place-items-center rounded-full border border-bark/20 text-bark hover:bg-bark hover:text-cream transition-colors ${small ? "w-7 h-7" : "w-9 h-9"}`;
  return (
    <div className="inline-flex items-center gap-2.5" role="group" aria-label="Quantidade">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} aria-label="Diminuir quantidade">
        <IMinus size={small ? 13 : 15} />
      </button>
      <span className={`font-display font-bold text-ink text-center ${small ? "w-5 text-sm" : "w-6"}`}>{value}</span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} aria-label="Aumentar quantidade">
        <IPlus size={small ? 13 : 15} />
      </button>
    </div>
  );
}

/* ============ MODAL ============ */
export function Modal({ open, onClose, title, children, wide = false }: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode; wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[120] grid place-items-end sm:place-items-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-ink/55 backdrop-blur-[3px]" onClick={onClose} />
      <div ref={ref} tabIndex={-1} className={`pop-in relative w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-md"} bg-cream rounded-t-[26px] sm:rounded-[26px] sm:rounded-bl-[8px] shadow-2xl max-h-[88vh] overflow-y-auto no-bar outline-none`}>
        <div className="sticky top-0 bg-cream/95 backdrop-blur z-10 flex items-center justify-between px-6 pt-5 pb-3 border-b border-line">
          <h3 className="font-display font-bold text-ink text-lg">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Fechar janela" className="w-9 h-9 grid place-items-center rounded-full hover:bg-sand text-bark transition-colors">
            <IX size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ============ TOASTS ============ */
export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="fixed z-[130] bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 flex flex-col gap-2 items-center sm:items-end pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast-in pointer-events-auto flex items-center gap-3 bg-ink text-cream pl-3.5 pr-2 py-2.5 rounded-full shadow-2xl max-w-[92vw]">
          <span className="w-6 h-6 shrink-0 grid place-items-center rounded-full bg-leaf text-white"><ICheck size={13} /></span>
          <div className="min-w-0">
            <p className="font-display font-semibold text-[13px] leading-tight truncate">{t.title}</p>
            {t.desc && <p className="text-[11.5px] text-cream/65 truncate">{t.desc}</p>}
          </div>
          {t.actionLabel && t.href && (
            <Link to={t.href} className="shrink-0 text-[12px] font-display font-bold text-brand bg-cream/10 hover:bg-cream/20 rounded-full px-3 py-1.5 inline-flex items-center gap-1 transition-colors">
              {t.actionLabel} <IArrow size={12} />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

/* ============ ILUSTRAÇÕES DE PRODUTO (catálogo ilustrado da casa) ============ */
function Shadow() {
  return <ellipse cx="100" cy="172" rx="52" ry="9" fill="rgba(91,64,52,0.12)" />;
}
export function ProductArt({ kind, className = "" }: { kind: ArtKind; className?: string }) {
  const art = {
    "kibble-bag": (
      <g>
        <path d="M62 62 70 34h60l8 28v88a14 14 0 0 1-14 14H76a14 14 0 0 1-14-14V62Z" fill="#C96A32" />
        <path d="M62 62h76v16H62z" fill="#A8552A" />
        <rect x="78" y="92" width="44" height="44" rx="10" fill="#FFF8F0" />
        <ellipse cx="100" cy="116" rx="10" ry="8.5" fill="#C96A32" />
        <ellipse cx="88" cy="105" rx="4.4" ry="5.4" fill="#C96A32" />
        <ellipse cx="112" cy="105" rx="4.4" ry="5.4" fill="#C96A32" />
        <rect x="84" y="144" width="32" height="6" rx="3" fill="#F1DFCA" />
      </g>
    ),
    "cat-bag": (
      <g>
        <path d="M64 58 72 32h56l8 26v92a14 14 0 0 1-14 14H78a14 14 0 0 1-14-14V58Z" fill="#568C76" />
        <path d="M64 58h72v14H64z" fill="#3F6E5B" />
        <rect x="80" y="88" width="40" height="40" rx="20" fill="#FFF8F0" />
        <path d="M88 108v-9l7 5h10l7-5v9a12 12 0 0 1-24 0Z" fill="#568C76" />
        <circle cx="95" cy="109" r="1.8" fill="#FFF8F0" /><circle cx="105" cy="109" r="1.8" fill="#FFF8F0" />
        <rect x="86" y="138" width="28" height="6" rx="3" fill="#B8D9CD" />
      </g>
    ),
    "treat-jar": (
      <g>
        <rect x="68" y="52" width="64" height="14" rx="7" fill="#8A5A44" />
        <path d="M70 66h60v84a16 16 0 0 1-16 16H86a16 16 0 0 1-16-16V66Z" fill="#F1DFCA" stroke="#E5CDAE" strokeWidth="3" />
        <rect x="82" y="84" width="36" height="52" rx="8" fill="#FFF8F0" />
        <rect x="88" y="96" width="10" height="26" rx="5" fill="#E7884A" />
        <rect x="103" y="92" width="10" height="30" rx="5" fill="#C96A32" />
      </g>
    ),
    biscuit: (
      <g>
        <rect x="58" y="70" width="84" height="66" rx="16" fill="#E5CDAE" />
        <rect x="58" y="58" width="84" height="24" rx="12" fill="#8A5A44" />
        <path d="M84 100c-5 0-8-3.5-8-7.5S79.5 85 84 85c1.8 0 3.4.6 4.8 1.7A7.6 7.6 0 0 1 95 85c4.4 0 8 3.5 8 7.5s-3 7.5-8 7.5c-3.5 2.8-8.5 2.8-11 0Z" fill="#C96A32" />
        <circle cx="112" cy="118" r="8" fill="#C96A32" />
        <circle cx="112" cy="118" r="3" fill="#E5CDAE" />
      </g>
    ),
    ball: (
      <g>
        <circle cx="100" cy="112" r="46" fill="#E7884A" />
        <path d="M58 96c24 14 60 14 84 0" stroke="#FFF8F0" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M58 128c24-14 60-14 84 0" stroke="#FFF8F0" strokeWidth="7" fill="none" strokeLinecap="round" />
        <circle cx="82" cy="86" r="9" fill="#F6B98B" opacity="0.9" />
      </g>
    ),
    rope: (
      <g>
        <path d="M62 148c22-24 54-60 76-84" stroke="#E5CDAE" strokeWidth="20" strokeLinecap="round" />
        <path d="M62 148c22-24 54-60 76-84" stroke="#C96A32" strokeWidth="20" strokeLinecap="round" strokeDasharray="10 14" />
        <circle cx="60" cy="150" r="15" fill="#8A5A44" /><circle cx="140" cy="62" r="15" fill="#8A5A44" />
        <circle cx="60" cy="150" r="6" fill="#E5CDAE" /><circle cx="140" cy="62" r="6" fill="#E5CDAE" />
      </g>
    ),
    mouse: (
      <g>
        <ellipse cx="100" cy="118" rx="42" ry="30" fill="#8FA8B8" />
        <path d="M62 106 44 88l26 4z" fill="#8FA8B8" />
        <path d="M62 130 44 148l26-4z" fill="#8FA8B8" />
        <circle cx="112" cy="108" r="4" fill="#2F2825" />
        <path d="M142 118c14 0 16-14 26-14" stroke="#568C76" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M96 92c6-10 18-10 22 0" stroke="#B8D9CD" strokeWidth="7" fill="none" strokeLinecap="round" />
      </g>
    ),
    shampoo: (
      <g>
        <rect x="88" y="34" width="24" height="16" rx="5" fill="#3F6E5B" />
        <rect x="93" y="48" width="14" height="12" fill="#B8D9CD" />
        <path d="M72 72c0-8 6-14 14-14h28c8 0 14 6 14 14v72a16 16 0 0 1-16 16H88a16 16 0 0 1-16-16V72Z" fill="#568C76" />
        <rect x="80" y="88" width="40" height="42" rx="9" fill="#FFF8F0" />
        <circle cx="100" cy="104" r="8" fill="#B8D9CD" />
        <rect x="88" y="118" width="24" height="5" rx="2.5" fill="#568C76" />
      </g>
    ),
    conditioner: (
      <g>
        <rect x="88" y="36" width="24" height="14" rx="5" fill="#C96A32" />
        <rect x="94" y="48" width="12" height="12" fill="#F1DFCA" />
        <path d="M72 72c0-8 6-14 14-14h28c8 0 14 6 14 14v72a16 16 0 0 1-16 16H88a16 16 0 0 1-16-16V72Z" fill="#E7884A" />
        <rect x="80" y="88" width="40" height="42" rx="9" fill="#FFF8F0" />
        <path d="M100 96c-5 6-8 9-8 13a8 8 0 0 0 16 0c0-4-3-7-8-13Z" fill="#E7884A" />
        <rect x="88" y="120" width="24" height="5" rx="2.5" fill="#E7884A" />
      </g>
    ),
    perfume: (
      <g>
        <circle cx="100" cy="52" r="10" fill="#C96A32" />
        <rect x="94" y="60" width="12" height="12" fill="#E5CDAE" />
        <path d="M76 86c0-8 6-14 14-14h20c8 0 14 6 14 14v58a16 16 0 0 1-16 16H92a16 16 0 0 1-16-16V86Z" fill="#F1DFCA" stroke="#E5CDAE" strokeWidth="3" />
        <circle cx="100" cy="112" r="17" fill="#FFF8F0" />
        <path d="M100 102c-4 5-6.5 7.5-6.5 10.5a6.5 6.5 0 0 0 13 0c0-3-2.5-5.5-6.5-10.5Z" fill="#E7884A" />
      </g>
    ),
    brush: (
      <g>
        <rect x="62" y="66" width="76" height="46" rx="23" fill="#8A5A44" />
        <rect x="70" y="74" width="60" height="30" rx="15" fill="#F1DFCA" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={76 + i * 12} y="80" width="4" height="18" rx="2" fill="#C96A32" />
        ))}
        <rect x="90" y="112" width="20" height="42" rx="10" fill="#E7884A" />
      </g>
    ),
    bed: (
      <g>
        <ellipse cx="100" cy="122" rx="52" ry="30" fill="#C96A32" />
        <ellipse cx="100" cy="116" rx="52" ry="28" fill="#E7884A" />
        <ellipse cx="100" cy="118" rx="34" ry="17" fill="#FFF8F0" />
        <ellipse cx="100" cy="122" rx="26" ry="11" fill="#F1DFCA" />
      </g>
    ),
    collar: (
      <g>
        <path d="M100 60c30 0 50 16 50 40s-20 40-50 40-50-16-50-40 20-40 50-40Z" fill="none" stroke="#C96A32" strokeWidth="17" />
        <path d="M100 60c30 0 50 16 50 40" fill="none" stroke="#A8552A" strokeWidth="17" strokeLinecap="round" />
        <circle cx="100" cy="146" r="13" fill="#E5CDAE" />
        <circle cx="100" cy="146" r="5" fill="#8A5A44" />
      </g>
    ),
    harness: (
      <g>
        <path d="M70 74h60l14 34-14 34H70L56 108l14-34Z" fill="#568C76" />
        <path d="M70 74h60l14 34H56l14-34Z" fill="#3F6E5B" />
        <rect x="90" y="64" width="20" height="12" rx="6" fill="#E7884A" />
        <circle cx="100" cy="108" r="9" fill="#FFF8F0" />
        <circle cx="100" cy="108" r="3.5" fill="#568C76" />
      </g>
    ),
    litter: (
      <g>
        <path d="M60 66 68 40h64l8 26v82a16 16 0 0 1-16 16H76a16 16 0 0 1-16-16V66Z" fill="#6799B5" />
        <path d="M60 66h80v15H60z" fill="#4E7C97" />
        <rect x="76" y="94" width="48" height="46" rx="10" fill="#FFF8F0" />
        <path d="M86 122c4-12 8-16 14-16s10 4 14 16" stroke="#6799B5" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="100" cy="108" r="5" fill="#6799B5" />
      </g>
    ),
    pads: (
      <g>
        <rect x="62" y="52" width="76" height="104" rx="12" fill="#E5CDAE" />
        <rect x="62" y="52" width="76" height="26" rx="12" fill="#C96A32" />
        <rect x="72" y="88" width="56" height="40" rx="8" fill="#FFF8F0" />
        <ellipse cx="100" cy="108" rx="9" ry="7.5" fill="#E7884A" />
        <ellipse cx="88" cy="99" rx="4" ry="5" fill="#E7884A" />
        <ellipse cx="112" cy="99" rx="4" ry="5" fill="#E7884A" />
        <rect x="78" y="136" width="44" height="7" rx="3.5" fill="#C96A32" />
      </g>
    ),
  }[kind];
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-hidden>
      <Shadow />
      {art}
    </svg>
  );
}

/* ============ ESTADOS ============ */
export function EmptyState({ icon, title, desc, action }: { icon: ReactNode; title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto w-20 h-20 rounded-full bg-sand grid place-items-center text-bark mb-5">{icon}</div>
      <h3 className="font-display font-bold text-xl text-ink">{title}</h3>
      <p className="text-fog mt-2 max-w-sm mx-auto text-[15px]">{desc}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export const inputCls =
  "w-full bg-white border-[1.5px] border-bark/15 rounded-[14px] rounded-bl-[4px] px-4 py-3 text-[15px] text-ink placeholder:text-fog/60 " +
  "focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 transition-all";
export const labelCls = "block font-display font-semibold text-[13px] text-bark mb-1.5";
