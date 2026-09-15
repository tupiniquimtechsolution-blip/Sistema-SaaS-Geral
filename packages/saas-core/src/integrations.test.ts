import { describe, expect, it } from "vitest";
import { isSafeOutboundUrl } from "./integrations";

describe("outbound webhook URL validation (anti-SSRF)", () => {
  it("accepts public https endpoints", () => {
    expect(isSafeOutboundUrl("https://hooks.example.com/x")).toBe(true);
    expect(isSafeOutboundUrl("http://api.partner.io/v1/events")).toBe(true);
  });

  it("SECURITY CONTRACT: blocks localhost and loopback targets", () => {
    expect(isSafeOutboundUrl("http://localhost:8080/hook")).toBe(false);
    expect(isSafeOutboundUrl("http://127.0.0.1/hook")).toBe(false);
    expect(isSafeOutboundUrl("http://0.0.0.0/hook")).toBe(false);
    expect(isSafeOutboundUrl("http://[::1]/hook")).toBe(false);
  });

  it("SECURITY CONTRACT: blocks private network ranges (cloud metadata included)", () => {
    expect(isSafeOutboundUrl("http://10.0.0.5/hook")).toBe(false);
    expect(isSafeOutboundUrl("http://172.16.1.1/hook")).toBe(false);
    expect(isSafeOutboundUrl("http://172.31.255.255/hook")).toBe(false);
    expect(isSafeOutboundUrl("http://192.168.1.1/hook")).toBe(false);
    expect(isSafeOutboundUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
  });

  it("SECURITY CONTRACT: blocks non-http schemes and unparseable input", () => {
    expect(isSafeOutboundUrl("file:///etc/passwd")).toBe(false);
    expect(isSafeOutboundUrl("ftp://example.com/hook")).toBe(false);
    expect(isSafeOutboundUrl("not a url")).toBe(false);
  });

  it("allows boundary values just outside private ranges", () => {
    // 172.32.x is outside the 172.16-31 private block; 11.x is outside 10.x
    expect(isSafeOutboundUrl("http://172.32.0.1/hook")).toBe(true);
    expect(isSafeOutboundUrl("http://11.0.0.1/hook")).toBe(true);
  });
});
