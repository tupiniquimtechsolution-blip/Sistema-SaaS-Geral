import { expect, test } from "@playwright/test";
import {
  assertQaSalonEditorEnv,
  QA_A,
  QA_EDITOR,
} from "../../../scripts/qa-salon-editor-guard.mjs";

/**
 * One-time isolated QA editor lifecycle. Intentionally writes only in the
 * authorized Tenant A and FAILS CLOSED if the publication fixture exists.
 * Requires a separate manual gate and protected QA-editor credentials.
 * Does not remove persisted revisions: exact-id recovery is a separate task.
 */
test("QA editor creates, approves, publishes and restores a Salon page", async ({ page }) => {
  assertQaSalonEditorEnv(process.env);
  const marker = `QA_SALON_EDITORIAL_${process.env.GITHUB_RUN_ID ?? "manual"}`;

  await page.goto("http://127.0.0.1:4173/");
  await expect(page.getByRole("heading", { name: "Entre para acessar o Builder" })).toBeVisible();

  await page.getByLabel("E-mail").fill(process.env.QA_EDITOR_EMAIL!);
  await page.getByLabel("Senha").fill(process.env.QA_EDITOR_PASSWORD!);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("TUPINIQUIM SITE BUILDER")).toBeVisible();
  const tenant = page.getByRole("combobox", { name: "Tenant", exact: true });
  await expect(tenant).toHaveValue(QA_A);
  await expect(tenant.locator("option")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Studio de páginas e revisões" })).toBeVisible();

  const newPage = page.locator("form.draft-form").filter({
    has: page.getByRole("heading", { name: "Nova página" }),
  });
  await newPage.getByLabel("Slug").fill("inicio");
  await newPage.getByLabel("Título").fill(`Salon QA publication ${marker}`);
  await newPage.getByRole("button", { name: "Criar página draft" }).click();

  await expect(page.getByRole("combobox", { name: "Página ativa" })).toHaveValue(/.+/);
  await expect(page.getByRole("button", { name: "Criar nova revisão" })).toBeEnabled();
  await page.getByRole("button", { name: "Criar nova revisão" }).click();

  await expect(page.getByRole("heading", { name: "Editar snapshot draft" })).toBeVisible();
  await page.getByRole("button", { name: /Adicionar texto/ }).click();
  await page.getByRole("textbox", { name: "text", exact: true }).fill(marker);
  await page.getByRole("button", { name: "Salvar snapshot" }).click();
  // Wait for the persisted revision acknowledgement before next transition.
  await expect(page.getByText(/Draft v\d+ salvo sem alterar a versão publicada/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar para revisão" })).toBeEnabled();

  await page.getByRole("button", { name: "Enviar para revisão" }).click();
  await expect(page.getByRole("button", { name: "Aprovar" })).toBeEnabled();
  await page.getByRole("button", { name: "Aprovar" }).click();
  await expect(page.getByRole("button", { name: "Publicar revisão" })).toBeEnabled();
  await page.getByRole("button", { name: "Publicar revisão" }).click();
  await expect(page.getByText(/Revisão v\d+: Publicada/)).toBeVisible();

  // Real PUBLIC Salon, backed by QA Supabase, must show the approved projection.
  const salon = await page.context().newPage();
  await salon.goto("http://127.0.0.1:4174/");
  const published = salon.getByRole("region", { name: "Conteúdo publicado pelo Builder" });
  await expect(published).toBeVisible();
  await expect(published).toContainText(marker);
  await expect(salon.locator("footer")).toContainText("Live tenant");

  // Restore historical approved content as a new *private* draft.
  // It must never silently change the already published Salon.
  await page.getByRole("button", { name: "Restaurar como novo draft" }).click();
  await expect(page.getByText(/Rollback preparado como novo draft/)).toBeVisible();
  await salon.reload();
  await expect(salon.getByRole("region", { name: "Conteúdo publicado pelo Builder" })).toContainText(marker);

  // Never print credentials or tokens in logs.
  console.log(`QA_EDITORIAL_E2E=PASS tenant=${QA_A} author=${QA_EDITOR} marker=${marker}`);
  await salon.close();
});
