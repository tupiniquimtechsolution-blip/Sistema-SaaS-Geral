import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/* ---------------- preferências do usuário ---------------- */

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches;

/* ---------------- smooth scroll (Lenis + ScrollTrigger) ---------------- */

let lenis: Lenis | null = null;

export function initSmoothScroll() {
  if (lenis || prefersReduced()) return () => {};
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on("scroll", () => ScrollTrigger.update());
  const raf = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(raf);
    lenis?.destroy();
    lenis = null;
  };
}

export function scrollToEl(target: string | number, offset = -72) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.1 });
    return;
  }
  if (typeof target === "string") {
    document
      .querySelector(target)
      ?.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth" });
  } else {
    window.scrollTo({ top: target, behavior: prefersReduced() ? "auto" : "smooth" });
  }
}

export function stopSmooth() {
  lenis?.stop();
}
export function startSmooth() {
  lenis?.start();
}

/** Vai ao topo imediatamente (sem animação) — usado na troca de rotas */
export function jumpToTop() {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true });
  } else {
    window.scrollTo(0, 0);
  }
  // garante mesmo com animação nativa em andamento
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function refreshTriggers(delay = 120) {
  window.setTimeout(() => ScrollTrigger.refresh(), delay);
}

/* ---------------- reveal on scroll ---------------- */

export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    });
    return () => ctx.revert();
  }, [delay, y]);
  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

/* ---------------- máscara de linhas para headlines ---------------- */

export function MaskLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.11,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inner = el.querySelectorAll<HTMLElement>("[data-line]");
    if (prefersReduced()) {
      gsap.set(inner, { y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { y: "112%" },
        {
          y: 0,
          duration: 1,
          delay,
          stagger,
          ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        }
      );
    });
    return () => ctx.revert();
  }, [delay, stagger, lines.length]);
  return (
    <div ref={ref} className={className}>
      {lines.map((l, i) => (
        <span key={i} className={`block overflow-hidden ${lineClassName ?? ""}`}>
          <span data-line className="block will-change-transform">
            {l}
          </span>
        </span>
      ))}
    </div>
  );
}

/* ---------------- scramble / decode ---------------- */

const SCRAMBLE_CHARS = "▮#/\\<>_-=+0123456789METAL";

export function useScramble(text: string, startDelay = 0) {
  const [out, setOut] = useState(() => (prefersReduced() ? text : ""));
  useEffect(() => {
    if (prefersReduced()) {
      setOut(text);
      return;
    }
    let frame = 0;
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        frame += 1;
        const reveal = Math.floor(frame / 2);
        const next = text
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (i < reveal) return ch;
            return SCRAMBLE_CHARS[
              Math.floor(Math.random() * SCRAMBLE_CHARS.length)
            ];
          })
          .join("");
        setOut(next);
        if (reveal >= text.length && interval) window.clearInterval(interval);
      }, 34);
    }, startDelay);
    return () => {
      window.clearTimeout(timeout);
      if (interval) window.clearInterval(interval);
    };
  }, [text, startDelay]);
  return out;
}

/* ---------------- parallax simples de imagem ---------------- */

export function useParallax<T extends HTMLElement>(strength = 40) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: -strength },
        {
          y: strength,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        }
      );
    });
    return () => ctx.revert();
  }, [strength]);
  return ref;
}

/* ---------------- campo de faíscas (canvas) ---------------- */

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
};

export function SparkField({
  className,
  density = 22,
}: {
  className?: string;
  density?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReduced()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const sparks: Spark[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      sparks.push({
        x: Math.random() * w,
        y: h + 8,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -(0.25 + Math.random() * 0.7),
        life: 0,
        maxLife: 120 + Math.random() * 160,
        size: 0.7 + Math.random() * 1.7,
        hue: 22 + Math.random() * 22,
      });
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, w, h);
      if (sparks.length < density && Math.random() < 0.35) spawn();
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += 1;
        s.x += s.vx + Math.sin(s.life * 0.05) * 0.18;
        s.y += s.vy;
        s.vy *= 0.998;
        const p = s.life / s.maxLife;
        if (p >= 1 || s.y < -10) {
          sparks.splice(i, 1);
          continue;
        }
        const alpha = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${s.hue}, 95%, ${58 + (1 - p) * 12}%, ${alpha * 0.85})`;
        ctx.arc(s.x, s.y, s.size * (1 - p * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(tick);

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density]);

  if (prefersReduced()) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? "pointer-events-none absolute inset-0 h-full w-full"}
    />
  );
}

/* ---------------- WhatsApp + analytics + helpers ---------------- */

export function waLink(digits: string, message: string) {
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function track(event: string, data?: Record<string, unknown>) {
  const w = window as unknown as { dataLayer?: unknown[] };
  (w.dataLayer ??= []).push({ event, ...(data ?? {}), ts: Date.now() });
}

export function cn(
  ...c: Array<string | false | null | undefined>
): string {
  return c.filter(Boolean).join(" ");
}
