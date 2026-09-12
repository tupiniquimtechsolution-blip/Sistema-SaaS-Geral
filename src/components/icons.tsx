/* ============================================================
   ICONOGRAFIA PRÓPRIA — traço 1.7, cantos orgânicos.
   Desenhada para a plataforma; nada de biblioteca genérica.
   ============================================================ */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...props }: P) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export const IBasket = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 9.5h15l-1.2 9a2 2 0 0 1-2 1.7H7.7a2 2 0 0 1-2-1.7l-1.2-9Z" />
    <path d="M8.5 9.5 12 3.5l3.5 6" />
    <path d="M9.5 13v3.5M14.5 13v3.5" />
  </svg>
);

export const ILoaf = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 13.2c0-3.4 3.6-5.7 8-5.7s8 2.3 8 5.7c0 1.2-.4 2.1-1.1 2.7v.8a1.6 1.6 0 0 1-1.6 1.6H6.7A1.6 1.6 0 0 1 5.1 16.7v-.8C4.4 15.3 4 14.4 4 13.2Z" />
    <path d="M8.6 9.4c.9 1 1.3 2.2 1.2 3.6M12.6 9c.9 1 1.3 2.4 1.2 4M16.4 9.6c.8.9 1.1 2 1 3.2" />
  </svg>
);

export const ICroissant = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 7.5c-3.6 0-7 2.4-8.4 5.7-.4 1 .1 2 1.1 2.3 1.4.5 2.7.2 3.7-.8.8 1 2 1.7 3.6 1.7s2.8-.7 3.6-1.7c1 1 2.3 1.3 3.7.8 1-.3 1.5-1.3 1.1-2.3C19 9.9 15.6 7.5 12 7.5Z" />
    <path d="M10 8.3c-.4 1.4-.4 2.9 0 4.4M14 8.3c.4 1.4.4 2.9 0 4.4" />
  </svg>
);

export const ICoffee = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 10h11v6.2A3.8 3.8 0 0 1 12.2 20H8.8A3.8 3.8 0 0 1 5 16.2V10Z" />
    <path d="M16 11h1.6a2.4 2.4 0 0 1 0 4.8H16M8 6.8c0-.9.9-1 .9-1.8M11.4 6.8c0-.9.9-1 .9-1.8" />
  </svg>
);

export const IFlame = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5c.6 2.8 2.3 4 3.7 5.6 1.3 1.5 2.3 3 2.3 5a6 6 0 0 1-12 0c0-2.4 1.2-4 2.5-5.6.5 1 1 1.6 1.8 2.2-.4-2.6.4-5.4 1.7-7.2Z" />
    <path d="M12 20a2.6 2.6 0 0 1-2.6-2.6c0-1.5 1.3-2.4 2.6-3.9 1.3 1.5 2.6 2.4 2.6 3.9A2.6 2.6 0 0 1 12 20Z" />
  </svg>
);

export const IBike = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="16.5" r="3.2" />
    <circle cx="18" cy="16.5" r="3.2" />
    <path d="M6 16.5 9 9.5h4.2l3 7M13.2 9.5 12 6.5h-2.4M14.5 6.5h2.2" />
  </svg>
);

export const IBag = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.5 8h13l-.9 11a2 2 0 0 1-2 1.8H8.4a2 2 0 0 1-2-1.8L5.5 8Z" />
    <path d="M9 10V6.8a3 3 0 0 1 6 0V10" />
  </svg>
);

export const IClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.2" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-6.6-5.4-6.6-10.4a6.6 6.6 0 0 1 13.2 0C18.6 15.6 12 21 12 21Z" />
    <circle cx="12" cy="10.4" r="2.4" />
  </svg>
);

export const IPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M7.8 4.5c.6 0 1.2.4 1.4 1l.8 2.1c.2.6 0 1.3-.5 1.7l-1.1.9a12.6 12.6 0 0 0 5.4 5.4l.9-1.1c.4-.5 1.1-.7 1.7-.5l2.1.8c.6.2 1 .8 1 1.4v2.3c0 .9-.7 1.6-1.6 1.5C10.5 19.4 4.6 13.5 4 6.1c-.1-.9.6-1.6 1.5-1.6h2.3Z" />
  </svg>
);

export const IWhatsApp = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.8a8.1 8.1 0 0 0-7 12.2L4 20l4.1-1A8.1 8.1 0 1 0 12 3.8Z" />
    <path d="M9 8.7c-.3 2.7 3.6 6.6 6.3 6.3l.7-1.5-2-1.2-.9.9c-1-.5-1.7-1.2-2.2-2.2l.9-.9-1.2-2L9 8.7Z" strokeWidth="1.4" />
  </svg>
);

export const IStar = ({ filled = true, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)} fill={filled ? "currentColor" : "none"} strokeWidth={filled ? 0 : 1.6}>
    <path d="M12 3.6l2.4 5 5.5.7-4 3.8 1 5.4-4.9-2.7-4.9 2.7 1-5.4-4-3.8 5.5-.7 2.4-5Z" />
  </svg>
);

export const IPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);

