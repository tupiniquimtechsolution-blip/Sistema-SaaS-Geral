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
  await widget.getByRole("button", { name: "Horário 10:30 de Brasília", exact: true }).click();
  await expect(widget.getByText("3 de 3 etapas")).toBeVisible();
  await widget.locator("#salon-message").fill("Preciso de um atendimento mais delicado.");
  const link = widget.getByRole("link", { name: /Revisar e enviar pelo WhatsApp/i });
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

test("Booking gives clear progress, summary and a complete local reset", async ({ page }) => {
  const base = process.env.VANESSA_VISUAL_URL;
  if (!base) throw new Error("VANESSA_VISUAL_URL is required");
  await page.goto(base, { waitUntil: "domcontentloaded" });
  const widget = page.locator(".salon-booking-widget");
  await expect(widget).toContainText("0 de 3 etapas");
  await widget.getByRole("button", { name: "Outro serviço" }).click();
  await expect(widget.getByRole("button", { name: "Descreva o serviço desejado" })).toBeDisabled();
  await widget.getByPlaceholder("Descreva o serviço").fill("Atendimento especial");
  await expect(widget).toContainText("1 de 3 etapas");
  const days = widget.locator(".salon-booking-day-grid button:not([disabled])");
  await days.nth(1).click();
  await widget.getByRole("button", { name: "Horário 11:00 de Brasília" }).click();
  await expect(widget).toContainText("3 de 3 etapas");
  await expect(widget.locator(".salon-booking-review")).toContainText("Atendimento especial");
  await widget.getByRole("button", { name: "Limpar minha seleção" }).click();
  await expect(widget).toContainText("0 de 3 etapas");
  await expect(widget.locator(".salon-booking-review")).toContainText("A escolher");
});
