import { expect, test } from '@playwright/test';

const baseUrl = process.env.DURABLE_SMOKE_URL;
const expectedTitle = process.env.DURABLE_SMOKE_TITLE;

if (!baseUrl || !expectedTitle) {
  throw new Error('DURABLE_SMOKE_URL and DURABLE_SMOKE_TITLE are required');
}

const origin = new URL(baseUrl).origin;

function isSameOrigin(url: string) {
  try {
    return new URL(url).origin === origin;
  } catch {
    return false;
  }
}

test('durable Cloudflare deployment serves identity, assets and SPA refresh without same-origin failures', async ({ page }) => {
  const consoleErrors: string[] = [];
  const failedSameOriginRequests: string[] = [];
  const badSameOriginResponses: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  page.on('requestfailed', (request) => {
    if (isSameOrigin(request.url())) {
      failedSameOriginRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText ?? 'unknown failure'}`);
    }
  });

  page.on('response', (response) => {
    if (isSameOrigin(response.url()) && response.status() >= 400) {
      badSameOriginResponses.push(`${response.status()} ${response.request().method()} ${response.url()}`);
    }
  });

  const home = await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  expect(home, 'home response must exist').not.toBeNull();
  expect(home!.status(), 'home must return 2xx').toBeGreaterThanOrEqual(200);
  expect(home!.status(), 'home must return 2xx').toBeLessThan(300);
  await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  await expect(page.locator('#root')).not.toBeEmpty({ timeout: 15_000 });

  const sameOriginAssets = await page.evaluate((expectedOrigin) => {
    return Array.from(document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src], link[rel="stylesheet"][href]'))
      .map((node) => node instanceof HTMLScriptElement ? node.src : node.href)
      .filter((url) => {
        try { return new URL(url).origin === expectedOrigin; } catch { return false; }
      });
  }, origin);

  expect(sameOriginAssets.length, 'deployment must reference at least one same-origin JS/CSS asset').toBeGreaterThan(0);

  for (const assetUrl of sameOriginAssets) {
    const response = await page.request.get(assetUrl);
    expect(response.status(), `asset must be reachable: ${assetUrl}`).toBeGreaterThanOrEqual(200);
    expect(response.status(), `asset must be reachable: ${assetUrl}`).toBeLessThan(300);
  }

  const deepLink = `${origin}/__durable-smoke__/deep/link`;
  const deepResponse = await page.goto(deepLink, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  expect(deepResponse, 'deep-link response must exist').not.toBeNull();
  expect(deepResponse!.status(), 'SPA deep link must return 2xx').toBeGreaterThanOrEqual(200);
  expect(deepResponse!.status(), 'SPA deep link must return 2xx').toBeLessThan(300);
  await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  await expect(page.locator('#root')).not.toBeEmpty({ timeout: 15_000 });

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30_000 });
  await expect(page).toHaveTitle(new RegExp(expectedTitle, 'i'));
  await expect(page.locator('#root')).not.toBeEmpty({ timeout: 15_000 });

  expect(failedSameOriginRequests, `same-origin request failures:\n${failedSameOriginRequests.join('\n')}`).toEqual([]);
  expect(badSameOriginResponses, `same-origin HTTP failures:\n${badSameOriginResponses.join('\n')}`).toEqual([]);
  expect(consoleErrors, `browser console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
});
