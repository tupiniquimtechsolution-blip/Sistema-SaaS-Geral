/* Iconografia própria da plataforma — traço 1.8, cantos arredondados, desenhada à mão */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 22, ...rest }: P) {
  return {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    "aria-hidden": true, ...rest,
  };
}

export const IPaw = (p: P) => (
  <svg {...base(p)}>
    <ellipse cx="12" cy="15.2" rx="4.6" ry="3.8" fill="currentColor" stroke="none" />
    <ellipse cx="5.6" cy="10.6" rx="2" ry="2.5" fill="currentColor" stroke="none" transform="rotate(-16 5.6 10.6)" />
    <ellipse cx="18.4" cy="10.6" rx="2" ry="2.5" fill="currentColor" stroke="none" transform="rotate(16 18.4 10.6)" />
    <ellipse cx="9.4" cy="6.4" rx="2" ry="2.5" fill="currentColor" stroke="none" transform="rotate(-5 9.4 6.4)" />
    <ellipse cx="14.6" cy="6.4" rx="2" ry="2.5" fill="currentColor" stroke="none" transform="rotate(5 14.6 6.4)" />
  </svg>
);
export const IBath = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Z" />
    <path d="M6 12V6.5A2.5 2.5 0 0 1 8.5 4c1.2 0 2.2.9 2.4 2" />
    <path d="M7 19.5 6 21m11-1.5L18 21" />
    <path d="M13.5 7.5c.4.8.4 1.4 0 2.1m2.8-1.6c.4.8.4 1.4 0 2.1" />
  </svg>
);
export const IScissors = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6.5" cy="6.5" r="2.5" /><circle cx="6.5" cy="17.5" r="2.5" />
    <path d="M8.7 8 20 17M8.7 16 20 7" />
  </svg>
);
export const ISparkle = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6Z" fill="currentColor" stroke="none" />
    <path d="M18.5 15.5c.3 1.7 1 2.4 2.5 2.7-1.5.3-2.2 1-2.5 2.8-.3-1.8-1-2.5-2.5-2.8 1.5-.3 2.2-1 2.5-2.7Z" fill="currentColor" stroke="none" />
  </svg>
);
export const ICalendar = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5" width="17" height="16" rx="3.5" />
    <path d="M3.5 10h17M8 3v4m8-4v4" />
    <circle cx="12" cy="15" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);
export const IClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />
  </svg>
);
export const IBag = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 8.5h14l-1 11a2 2 0 0 1-2 1.8H8a2 2 0 0 1-2-1.8l-1-11Z" />
    <path d="M8.5 11V7a3.5 3.5 0 0 1 7 0v4" />
  </svg>
);
export const ICart = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 4.5h2.2l2.1 10.6a1.8 1.8 0 0 0 1.8 1.4h7.6a1.8 1.8 0 0 0 1.8-1.4L20.5 8H6.3" />
    <circle cx="10" cy="20" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);
