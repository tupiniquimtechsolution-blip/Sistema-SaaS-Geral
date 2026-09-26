import type { ReactNode } from "react";
import { useReveal } from "../hooks";
import { GoldArrow, GoldStar } from "./Ornaments";

/* ---------- revelação no scroll ---------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "figure" | "li" | "article";
}) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      className={`${className} transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        inView ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ---------- títulos de seção ---------- */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
  className = "",
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  light?: boolean;
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "text-center" : "text-left"} ${className}`}>
      <p
        className={`mb-3 flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-[0.3em] ${
          centered ? "justify-center" : ""
        } ${light ? "text-gold-300" : "text-gold-700"}`}
      >
        <GoldStar size={10} />
        {eyebrow}
        <GoldStar size={10} />
      </p>
      <h2
        className={`font-display text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl ${
          light ? "text-cream" : "text-forest-950"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mx-auto mt-4 max-w-2xl font-body text-[15px] leading-relaxed sm:text-base ${
            light ? "text-mint-200/80" : "text-sage"
          } ${centered ? "" : "mx-0"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ---------- botões ---------- */
export function TempleButton({
  children,
  variant = "primary",
  href,
  onClick,
  external = false,
  arrow = false,
  className = "",
  type,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "gold" | "light";
  href?: string;
  onClick?: () => void;
  external?: boolean;
  arrow?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "group inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 font-body text-[13px] font-semibold tracking-[0.08em] transition-all duration-300";
  const styles = {
    primary:
      "bg-forest-950 text-cream shadow-[0_10px_30px_-10px_rgba(23,79,50,0.55)] hover:-translate-y-0.5 hover:bg-forest-800 hover:shadow-[0_16px_36px_-10px_rgba(23,79,50,0.6)]",
    secondary:
      "border border-forest-950/40 bg-transparent text-forest-950 hover:-translate-y-0.5 hover:border-forest-950 hover:bg-forest-950/5",
    gold: "border border-gold-500/60 bg-gold-500/10 text-gold-700 hover:-translate-y-0.5 hover:bg-gold-500/20 hover:border-gold-500",
    light:
      "bg-cream text-forest-950 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 hover:bg-white",
  } as const;

  const arrowEl = arrow && (
    <GoldArrow
      size={16}
      className="transition-transform duration-300 group-hover:translate-x-1"
    />
  );

  const content = (
    <>
      {children}
      {arrowEl}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className={`${base} ${styles[variant]} ${className}`}
      >
        {content}
      </a>
    );
  }
  return (
    <button type={type ?? "button"} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {content}
    </button>
  );
}

/* ---------- badge de tipo de evento ---------- */
export function EventBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    gira: {
      label: "Gira",
      cls: "bg-forest-950 text-gold-300 border-gold-500/50",
    },
    festa: {
      label: "Festa",
      cls: "bg-forest-950 text-gold-300 border-gold-500/50",
    },
    consulta: {
      label: "Consulta",
      cls: "bg-mulambo text-cream border-mulambo/60",
    },
    desenvolvimento: {
      label: "Atividade interna",
      cls: "bg-mint-100 text-forest-800 border-forest-300",
    },
    outro: { label: "Evento", cls: "bg-mint-100 text-forest-800 border-forest-300" },
  };
  const m = map[type] ?? map.outro;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.14em] ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
