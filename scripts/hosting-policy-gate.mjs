import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const ignoredDirs = new Set([".git", "node_modules", "dist", ".wrangler", "coverage", "playwright-report", "test-results"]);

function rel(p) {
  return path.relative(root, p).replaceAll(path.sep, "/");
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const relative = rel(full);
    if (entry.isDirectory()) {
      if (entry.name === ".vercel") failures.push(`Forbidden Vercel project directory: ${relative}`);
      walk(full, out);
    } else {
      out.push(full);
      if (entry.name === "vercel.json" || entry.name === "now.json") {
        failures.push(`Forbidden Vercel deployment config: ${relative}`);
      }
    }
  }
  return out;
}

const files = walk(root);

for (const file of files) {
  const relative = rel(file);

  if (path.basename(file) === "package.json") {
    let pkg;
    try {
      pkg = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      continue;
    }

    const dependencyBlocks = [pkg.dependencies ?? {}, pkg.devDependencies ?? {}, pkg.optionalDependencies ?? {}];
    for (const block of dependencyBlocks) {
      for (const name of Object.keys(block)) {
        if (name === "vercel" || name.startsWith("@vercel/")) {
          failures.push(`Forbidden Vercel dependency ${name} in ${relative}`);
        }
      }
    }

    for (const [name, value] of Object.entries(pkg.scripts ?? {})) {
      if (typeof value !== "string") continue;
      if (/(^|\s)(npx\s+)?vercel(\s|$)|vercel\s+deploy|vercel\s+--prod/i.test(value)) {
        failures.push(`Forbidden Vercel script "${name}" in ${relative}`);
      }
    }
  }

  if (relative.startsWith(".github/workflows/") && /\.ya?ml$/i.test(relative)) {
    const text = fs.readFileSync(file, "utf8");
    const forbidden = [
      /npx\s+vercel\b/i,
      /\bvercel\s+deploy\b/i,
      /\bvercel\s+--prod\b/i,
      /uses:\s*[^\n]*vercel[^\n]*action/i,
      /VERCEL_TOKEN/i,
      /VERCEL_ORG_ID/i,
      /VERCEL_PROJECT_ID/i,
    ];
    if (forbidden.some((pattern) => pattern.test(text))) {
      failures.push(`Forbidden active Vercel deployment reference in workflow: ${relative}`);
    }
  }
}

const requiredWranglerConfigs = [
  "wrangler.jsonc",
  "apps/platform/wrangler.jsonc",
  "apps/builder/wrangler.jsonc",
  "apps/bakery/wrangler.jsonc",
  "apps/pet/wrangler.jsonc",
  "apps/restaurant/wrangler.jsonc",
  "apps/metalart/wrangler.jsonc",
  "apps/heavy-machinery/wrangler.jsonc",
  "apps/religious-house/wrangler.jsonc",
  "apps/salon/wrangler.jsonc",
];

for (const config of requiredWranglerConfigs) {
  if (!fs.existsSync(path.join(root, config))) {
    failures.push(`Missing canonical Cloudflare Wrangler config: ${config}`);
  }
}

let rootPackage;
try {
  rootPackage = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
} catch {
  failures.push("Unable to read root package.json");
}
if (rootPackage && !rootPackage.devDependencies?.wrangler) {
  failures.push("Root package.json must pin Wrangler as a devDependency");
}

if (failures.length) {
  console.error("HOSTING_POLICY_GATE=FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("HOSTING_POLICY_GATE=PASS");
console.log("Canonical hosting: Cloudflare Workers / Static Assets");
console.log("Active Vercel deployment configuration: none detected");
