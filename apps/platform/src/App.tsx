import { useEffect, useMemo, useRef, useState } from "react";
import {
  DashboardView, VerticalsView, VerticalDetailView, CoreView, TenantsView, DeploymentsView, StatusView,
} from "./views";

type Route =
  | { name: "dashboard" } | { name: "verticals" } | { name: "vertical"; slug: string }
  | { name: "core" } | { name: "tenants" } | { name: "deployments" } | { name: "status" }
  | { name: "billing" } | { name: "automations" } | { name: "integrations" };

function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, "").split("?")[0] ?? "";
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "verticals" && parts[1]) return { name: "vertical", slug: parts[1] };
  if (parts[0] === "verticals") return { name: "verticals" };
  if (["core", "tenants", "deployments", "status", "billing", "automations", "integrations"].includes(parts[0] ?? "")) {
    return { name: parts[0] as "core" | "tenants" | "deployments" | "status" | "billing" | "automations" | "integrations" };
  }
  return { name: "dashboard" };
}

const NAV: Array<{ href: string; label: string; route: Route["name"]; icon: string }> = [
  { href: "#/", label: "Visão geral", route: "dashboard", icon: "◫" },
  { href: "#/tenants", label: "Tenants", route: "tenants", icon: "◉" },
  { href: "#/verticals", label: "Verticais", route: "verticals", icon: "▧" },
  { href: "#/core", label: "SaaS Core", route: "core", icon: "⌘" },
  { href: "#/deployments", label: "Implantações", route: "deployments", icon: "↗" },
  { href: "#/billing", label: "Cobrança", route: "billing", icon: "＄" },
  { href: "#/automations", label: "Automações", route: "automations", icon: "⟳" },
  { href: "#/integrations", label: "Integrações", route: "integrations", icon: "⌁" },
  { href: "#/status", label: "Saúde e segurança", route: "status", icon: "◇" },
];
const TITLES: Record<Route["name"] | "vertical", string> = {
  dashboard: "Visão geral", verticals: "Verticais", vertical: "Vertical", core: "SaaS Core",
  tenants: "Tenants", deployments: "Implantações", status: "Saúde e segurança", billing: "Cobrança",
  automations: "Automações", integrations: "Integrações",
};

function CapabilityEmptyState({ title, eyebrow, description }: { title: string; eyebrow: string; description: string }) {
  return <div className="view">
    <section className="capability-empty" aria-labelledby="capability-title">
      <p className="capability-eyebrow">{eyebrow}</p>
      <h2 id="capability-title">{title}</h2>
      <p>{description}</p>
      <p className="capability-status"><span className="status-dot" aria-hidden="true" /> Sem dados ou ações conectados</p>
    </section>
  </div>;
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 800px)").matches);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const wasMenuOpen = useRef(false);
  const env = useMemo(() => (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {}, []);

  useEffect(() => {
    const onChange = () => { setRoute(parseHash(window.location.hash)); setMenuOpen(false); };
    const media = window.matchMedia("(max-width: 800px)");
    const onMediaChange = () => { setIsMobile(media.matches); if (!media.matches) setMenuOpen(false); };
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isMobile || !menuOpen) return;
      if (event.key === "Escape") { event.preventDefault(); setMenuOpen(false); return; }
      if (event.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("hashchange", onChange);
    window.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onMediaChange);
    return () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onMediaChange);
    };
  }, [isMobile, menuOpen]);

  useEffect(() => {
    if (isMobile && menuOpen) {
      drawerRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])')?.focus();
    } else if (isMobile && wasMenuOpen.current) {
      menuButtonRef.current?.focus();
    }
    wasMenuOpen.current = menuOpen;
  }, [isMobile, menuOpen]);

  const active = route.name;
  const title = route.name === "vertical" ? TITLES.vertical : TITLES[active];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
      <aside
        id="navigation-drawer"
        ref={drawerRef}
        className={`sidebar${menuOpen ? " sidebar-open" : ""}`}
        aria-label="Navegação principal"
        aria-hidden={isMobile && !menuOpen}
        role={isMobile && menuOpen ? "dialog" : "complementary"}
        aria-modal={isMobile && menuOpen ? true : undefined}
      >
        <a className="brand" href="#/" aria-label="Página inicial do Control Plane Tupiniquim">
          <span className="brand-mark" aria-hidden="true">T</span><span>Tupiniquim<small>PLANO DE CONTROLE</small></span>
        </a>
        <div className="workspace-label">ESPAÇO DE TRABALHO</div>
        <nav className="side-nav" aria-label="Navegação do espaço de trabalho">
          {NAV.map((item) => <a key={item.route} href={item.href} onClick={() => { if (isMobile) setMenuOpen(false); }} className={active === item.route ? "navlink active" : "navlink"} aria-current={active === item.route ? "page" : undefined}>
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
          </a>)}
        </nav>
        <div className="sidebar-bottom"><span className="status-dot" aria-hidden="true" /> Supabase · fonte canônica de dados</div>
      </aside>
      {menuOpen && <button className="mobile-scrim" aria-label="Fechar navegação" onClick={() => setMenuOpen(false)} />}
      <div className="main-column" aria-hidden={isMobile && menuOpen}>
        <header className="topbar">
          <button id="navigation-trigger" ref={menuButtonRef} className="menu-toggle" type="button" aria-controls="navigation-drawer" aria-expanded={menuOpen} aria-label={menuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"} onClick={() => setMenuOpen((open) => !open)}>☰</button>
          <div className="breadcrumbs"><span>Espaço de trabalho</span><span aria-hidden="true">/</span><strong>{title}</strong></div>
          <div className="topbar-meta"><span className="environment-pill"><span className="status-dot" aria-hidden="true" /> Plataforma</span></div>
        </header>
        <main id="main-content" className="content-area">
          <h1 className="visually-hidden">Tupiniquim SaaS — {title}</h1>
          {route.name === "dashboard" && <DashboardView env={env} />}
          {route.name === "verticals" && <VerticalsView env={env} />}
          {route.name === "vertical" && <VerticalDetailView slug={route.slug} />}
          {route.name === "core" && <CoreView />}
          {route.name === "tenants" && <TenantsView />}
          {route.name === "deployments" && <DeploymentsView />}
          {route.name === "status" && <StatusView />}
          {route.name === "billing" && <CapabilityEmptyState title="Central de cobrança" eyebrow="STRIPE · CONTRATO DE BACKEND PENDENTE" description="O Control Plane ainda não está conectado a um contrato tenant-scoped de leitura e ações de billing. A autoridade de assinaturas e entitlements permanece no webhook Stripe existente e no SaaS Core; o ciclo Test Mode E2E continua pendente." />}
          {route.name === "automations" && <CapabilityEmptyState title="Automações" eyebrow="ORQUESTRAÇÃO PRIVADA · CONTRATO PENDENTE" description="Ainda não há contrato de gestão de automações conectado. O n8n permanece um futuro motor privado de orquestração e não é exposto aos navegadores dos tenants." />}
          {route.name === "integrations" && <CapabilityEmptyState title="Integrações" eyebrow="CONEXÕES · CONTRATO PENDENTE" description="Ainda não há contrato de conexões ou dados de saúde integrado aqui. Credenciais e configuração de provedores devem permanecer no servidor." />}
        </main>
        <footer className="app-footer">Tupiniquim Tech Solution <span>·</span> Supabase é a fonte canônica de dados <span>·</span> Cloudflare Workers / Static Assets é a hospedagem canônica</footer>
      </div>
    </div>
  );
}
