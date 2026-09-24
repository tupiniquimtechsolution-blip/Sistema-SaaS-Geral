import { expect, test } from "@playwright/test";

const email = process.env.TEST_A_EMAIL ?? "";
const password = process.env.TEST_A_PASSWORD ?? "";

function requireLiveCredentials() {
  if (!email || !password) {
    throw new Error("Live Builder E2E requires TEST_A_EMAIL and TEST_A_PASSWORD");
  }
}

test("real QA session resolves tenant and rejects an unowned tenant", async ({ page }) => {
  requireLiveCredentials();

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Entre para acessar o Builder" })).toBeVisible();
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("TUPINIQUIM SITE BUILDER")).toBeVisible();
  const tenant = page.getByLabel("Tenant");
  await expect(tenant).toBeVisible();
  const ownedTenantId = await tenant.inputValue();
  expect(ownedTenantId).not.toBe("");
  expect(await tenant.locator("option").count()).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { name: "Draft Studio + Workflow" })).toBeVisible();

  const deniedTenant = "99999999-9999-4999-8999-999999999999";
  await page.goto(`/?tenant=${deniedTenant}&vertical=bakery`);
  await expect(page.getByRole("heading", { name: "Seleção não autorizada" })).toBeVisible();
  await expect(page.getByText("não pertence às memberships ativas", { exact: false })).toBeVisible();

  await page.getByLabel("Tenant").selectOption(ownedTenantId);
  await page.getByRole("button", { name: "Aplicar seleção" }).click();
  await expect(page.getByText("TUPINIQUIM SITE BUILDER")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Draft Studio + Workflow" })).toBeVisible();
});
