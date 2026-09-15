import { describe, expect, it } from "vitest";
import { InMemoryStructuredLogger } from "./observability";

describe("structured logger", () => {
  it("records entries with level, message and context", () => {
    const logger = new InMemoryStructuredLogger();
    logger.info("order created", { tenantId: "t-1", userId: "u-1", action: "order.create" });
    expect(logger.entries).toHaveLength(1);
    expect(logger.entries[0].level).toBe("info");
    expect(logger.entries[0].message).toBe("order created");
    expect(logger.entries[0].context?.tenantId).toBe("t-1");
  });

  it("SECURITY CONTRACT: strips secret-like keys from log data", () => {
    const logger = new InMemoryStructuredLogger();
    logger.error("auth failed", { tenantId: "t-1" }, {
      password: "hunter2",
      api_key: "sk-live-123",
      Authorization: "Bearer xyz",
      sessionCookie: "sid=abc",
      attempts: 3,
    });
    expect(logger.entries[0].data).toEqual({ attempts: 3 });
  });

  it("SECURITY CONTRACT: never emits raw secrets even at debug level", () => {
    const logger = new InMemoryStructuredLogger();
    logger.debug("webhook dispatch", undefined, { secretRef: "vault://x", TOKEN: "t" });
    expect(logger.entries[0].data).toEqual({});
  });

  it("keeps safe telemetry data intact", () => {
    const logger = new InMemoryStructuredLogger();
    logger.warn("slow query", { tenantId: "t-2" }, { durationMs: 1200, table: "orders" });
    expect(logger.entries[0].data).toEqual({ durationMs: 1200, table: "orders" });
  });
});
