import { describe, expect, it } from "vitest";
import { isUploadAllowed, tenantMediaPath } from "./media";

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

describe("tenant media path", () => {
  it("scopes object keys by tenant", () => {
    expect(tenantMediaPath("t-a", "logo.png")).toBe("tenants/t-a/logo.png");
  });

  it("sanitizes unsafe filenames and traversal", () => {
    expect(tenantMediaPath("t-a", "../../etc/passwd.png")).toBe("tenants/t-a/.._.._etc_passwd.png");
    expect(tenantMediaPath("t-a", "my file (1).jpg")).toBe("tenants/t-a/my_file__1_.jpg");
  });

  it("SECURITY CONTRACT: tenant A path never lands under tenant B prefix", () => {
    const p = tenantMediaPath("t-a", "x.png");
    expect(p.startsWith("tenants/t-b/")).toBe(false);
  });
});
