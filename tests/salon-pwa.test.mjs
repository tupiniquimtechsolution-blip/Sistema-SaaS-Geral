import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

test("Salon PWA manifest is standalone and icons have actual standard PNG dimensions", () => {
  const root = new URL("../apps/salon/public/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("manifest.webmanifest", root), "utf8"));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.lang, "pt-BR");
  for (const px of [192, 512]) {
    const name = new URL("icons/icon-" + px + ".png", root);
    assert.ok(existsSync(name));
    const data = readFileSync(name);
    assert.equal(data.subarray(0,8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(data.readUInt32BE(16), px);
    assert.equal(data.readUInt32BE(20), px);
    assert.ok(manifest.icons.some((icon) => icon.sizes === px + "x" + px));
  }
});

test("Salon service worker does not cache API, auth or cross-origin content", () => {
  const root = new URL("../apps/salon/public/", import.meta.url);
  const sw = readFileSync(new URL("sw.js", root), "utf8");
  const html = readFileSync(new URL("../index.html", root), "utf8");
  assert.match(sw, /req.method\s*!==\s*"GET"/);
  assert.match(sw, /url.origin\s*!==\s*self.location.origin/);
  assert.match(sw, /url.pathname.startsWith\("\/assets\/"\)/);
  assert.match(html, /rel="manifest"/);
  assert.match(html, /apple-touch-icon/);
});
