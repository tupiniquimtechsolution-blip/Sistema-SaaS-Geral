import { VERTICALS, GATES, PROJECTS, CORE_MODULES, HOSTING_POLICY, readPreviewUrls } from "./data";
import type { Vertical } from "./data";
import { Badge, gateTone, maturityTone } from "./ui";

/**
 * Views do CONTROL PLANE — conteúdo real do monorepo; nada de métricas
 * inventadas ou "Lorem ipsum". Estados de ausência são explícitos
 * (NOT READY / BLOCKED / COMING SOON).
 */

export function DashboardView({ env }: { env: Record<string, string | undefined> }) {
  const previewUrls = readPreviewUrls(env);
  const readyCount = VERTICALS.filter((v) => v.state === "ready").length;
  const blockedCount = VERTICALS.filter((v) => v.state === "blocked").length;
  const gatesPass = GATES.filter((g) => g.state === "PASS").length;
  const ownerActions = PROJECTS.filter((p) => p.status.includes("OWNER_ACTION_REQUIRED")).length;

  return (
    <div className="view">
      <section>
        <h2>Estado da plataforma</h2>
        <div className="statgrid">
          <div className="stat">
            <div className="stat-num">{readyCount}</div>
            <div className="stat-label">verticais prontos p/ deploy</div>
          </div>
          <div className="stat">
            <div className="stat-num">{blockedCount}</div>
            <div className="stat-label">bloqueados (blocker externo real)</div>
          </div>
          <div className="stat">
            <div className="stat-num">
              {gatesPass}/{GATES.length}
            </div>
            <div className="stat-label">gates de segurança/qualidade PASS</div>
          </div>
          <div className="stat">
            <div className="stat-num">{ownerActions}</div>
            <div className="stat-label">projetos aguardando ação do owner</div>
          </div>
        </div>
        <p className="hint">
          Números refletem execução real registrada (docs/ + gates). Nada é
          estimado ou simulado — ver detalhes na aba{" "}
          <a href="#/status">Status</a>.
        </p>
      </section>

      <section>
        <h2>Verticais</h2>
        <div className="grid">
          {VERTICALS.map((v) => {
            const url = previewUrls[v.slug];
            const inner = (
              <>
                <span className={`tag ${v.state === "ready" ? "ok" : v.state === "blocked" ? "blocked" : "soon"}`}>
                  {v.state === "ready" ? "Preview ready" : v.state === "blocked" ? "Blocked" : "Not ready"}
                </span>
                <h3>{v.name}</h3>
                <p>{v.note}</p>
              </>
            );
            return url ? (
              <a key={v.slug} className="card" href={url} target="_blank" rel="noreferrer">
                {inner}
              </a>
            ) : (
              <a key={v.slug} className="card" href={`#/verticals/${v.slug}`}>
                {inner}
              </a>
            );
          })}
        </div>
      </section>

      <p className="hint">
        Demo URLs são configuradas por deploy via{" "}
        <code>VITE_VERTICAL_PREVIEW_URLS</code> (lista pública <code>name=url</code>,
        sem secrets). Cada cliente comercial é um <strong>tenant</strong> —
        nunca um fork de código.
      </p>
    </div>
  );
}

