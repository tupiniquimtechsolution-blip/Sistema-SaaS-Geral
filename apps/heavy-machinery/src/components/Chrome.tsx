import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { BUSINESS } from "../config/business";
import { availableCount, IMG } from "../data/machines";
import { cx, generalMessage, waLink } from "../lib/utils";
import { useApp } from "../store/AppStore";
import { Btn, IcHeart, IcMenu, IcPhone, IcScale, IcWhatsApp, IcX } from "./ui";

const NAV = [
  { to: "/pecas", label: "Peças", end: false },
  { to: "/originais", label: "Originais", end: true },
  { to: "/compativeis", label: "Compatíveis", end: true },
  { to: "/motores", label: "Motores", end: true },
  { to: "/empresa", label: "Empresa", end: true },
  { to: "/contato", label: "Contato", end: true },
];

function Logo({ dark = false }: { dark?: boolean }) {
  const [broken, setBroken] = useState(false);
  return (
    <Link to="/" className="flex items-center gap-3" aria-label={`${BUSINESS.name} — início`}>
      {!broken ? (
        <img
          src={IMG.logo}
          alt="Lusomaq"
          className={cx("h-9 w-auto object-contain md:h-10", dark && "brightness-0 invert")}
          onError={() => setBroken(true)}
        />
      ) : (
        <span className={cx("font-display text-2xl uppercase tracking-wide", dark ? "text-bone-100" : "text-coal-950")}>
          Luso<span className="text-hz-400">maq</span>
        </span>
      )}
    </Link>
  );
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return p;
}

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const progress = useScrollProgress();
  const { favorites, compare } = useApp();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-[60]">
      <div className={cx("transition-all duration-300", scrolled ? "bg-coal-950/95 shadow-plate backdrop-blur-md" : "bg-gradient-to-b from-coal-950/85 to-transparent")}>
        {/* linha utilitária */}
        <div className={cx("hidden border-b border-bone-100/10 transition-all duration-300 lg:block", scrolled ? "h-0 overflow-hidden border-b-0" : "h-9")}>
          <div className="mx-auto flex h-9 max-w-(--container-site) items-center justify-between px-6 font-cond text-[12px] font-semibold uppercase tracking-[0.18em] text-steel-300">
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse bg-agri-400" aria-hidden="true" />
              {availableCount()} peças do catálogo online · 30.000+ itens no estoque físico
            </p>
            <div className="flex items-center gap-6">
              <span>{BUSINESS.hours[0].days} {BUSINESS.hours[0].time}</span>
              <a href={`tel:+${BUSINESS.phoneRaw}`} className="transition-colors hover:text-hz-300">{BUSINESS.phoneDisplay}</a>
            </div>
          </div>
        </div>

        <div className={cx("mx-auto flex max-w-(--container-site) items-center justify-between gap-6 px-6 transition-all duration-300", scrolled ? "py-2.5" : "py-4")}>
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cx(
                    "group relative font-cond text-[14px] font-semibold uppercase tracking-[0.16em] transition-colors",
                    isActive ? "text-hz-300" : "text-bone-200 hover:text-hz-300",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {n.label}
                    <span className={cx("absolute -bottom-1.5 left-0 h-[2px] bg-hz-400 transition-all duration-300", isActive ? "w-full" : "w-0 group-hover:w-full")} aria-hidden="true" />
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <Link
              to="/minhas-pecas"
              className="relative grid h-10 w-10 place-items-center border border-line-dark text-steel-300 transition-colors hover:border-hz-400 hover:text-hz-300"
              aria-label={`Minhas peças salvas (${favorites.length})`}
              title="Minhas peças"
            >
              <IcHeart size={17} />
              {favorites.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center bg-hz-400 font-cond text-[11px] font-bold text-coal-950">{favorites.length}</span>
              )}
            </Link>
            <Link
              to="/pecas"
              className="relative hidden h-10 w-10 place-items-center border border-line-dark text-steel-300 transition-colors hover:border-hz-400 hover:text-hz-300 sm:grid"
              aria-label={`Comparar peças (${compare.length}/3)`}
              title="Comparar"
            >
              <IcScale size={17} />
              {compare.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center bg-hz-400 font-cond text-[11px] font-bold text-coal-950">{compare.length}</span>
              )}
            </Link>
            <Btn href={waLink(BUSINESS.whatsapp, generalMessage())} size="sm" className="hidden md:inline-flex">
              <IcWhatsApp size={15} /> Orçamento
            </Btn>
            <button
              onClick={() => setOpen(!open)}
              className="grid h-10 w-10 place-items-center border border-line-dark text-bone-100 lg:hidden"
              aria-expanded={open}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
            >
              {open ? <IcX size={18} /> : <IcMenu size={18} />}
            </button>
          </div>
        </div>
        {/* barra de progresso de leitura */}
        <div className="h-[2px] w-full bg-transparent">
          <div className="h-full bg-hz-400 transition-[width] duration-150" style={{ width: `${progress * 100}%` }} aria-hidden="true" />
        </div>
      </div>

      {/* menu mobile */}
      <div className={cx("lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
        <div className={cx("fixed inset-0 z-[55] bg-coal-950/80 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
        <nav
          className={cx(
            "fixed inset-y-0 right-0 z-[56] flex w-[86vw] max-w-[340px] flex-col border-l border-line-dark bg-coal-900 transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          )}
          aria-label="Menu"
        >
          <div className="hazard-thin h-2 w-full" aria-hidden="true" />
          <div className="flex items-center justify-between border-b border-line-dark px-5 py-4">
            <Logo />
            <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center border border-line-dark" aria-label="Fechar menu">
              <IcX size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {NAV.map((n, i) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cx(
                    "flex items-center justify-between border-b border-line-dark py-4 font-display text-3xl uppercase transition-colors",
                    isActive ? "text-hz-300" : "text-bone-100 hover:text-hz-300",
                  )
                }
              >
                {n.label}
                <span className="font-cond text-[12px] font-semibold tracking-[0.2em] text-steel-500">0{i + 1}</span>
              </NavLink>
            ))}
            <div className="mt-6 grid gap-2">
              <Link to="/minhas-pecas" className="flex items-center justify-between border border-line-dark px-4 py-3 font-cond text-sm font-bold uppercase tracking-[0.16em] text-bone-100">
                Minhas peças <IcHeart size={16} className="text-safety-400" />
              </Link>
            </div>
          </div>
          <div className="border-t border-line-dark p-4">
            <Btn href={waLink(BUSINESS.whatsapp, generalMessage())} className="w-full">
              <IcWhatsApp size={16} /> Solicitar orçamento
            </Btn>
            <a href={`tel:+${BUSINESS.phoneRaw}`} className="mt-2 flex items-center justify-center gap-2 py-2 font-cond text-[13px] font-semibold uppercase tracking-[0.18em] text-steel-300">
              <IcPhone size={14} /> {BUSINESS.phoneDisplay}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function WhatsFloat() {
  return (
    <a
      href={waLink(BUSINESS.whatsapp, generalMessage())}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="group fixed bottom-5 right-5 z-[50] flex items-center gap-3 bg-[#1f9d44] px-4 py-3 text-bone-100 shadow-plate transition-all duration-300 hover:-translate-y-1 hover:bg-[#23b34d] md:bottom-7 md:right-7"
    >
      <IcWhatsApp size={24} />
      <span className="hidden max-w-[180px] font-cond text-[13px] font-bold uppercase leading-tight tracking-[0.12em] sm:block">
        Peça seu orçamento agora
      </span>
      <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-hz-400" aria-hidden="true" />
    </a>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-line-dark bg-coal-950">
      <div className="roadline" aria-hidden="true" />
      <div className="mx-auto max-w-(--container-site) px-6 pb-10 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-steel-300">{BUSINESS.tagline}</p>
            <p className="mt-4 font-cond text-[13px] font-semibold uppercase tracking-[0.2em] text-hz-300">
              Desde {BUSINESS.founded} · {BUSINESS.yearsInMarket} anos de estrada
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { href: BUSINESS.instagramUrl, label: "Instagram", d: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5Zm0 2A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5ZM17.8 5.4a.9.9 0 1 0 .9.9.9.9 0 0 0-.9-.9Z" },
                { href: BUSINESS.facebookUrl, label: "Facebook", d: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" },
                { href: BUSINESS.linkedinUrl, label: "LinkedIn", d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM6 9H2v12h4V9ZM4 2a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label} className="grid h-10 w-10 place-items-center border border-line-dark text-steel-300 transition-all duration-200 hover:-translate-y-0.5 hover:border-hz-400 hover:text-hz-300">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={s.d} /></svg>
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Catálogo">
            <p className="font-cond text-[13px] font-bold uppercase tracking-[0.26em] text-hz-300">Catálogo</p>
            <ul className="mt-5 space-y-3 text-[14px]">
              {[
                ["/pecas", "Todas as peças"],
                ["/originais", "Peças originais"],
                ["/compativeis", "Peças compatíveis"],
                ["/motores", "Motores"],
                ["/minhas-pecas", "Minhas peças"],
                ["/busca", "Não achou a peça?"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-steel-300 transition-colors hover:text-hz-300">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Empresa">
            <p className="font-cond text-[13px] font-bold uppercase tracking-[0.26em] text-hz-300">Empresa</p>
            <ul className="mt-5 space-y-3 text-[14px]">
              {[
                ["/empresa", "A Lusomaq"],
                ["/orcamento", "Orçamento para frota"],
                ["/conteudos", "Conteúdos técnicos"],
                ["/contato", "Contato & pátio"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-steel-300 transition-colors hover:text-hz-300">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-cond text-[13px] font-bold uppercase tracking-[0.26em] text-hz-300">Contato</p>
            <ul className="mt-5 space-y-3 text-[14px] text-steel-300">
              <li>{BUSINESS.address.street}<br />{BUSINESS.address.city}/{BUSINESS.address.state} — CEP {BUSINESS.address.zip}</li>
              <li>
                <a href={`tel:+${BUSINESS.phoneRaw}`} className="transition-colors hover:text-hz-300">{BUSINESS.phoneDisplay}</a>
                {" · "}
                <a href={waLink(BUSINESS.whatsapp, generalMessage())} target="_blank" rel="noreferrer" className="transition-colors hover:text-hz-300">{BUSINESS.whatsappDisplay} (WhatsApp)</a>
              </li>
              <li><a href={`mailto:${BUSINESS.email}`} className="transition-colors hover:text-hz-300">{BUSINESS.email}</a></li>
              <li>{BUSINESS.hours[0].days}: {BUSINESS.hours[0].time}</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line-dark pt-6 text-[12px] text-steel-500 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} {BUSINESS.legalName}. Todos os direitos reservados.</p>
          <p className="font-cond uppercase tracking-[0.2em]">Peças para pavimentação · terraplanagem · construção</p>
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-hz-400 focus:px-4 focus:py-2 focus:font-cond focus:font-bold focus:uppercase focus:text-coal-950"
      >
        Ir para o conteúdo
      </a>
      <Navbar />
      <main id="conteudo">{children}</main>
      <Footer />
      <WhatsFloat />
    </div>
  );
}
