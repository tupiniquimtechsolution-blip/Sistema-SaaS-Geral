import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const baseUrl = process.env.SALON_BASE_URL ?? "http://127.0.0.1:4174";
const expectLive = process.env.SALON_EXPECT_LIVE === "true";

test("Salon renders the expected public runtime without critical accessibility violations", async ({ page }) => {
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await expect(page.locator("main#conteudo")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  if (expectLive) {
    await expect(page.locator("footer")).toContainText("Live tenant");
    await expect(page.locator("body")).toContainText("Vanessa Braz — Beleza & Autoestima");
    await expect(page.locator("body")).toContainText("Rua Redenção 88");
    await expect(page.locator("body")).toContainText("(11) 98814-9152");
    await expect(page.locator("body")).not.toContainText("Preview controlado");
    await expect(page.locator("body")).toContainText("Horários: a confirmar");
  } else {
    await expect(page.locator("footer")).toContainText("Preview");
    await expect(page.locator("body")).toContainText("Preview controlado");
  }

  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const blocking = accessibility.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});

test("Salon keeps unapproved commercial data and booking claims closed", async ({ page }) => {
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  await expect(page.locator("body")).not.toContainText(/R\$\s*\d/);
  await expect(page.locator("body")).toContainText(/serviços, preços e horários/i);
  await expect(page.locator("body")).toContainText(/agenda online permanece bloqueada/i);
});
