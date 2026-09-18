import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode, SVGProps } from "react";
import { Link } from "react-router-dom";
import { cx, formatNum, prefersReducedMotion, useInView } from "../lib/utils";

/* ================= ÍCONES (SVG próprios, traço industrial) ================= */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const Stroke = ({ size = 18, children, ...rest }: IconProps & { children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="square"
    strokeLinejoin="miter"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

export const IcWhatsApp = ({ size = 18, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

export const IcPhone = (p: IconProps) => (
  <Stroke {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 2Z" />
  </Stroke>
);
export const IcArrow = (p: IconProps) => (
  <Stroke {...p}><path d="M4 12h16M13 5l7 7-7 7" /></Stroke>
);
export const IcArrowUpRight = (p: IconProps) => (
  <Stroke {...p}><path d="M7 17 17 7M8 7h9v9" /></Stroke>
);
export const IcHeart = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Stroke {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M19 14c1.5-1.5 2-3.2 2-5a5 5 0 0 0-9-3 5 5 0 0 0-9 3c0 1.8.5 3.5 2 5l7 7 7-7Z" />
  </Stroke>
);
export const IcScale = (p: IconProps) => (
  <Stroke {...p}><path d="M12 3v18M5 7l-3 6a3.5 3.5 0 0 0 6 0L5 7Zm0 0 7-2m0 2 3 6a3.5 3.5 0 0 0 6 0l-3-6-6-2M8 21h8" /></Stroke>
);
export const IcFilter = (p: IconProps) => (
  <Stroke {...p}><path d="M4 5h16M7 12h10M10 19h4" /></Stroke>
);
export const IcSearch = (p: IconProps) => (
  <Stroke {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Stroke>
);
export const IcClock = (p: IconProps) => (
  <Stroke {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></Stroke>
);
export const IcGauge = (p: IconProps) => (
  <Stroke {...p}><path d="M12 21a9 9 0 1 1 9-9" /><path d="m12 12 5-3" /><path d="M21 16l-2 1" /></Stroke>
);
export const IcCalendar = (p: IconProps) => (
  <Stroke {...p}><rect x="3" y="5" width="18" height="16" /><path d="M3 9h18M8 3v4M16 3v4" /></Stroke>
);
export const IcPin = (p: IconProps) => (
  <Stroke {...p}><path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></Stroke>
);
export const IcFuel = (p: IconProps) => (
  <Stroke {...p}><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h14M5 10h10" /><path d="M15 8h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3" /></Stroke>
);
export const IcGear = (p: IconProps) => (
  <Stroke {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></Stroke>
);
export const IcEngine = (p: IconProps) => (
  <Stroke {...p}><path d="M7 7V5h6v2h3l2 3h3v8h-3l-2 2H8l-3-3H3v-6h2l2-4Z" /><path d="M10 5V3h4" /></Stroke>
);
export const IcWeight = (p: IconProps) => (
  <Stroke {...p}><path d="M6 8 3 21h18L18 8" /><path d="M6 8a6 6 0 1 1 12 0" /></Stroke>
);
export const IcCheck = (p: IconProps) => (
  <Stroke {...p}><path d="m4 12 5 5L20 6" /></Stroke>
);
export const IcX = (p: IconProps) => (
  <Stroke {...p}><path d="M5 5l14 14M19 5 5 19" /></Stroke>
);
export const IcChevronD = (p: IconProps) => (
  <Stroke {...p}><path d="m5 9 7 7 7-7" /></Stroke>
);
export const IcChevronL = (p: IconProps) => (
  <Stroke {...p}><path d="m14 5-7 7 7 7" /></Stroke>
);
export const IcChevronR = (p: IconProps) => (
  <Stroke {...p}><path d="m10 5 7 7-7 7" /></Stroke>
);
export const IcMenu = (p: IconProps) => (
  <Stroke {...p}><path d="M3 6h18M3 12h18M3 18h18" /></Stroke>
);
export const IcShield = (p: IconProps) => (
  <Stroke {...p}><path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></Stroke>
);
export const IcWrench = (p: IconProps) => (
  <Stroke {...p}><path d="M14 7a4 4 0 0 1 5-4l-3 3 1 4 4 1 3-3a4 4 0 0 1-4 5 4 4 0 0 1-3-1L7 22l-4-4L13 8a4 4 0 0 1 1-1Z" /></Stroke>
);
export const IcPlay = (p: IconProps) => (
  <Stroke {...p}><path d="M7 5v14l12-7-12-7Z" /></Stroke>
);
export const IcTractor = (p: IconProps) => (
  <Stroke {...p}>
    <circle cx="7" cy="17" r="4" />
    <circle cx="18.5" cy="18.5" r="2.5" />
    <path d="M11 17h5m-4-9V5h6l2 6.5M4 13l2-5h6" />
  </Stroke>
);
export const IcDoc = (p: IconProps) => (
  <Stroke {...p}><path d="M6 3h9l4 4v14H6V3Z" /><path d="M15 3v4h4M9 12h7M9 16h7" /></Stroke>
);
export const IcSwap = (p: IconProps) => (
  <Stroke {...p}><path d="M4 8h13l-3-3m3 3-3 3M20 16H7l3-3m-3 3 3 3" /></Stroke>
);
export const IcCoin = (p: IconProps) => (
  <Stroke {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v10M15.5 9.5c-.7-1-2-1.5-3.5-1.5-1.9 0-3.5.9-3.5 2.25S9.9 12.5 12 12.5s3.5.85 3.5 2.25-1.6 2.25-3.5 2.25c-1.5 0-2.8-.5-3.5-1.5" /></Stroke>
);

/* ================= Primitivos ================= */

const btnTones = {
  hz: "bg-hz-400 text-coal-950 hover:bg-hz-300",
  safety: "bg-safety-500 text-bone-100 hover:bg-safety-400",
  agri: "bg-agri-500 text-bone-100 hover:bg-agri-400",
  dark: "bg-coal-800 text-bone-100 border border-line-dark hover:bg-coal-700",
  outline: "border border-steel-400 text-bone-100 hover:border-hz-400 hover:text-hz-300",
  outlineDark: "border border-coal-950/35 text-coal-950 hover:border-coal-950 hover:bg-coal-950 hover:text-hz-400",
};
const btnSizes = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-[15px]",
};

export function Btn({
  to,
  href,
  onClick,
  children,
  tone = "hz",
  size = "md",
  className,
  type,
  ariaLabel,
  style,
}: {
  to?: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  tone?: keyof typeof btnTones;
  size?: keyof typeof btnSizes;
  className?: string;
  type?: "button" | "submit";
  ariaLabel?: string;
  style?: CSSProperties;
}) {
  const cls = cx(
    "clip-cut-sm inline-flex items-center justify-center gap-2.5 font-cond font-semibold uppercase tracking-[0.16em] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 select-none cursor-pointer",
    btnTones[tone],
    btnSizes[size],
    className,
  );
  if (to)
    return (
      <Link to={to} className={cls} aria-label={ariaLabel} style={style}>
        {children}
      </Link>
    );
  if (href)
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={cls} aria-label={ariaLabel} style={style}>
        {children}
      </a>
    );
  return (
    <button type={type ?? "button"} onClick={onClick} className={cls} aria-label={ariaLabel} style={style}>
      {children}
    </button>
  );
}

export function Kicker({ children, tone = "hz" }: { children: ReactNode; tone?: "hz" | "agri" | "safety" | "steel" }) {
  const bar = tone === "agri" ? "bg-agri-400" : tone === "safety" ? "bg-safety-400" : tone === "steel" ? "bg-steel-400" : "bg-hz-400";
  return (
    <p className={cx("flex items-center gap-3 font-cond text-[13px] font-semibold uppercase tracking-[0.28em]", tone === "steel" ? "text-steel-300" : tone === "agri" ? "text-agri-300" : "text-hz-300")}>
      <span className={cx("inline-block h-[2px] w-8", bar)} aria-hidden="true" />
      {children}
    </p>
  );
}

export function SectionHead({
  kicker,
  title,
  lead,
  tone = "hz",
  align = "left",
  className,
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: "hz" | "agri" | "safety" | "steel";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cx("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <Reveal>
        <Kicker tone={tone}>{kicker}</Kicker>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="mt-4 font-display text-[clamp(2rem,5.5vw,3.6rem)] leading-[0.98] uppercase text-balance">
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={160}>
          <p className={cx("mt-5 text-lg leading-relaxed", align === "center" && "mx-auto", "max-w-2xl text-steel-300")}>{lead}</p>
        </Reveal>
      )}
    </div>
  );
}

export function Reveal({
  children,
  className,
  variant = "up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  variant?: "up" | "left" | "right" | "scale";
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cx(
        "reveal-base",
        variant === "left" && "from-left",
        variant === "right" && "from-right",
        variant === "scale" && "from-scale",
        inView && "is-in",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function Counter({ to, suffix = "", className }: { to: number; suffix?: string; className?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setVal(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const dur = 1800;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref} className={className}>
      {formatNum(val)}
      {suffix}
    </span>
  );
}

export function HazardStrip({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx("hazard-thin h-2 w-full opacity-80", className)} />;
}

export function StatusTag({ status }: { status: "disponivel" | "reservada" | "vendida" }) {
  const map = {
    disponivel: { label: "Em estoque", cls: "bg-agri-500/15 text-agri-300 border-agri-500/40" },
    reservada: { label: "Reservada", cls: "bg-hz-400/10 text-hz-300 border-hz-500/40" },
    vendida: { label: "Esgotada", cls: "bg-safety-500/10 text-safety-400 border-safety-500/40" },
  } as const;
  const s = map[status];
  return (
    <span className={cx("inline-flex items-center gap-1.5 border px-2.5 py-1 font-cond text-[12px] font-semibold uppercase tracking-[0.18em]", s.cls)}>
      <span className={cx("h-1.5 w-1.5", status === "disponivel" ? "bg-agri-400" : status === "reservada" ? "bg-hz-400" : "bg-safety-500")} />
      {s.label}
    </span>
  );
}
