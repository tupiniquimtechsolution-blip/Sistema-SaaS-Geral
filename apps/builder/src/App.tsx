import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { onAuthStateChange, signInWithPassword, signOut } from "tupiniquim-auth";
import type { TenantContextResult } from "tupiniquim-tenancy";
import { loadBuilderAccess, type BuilderAccessState } from "./access";

interface AppProps {
  client: SupabaseClient;
}

type ViewState = { status: "loading" } | BuilderAccessState | { status: "error"; message: string };

function readSelection() {
  const params = new URLSearchParams(window.location.search);
  return {
    tenantId: params.get("tenant") ?? "",
    verticalKey: params.get("vertical") ?? "",
  };
}

function writeSelection(tenantId: string, verticalKey: string) {
  const params = new URLSearchParams(window.location.search);
  tenantId ? params.set("tenant", tenantId) : params.delete("tenant");
  verticalKey ? params.set("vertical", verticalKey) : params.delete("vertical");
  const query = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
}

export function App({ client }: AppProps) {
  const initial = useMemo(readSelection, []);
  const [tenantId, setTenantId] = useState(initial.tenantId);
  const [verticalKey, setVerticalKey] = useState(initial.verticalKey);
  const [state, setState] = useState<ViewState>({ status: "loading" });
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const next = await loadBuilderAccess(client, {
        requestedTenantId: tenantId || undefined,
        requestedVerticalKey: verticalKey || undefined,
      });
      setState(next);
      if (next.status === "selected") {
        const resolvedTenant = next.context.tenant?.id ?? "";
        if (!tenantId && resolvedTenant) {
          setTenantId(resolvedTenant);
          writeSelection(resolvedTenant, verticalKey);
        }
      }
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "Builder load failed" });
    }
  }, [client, tenantId, verticalKey]);

  useEffect(() => {
    void refresh();
    return onAuthStateChange(client, () => void refresh());
  }, [client, refresh]);

  const applySelection = () => {
    const normalizedVertical = verticalKey.trim();
    writeSelection(tenantId, normalizedVertical);
    if (normalizedVertical !== verticalKey) {
      setVerticalKey(normalizedVertical);
      return;
    }
    void refresh();
  };

  if (state.status === "loading") {
    return <StateCard eyebrow="BUILDER" title="Carregando contexto seguro…" body="Validando sessão, memberships e acesso ao tenant." />;
  }

  if (state.status === "unauthorized") {
    return (
      <main className="shell">
        <section className="state-card">
          <p className="eyebrow">UNAUTHORIZED</p>
          <h1>Entre para acessar o Builder</h1>
          <p>A autenticação usa a sessão Supabase canônica; não existe login paralelo.</p>
          <form
            className="auth-form"
            onSubmit={async (event) => {
              event.preventDefault();
              setAuthError(null);
              try {
                await signInWithPassword(client, credentials.email, credentials.password);
                setCredentials((current) => ({ ...current, password: "" }));
                await refresh();
              } catch (error) {
                setAuthError(error instanceof Error ? error.message : "Falha ao entrar");
              }
            }}
          >
            <label>E-mail<input type="email" autoComplete="email" required value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} /></label>
            <label>Senha<input type="password" autoComplete="current-password" required value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} /></label>
            <button type="submit">Entrar</button>
            {authError ? <p className="error-text" role="alert">{authError}</p> : null}
          </form>
        </section>
      </main>
    );
  }

  if (state.status === "empty") {
    return <StateCard eyebrow="EMPTY" title="Nenhum tenant disponível" body="A sessão é válida, mas não há membership ativa. Acesso permanece negado por padrão." />;
  }

  if (state.status === "forbidden") {
    return (
      <main className="shell">
        <section className="state-card" role="alert">
          <p className="eyebrow">FORBIDDEN</p>
          <h1>Seleção não autorizada</h1>
          <p>{state.reason === "INVALID_VERTICAL" ? "A chave da vertical não está no formato canônico." : "O tenant solicitado não pertence às memberships ativas desta sessão."}</p>
          <TenantSelector memberships={state.memberships} tenantId={tenantId} verticalKey={verticalKey} onTenant={setTenantId} onVertical={setVerticalKey} onApply={applySelection} />
        </section>
      </main>
    );
  }

  if (state.status === "error") {
    return <StateCard eyebrow="ERROR" title="Não foi possível carregar o Builder" body={state.message} />;
  }

  const { context, memberships } = state;
  return (
    <main className="shell">
      <header className="topbar">
        <div><p className="eyebrow">TUPINIQUIM SITE BUILDER</p><h1>{context.brand?.display_name ?? context.tenant?.name ?? "Tenant selecionado"}</h1></div>
        <button className="secondary" type="button" onClick={() => void signOut(client)}>Sair</button>
      </header>

      <section className="selection-card">
        <TenantSelector memberships={memberships} tenantId={context.tenant?.id ?? tenantId} verticalKey={verticalKey} onTenant={setTenantId} onVertical={setVerticalKey} onApply={applySelection} />
      </section>

      <section className="grid" aria-label="Contexto somente leitura">
        <ReadOnlyCard title="Brand" value={context.brand ? {
          display_name: context.brand.display_name,
          tagline: context.brand.tagline ?? null,
          logo_url: context.brand.logo_url ?? null,
          hero_media_url: context.brand.hero_media_url ?? null,
          whatsapp: context.brand.whatsapp ?? null,
          email: context.brand.email ?? null,
        } : null} />
        <ReadOnlyCard title="Theme" value={context.theme ?? null} />
        <ReadOnlyCard title="Settings" value={context.settings ? {
          locale: context.settings.locale,
          timezone: context.settings.timezone,
          currency: context.settings.currency,
          public_settings: context.settings.public_settings ?? {},
        } : null} />
        <ReadOnlyCard title="Entitlements" value={context.effectiveEntitlements} />
      </section>

      <footer className="guardrail">Modo somente leitura · tenant validado por membership · RLS permanece autoridade de enforcement</footer>
    </main>
  );
}

function TenantSelector(props: {
  memberships: TenantContextResult["memberships"];
  tenantId: string;
  verticalKey: string;
  onTenant(value: string): void;
  onVertical(value: string): void;
  onApply(): void;
}) {
  return (
    <div className="selector-row">
      <label>Tenant<select value={props.tenantId} onChange={(event) => props.onTenant(event.target.value)}>{props.memberships.map((entry) => <option key={entry.tenant.id} value={entry.tenant.id}>{entry.tenant.name}</option>)}</select></label>
      <label>Vertical canônica<input value={props.verticalKey} placeholder="bakery" onChange={(event) => props.onVertical(event.target.value)} /></label>
      <button type="button" onClick={props.onApply}>Aplicar seleção</button>
    </div>
  );
}

function ReadOnlyCard({ title, value }: { title: string; value: unknown }) {
  return <article className="data-card"><div className="card-heading"><h2>{title}</h2><span>READ ONLY</span></div><pre>{JSON.stringify(value, null, 2)}</pre></article>;
}

function StateCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <main className="shell"><section className="state-card"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{body}</p></section></main>;
}
