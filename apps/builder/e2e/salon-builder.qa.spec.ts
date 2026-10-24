import { expect, test, type Page } from "@playwright/test";

/**
 * QA-only hosted read-only end-to-end contract for the first Salon + Builder MVP.
 * Never uses a platform admin, writes to Supabase, or production credentials.
 * Builder is served locally, but authenticates to the independent QA Supabase.
 */
const QA_PROJECT_REF = "ynqbnimlpxlokrxlucdm";
const TENANT_A = "f92215f9-da30-4453-9190-aece00984284";
const TENANT_B = "a8494bfa-ac05-478c-b06f-3031e0d2cb8c";
const BUILDER_URL = "http://127.0.0.1:4173";
const SALON_URL = "http://127.0.0.1:4174";

const credentials = [
  {
    actor: "A",
    email: process.env.QA_TEST_A_EMAIL ?? "",
    password: process.env.QA_TEST_A_PASSWORD ?? "",
    tenant: TENANT_A,
    foreign: TENANT_B,
  },
  {
    actor: "B",
    email: process.env.QA_TEST_B_EMAIL ?? "",
    password: process.env.QA_TEST_B_PASSWORD ?? "",
    tenant: TENANT_B,
    foreign: TENANT_A,
  },
] as const;

function assertQaOnly() {
  if (
    process.env.QA_PROJECT_REF !== QA_PROJECT_REF ||
    process.env.QA_APPROVED_PROJECT_REF !== QA_PROJECT_REF ||
    process.env.QA_TEST_MODE !== "readonly" ||
    process.env.QA_SUPABASE_URL !== `https://${QA_PROJECT_REF}.supabase.co`
  ) {
    throw new Error("Salon + Builder QA E2E refused: wrong project or mode");
  }
  for (const identity of credentials) {
    if (!identity.email || !identity.password) {
      throw new Error(`Salon + Builder QA E2E missing identity ${identity.actor}`);
    }
  }
}

async function signIn(page: Page, email: string, password: string) {
  await page.goto(BUILDER_URL);
  await expect(
    page.getByRole("heading", { name: "Entre para acessar o Builder" }),
  ).toBeVisible();
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("TUPINIQUIM SITE BUILDER")).toBeVisible();
}

for (const identity of credentials) {
  test(`Viewer QA-${identity.actor} signs in to Builder and cannot select foreign tenant`, async ({ page }) => {
    assertQaOnly();
    await signIn(page, identity.email, identity.password);

    const tenantSelect = page.getByRole("combobox", { name: "Tenant", exact: true });
    await expect(tenantSelect).toHaveValue(identity.tenant);
    await expect(tenantSelect.locator("option")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: "Studio de páginas e revisões" }),
    ).toBeVisible();

    await page.goto(`${BUILDER_URL}/?tenant=${identity.foreign}&vertical=salon`);
    await expect(
      page.getByRole("heading", { name: "Seleção não autorizada" }),
    ).toBeVisible();

    const recovery = page.getByRole("combobox", { name: "Tenant", exact: true });
    await expect(recovery.locator("option")).toHaveCount(1);
    await recovery.selectOption(identity.tenant);
    await page.getByRole("button", { name: "Aplicar seleção" }).click();

    await expect(page.getByText("TUPINIQUIM SITE BUILDER")).toBeVisible();
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(
      page.getByRole("heading", { name: "Entre para acessar o Builder" }),
    ).toBeVisible();
  });
}

test("Salon loads public tenant A from the same QA database, not demo defaults", async ({ page }) => {
  assertQaOnly();
  await page.goto(SALON_URL);
  await expect(page.locator("main#conteudo")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Não foi possível carregar este espaço." })).toHaveCount(0);
  await expect(page.getByText("Live tenant", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "qa-isolation-tenant-a" }).first()).toBeVisible();
  await expect(page.getByText("Preview controlado.", { exact: false })).toHaveCount(0);
  await expect(page.getByText("Mídia identificável: publicação pública aguardando autorização específica.")).toBeVisible();
});
