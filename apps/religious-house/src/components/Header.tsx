import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { templeConfig } from "../data/templeConfig";
import { useScrolled } from "../hooks";
import { WHATSAPP_URL } from "../lib/calendar";
import { useBooking } from "./BookingModal";
import { GoldStar, LeafSprig, LogoCircle } from "./Ornaments";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/quem-somos", label: "Quem Somos" },
  { to: "/calendario", label: "Calendário" },
  { to: "/atendimentos", label: "Atendimentos" },
  { to: "/galeria", label: "Galeria" },
  { to: "/contato", label: "Contato" },
];

export default function Header() {
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);
  const { openBooking } = useBooking();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `gold-line relative py-1 font-body text-[13px] font-semibold tracking-[0.04em] transition-colors ${
      isActive ? "text-gold-700 is-drawn" : "text-forest-950/80 hover:text-forest-950"
    }`;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-gold-500/25 bg-cream/85 py-2.5 shadow-[0_8px_30px_-18px_rgba(23,79,50,0.35)] backdrop-blur-md"
            : "border-b border-transparent bg-transparent py-4"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 sm:px-6">
          <NavLink to="/" className="flex items-center gap-3" aria-label="Ir para o início">
            <LogoCircle size={scrolled ? 40 : 48} />
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="font-display text-[15px] font-semibold text-forest-950">
                Caboclo Tupinambá
              </span>
              <span className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-700">
                & Flecha Dourada
              </span>
            </span>
          </NavLink>

          <nav className="ml-auto hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === "/"} className={linkCls}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:ml-6">
            <button
              onClick={() => openBooking()}
              className="hidden rounded-full bg-forest-950 px-6 py-2.5 font-body text-[12px] font-semibold tracking-[0.08em] text-cream shadow-[0_8px_24px_-8px_rgba(23,79,50,0.5)] transition-all hover:-translate-y-0.5 hover:bg-forest-800 sm:inline-flex"
            >
              Agendar
            </button>
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              className="grid size-11 place-items-center rounded-full border border-forest-950/25 bg-cream/70 lg:hidden"
            >
              <span className="flex flex-col gap-[5px]">
                <span className="block h-[2px] w-5 bg-forest-950" />
                <span className="block h-[2px] w-3.5 self-end bg-gold-700" />
                <span className="block h-[2px] w-5 bg-forest-950" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* menu mobile fullscreen */}
      <div
        className={`fixed inset-0 z-[60] flex flex-col overflow-hidden bg-forest-950 transition-all duration-500 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="absolute -right-16 -top-16 opacity-20" aria-hidden>
          <LeafSprig color="var(--color-gold-300)" className="h-72 w-72" flip />
        </div>
        <div className="absolute -bottom-20 -left-16 opacity-15" aria-hidden>
          <LeafSprig color="var(--color-forest-300)" className="h-80 w-80" />
        </div>

        <div className="flex items-center justify-between px-5 py-4">
          <span className="flex items-center gap-3">
            <LogoCircle size={46} />
            <span className="font-display text-base font-semibold text-cream">
              Caboclo Tupinambá
            </span>
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
            className="grid size-11 place-items-center rounded-full border border-gold-500/40 text-gold-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="relative z-10 mt-6 flex flex-1 flex-col gap-1 px-8" aria-label="Menu mobile">
          {NAV.map((n, i) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${120 + i * 55}ms` : "0ms" }}
              className={({ isActive }) =>
                `flex items-center justify-between border-b border-cream/10 py-4 font-display text-3xl font-medium transition-all duration-500 ${
                  open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                } ${isActive ? "text-gold-300" : "text-cream hover:text-gold-300"}`
              }
            >
              {n.label}
              <GoldStar size={12} className="opacity-50" />
            </NavLink>
          ))}
        </nav>

        <div className="relative z-10 space-y-3 px-8 pb-10">
          <button
            onClick={() => {
              setOpen(false);
              openBooking();
            }}
            className="w-full rounded-full bg-gold-500 py-4 font-body text-sm font-bold tracking-[0.08em] text-forest-950"
          >
            Agendar atendimento
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-cream/40 py-4 font-body text-sm font-semibold text-cream"
          >
            Falar pelo WhatsApp · {templeConfig.phoneDisplay}
          </a>
        </div>
      </div>
    </>
  );
}
