import { useMemo } from "react";

/**
 * CENTRAL CONTROL-PLANE SHELL — minimal by design.
 *
 * This is the entrypoint of the PLATFORM (Sistema SaaS Geral), not of any
 * vertical. It presents platform status and the catalog of vertical
 * applications. Each vertical is a separate deployable (own Vercel project)
 * and each commercial client of a vertical is a TENANT (runtime data/config),
 * never a code fork.
 *
 * Vertical preview URLs are read from VITE_VERTICAL_PREVIEW_URLS
 * (comma-separated `name=url` pairs). Absent/invalid entries simply render
 * without a link — the shell never hardcodes tenant-specific URLs and never
 * embeds secrets. No routing library: the platform identity is a single
 * static screen (SEO/PWA out of scope for a control plane).
 */

type VerticalStatus = "ready" | "not-ready" | "blocked";

interface VerticalCard {
  name: string;
  slug: string;
  status: VerticalStatus;
  note: string;
}

const VERTICALS: VerticalCard[] = [
  { name: "Padaria (Bakery)", slug: "bakery", status: "ready", note: "Primeiro vertical end-to-end validado contra o Supabase canônico." },
  { name: "Pet Shop", slug: "pet", status: "ready", note: "App importado; build/typecheck PASS. Integração SaaS futura." },
  { name: "Restaurante", slug: "restaurant", status: "ready", note: "App importado; build/typecheck PASS. Integração SaaS futura." },
  { name: "MetalArt", slug: "metalart", status: "ready", note: "Vertical principal; implementação premium importada; build/typecheck PASS." },
  { name: "Máquinas Pesadas", slug: "heavy-machinery", status: "ready", note: "App importado; build/typecheck PASS. Integração SaaS futura." },
  { name: "Casa/Templo Religioso", slug: "religious-house", status: "blocked", note: "BLOCKED_FREEBUFF_REPOSITORY_ACCESS_TEMPLO — fonte pendente de acesso." },
  { name: "Painéis de LED", slug: "led", status: "blocked", note: "BLOCKED_SOURCE_REPOSITORY_LED — repositório canônico não identificado." },
  { name: "Salão", slug: "salon", status: "not-ready", note: "MISSING_APP — sem implementação no monorepo ainda." },
];

const TAG: Record<VerticalStatus, { label: string; cls: string }> = {
  ready: { label: "Preview ready", cls: "ok" },
  "not-ready": { label: "Not ready", cls: "soon" },
  blocked: { label: "Blocked", cls: "blocked" },
};

function readPreviewUrls(): Record<string, string> {
  const raw = (
    import.meta as unknown as { env?: Record<string, string | undefined> }
  ).env?.VITE_VERTICAL_PREVIEW_URLS;
  if (!raw) return {};
  const out: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const idx = pair.indexOf("=");
    if (idx <= 0) continue;
    const name = pair.slice(0, idx).trim().toLowerCase();
    const url = pair.slice(idx + 1).trim();
    if (name && /^https:\/\//.test(url)) out[name] = url;
  }
  return out;
}

export default function App() {
  const previewUrls = useMemo(readPreviewUrls, []);

  return (
    <div className="wrap">
      <span className="badge">Sistema SaaS Geral · Control Plane</span>
      <h1>
        Tupiniquim <span className="accent">SaaS</span>
      </h1>
      <p className="lede">
        Plataforma multi-tenant modular: um SaaS Core único alimenta verticais
        comerciais independentes. Novo cliente = novo tenant — nunca um fork.
      </p>

      <section>
        <h2>Plataforma</h2>
        <div className="grid">
          <div className="card">
            <h3>SaaS Core</h3>
            <p>Contratos, permissões (42), features (14), entitlements, billing e observabilidade.</p>
          </div>
          <div className="card">
            <h3>Infra canônica</h3>
            <p>Supabase único: RLS validada (58/58), storage isolado (42/42), migration fix aplicada.</p>
          </div>
          <div className="card">
            <h3>Auth</h3>
            <p>
              Sessão real via Supabase Auth. Login dos membros acontece dentro de
              cada vertical integrado; entrypoints de admin chegam em waves futuras.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>Verticais (aplicações independentes)</h2>
        <div className="grid">
          {VERTICALS.map((v) => {
            const url = previewUrls[v.slug];
            const t = TAG[v.status];
            const inner = (
              <>
                <span className={`tag ${t.cls}`}>{t.label}</span>
                <h3>{v.name}</h3>
                <p>{v.note}</p>
              </>
            );
            return url ? (
              <a key={v.slug} className="card" href={url} target="_blank" rel="noreferrer">
                {inner}
              </a>
            ) : (
              <div key={v.slug} className="card">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      <p className="authnote">
        Preview URLs são configuradas por deploy via{" "}
        <code>VITE_VERTICAL_PREVIEW_URLS</code> (lista pública <code>name=url</code>;
        sem secrets).
      </p>

      <footer>
        Tupiniquim Tech Solution · monorepo <code>Sistema-SaaS-Geral</code> · branch{" "}
        <code>freebuff/big-master-wave-01-monorepo</code> · Demo status apenas — não é
        produção comercial.
      </footer>
    </div>
  );
}
