import { describe, expect, it } from "vitest";
import { BUCKETS, bucketForVisibility, isCanonicalMediaPath, isUploadAllowed, tenantMediaPath } from "./media";

const UUID_A = "11111111-2222-3333-4444-555555555555";
const UUID_B = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

describe("media upload policy", () => {
  const MAX = 5 * 1024 * 1024;

  it("accepts safe images within size limit", () => {
    expect(isUploadAllowed("image/png", 1024, MAX)).toBe(true);
    expect(isUploadAllowed("application/pdf", MAX, MAX)).toBe(true);
  });

  it("rejects executables and scripts", () => {
    expect(isUploadAllowed("application/x-sh", 10, MAX)).toBe(false);
    expect(isUploadAllowed("application/x-msdownload", 10, MAX)).toBe(false);
    expect(isUploadAllowed("text/javascript", 10, MAX)).toBe(false);
    expect(isUploadAllowed("application/javascript", 10, MAX)).toBe(false);
  });

  it("rejects unknown mime families (default deny)", () => {
    expect(isUploadAllowed("application/octet-stream", 10, MAX)).toBe(false);
    expect(isUploadAllowed("weird/type", 10, MAX)).toBe(false);
  });

  it("rejects zero or oversized files", () => {
    expect(isUploadAllowed("image/png", 0, MAX)).toBe(false);
    expect(isUploadAllowed("image/png", MAX + 1, MAX)).toBe(false);
  });
});

describe("canonical storage buckets", () => {
  it("maps visibility to the canonical remote buckets", () => {
    expect(BUCKETS.public).toBe("tenant-public");
    expect(BUCKETS.private).toBe("tenant-private");
    expect(bucketForVisibility("public")).toBe("tenant-public");
    expect(bucketForVisibility("private")).toBe("tenant-private");
  });
});

describe("canonical tenant media path (<uuid>/<folder>/<file>)", () => {
  it("puts the tenant UUID as the FIRST path segment (remote policy convention)", () => {
    expect(tenantMediaPath(UUID_A, "images", "logo.png")).toBe(`${UUID_A}/images/logo.png`);
  });

  it("accepts uppercase UUIDs but emits a lowercase first segment", () => {
    expect(tenantMediaPath(UUID_A.toUpperCase(), "docs", "menu.pdf")).toBe(`${UUID_A}/docs/menu.pdf`);
  });

  it("rejects non-UUID tenant ids (must match remote policy segment parsing)", () => {
    expect(() => tenantMediaPath("t-a", "images", "x.png")).toThrow(/canonical UUID/);
    expect(() => tenantMediaPath("", "images", "x.png")).toThrow(/canonical UUID/);
  });

  it("sanitizes unsafe filenames and traversal", () => {
    expect(tenantMediaPath(UUID_A, "images", "../../etc/passwd.png")).toBe(`${UUID_A}/images/.._.._etc_passwd.png`);
    expect(tenantMediaPath(UUID_A, "my folder", "my file (1).jpg")).toBe(`${UUID_A}/my_folder/my_file__1_.jpg`);
  });

  it("collapses dots-only segments so no segment can act as a parent directory", () => {
    expect(tenantMediaPath(UUID_A, "..", "x.png")).toBe(`${UUID_A}/_/x.png`);
    expect(tenantMediaPath(UUID_A, "images", "..")).toBe(`${UUID_A}/images/_`);
  });

  it("SECURITY CONTRACT: tenant A path never lands under tenant B prefix", () => {
    const p = tenantMediaPath(UUID_A, "images", "x.png");
    expect(p.startsWith(`${UUID_B}/`)).toBe(false);
    expect(p.startsWith(`${UUID_A}/`)).toBe(true);
  });

  it("SECURITY CONTRACT: slashes can never be smuggled through folder or filename", () => {
    const p = tenantMediaPath(UUID_A, "a/b", "../../c.png");
    const segments = p.split("/");
    expect(segments).toHaveLength(3); // uuid / folder / file — nothing more
    expect(segments[0]).toBe(UUID_A);
  });
});

describe("isCanonicalMediaPath (defense in depth)", () => {
  it("validates keys that follow the remote convention", () => {
    expect(isCanonicalMediaPath(`${UUID_A}/images/logo.png`, UUID_A)).toBe(true);
  });

  it("rejects wrong tenant prefix, wrong segment count and traversal segments", () => {
    expect(isCanonicalMediaPath(`${UUID_B}/images/logo.png`, UUID_A)).toBe(false);
    expect(isCanonicalMediaPath(`tenants/${UUID_A}/logo.png`, UUID_A)).toBe(false);
    expect(isCanonicalMediaPath(`${UUID_A}/../logo.png`, UUID_A)).toBe(false);
    expect(isCanonicalMediaPath(`${UUID_A}/images`, UUID_A)).toBe(false);
  });
});
