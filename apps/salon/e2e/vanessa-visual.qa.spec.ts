import { expect, test } from "@playwright/test";

// The official Vanessa Braz Beleza e Autoestima review is pinned at 8e4c304
// and deduplicates the inventory before exposing it for editorial curation.
test("Vanessa visual QA preview displays original editorial photography and no invented booking", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1, name: "Vanessa Braz" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Acervo de fotografias" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bastidores em movimento" })).toBeVisible();
  await expect(page.locator(".vanessa-hero-img")).toBeVisible();
  await expect(page.locator(".vanessa-official-grid img")).toHaveCount(18);
  await expect(page.locator(".vanessa-videos-grid video")).toHaveCount(4);
  await expect(page.getByText(/155 fotografias distintas/)).toBeVisible();
  await expect(page.locator("footer")).not.toContainText("revisão de QA");
  await expect(page.locator(".vanessa-logo img")).toHaveAttribute("src", /source\/images/);
  await expect(page.getByRole("navigation", { name: "Mapa do site" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Escolha sua preferência" })).toBeVisible();
  await expect(page.getByText(/Nenhum horário é reservado automaticamente/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /Conversar pelo WhatsApp com o salão/i })).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/R\$\s*\d/);

  const images = page.locator(".vanessa-hero-img, .vanessa-essence > img, .vanessa-official-grid img").first();
  await expect(images).toBeVisible();
  for (let index = 0; index < 4; index++) {
    const img = page.locator(".vanessa-official-grid img").nth(index);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0), {
      message: "Upstream original photo must load in visual QA preview",
      timeout: 30_000,
    }).toBe(true);
  }
});

test("Salon first visit displays Bem Vindo with brand logo for 2.5 seconds without a button", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.goto(base, { waitUntil: "domcontentloaded" });
  const intro = page.getByTestId("salon-welcome");
  await expect(intro).toBeVisible();
  await expect(intro.getByText("Bem Vindo", { exact: true })).toBeVisible();
  await expect(intro.getByRole("img", { name: /Logo Vanessa Braz/ })).toBeVisible();
  await expect(intro.getByRole("button")).toHaveCount(0);
  await expect(intro).toHaveCount(0, { timeout: 5000 });
  await page.reload();
  await expect(page.getByTestId("salon-welcome")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: "Vanessa Braz" })).toBeVisible();
});
