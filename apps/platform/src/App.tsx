import { useEffect, useMemo, useState } from "react";
import {
  DashboardView,
  VerticalsView,
  VerticalDetailView,
  CoreView,
  TenantsView,
  DeploymentsView,
  StatusView,
} from "./views";

/**
 * CONTROL PLANE — portal central do Sistema SaaS Geral.
 *
 * Plataforma ≠ vertical ≠ tenant ≠ deployment ≠ domínio ≠ ambiente.
 * Navegação por hash (sem roteador externo): todas as rotas vivem após /#/
 * e são servidas do "/" — nenhum rewrite de SPA é necessário (padrão
 * HashRouter do monorepo).
 */

type Route =
  | { name: "dashboard" }
  | { name: "verticals" }
  | { name: "vertical"; slug: string }
  | { name: "core" }
  | { name: "tenants" }
  | { name: "deployments" }
  | { name: "status" };

function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, "").split("?")[0] ?? "";
  const parts = path.split("/").filter(Boolean);
  if (parts[0] === "verticals" && parts[1]) return { name: "vertical", slug: parts[1] };
  if (parts[0] === "verticals") return { name: "verticals" };
  if (parts[0] === "core") return { name: "core" };
  if (parts[0] === "tenants") return { name: "tenants" };
  if (parts[0] === "deployments") return { name: "deployments" };
  if (parts[0] === "status") return { name: "status" };
  return { name: "dashboard" };
}

const NAV: Array<{ href: string; label: string; route: Route["name"] }> = [
  { href: "#/", label: "Dashboard", route: "dashboard" },
  { href: "#/verticals", label: "Verticais", route: "verticals" },
  { href: "#/core", label: "Core", route: "core" },
  { href: "#/tenants", label: "Tenants", route: "tenants" },
  { href: "#/deployments", label: "Deployments", route: "deployments" },
  { href: "#/status", label: "Status", route: "status" },
];

const TITLES: Record<Route["name"] | "vertical", string> = {
  dashboard: "Dashboard",
  verticals: "Verticais",
  vertical: "Vertical",
  core: "SaaS Core",
  tenants: "Tenants",
  deployments: "Deployments",
  status: "Status",
};

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const env = useMemo(
    () => (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {},
    [],
  );

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const active: Route["name"] = route.name;
  const title = route.name === "vertical" ? TITLES.vertical : TITLES[active];

  return (
    <div className="wrap">
      <header className="topbar">
        <a className="brand" href="#/">
          Tupiniquim <span className="accent">SaaS</span>
          <span className="brand-sub">Control Plane</span>
        </a>
        <nav aria-label="Navegação principal">
          {NAV.map((item) => (
            <a
              key={item.route}
              href={item.href}
              className={active === item.route ? "navlink active" : "navlink"}
              aria-current={active === item.route ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <h1 className="visually-hidden">Tupiniquim SaaS — {title}</h1>

      {route.name === "dashboard" && <DashboardView env={env} />}
      {route.name === "verticals" && <VerticalsView env={env} />}
      {route.name === "vertical" && <VerticalDetailView slug={route.slug} />}
      {route.name === "core" && <CoreView />}
      {route.name === "tenants" && <TenantsView />}
      {route.name === "deployments" && <DeploymentsView />}
      {route.name === "status" && <StatusView />}

      <footer>
        Tupiniquim Tech Solution · monorepo <code>Sistema-SaaS-Geral</code> · branch{" "}
        <code>freebuff/big-master-wave-01-monorepo</code> · Vercel = preview/dev ·
        Supabase = backend canônico · PRODUCTION: NOT PROMOTED.
      </footer>
    </div>
  );
}
