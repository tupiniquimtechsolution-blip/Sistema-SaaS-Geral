import { expect, test } from "@playwright/test";

// The authorized visual review uses only the upstream Vanessa-Braz source
// pinned at the immutable 74dd4b8 commit, never synthetic stock images.
test("Vanessa visual QA preview displays original editorial photography and no invented booking", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1, name: "Vanessa Braz" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Imagens do acervo" })).toBeVisible();
  await expect(page.locator(".vanessa-hero-img")).toBeVisible();
  await expect(page.locator(".vanessa-grid img")).toHaveCount(6);
  await expect(page.locator("footer")).toContainText("Preview");
  await expect(page.getByRole("heading", { name: "Escolha sua preferência" })).toBeVisible();
  await expect(page.getByText(/Nenhum horário é reservado automaticamente/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Conversar pelo WhatsApp com o salão/i })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/R\$\s*\d/);

  const images = page.locator(".vanessa-showcase img");
  const count = await images.count();
  expect(count).toBeGreaterThanOrEqual(8);
  for (let index = 0; index < count; index++) {
    const img = images.nth(index);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0), {
      message: "Upstream original photo must load in visual QA preview",
      timeout: 30_000,
    }).toBe(true);
  }
});