export const IHeart = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20s-7.5-4.6-8.7-9.6C2.5 7 4.6 4.5 7.4 4.5c2 0 3.4 1 4.6 2.8 1.2-1.8 2.6-2.8 4.6-2.8 2.8 0 4.9 2.5 4.1 5.9C19.5 15.4 12 20 12 20Z" />
  </svg>
);
export const IStar = (p: P) => (
  <svg {...base(p)}>
    <path d="m12 3.6 2.5 5.2 5.7.7-4.2 4 1.1 5.6L12 16.4l-5.1 2.7L8 13.5l-4.2-4 5.7-.7L12 3.6Z" fill="currentColor" stroke="none" />
  </svg>
);
export const ISearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" />
  </svg>
);
export const IUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" /><path d="M4.5 20c1.3-3.4 4.1-5 7.5-5s6.2 1.6 7.5 5" />
  </svg>
);
export const IMenu = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h10" /></svg>
);
export const IX = (p: P) => (
  <svg {...base(p)}><path d="m6 6 12 12M18 6 6 18" /></svg>
);
export const IPlus = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IMinus = (p: P) => (
  <svg {...base(p)}><path d="M5 12h14" /></svg>
);
export const ICheck = (p: P) => (
  <svg {...base(p)}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const IChevron = (p: P) => (
  <svg {...base(p)}><path d="m9 5 7 7-7 7" /></svg>
);
export const IArrow = (p: P) => (
  <svg {...base(p)}><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
);
export const IWhatsApp = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.8a8.2 8.2 0 0 0-7 12.4L4 20l3.9-1A8.2 8.2 0 1 0 12 3.8Z" />
    <path d="M9 8.7c-.4 1.9 2.6 6.1 5.5 6.3.9 0 1.8-.7 1.8-1.5l-1.9-1.2-1.2.9c-.9-.3-2-1.5-2.2-2.3l.9-1.1L10.6 8l-1.6.7Z" fill="currentColor" stroke="none" />
  </svg>
);
export const IPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-6.8-5.4-6.8-11A6.8 6.8 0 0 1 12 3.2 6.8 6.8 0 0 1 18.8 10c0 5.6-6.8 11-6.8 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>
);
export const IPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 3.8h3l1.4 4-2.2 1.6a12.4 12.4 0 0 0 5.4 5.4l1.6-2.2 4 1.4v3a2 2 0 0 1-2.1 2A15.6 15.6 0 0 1 5 7 15 15 0 0 1 5 5.9 2 2 0 0 1 7 3.8Z" />
  </svg>
);
export const ITruck = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 6.5h11v10H3zM14 10h4.2l2.8 3.2v3.3H14" />
    <circle cx="7" cy="17.8" r="1.9" /><circle cx="17" cy="17.8" r="1.9" />
  </svg>
);
export const IStore = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 9.5 5.4 4h13.2L20 9.5M4.8 9.5V20h14.4V9.5" />
    <path d="M4 9.5c0 1.5 1.3 2.8 2.9 2.8 1.5 0 2.7-1.3 2.7-2.8 0 1.5 1.2 2.8 2.7 2.8 1.6 0 2.8-1.3 2.8-2.8 0 1.5 1.2 2.8 2.7 2.8 1.6 0 2.9-1.3 2.9-2.8" />
    <path d="M9.5 20v-5.5h5V20" />
  </svg>
);
export const ITag = (p: P) => (
  <svg {...base(p)}>
    <path d="m12.6 3.5 7.9 7.9a2 2 0 0 1 0 2.8l-6.3 6.3a2 2 0 0 1-2.8 0l-7.9-7.9V5.5a2 2 0 0 1 2-2h7.1Z" />
    <circle cx="8.2" cy="8.2" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);
