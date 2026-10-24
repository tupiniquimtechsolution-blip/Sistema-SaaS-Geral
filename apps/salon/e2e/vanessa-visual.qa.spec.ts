import { expect, test } from "@playwright/test";

// The official Vanessa Braz Beleza e Autoestima review is pinned at 8e4c304
// and deduplicates the inventory before exposing it for editorial curation.
test("Vanessa visual QA preview displays original editorial photography and no invented booking", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1, name: "Vanessa Braz — Beleza & Autoestima" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Acervo de fotografias" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bastidores em movimento" })).toBeVisible();
  await expect(page.locator(".vanessa-hero-card h1")).toHaveText("Vanessa Braz — Beleza & Autoestima");
  await expect(page.getByRole("link", { name: /EXPLORE O ESPAÇO/ })).toHaveAttribute("href", "#espaco");
  await expect(page.getByRole("heading", { name: "Conheça nosso salão." })).toBeVisible();
  await expect(page.locator(".vanessa-essence-photo img")).toHaveAttribute("src", /source\/images/);
  await expect(page.locator(".vanessa-hero-img")).toBeVisible();
  await expect.poll(async () => await page.locator(".vanessa-hero-img").getAttribute("src"), {
    timeout: 20_000,
    message: "O banner QA precisa exibir a imagem superior aprovada e versionada",
  }).toBe("/media/espaco-vanessa-vista-superior.webp");
  const overheadResponse = await page.request.get(new URL("/media/espaco-vanessa-vista-superior.webp", base).toString());
  expect(overheadResponse.ok()).toBeTruthy();
  expect(overheadResponse.headers()["content-type"]).toContain("image/webp");
  await expect.poll(() => page.locator(".vanessa-hero-img").evaluate(
    (image: HTMLImageElement) => image.complete && image.naturalWidth === 1448
  ), { timeout: 20_000 }).toBe(true);

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

test("Salon first visit displays a translucent photo welcome with full salon identity for 2.5 seconds", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.goto(base, { waitUntil: "domcontentloaded" });
  const intro = page.getByTestId("salon-welcome");
  await expect(intro).toHaveCSS("background-color", "rgb(250, 248, 245)");
  await expect(intro).toBeVisible();
  await expect(intro.getByText("Bem-vindo", { exact: true })).toBeVisible();
  await expect(intro.getByRole("img", { name: /Logo Vanessa Braz/ })).toBeVisible();
  await expect(intro.getByText("ao salão", { exact: true })).toBeVisible();
  await expect(intro.getByText("Vanessa Braz — Beleza & Autoestima", { exact: true })).toBeVisible();
  await expect(intro.getByRole("button")).toHaveCount(0);
  await expect(intro).toHaveCount(0, { timeout: 5000 });
  await page.reload();
  await expect(page.getByTestId("salon-welcome")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: "Vanessa Braz — Beleza & Autoestima" })).toBeVisible();
});

test("Salon offers accessible light/dark switch, preserves preference and keeps text contrast", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.goto(base, { waitUntil: "domcontentloaded" });
  const salon = page.locator(".vanessa-showcase");
  const toggle = page.getByRole("button", { name: /Ativar tema (claro|escuro)/ });
  await expect(toggle).toBeVisible();

  async function checkContrast() {
    const styles = await salon.evaluate((element) => {
      const s = getComputedStyle(element);
      return { foreground: s.color, background: s.backgroundColor };
    });
    function luminance(value: string) {
      const values = value.match(/[\d.]+/g);
      if (!values || values.length < 3) throw new Error("Missing RGB: " + value);
      const channels = values.slice(0, 3).map((v) => {
        const srgb = Number(v) / 255;
        return srgb <= .04045 ? srgb / 12.92 : ((srgb + .055) / 1.055) ** 2.4;
      });
      return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
    }
    const a = luminance(styles.foreground), b = luminance(styles.background);
    const ratio = (Math.max(a,b) + .05) / (Math.min(a,b) + .05);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  }
  await checkContrast();
  const first = await salon.getAttribute("data-theme");
  await toggle.click();
  await expect(salon).toHaveAttribute("data-theme", first === "dark" ? "light" : "dark");
  await checkContrast();
  const selected = await salon.getAttribute("data-theme");
  await page.reload();
  await expect(salon).toHaveAttribute("data-theme", selected!);
  await checkContrast();
});
