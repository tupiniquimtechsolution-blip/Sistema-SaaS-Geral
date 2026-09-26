import { useState } from "react";
import { logoRoundUrl } from "../data/media";

/** Ornamentos SVG autorais — folhas, flechas, estrelas, divisores e o selo. */

/**
 * Logo OFICIAL redondo do templo (imagem enviada pela casa).
 * Se o Drive não carregar, cai no selo vetorial sem quebrar o layout.
 */
export function LogoCircle({
  size = 56,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <TempleSeal size={size} />;
  return (
    <img
      src={logoRoundUrl}
      alt="Logo oficial do Templo de Umbanda Caboclo Tupinambá e Flecha Dourada"
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full object-cover shadow-[0_6px_18px_-8px_rgba(23,79,50,0.45)] ring-1 ring-gold-500/50 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
import type { CSSProperties } from "react";

export function GoldStar({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 1.5c.9 4.9 2.4 7.6 3.4 8.6 1 1 3.7 2.5 8.6 3.4-4.9.9-7.6 2.4-8.6 3.4-1 1-2.5 3.7-3.4 8.6-.9-4.9-2.4-7.6-3.4-8.6-1-1-3.7-2.5-8.6-3.4 4.9-.9 7.6-2.4 8.6-3.4 1-1 2.5-3.7 3.4-8.6z" />
    </svg>
  );
}

export function GoldArrow({
  dir = "right",
  size = 18,
  className = "",
  strokeWidth = 1.8,
}: {
  dir?: "right" | "down" | "up";
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const rotate = dir === "down" ? 90 : dir === "up" ? -90 : 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      aria-hidden
    >
      <path d="M3 12h17" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

/** folha em formato de lente, com nervura */
export function Leaf({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 40 20" className={className} style={style} aria-hidden>
      <path
        d="M1 10 Q 20 -2 39 10 Q 20 22 1 10 Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M3 10 Q 20 7 37 10"
        fill="none"
        stroke="var(--color-cream)"
        strokeWidth="1"
        opacity="0.5"
      />
    </svg>
  );
}

/** ramo botânico — caule curvo com folhas, inspirado nas aquarelas */
export function LeafSprig({
  className = "",
  color = "var(--color-forest-300)",
  opacity = 0.5,
  flip = false,
}: {
  className?: string;
  color?: string;
  opacity?: number;
  flip?: boolean;
}) {
  const leaves = [
    { x: 4, y: 88, r: -38, s: 0.6 },
    { x: 10, y: 70, r: -52, s: 0.75 },
    { x: 18, y: 52, r: -64, s: 0.85 },
    { x: 28, y: 36, r: -72, s: 0.95 },
    { x: 40, y: 22, r: -78, s: 1.05 },
    { x: 16, y: 62, r: 128, s: 0.7 },
    { x: 26, y: 46, r: 122, s: 0.8 },
    { x: 38, y: 30, r: 116, s: 0.9 },
  ];
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ color, opacity, transform: flip ? "scaleX(-1)" : undefined }}
      fill="none"
      aria-hidden
    >
      <path
        d="M6 96 Q 20 60 52 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})`}>
          <path d="M0 0 Q 14 -7 28 0 Q 14 7 0 0 Z" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

/** canto botânico para emoldurar seções e cards */
export function BotanicalCorner({
  className = "",
  color = "var(--color-gold-500)",
  opacity = 0.55,
}: {
  className?: string;
  color?: string;
  opacity?: number;
}) {
  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden>
      <LeafSprig color={color} opacity={opacity} className="h-20 w-20" />
    </div>
  );
}

/** divisor: linha dourada — estrela — folha — estrela — linha */
export function BotanicalDivider({
  className = "",
  tone = "var(--color-gold-500)",
}: {
  className?: string;
  tone?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-3 ${className}`}
      style={{ color: tone }}
      aria-hidden
    >
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-current opacity-60 sm:w-20" />
      <GoldStar size={10} className="opacity-70" />
      <Leaf className="w-8 opacity-80" />
      <GoldStar size={10} className="opacity-70" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-current opacity-60 sm:w-20" />
    </div>
  );
}

/** selo circular turquesa/dourado com flechas cruzadas — sem texto cortado */
export function TempleSeal({ size = 72 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      aria-label="Selo do Templo de Umbanda Caboclo Tupinambá e Flecha Dourada"
    >
      <circle cx="40" cy="40" r="37" fill="var(--color-forest-950)" />
      <circle
        cx="40"
        cy="40"
        r="37"
        stroke="var(--color-gold-500)"
        strokeWidth="2"
      />
      <circle
        cx="40"
        cy="40"
        r="32.5"
        stroke="var(--color-gold-300)"
        strokeWidth="0.8"
        strokeDasharray="2.5 3.5"
        opacity="0.8"
      />
      {/* flechas cruzadas */}
      <g stroke="var(--color-gold-300)" strokeWidth="1.7" strokeLinecap="round">
        <path d="M22 58 L54 26" />
        <path d="M58 58 L26 26" />
      </g>
      {/* pontas das flechas */}
      <g fill="var(--color-gold-300)">
        <path d="M54 26 l-7 1.5 5.5 5.5 z" />
        <path d="M26 26 l7 1.5 -5.5 5.5 z" />
        <path d="M22 58 l1.5 -7 5.5 5.5 z" opacity="0" />
        <path d="M58 58 l-1.5 -7 -5.5 5.5 z" opacity="0" />
      </g>
      {/* penas nas hastes */}
      <g stroke="var(--color-teal)" strokeWidth="1.3" strokeLinecap="round" opacity="0.9">
        <path d="M27 53 l-4 -2 M30 50 l-4 -2" />
        <path d="M53 53 l4 -2 M50 50 l4 -2" />
      </g>
      {/* estrela no topo */}
      <path
        d="M40 14.5l1.4 3.4 3.6.4-2.7 2.4.8 3.6-3.1-1.9-3.1 1.9.8-3.6-2.7-2.4 3.6-.4z"
        fill="var(--color-gold-500)"
      />
      {/* folhinhas na base */}
      <path
        d="M32 62 Q 40 56 48 62 Q 40 66 32 62 Z"
        fill="var(--color-forest-600)"
      />
      <path d="M40 58 v6" stroke="var(--color-forest-600)" strokeWidth="1.2" />
    </svg>
  );
}
