import React from "react";
import ReactDOM from "react-dom/client";
import { createSupabaseBrowserClient } from "tupiniquim-database";
import { App } from "./App";
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

try {
  const client = createSupabaseBrowserClient({
    url: import.meta.env.VITE_SUPABASE_URL ?? "",
    publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
    authStorageKey: "tupiniquim-builder-auth",
  });
  root.render(
    <React.StrictMode>
      <App client={client} />
    </React.StrictMode>,
  );
} catch (error) {
  const message = error instanceof Error ? error.message : "Builder configuration failed";
  root.render(
    <main className="shell">
      <section className="state-card" role="alert">
        <p className="eyebrow">CONFIGURATION</p>
        <h1>Builder indisponível</h1>
        <p>{message}</p>
      </section>
    </main>,
  );
}
