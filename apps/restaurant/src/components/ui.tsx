import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";

/** Ícone de cloche (serviço à francesa) — desenho próprio em SVG */
export function ClocheIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8Z" />
      <path d="M2.5 16.5h19" />
      <path d="M12 5V3.5" />
      <circle cx="12" cy="3" r="0.9" fill="currentColor" stroke="none" />
      <path d="M5 19.5h14" />
    </svg>
  );
}

/* ============================================================
   Motion system nativo — sem dependências externas.
   Scroll reveal (IntersectionObserver), parallax (rAF),
   contadores e letreiro. Tudo respeita prefers-reduced-motion.
   ============================================================ */

/** Detecta prefers-reduced-motion reativamente */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

/** Observa a entrada do elemento no viewport (uma única vez) */
export function useInViewOnce<T extends Element>(margin = "-60px"): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [margin, inView]);
  return [ref, inView];
}

/** Scroll reveal — fade + translate + blur, com delay configurável */
export function ScrollReveal({
  children,
  delay = 0,
  y = 28,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduce = usePrefersReducedMotion();
  const [ref, inView] = useInViewOnce<HTMLDivElement>();
  const shown = reduce || inView;
  return (
    <div
      ref={ref}
      className={`reveal ${shown ? "is-in" : ""} ${className}`}
      style={{ "--reveal-y": `${y}px`, transitionDelay: `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/** Parallax suave via requestAnimationFrame (GPU-friendly) */
export function Parallax({
  speed = 0.12,
  className = "",
  children,
}: {
  speed?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const center = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed, reduce]);

  return (
    <div className={className}>
      <div ref={ref} className={reduce ? undefined : "will-change-transform"}>
        {children}
      </div>
    </div>
  );
}

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[11px] uppercase tracking-[0.32em] text-ember sm:text-xs ${className}`}>
      <span aria-hidden className="mr-2 inline-block h-[2px] w-6 bg-ember align-middle" />
      {children}
    </p>
  );
}

export function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
  light = false,
}: {
  kicker: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <ScrollReveal>
        <Kicker>{kicker}</Kicker>
      </ScrollReveal>
      <ScrollReveal delay={0.08}>
        <h2
          className={`display-tight mt-4 font-display text-4xl uppercase sm:text-5xl lg:text-6xl ${
            light ? "text-bg" : "text-cream"
          }`}
        >
          {title}
        </h2>
      </ScrollReveal>
      {description && (
        <ScrollReveal delay={0.16}>
          <p className={`mt-5 text-base leading-relaxed sm:text-lg ${light ? "text-bg/70" : "text-sand"}`}>{description}</p>
        </ScrollReveal>
      )}
    </div>
  );
}

/** Contador animado (rAF) que respeita prefers-reduced-motion */
export function AnimatedCounter({
  value,
  suffix = "",
  decimals = 0,
  className = "",
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const [ref, inView] = useInViewOnce<HTMLSpanElement>("-40px");
  const reduce = usePrefersReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1600;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduce]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals).replace(".", ",")
      : Math.round(display).toLocaleString("pt-BR");

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
    </span>
  );
}

/** Letreiro contínuo (marquee) — CSS puro, pausa no hover */
export function Marquee({ items, className = "", speed = 28 }: { items: string[]; className?: string; speed?: number }) {
  const row = (ariaHidden: boolean) => (
    <div aria-hidden={ariaHidden || undefined} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-5 font-display text-sm uppercase tracking-[0.18em] text-cream/85 sm:text-base">{item}</span>
          <ClocheIcon size={14} className="text-ember" />
        </span>
      ))}
    </div>
  );
  return (
    <div
      className={`marquee-paused overflow-hidden border-y border-line bg-panel py-3 ${className}`}
      style={{ "--marquee-speed": `${speed}s` } as CSSProperties}
      role="presentation"
    >
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/**
 * Logo — reconstrução fiel do wordmark "CHEZ Amis" da identidade
 * oficial (lettering + script manuscrito, como no Instagram/Google),
 * acompanhada da cloche de serviço à francesa. Substituir pelo
 * arquivo oficial em public/client-assets/logo/ quando disponível.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#/" className="group flex items-center gap-3" aria-label="Chez Amis Bistrô — início">
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ember/60 bg-panel text-ember transition-transform duration-300 group-hover:-rotate-6">
        <ClocheIcon size={20} />
      </span>
      <span className="leading-none">
        <span className="flex items-baseline gap-1.5">
          <span className="font-display text-[13px] font-semibold uppercase tracking-[0.32em] text-cream">Chez</span>
          <span className="font-wordmark pt-0.5 text-[30px] leading-none text-ember transition-colors duration-300 group-hover:text-gold">
            Amis
          </span>
        </span>
        {!compact && (
          <span className="mt-1.5 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.32em] text-sand">
            Bistrô
            <span aria-hidden className="text-[7px] text-ember/80">
              ✦
            </span>
            Café
            <span aria-hidden className="text-[7px] text-ember/80">
              ✦
            </span>
            Bar
          </span>
        )}
      </span>
    </a>
  );
}
