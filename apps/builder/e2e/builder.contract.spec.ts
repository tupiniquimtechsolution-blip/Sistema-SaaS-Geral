import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";

const SUPABASE_ORIGIN = "https://builder-e2e.supabase.co";
const USER_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_ID = "22222222-2222-4222-8222-222222222222";
const PLAN_ID = "33333333-3333-4333-8333-333333333333";
const NOW = "2026-09-24T12:00:00.000Z";

const user = {
  id: USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: "qa-builder@example.test",
  email_confirmed_at: NOW,
  phone: "",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
  identities: [],
  created_at: NOW,
  updated_at: NOW,
};

const session = {
  access_token: "contract-access-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: 2_000_000_000,
  refresh_token: "contract-refresh-token",
  user,
};

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: "application/json",
    headers: { "content-range": "0-0/*" },
    body: JSON.stringify(body),
  });
}

async function installSupabaseContract(page: Page) {
  await page.route(`${SUPABASE_ORIGIN}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (url.pathname === "/auth/v1/token" && request.method() === "POST") {
      return json(route, session);
    }
    if (url.pathname === "/auth/v1/user") return json(route, user);
    if (url.pathname === "/auth/v1/logout") return route.fulfill({ status: 204, body: "" });

    const table = url.pathname.replace("/rest/v1/", "");
    if (table === "memberships") {
      return json(route, [{
        id: "44444444-4444-4444-8444-444444444444",
        tenant_id: TENANT_ID,
        user_id: USER_ID,
        status: "active",
        joined_at: NOW,
        tenant: {
          id: TENANT_ID,
          slug: "qa-tenant-a",
          name: "QA Tenant A",
          vertical_id: null,
          status: "active",
          created_by: USER_ID,
          created_at: NOW,
          updated_at: NOW,
        },
      }]);
    }
    if (table === "tenant_brands") {
      return json(route, { tenant_id: TENANT_ID, display_name: "QA Tenant A", tagline: "Builder contract", logo_url: null, hero_media_url: null, whatsapp: null, email: null });
    }
    if (table === "tenant_themes") {
      return json(route, { tenant_id: TENANT_ID, preset: "default", tokens: {} });
    }
    if (table === "tenant_settings") {
      return json(route, { tenant_id: TENANT_ID, locale: "pt-BR", timezone: "America/Sao_Paulo", currency: "BRL", public_settings: {}, private_settings: {} });
    }
    if (table === "subscriptions") {
      return json(route, { id: "55555555-5555-4555-8555-555555555555", tenant_id: TENANT_ID, plan_id: PLAN_ID, status: "active", current_period_start: NOW, current_period_end: null, cancel_at_period_end: false });
    }
    if (table === "plans") return json(route, { id: PLAN_ID, name: "QA", is_public: false, is_active: true });
    if (table === "plan_entitlements") return json(route, [{ plan_id: PLAN_ID, feature_key: "booking.enabled", value: true }]);
    if (table === "tenant_entitlements" || table === "tenant_features") return json(route, []);
    if (table === "pages" || table === "page_sections" || table === "page_revisions") return json(route, []);

    return json(route, []);
  });
}

async function assertNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blocking = results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}

test("unauthenticated shell is accessible and fail-closed", async ({ page }) => {
  await installSupabaseContract(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Entre para acessar o Builder" })).toBeVisible();
  await expect(page.getByText("não existe login paralelo", { exact: false })).toBeVisible();
  await assertNoSeriousA11yViolations(page);
});

test("authenticated tenant shell resolves canonical context and Builder preview", async ({ page }) => {
  await installSupabaseContract(page);
  await page.goto("/");
  await page.getByLabel("E-mail").fill("qa-builder@example.test");
  await page.getByLabel("Senha").fill("contract-only-password");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("TUPINIQUIM SITE BUILDER")).toBeVisible();
  await expect(page.getByRole("heading", { name: "QA Tenant A", level: 1 })).toBeVisible();
  await expect(page.getByLabel("Tenant")).toHaveValue(TENANT_ID);
  await expect(page.getByLabel("Tenant").locator("option")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Draft Studio + Workflow" })).toBeVisible();

  await page.getByLabel("Vertical canônica").fill("bakery");
  await page.getByRole("button", { name: "Aplicar seleção" }).click();
  await expect(page).toHaveURL(new RegExp(`tenant=${TENANT_ID}.*vertical=bakery`));
  await assertNoSeriousA11yViolations(page);
});

test("requested tenant outside memberships is denied by default", async ({ page }) => {
  await installSupabaseContract(page);
  await page.goto("/?tenant=99999999-9999-4999-8999-999999999999&vertical=bakery");
  await page.getByLabel("E-mail").fill("qa-builder@example.test");
  await page.getByLabel("Senha").fill("contract-only-password");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Seleção não autorizada" })).toBeVisible();
  await expect(page.getByText("não pertence às memberships ativas", { exact: false })).toBeVisible();
});
