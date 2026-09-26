import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { business } from "../config/business";
import {
  cn,
  prefersReduced,
  scrollToEl,
  startSmooth,
  stopSmooth,
  track,
  waLink,
} from "../lib/motion";
import {
  IconArrowUpRight,
  IconClock,
  IconClose,
  IconGoogle,
  IconInstagram,
  IconMail,
  IconMenu,
  IconPhone,
  IconPin,
  IconWhatsApp,
  Logo,
  SparkMark,
} from "./ui";
import { services } from "../data/services";

/* ---------- âncora pendente entre rotas ---------- */
let pendingAnchor: string | null = null;
export const setPendingAnchor = (a: string | null) => (pendingAnchor = a);
export const consumePendingAnchor = () => {
  const a = pendingAnchor;
  pendingAnchor = null;
  return a;
};

export function useGoSection() {
  const nav = useNavigate();
  const loc = useLocation();
  return useCallback(
    (anchor: string) => {
      track(`nav_secao_${anchor}`);
      if (loc.pathname === "/") {
        scrollToEl(`#${anchor}`, -72);
      } else {
        // em páginas internas: volta para a Home já com a âncora na bagagem
        setPendingAnchor(anchor);
        nav("/", { state: { anchor } });
      }
    },
    [loc.pathname, nav]
  );
}

/* ================= PRELOADER — FAÍSCA / SOLDA ================= */

export function Preloader({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("ma_preloaded") === "1";
    } catch {
      seen = false;
    }
    if (seen || prefersReduced()) {
      setSkip(true);
      onDone();
      return;
    }
    const t1 = window.setTimeout(() => setStage(1), 1250);
    const t2 = window.setTimeout(() => setStage(2), 2050);
    const t3 = window.setTimeout(() => {
      setStage(3);
      try {
        sessionStorage.setItem("ma_preloaded", "1");
      } catch {
        /* noop */
      }
      onDone();
    }, 2650);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onDone]);

  if (skip || stage === 3) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-coal-950"
      style={
        stage === 2
          ? { animation: "pl-curtain 0.6s cubic-bezier(0.7,0,0.3,1) forwards" }
          : undefined
      }
      aria-hidden="true"
    >
      <div className="relative w-[min(72vw,430px)]">
        {/* linha metálica sendo soldada */}
        <div className="relative h-px w-full overflow-visible bg-coal-700">
          <div
            className="absolute inset-0 origin-left bg-gradient-to-r from-steel-500 via-weld-400 to-ember-500"
            style={{ animation: "weld-line-draw 1.15s cubic-bezier(0.6,0,0.3,1) forwards" }}
          />
          {/* ponto de solda */}
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ animation: "weld-travel 1.15s linear forwards" }}
          >
            <div className="relative">
              <div className="h-2.5 w-2.5 rounded-full bg-weld-300 shadow-[0_0_18px_6px_rgba(255,196,107,0.75)]" />
              <div className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 animate-[spark-flicker_0.22s_infinite] rounded-full bg-ember-300 shadow-[0_0_8px_2px_rgba(255,145,72,0.8)]" style={{ marginLeft: 5 }} />
              <div className="absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-full bg-weld-400" style={{ marginLeft: -6, marginTop: -6, animation: "spark-flicker 0.3s infinite" }} />
            </div>
          </div>
        </div>
        {/* wordmark */}
        <div
          className="mt-8 text-center"
          style={{
            opacity: stage >= 1 ? 1 : 0,
            animation: stage >= 1 ? "pl-fade-up 0.55s ease-out forwards" : undefined,
          }}
        >
          <p className="font-display text-4xl tracking-[0.05em] text-paper-100 uppercase sm:text-5xl">
            Metal
            <span className="relative mx-[0.12em] inline-block text-ember-500">
              &amp;
              <SparkMark className="absolute -top-[0.42em] -right-[0.5em] h-[0.32em] w-[0.32em] text-weld-400" />
            </span>
            Art
          </p>
          <span
            className="mx-auto mt-3 block h-[2px] w-3/4 bg-gradient-to-r from-transparent via-ember-500 to-transparent"
            aria-hidden="true"
          />
          <p className="font-mono mt-3 text-[0.6rem] tracking-[0.5em] text-steel-400 uppercase">
            Serralheria · São Paulo
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================= HEADER ================= */