export const IBall = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" /><path d="M5 6.8c4 2.6 10 2.6 14 0M5 17.2c4-2.6 10-2.6 14 0" />
  </svg>
);
export const IFilter = (p: P) => (
  <svg {...base(p)}><path d="M4 7h16M7 12h10m-7 5h4" /></svg>
);
export const IEdit = (p: P) => (
  <svg {...base(p)}>
    <path d="m14.5 5.5 4 4L8 20H4v-4L14.5 5.5Z" /><path d="m12.5 7.5 4 4" />
  </svg>
);
export const ITrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 7h14M10 7V5h4v2m-7.5 0 .8 12a1.8 1.8 0 0 0 1.8 1.7h5.8a1.8 1.8 0 0 0 1.8-1.7l.8-12" />
  </svg>
);
export const IShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 19 6v6c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6l7-2.5Z" />
    <path d="m9 11.8 2.2 2.2L15.5 9.5" />
  </svg>
);
export const IDrop = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5S6 10 6 14.4a6 6 0 0 0 12 0C18 10 12 3.5 12 3.5Z" />
    <path d="M9.5 14.5a2.5 2.5 0 0 0 2 2.4" />
  </svg>
);
export const IRefresh = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 12a7.5 7.5 0 0 1 13-5.1L20 9.5m0-5v5h-5M19.5 12a7.5 7.5 0 0 1-13 5.1L4 14.5m0 5v-5h5" />
  </svg>
);
export const ICard = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="M3.5 10h17M7 14.5h4" />
  </svg>
);
export const IPix = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 20.5 12 12 20.5 3.5 12 12 3.5Z" />
    <path d="M8.5 12 12 8.5 15.5 12 12 15.5 8.5 12Z" fill="currentColor" stroke="none" />
  </svg>
);
export const IKibble = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 4h10l1.5 4H5.5L7 4Z" /><path d="M5.5 8h13L19.5 19a1.8 1.8 0 0 1-1.8 2H6.3a1.8 1.8 0 0 1-1.8-2L5.5 8Z" />
    <path d="M9.5 13h.01m2.5 2.5h.01m2.5-2.5h.01" strokeWidth="2.4" />
  </svg>
);
export const IBone = (p: P) => (
  <svg {...base(p)}>
    <path d="M8.5 8.5 6.8 6.8a2.1 2.1 0 1 0-3 3l1.7 1.7-1.7 1.7a2.1 2.1 0 1 0 3 3l1.7-1.7 7 7-1.7 1.7a2.1 2.1 0 1 0 3 3l1.7-1.7 1.7 1.7a2.1 2.1 0 1 0 3-3l-1.7-1.7 1.7-1.7a2.1 2.1 0 1 0-3-3l-1.7 1.7-7-7Z" transform="scale(0.82) translate(2.6 2.6)" />
  </svg>
);
export const ICat = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 9V4.5L8.5 7h7L19 4.5V9a7 7 0 0 1-14 0Z" />
    <path d="M9 11.5h.01m6 0h.01" strokeWidth="2.6" />
    <path d="M12 14.2c-.8 0-1.2.5-1.2 1 0 .7.6 1 1.2 1s1.2-.3 1.2-1c0-.5-.4-1-1.2-1Z" fill="currentColor" stroke="none" />
  </svg>
);
export const IBed = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 18v-4a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v4" />
    <path d="M3.5 18h17M5 11V8.5A1.5 1.5 0 0 1 6.5 7h4A1.5 1.5 0 0 1 12 8.5V11" />
  </svg>
);
export const ICollar = (p: P) => (
  <svg {...base(p)}>
    <ellipse cx="12" cy="10" rx="7.5" ry="5" />
    <path d="M12 15v2.5" /><circle cx="12" cy="19.2" r="1.8" />
  </svg>
);
export const IGift = (p: P) => (
  <svg {...base(p)}>
    <rect x="4.5" y="9" width="15" height="11" rx="2" /><path d="M4.5 12.5h15M12 9v11" />
    <path d="M12 9c-4.5 0-5.5-4.5-2.8-4.5C11.4 4.5 12 9 12 9Zm0 0c4.5 0 5.5-4.5 2.8-4.5C12.6 4.5 12 9 12 9Z" />
  </svg>
);
export const IInfo = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" /><path d="M12 11v5m0-8.5h.01" strokeWidth="2.2" />
  </svg>
);
export const IInstagram = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="16" rx="4.5" />
    <circle cx="12" cy="12" r="3.6" />
    <circle cx="16.8" cy="7.2" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);
export const IRoute = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="18" r="2.2" /><circle cx="18" cy="6" r="2.2" />
    <path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8" strokeDasharray="3.5 3" />
  </svg>
);
export const ILogo = ({ size = 34, ...rest }: P) => (
  <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden {...rest}>
    <path d="M64 14c-4 0-7 3-7 7v6c-18 4-30 17-30 35 0 22 16 40 37 40s37-18 37-40c0-18-12-31-30-35v-6c0-4-3-7-7-7z" fill="var(--t-brand)" />
    <circle cx="64" cy="26" r="5" fill="var(--t-cream)" />
    <ellipse cx="64" cy="80" rx="13" ry="11" fill="var(--t-cream)" />
    <ellipse cx="46" cy="64" rx="6.5" ry="8" fill="var(--t-cream)" transform="rotate(-18 46 64)" />
    <ellipse cx="82" cy="64" rx="6.5" ry="8" fill="var(--t-cream)" transform="rotate(18 82 64)" />
    <ellipse cx="54" cy="52" rx="6" ry="7.5" fill="var(--t-cream)" transform="rotate(-6 54 52)" />
    <ellipse cx="74" cy="52" rx="6" ry="7.5" fill="var(--t-cream)" transform="rotate(6 74 52)" />
  </svg>
);

/* Marcador de pegada (trilha) */
export const PawMark = ({ className = "", style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor" aria-hidden>
    <ellipse cx="12" cy="15.6" rx="4.8" ry="3.9" />
    <ellipse cx="5.4" cy="10.6" rx="2" ry="2.6" transform="rotate(-16 5.4 10.6)" />
    <ellipse cx="18.6" cy="10.6" rx="2" ry="2.6" transform="rotate(16 18.6 10.6)" />
    <ellipse cx="9.3" cy="6.2" rx="2" ry="2.6" transform="rotate(-5 9.3 6.2)" />
    <ellipse cx="14.7" cy="6.2" rx="2" ry="2.6" transform="rotate(5 14.7 6.2)" />
  </svg>
);
