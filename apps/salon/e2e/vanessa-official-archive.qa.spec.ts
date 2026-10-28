import { expect, test } from "@playwright/test";

test("official archive supports browsing 155 photos, 28 videos and downloading a local editorial selection", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.goto(new URL("?curadoria=1", base).toString(), { waitUntil: "domcontentloaded" });
  const archive = page.locator(".vanessa-full-gallery");
  await expect(archive.locator(".vanessa-archive-tile")).toHaveCount(18);
  await expect(page.getByText(/155 fotografias e 28 vídeos disponíveis/)).toBeVisible();
  await expect(page.getByText(/Curadoria local de QA\. Reproduza/)).toBeVisible();
  const sources = await archive.locator(".vanessa-archive-view img").evaluateAll(
    (imgs) => imgs.map((img) => (img as HTMLImageElement).src)
  );
  expect(new Set(sources).size).toBe(18);
  await archive.getByRole("button", { name: "Mostrar mais fotografias" }).click();
  await expect(archive.locator(".vanessa-archive-tile")).toHaveCount(36);

  await archive.getByRole("checkbox", { name: "Selecionar foto 1", exact: true }).check();
  await expect(archive.getByText("1 mídias selecionadas para revisão")).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    archive.getByRole("button", { name: "Baixar minha seleção" }).click()
  ]);
  expect(download.suggestedFilename()).toBe("vanessa-braz-selecao-acervo.json");

  await archive.getByRole("button", { name: "Ampliar fotografia 1", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Foto ampliada" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Foto ampliada" })).toHaveCount(0);

  const videos = page.locator(".vanessa-official-videos");
  await expect(videos.locator("video")).toHaveCount(4);
  await videos.getByRole("button", { name: "Mostrar mais vídeos" }).click();
  await expect(videos.locator("video")).toHaveCount(8);
  await expect(page.getByRole("link", { name: /Instagram/ }).first()).toHaveAttribute("href", /instagram.com/);
  await expect(page.locator("#contato iframe")).toHaveAttribute("src", /maps.google.com/);
  await expect(page.locator("#contato")).toContainText("Chácara Tatuapé, São Paulo");
  await page.reload();
  await expect(archive.getByText("1 mídias selecionadas para revisão")).toBeVisible();
});

test("mobile menu reveals all Salon sections and illustrated service choices", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.locator(".vanessa-mobile-menu summary").click();
  await expect(page.locator(".vanessa-mobile-menu").getByRole("link", { name: "Galeria" })).toBeVisible();
  await expect(page.locator(".vanessa-mobile-menu").getByRole("link", { name: "Contato" })).toBeVisible();
  await expect(page.locator(".vanessa-mobile-menu").getByRole("link", { name: "Vídeos" })).toHaveCount(0);
  const booking = page.locator(".salon-booking-widget");
  await expect(booking.locator(".salon-service-option")).toHaveCount(7);
  await booking.getByRole("button", { name: "Sobrancelhas" }).click();
  await expect(booking.getByRole("button", { name: "Sobrancelhas" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: "Conversar pelo WhatsApp com o salão" })).toHaveCSS("position", "fixed");
});

test("Anonymous gallery hides QA review controls but keeps photos and video playback", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Galeria" })).toBeVisible();
  await expect(page.locator(".vanessa-official-grid img")).toHaveCount(18);
  await expect(page.locator(".vanessa-videos-grid video")).toHaveCount(4);
  await expect(page.getByText(/REVISÃO DE QA|fotografias distintas|repositório oficial/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Baixar minha seleção" })).toHaveCount(0);
  await expect(page.getByRole("checkbox", { name: /Selecionar foto/ })).toHaveCount(0);
});