const NAV = [
  { label: "Serviços", to: "/servicos" },
  { label: "Projetos", to: "/projetos" },
  { label: "Sobre", to: "/sobre" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const goSection = useGoSection();
  const loc = useLocation();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => setOpen(false), [loc.pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      stopSmooth();
    } else {
      document.body.style.overflow = "";
      startSmooth();
    }
    return () => {
      document.body.style.overflow = "";
      startSmooth();
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-coal-700/70 bg-coal-950/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-4 px-5 transition-all duration-300 md:px-8",
            scrolled ? "h-16" : "h-20 md:h-24"
          )}
        >
          {/* logo ancorado no canto superior esquerdo do site */}
          <Link
            to="/"
            aria-label="Metal & Art Serralheria — início"
            onClick={() => track("nav_home")}
            className="shrink-0 self-center"
          >
            <Logo compact />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "underline-weld font-mono pb-0.5 text-[0.72rem] tracking-[0.22em] uppercase transition-colors",
                  loc.pathname.startsWith(n.to)
                    ? "text-ember-400"
                    : "text-steel-300 hover:text-paper-100"
                )}
              >
                {n.label}
              </Link>
            ))}
            <button
              onClick={() => goSection("avaliacoes")}
              className="underline-weld font-mono pb-0.5 text-[0.72rem] tracking-[0.22em] text-steel-300 uppercase transition-colors hover:text-paper-100"
            >
              Avaliações
            </button>
            <Link
              to="/contato"
              className={cn(
                "underline-weld font-mono pb-0.5 text-[0.72rem] tracking-[0.22em] uppercase transition-colors",
                loc.pathname === "/contato" ? "text-ember-400" : "text-steel-300 hover:text-paper-100"
              )}
            >
              Contato
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/orcamento"
              onClick={() => track("cta_orcamento_header")}
              className="btn-press bg-ember-500 hover:bg-ember-400 font-display hidden px-5 py-2.5 text-[0.95rem] tracking-[0.08em] text-coal-950 uppercase sm:block"
            >
              Orçamento
            </Link>
            <button
              onClick={() => setOpen(!open)}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              className="btn-press border-coal-600 text-paper-100 hover:border-ember-500 border p-2 lg:hidden"
            >
              {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ---- menu mobile fullscreen ---- */}
      <div
        className={cn(
          "blueprint-grid fixed inset-0 z-40 flex flex-col bg-coal-950 transition-all duration-400 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
      >
        <div className="flex flex-1 flex-col justify-center px-8 pt-20">
          {([
            { label: "Serviços", to: "/servicos", i: "01" },
            { label: "Projetos", to: "/projetos", i: "02" },
            { label: "Orçamento", to: "/orcamento", i: "03" },
            { label: "Sobre", to: "/sobre", i: "04" },
            { label: "Avaliações", to: "/", anchor: "avaliacoes", i: "05" },
            { label: "Contato", to: "/contato", i: "06" },
          ] as { label: string; to: string; i: string; anchor?: string }[]).map((l, idx) => (
            <Link
              key={l.label}
              to={l.to}
              tabIndex={open ? 0 : -1}
              className="group border-b border-coal-700/60 py-4"
              style={{
                transition: "opacity .5s ease, transform .5s ease",
                transitionDelay: open ? `${idx * 60 + 100}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(24px)",
              }}
              onClick={(e) => {
                if (l.anchor) {
                  e.preventDefault();
                  goSection(l.anchor);
                }
                track(`nav_mobile_${l.label}`);
              }}
            >
              <span className="flex items-baseline gap-4">
                <span className="font-mono text-[0.65rem] text-ember-500">{l.i}</span>
                <span className="font-display text-4xl tracking-[0.05em] text-paper-100 uppercase transition-colors group-hover:text-ember-400">
                  {l.label}
                </span>
                <IconArrowUpRight className="ml-auto h-6 w-6 text-steel-500 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-ember-500" />
              </span>
            </Link>
          ))}
        </div>
        <div
          className="px-8 pb-[calc(2rem+env(safe-area-inset-bottom))]"
          style={{ transition: "opacity .5s ease .35s", opacity: open ? 1 : 0 }}
        >
          <a
            href={waLink(business.whatsappDigits, "Olá, Metal & Art! Vim pelo site e gostaria de falar com a equipe.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_menu_mobile")}
            className="btn-press bg-ember-500 font-display flex w-full items-center justify-center gap-3 py-4 text-lg tracking-[0.08em] text-coal-950 uppercase"
          >
            <IconWhatsApp className="h-5 w-5" /> Chamar no WhatsApp
          </a>
          <p className="font-mono mt-4 text-center text-[0.65rem] tracking-[0.15em] text-steel-400">
            {business.phoneDisplay} · {business.address.street} — {business.address.city}
          </p>
        </div>
      </div>
    </>
  );
}

/* ================= CTA FIXO MOBILE ================= */

export function MobileCtaBar() {
  const loc = useLocation();
  if (loc.pathname === "/orcamento") return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-coal-700/70 bg-coal-950/92 px-3 pt-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
      <a
        href={waLink(business.whatsappDigits, "Olá, Metal & Art! Vim pelo site e gostaria de um orçamento.")}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("whatsapp_bar_mobile")}
        className="btn-press font-display flex items-center justify-center gap-2 border border-[#25D366]/60 bg-[#123524]/80 py-3 text-[0.95rem] tracking-[0.06em] text-[#7BE3AC] uppercase"
      >
        <IconWhatsApp className="h-4.5 w-4.5" /> WhatsApp
      </a>
      <Link
        to="/orcamento"
        onClick={() => track("orcamento_bar_mobile")}
        className="btn-press bg-ember-500 font-display flex items-center justify-center gap-2 py-3 text-[0.95rem] tracking-[0.06em] text-coal-950 uppercase"
      >
        Orçamento <IconArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* ================= FOOTER ================= */

export function Footer() {
  const goSection = useGoSection();
  return (
    <footer className="border-t border-coal-700/70 bg-coal-950">
      <div className="mx-auto max-w-[1440px] px-5 pt-16 pb-28 md:px-8 md:pb-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-steel-400">
              Serralheria sob medida: do metal bruto à solução instalada —
              portões, automação, proteção e estruturas para residências,
              condomínios e empresas.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={business.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("instagram_footer")}
                aria-label="Instagram da Metal & Art"
                className="btn-press border-coal-600 text-steel-300 hover:border-ember-500 hover:text-ember-400 border p-2.5"
              >
                <IconInstagram className="h-4.5 w-4.5" />
              </a>
              <a
                href={business.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook da Metal & Art"
                className="btn-press border-coal-600 hover:border-ember-500 font-mono hover:text-ember-400 border p-2.5 text-[0.7rem] text-steel-300"
              >
                f
              </a>
              <a
                href={business.mapsReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("google_footer")}
                aria-label="Avaliações da Metal & Art no Google"
                className="btn-press border-coal-600 text-steel-300 hover:border-ember-500 hover:text-ember-400 border p-2.5"
              >
                <IconGoogle className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          <nav aria-label="Mapa do site">
            <p className="font-mono text-[0.65rem] tracking-[0.3em] text-steel-500 uppercase">Navegação</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { l: "Início", to: "/" },
                { l: "Serviços", to: "/servicos" },
                { l: "Projetos", to: "/projetos" },
                { l: "Sobre a Metal & Art", to: "/sobre" },
                { l: "Montar orçamento", to: "/orcamento" },
                { l: "Contato", to: "/contato" },
              ].map((x) => (
                <li key={x.to}>
                  <Link to={x.to} className="underline-weld text-steel-300 hover:text-paper-100 pb-0.5">
                    {x.l}
                  </Link>
                </li>
              ))}
              <li>
                <button onClick={() => goSection("avaliacoes")} className="underline-weld text-steel-300 hover:text-paper-100 pb-0.5">
                  Avaliações
                </button>
              </li>
              <li>
                <Link to="/faq" className="underline-weld text-steel-300 hover:text-paper-100 pb-0.5">
                  Perguntas frequentes
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Serviços">
            <p className="font-mono text-[0.65rem] tracking-[0.3em] text-steel-500 uppercase">Serviços</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.slice(0, 7).map((s) => (
                <li key={s.slug}>
                  <Link to={`/servicos/${s.slug}`} className="underline-weld text-steel-300 hover:text-paper-100 pb-0.5">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.3em] text-steel-500 uppercase">Contato</p>
            <ul className="mt-4 space-y-3 text-sm text-steel-300">
              <li>
                <a href={waLink(business.whatsappDigits, "Olá, Metal & Art!")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-ember-400">
                  <IconWhatsApp className="h-4 w-4 shrink-0 text-ember-500" /> {business.phoneDisplay} (WhatsApp)
                </a>
              </li>
              <li>
                <a href={`tel:+55${business.whatsappDigits.slice(2)}`} className="flex items-center gap-2.5 hover:text-ember-400" onClick={() => track("telefone_footer")}>
                  <IconPhone className="h-4 w-4 shrink-0 text-ember-500" /> Ligar agora
                </a>
              </li>
              <li>
                <a href={`mailto:${business.email}`} className="flex items-center gap-2.5 hover:text-ember-400">
                  <IconMail className="h-4 w-4 shrink-0 text-ember-500" /> {business.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-ember-500" />
                <span>
                  {business.address.street} — {business.address.region},{" "}
                  {business.address.city}/{business.address.state} · CEP {business.address.zip}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <IconClock className="mt-0.5 h-4 w-4 shrink-0 text-ember-500" />
                <span>Atendimento com hora marcada — confirme pelo WhatsApp.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-coal-700/60 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[0.65rem] tracking-[0.12em] text-steel-500">
            © {new Date().getFullYear()} {business.name}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/privacidade" className="underline-weld font-mono pb-0.5 text-[0.65rem] tracking-[0.12em] text-steel-500 uppercase hover:text-steel-300">
              Política de privacidade
            </Link>
            <span className="font-mono flex items-center gap-1.5 text-[0.65rem] tracking-[0.12em] text-steel-500 uppercase">
              <SparkMark className="h-3 w-3 text-ember-600" /> Feito do metal à solução
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
