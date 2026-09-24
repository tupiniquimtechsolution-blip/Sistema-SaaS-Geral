import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const url = process.env.BUILDER_BASE_URL ?? "http://127.0.0.1:4173";
const thresholds = {
  performance: 0.8,
  accessibility: 0.95,
  "best-practices": 0.9,
};

const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
});

try {
  const result = await lighthouse(url, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: Object.keys(thresholds),
  });

  if (!result) throw new Error("Lighthouse returned no result");
  await mkdir("lighthouse", { recursive: true });
  await writeFile("lighthouse/report.json", result.report, "utf8");

  const scores = Object.fromEntries(
    Object.keys(thresholds).map((key) => [key, result.lhr.categories[key]?.score ?? 0]),
  );
  await writeFile("lighthouse/scores.json", `${JSON.stringify(scores, null, 2)}\n`, "utf8");

  const failures = Object.entries(thresholds)
    .filter(([key, minimum]) => scores[key] < minimum)
    .map(([key, minimum]) => `${key}=${scores[key]} < ${minimum}`);

  console.log(`Lighthouse scores: ${JSON.stringify(scores)}`);
  if (failures.length > 0) {
    throw new Error(`Lighthouse gate failed: ${failures.join(", ")}`);
  }
} finally {
  await chrome.kill();
}
