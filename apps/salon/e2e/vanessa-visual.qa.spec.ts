import { expect, test } from "@playwright/test";

// The official Vanessa Braz Beleza e Autoestima review is pinned at 8e4c304
// and deduplicates the inventory before exposing it for editorial curation.
test("Vanessa visual QA preview displays original editorial photography and no invented booking", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1, name: "Vanessa Braz — Beleza & Autoestima" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Galeria" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Vídeos" })).toBeVisible();
  await expect(page.locator(".vanessa-hero-card h1")).toHaveText("Vanessa Braz — Beleza & Autoestima");
  await expect(page.getByRole("link", { name: /EXPLORE O ESPAÇO/ })).toHaveAttribute("href", "#espaco");
  await expect(page.getByRole("heading", { name: "Um espaço pensado para receber você." })).toBeVisible();
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

  await expect(page.locator(".vanessa-official-grid img")).toHaveCount(12);
  await expect(page.locator(".vanessa-videos-grid video")).toHaveCount(4);
  await expect(page.getByText(/155 fotografias distintas/)).toHaveCount(0);
  await expect(page.getByText(/REVISÃO DE QA/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Baixar minha seleção" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Um momento para cuidar de você." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Seu cuidado, no seu ritmo." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Agende seu horário/ })).toHaveAttribute("href", "#salon-calendar");
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
  await expect(intro.getByText("Bem-Vindo!", { exact: true })).toBeVisible();
  await expect(intro.getByRole("img", { name: /Logo Vanessa Braz/ })).toBeVisible();
  await expect(intro.getByText("Beleza e Autoestima", { exact: true })).toBeVisible();
  await expect(intro.getByText("Vanessa Braz", { exact: true })).toBeVisible();
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

test("Guest layout uses full-width editorial photography and no numbered tutorial cards", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#sobre .vanessa-essence-photo img")).toBeVisible();
  const editorialImage = page.locator("#sobre .vanessa-essence-photo");
  const width = await editorialImage.evaluate((node) => node.getBoundingClientRect().width);
  expect(width).toBeGreaterThanOrEqual(1270);
  await expect(page.locator(".vanessa-info-list")).toHaveCount(0);
  await expect(page.getByText("01 / NOSSA ESSÊNCIA")).toHaveCount(0);
  await expect(page.getByText("02 / SERVIÇOS")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Galeria" })).toBeVisible();
  await expect(page.locator(".vanessa-archive-pick")).toHaveCount(0);
});

test("Salon links take guests to actual service choices and calendar, not marketing copy", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.goto(base, { waitUntil: "domcontentloaded" });
  const serviceLink = page.getByRole("link", { name: /Conheça nossos serviços/ });
  await expect(serviceLink).toHaveAttribute("href", "#salon-service-label");
  await serviceLink.click();
  await expect(page).toHaveURL(/#salon-service-label$/);
  const choices = page.locator("#salon-service-label");
  await expect(choices).toBeVisible();
  await expect.poll(async () => choices.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return rect.top >= 65 && rect.top <= 160;
  }), {timeout: 5000}).toBe(true);

  const scheduleLink = page.getByRole("link", { name: /Agende seu horário/ });
  await expect(scheduleLink).toHaveAttribute("href", "#salon-calendar");
  await scheduleLink.click();
  await expect(page).toHaveURL(/#salon-calendar$/);
  const calendar = page.locator("#salon-calendar");
  await expect(calendar.getByRole("button", { name: "Próximo mês" })).toBeVisible();
  await expect.poll(async () => calendar.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return rect.top >= 65 && rect.top <= 160;
  }), {timeout: 5000}).toBe(true);
});
