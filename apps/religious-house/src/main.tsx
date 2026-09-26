import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { loadTempleTenantConfig } from "./runtimeConfig";

async function bootstrap() {
  await loadTempleTenantConfig();
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
}

void bootstrap();
