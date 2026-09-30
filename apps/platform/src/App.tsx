import { useEffect, useMemo, useState } from "react";
import {
  DashboardView, VerticalsView, VerticalDetailView, CoreView, TenantsView, DeploymentsView, StatusView,
} from "./views";

type Route =
  | { name: "dashboard" } | { name: "verticals" } | { name: "vertical"; slug: string }
  | { name: "core" } | { name: "tenants" } | { name: "deployments" } | { name: "status" };

function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, "").split("?")[0] ?? "";
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "verticals" && parts[1]) return { name: "vertical", slug: parts[1] };
  if (parts[0] === "verticals") return { name: "verticals" };
  if (["core", "tenants", "deployments", "status"].includes(parts[0] ?? "")) return { name: parts[0] as "core" | "tenants" | "deployments" | "status" };
  return { name: "dashboard" };
}

const NAV: Array<{ href: string; label: string; route: Route["name"]; icon: string }> = [
  { href: "#/", label: "Overview", route: "dashboard", icon: "◫" },
  { href: "#/tenants", label: "Tenants", route: "tenants", icon: "◉" },
  { href: "#/verticals", label: "Verticals", route: "verticals", icon: "▧" },
  { href: "#/core", label: "SaaS Core", route: "core", icon: "⌘" },
  { href: "#/deployments", label: "Deployments", route: "deployments", icon: "↗" },
  { href: "#/status", label: "Health & security", route: "status", icon: "◇" },
];
const TITLES: Record<Route["name"] | "vertical", string> = {
  dashboard: "Overview", verticals: "Verticals", vertical: "Vertical", core: "SaaS Core",
  tenants: "Tenants", deployments: "Deployments", status: "Health & security",
};

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const [menuOpen, setMenuOpen] = useState(false);
  const env = useMemo(() => (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {}, []);
  useEffect(() => {
    const onChange = () => { setRoute(parseHash(window.location.hash)); setMenuOpen(false); };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const active = route.name;
  const title = route.name === "vertical" ? TITLES.vertical : TITLES[active];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className={`sidebar${menuOpen ? " sidebar-open" : ""}`} aria-label="Application navigation">
        <a className="brand" href="#/" aria-label="Tupiniquim Control Plane home">
          <span className="brand-mark" aria-hidden="true">T</span><span>Tupiniquim<small>CONTROL PLANE</small></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Primary navigation">
          {NAV.map((item) => <a key={item.route} href={item.href} className={active === item.route ? "navlink active" : "navlink"} aria-current={active === item.route ? "page" : undefined}>
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}
          </a>)}
        </nav>
        <div className="sidebar-bottom"><span className="status-dot" aria-hidden="true" /> Supabase · canonical data plane</div>
      </aside>
      {menuOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <div className="main-column">
        <header className="topbar">
          <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen((open) => !open)}>☰</button>
          <div className="breadcrumbs"><span>Workspace</span><span aria-hidden="true">/</span><strong>{title}</strong></div>
          <div className="topbar-meta"><span className="environment-pill"><span className="status-dot" aria-hidden="true" /> Platform</span></div>
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
        </main>
        <footer className="app-footer">Tupiniquim Tech Solution <span>·</span> Supabase is the canonical data plane <span>·</span> Cloudflare Workers / Static Assets is canonical hosting</footer>
      </div>
    </div>
  );
}