export const IMinus = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.5 12h13" />
  </svg>
);

export const IArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
);

export const ISearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m19.5 19.5-3.8-3.8" />
  </svg>
);

export const IFilter = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 7h15M7.5 12h9M10.5 17h3" />
  </svg>
);

export const IClose = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const ICheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const ITrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M5.5 7h13M9.5 7V5.4a1.4 1.4 0 0 1 1.4-1.4h2.2a1.4 1.4 0 0 1 1.4 1.4V7M7 7l.8 11.6a1.6 1.6 0 0 0 1.6 1.4h5.2a1.6 1.6 0 0 0 1.6-1.4L17 7M10.2 10.5v6M13.8 10.5v6" />
  </svg>
);

export const IChevron = (p: P) => (
  <svg {...base(p)}>
    <path d="m8.5 5.5 6.5 6.5-6.5 6.5" />
  </svg>
);

export const ILeaf = (p: P) => (
  <svg {...base(p)}>
    <path d="M18.5 5.5c-7 0-12 3.5-12 9.5 0 2 .8 3.5 2 4.5 5.5 0 10-3 10-9 0-1.8-.4-3.6 0-5Z" />
    <path d="M6.5 19.5c2-4.5 5.5-8 10-10.5" />
  </svg>
);

export const ICalendar = (p: P) => (
  <svg {...base(p)}>
    <rect x="4.5" y="6" width="15" height="14" rx="2" />
    <path d="M4.5 10.5h15M8.5 4v3.5M15.5 4v3.5" />
  </svg>
);

export const ICard = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="6" width="17" height="12.5" rx="2" />
    <path d="M3.5 10h17M7 14.5h4" />
  </svg>
);

export const IPix = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 20.5 12 12 20.5 3.5 12 12 3.5Z" />
    <path d="M8.5 10 10.4 8.1a2.2 2.2 0 0 1 3.2 0l.4.4.4-.4a2.2 2.2 0 0 1 3.2 0l-1.4 3.9-2.6 2.6-2.6-2.6L8.5 10Z" strokeWidth="1.3" />
  </svg>
);

export const ICash = (p: P) => (
  <svg {...base(p)}>
    <rect x="3.5" y="7" width="17" height="10.5" rx="1.8" />
    <circle cx="12" cy="12.2" r="2.4" />
    <path d="M6.5 10v.01M17.5 14.5v.01" />
  </svg>
);

export const INote = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 4.5h12a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.5 18V6A1.5 1.5 0 0 1 6 4.5Z" />
    <path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" />
  </svg>
);

export const IInstagram = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="16" rx="4.5" />
    <circle cx="12" cy="12" r="3.6" />
    <path d="M16.8 7.2v.01" strokeWidth="2.4" />
  </svg>
);

export const IFacebook = (p: P) => (
  <svg {...base(p)}>
    <path d="M14.5 8.5H16.5V5.5h-2a3.5 3.5 0 0 0-3.5 3.5v2h-2v3h2v6h3v-6h2.5l.5-3h-3v-2a1 1 0 0 1 1-1Z" />
  </svg>
);

export const IWheat = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 20.5V9" />
    <path d="M12 12c-2.6 0-4-1.7-4.2-4.2C10.4 7.9 11.8 9.4 12 12ZM12 12c2.6 0 4-1.7 4.2-4.2C13.6 7.9 12.2 9.4 12 12ZM12 16.2c-2.6 0-4-1.7-4.2-4.2 2.6.1 4 1.6 4.2 4.2ZM12 16.2c2.6 0 4-1.7 4.2-4.2-2.6.1-4 1.6-4.2 4.2ZM12 9c-1-2-1-4 0-5.5 1 1.5 1 3.5 0 5.5Z" />
  </svg>
);

export const ISpark = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6Z" />
    <path d="M18.5 15.5c.3 1.7 1 2.4 2.5 2.7-1.5.3-2.2 1-2.5 2.7-.3-1.7-1-2.4-2.5-2.7 1.5-.3 2.2-1 2.5-2.7Z" strokeWidth="1.3" />
  </svg>
);

export const IRoute = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="18.5" r="2" />
    <circle cx="18" cy="5.5" r="2" />
    <path d="M8 18.5h7a3.5 3.5 0 0 0 0-7H9.5a3.25 3.25 0 0 1 0-6.5H16" strokeDasharray="1 3" />
  </svg>
);

export const IOven = (p: P) => (
  <svg {...base(p)}>
    <path d="M4.5 19.5v-8.2a7.5 7.5 0 0 1 15 0v8.2" />
    <path d="M3.5 19.5h17M8 19.5v-4.8a4 4 0 0 1 8 0v4.8" />
    <path d="M12 8.5c1.6 1.6 1.2 3-.2 4.1" strokeWidth="1.3" />
  </svg>
);

export const IUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5.5 19.5c.8-3.4 3.4-5.2 6.5-5.2s5.7 1.8 6.5 5.2" />
  </svg>
);

export const IAlert = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 4.5 21 19.5H3L12 4.5Z" />
    <path d="M12 10v4M12 16.8v.01" />
  </svg>
);