export function VerticalsView({ env }: { env: Record<string, string | undefined> }) {
  const previewUrls = readPreviewUrls(env);
  return (
    <div className="view">
      <section>
        <h2>Catálogo de verticais</h2>
        <p className="hint">
          Cada vertical é uma aplicação deployable independente (próprio projeto
          Vercel). Clique em um card para o dossiê completo.
        </p>
        <div className="grid">
          {VERTICALS.map((v) => {
            const url = previewUrls[v.slug];
            return (
              <a key={v.slug} className="card" href={url ?? `#/verticals/${v.slug}`} target={url ? "_blank" : undefined} rel={url ? "noreferrer" : undefined}>
                <span className={`tag ${v.state === "ready" ? "ok" : v.state === "blocked" ? "blocked" : "soon"}`}>
                  {v.state === "ready" ? "Preview ready" : v.state === "blocked" ? "Blocked" : "Not ready"}
                </span>
                <h3>{v.name}</h3>
                <p>{v.blocker ?? v.note}</p>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function VerticalDetailView({ slug }: { slug: string }) {
  const v = VERTICALS.find((x) => x.slug === slug);
  if (!v) {
    return (
      <div className="view">
        <p className="hint">Vertical desconhecido: <code>{slug}</code>.</p>
        <p>
          <a className="btn" href="#/verticals">← Voltar ao catálogo</a>
        </p>
      </div>
    );
  }
  const rows: Array<[string, string]> = [
    ["SOURCE", v.source],
    ["APP", v.app],
    ["BUILD", v.build],
    ["TYPECHECK", v.typecheck],
    ["TEST", v.test],
    ["ROUTER", v.router],
    ["ENV (VITE_*)", v.env],
    ["SUPABASE", v.supabase],
    ["CLIENTES", v.clients],
    ["TENANT MODEL", "Um cliente = um tenant no Supabase canônico — sem fork por cliente"],
    ["BRANDING MODEL", "tenant_brands/tenant_themes por tenant (leitura live já provada na Bakery)"],
    ["DEMO READINESS", v.demo],
    ["COMMERCIAL READINESS", v.commercial],
    ["PROJETO VERCEL", v.project],
  ];
  return (
    <div className="view">
      <p>
        <a href="#/verticals">← Catálogo de verticais</a>
      </p>
      <section>
        <h2>
          {v.name}{" "}
          <Badge tone={v.state === "ready" ? "ok" : v.state === "blocked" ? "blocked" : "muted"}>
            {v.state === "ready" ? "READY" : v.state === "blocked" ? "BLOCKED" : "NOT READY"}
          </Badge>
        </h2>
        {v.blocker && <p className="hint blocker-text">BLOCKER: {v.blocker}</p>}
        <p>{v.note}</p>
        <table>
          <tbody>
            {rows.map(([k, val]) => (
              <tr key={k}>
                <th>{k}</th>
                <td>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export function CoreView() {
  return (
    <div className="view">
      <section>
        <h2>SaaS Core — módulos e maturidade</h2>
        <p className="hint">
          Maturidade declarada honestamente: IMPLEMENTED (executado e provado),
          FOUNDATION (contratos prontos, UI/provider pendente), COMING_SOON
          (planejado). Ausência nunca é mascarada.
        </p>
        <table>
          <thead>
            <tr>
              <th>Módulo</th>
              <th>Maturidade</th>
              <th>Evidência</th>
            </tr>
          </thead>
          <tbody>
            {CORE_MODULES.map((m) => (
              <tr key={m.name}>
                <td>{m.name}</td>
                <td>
                  <Badge tone={maturityTone(m.maturity)}>{m.maturity}</Badge>
                </td>
                <td>{m.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2>Modelo multi-tenant (invariante)</h2>
        <table>
          <tbody>
            <tr><th>1 vertical</th><td>vários clientes (tenants)</td></tr>
            <tr><th>1 cliente</th><td>1 tenant — dados/branding/config próprios</td></tr>
            <tr><th>1 tenant</th><td>branding/config/domain próprios no Supabase canônico</td></tr>
            <tr><th>NUNCA</th><td>1 cliente = fork do código</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

export function TenantsView() {
  return (
    <div className="view">
      <section>
        <h2>Tenants</h2>
        <p>
          A gestão operacional de tenants (criar cliente, atribuir plano,
          configurar branding/domínio) acontece <strong>dentro de cada vertical</strong>{" "}
          integrado e nas waves futuras do control plane — sempre server-side,
          com RLS como autoridade final.
        </p>
        <table>
          <tbody>
            <tr><th>Infra de tenants</th><td>IMPLEMENTED — memberships/roles/RLS provados (58/58)</td></tr>
            <tr><th>Resolução de tenant</th><td>membership-scoped, fail-closed; seleção no browser é UX, RLS é enforcement</td></tr>
            <tr><th>Provisionamento</th><td>RPC canônica <code>create_tenant_with_owner</code> (idempotente, usada nos QA A/B)</td></tr>
            <tr><th>Gestão UI</th><td>COMING_SOON — wave futura do control plane</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}

export function DeploymentsView() {
  return (
    <div className="view">
      <section>
        <h2>Deployments — matriz de projetos</h2>
        <table>
          <thead>
            <tr>
              <th>Projeto Vercel</th>
              <th>App</th>
              <th>Build</th>
              <th>Output</th>
              <th>Status real</th>
            </tr>
          </thead>
          <tbody>
            {PROJECTS.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>{p.app}</td>
                <td><code>{p.build}</code></td>
                <td><code>{p.output}</code></td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="hint">
          Política de hosting (decisão do owner): {HOSTING_POLICY.vercelRole}.
          Projetos dedicados: {HOSTING_POLICY.dedicatedProjects}. Hosting
          definitivo: {HOSTING_POLICY.finalHosting} — plano em{" "}
          <code>docs/CLOUDFLARE_MIGRATION_MASTER_PLAN.md</code> (não executado).
          Remote preview do central: {HOSTING_POLICY.centralRemotePreview}.
        </p>
      </section>
    </div>
  );
}

export function StatusView() {
  return (
    <div className="view">
      <section>
        <h2>Gates de segurança e qualidade</h2>
        <table>
          <thead>
            <tr>
              <th>Gate</th>
              <th>Estado</th>
              <th>Evidência</th>
            </tr>
          </thead>
          <tbody>
            {GATES.map((g) => (
              <tr key={g.name}>
                <td>{g.name}</td>
                <td>
                  <Badge tone={gateTone(g.state)}>{g.state}</Badge>
                </td>
                <td>{g.evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export type { Vertical };
