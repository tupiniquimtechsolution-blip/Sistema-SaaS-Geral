import { expect, test } from "@playwright/test";

test("Vanessa booking calendar creates custom WhatsApp request without reserving a slot", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.goto(base, { waitUntil: "domcontentloaded" });
  const widget = page.locator(".salon-booking-widget");
  await expect(widget).toBeVisible();
  await widget.getByRole("button", { name: "Cabelos e tratamentos" }).click();
  await expect(widget.getByRole("button", { name: "Cabelos e tratamentos" })).toHaveAttribute("aria-pressed", "true");
  const validDays = widget.locator(".salon-booking-day-grid button:not([disabled])");
  await expect(validDays.first()).toBeVisible();
  await validDays.nth(1).click(); // tomorrow, avoids past-time cutoffs
  await widget.getByRole("button", { name: "10:30", exact: true }).click();
  await widget.locator("#salon-message").fill("Preciso de um atendimento mais delicado.");
  const link = widget.getByRole("link", { name: /Solicitar pelo WhatsApp/i });
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\/5511988149152\?/);
  const msg = new URL(href!).searchParams.get("text") || "";
  expect(msg).toContain("Cabelos e tratamentos");
  expect(msg).toContain("10:30");
  expect(msg).toContain("Preciso de um atendimento mais delicado.");
  expect(msg).toContain("aguardo a confirmação");
  const floating = page.getByRole("link", { name: "Conversar pelo WhatsApp com o salão" });
  await expect(floating).toBeVisible();
  await expect(floating.locator("svg")).toBeVisible();
  await expect(floating).toHaveCSS("position", "fixed");
  await expect(floating).toHaveCSS("right", /.+/);
  await expect(floating).toHaveCSS("bottom", /.+/);
  await expect(page.getByText(/Nenhum horário é reservado automaticamente/i)).toBeVisible();
});
