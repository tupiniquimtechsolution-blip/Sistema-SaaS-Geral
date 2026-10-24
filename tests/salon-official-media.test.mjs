import test from "node:test";
import assert from "node:assert/strict";
import {
  OFFICIAL_VANESSA_REPO, OFFICIAL_VANESSA_COMMIT,
  officialVanessaPhotos, officialVanessaVideos, officialVanessaQaReviewAllowed
} from "../apps/salon/src/official-vanessa-media.ts";

test("official archive is pinned and has all unique manifest media", () => {
  assert.equal(OFFICIAL_VANESSA_REPO, "tupiniquimtechsolution-blip/VanessaBraz-Beleza-e-Autoestima");
  assert.equal(OFFICIAL_VANESSA_COMMIT, "8e4c3048367ebc3bbcae99d5a1f011fae2908a5d");
  assert.equal(officialVanessaPhotos.length, 155);
  assert.equal(officialVanessaVideos.length, 28);
  const all = [...officialVanessaPhotos, ...officialVanessaVideos];
  assert.equal(new Set(all.map(a => a.sha256)).size, all.length);
  assert.equal(new Set(all.map(a => a.url)).size, all.length);
  for (const a of all) {
    assert.match(a.sha256, /^[a-f0-9]{64}$/);
    assert.ok(a.url.startsWith(
      "https://raw.githubusercontent.com/tupiniquimtechsolution-blip/VanessaBraz-Beleza-e-Autoestima/8e4c3048367ebc3bbcae99d5a1f011fae2908a5d/apps/web/public/media/source/"
    ));
    assert.equal(decodeURIComponent(a.url).endsWith(a.name), true);
  }
});

test("official media review is isolated to Vanessa QA and never automatically production", () => {
  const qa={ VITE_DEMO_MODE: "false", VITE_VANESSA_QA_VISUAL_OVERLAY: "true",
    VITE_TENANT_SLUG: "vanessa-braz", VITE_SUPABASE_URL: "https://ynqbnimlpxlokrxlucdm.supabase.co" };
  assert.equal(officialVanessaQaReviewAllowed(qa, "vanessa-braz"), true);
  assert.equal(officialVanessaQaReviewAllowed(qa, "qa-isolation-tenant-a"), false);
  assert.equal(officialVanessaQaReviewAllowed({...qa,VITE_SUPABASE_URL:"https://mmykyzzkcugxunmekwew.supabase.co"}, "vanessa-braz"), false);
  assert.equal(officialVanessaQaReviewAllowed({...qa,VITE_VANESSA_QA_VISUAL_OVERLAY:"false"}, "vanessa-braz"), false);
  assert.equal(officialVanessaQaReviewAllowed({...qa,VITE_TENANT_SLUG:"qa-isolation-tenant-a"}, "vanessa-braz"), false);
  assert.equal(officialVanessaQaReviewAllowed({
    VITE_DEMO_MODE:"true", VITE_TENANT_SLUG:"vanessa-braz"
  }, "vanessa-braz"), true);
});
