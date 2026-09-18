import { describe, expect, it } from "vitest";
import { InMemoryWebhookIdempotency } from "./billing";

describe("billing webhook idempotency", () => {
  it("accepts an event id exactly once", () => {
    const guard = new InMemoryWebhookIdempotency();
    expect(guard.acceptOnce("evt_1")).toBe(true);
    expect(guard.acceptOnce("evt_1")).toBe(false);
    expect(guard.acceptOnce("evt_2")).toBe(true);
  });

  it("SECURITY CONTRACT: replayed webhook events are dropped (double-charge protection)", () => {
    const guard = new InMemoryWebhookIdempotency();
    const first = guard.acceptOnce("checkout.completed:evt_42");
    const replay = guard.acceptOnce("checkout.completed:evt_42");
    expect(first).toBe(true);
    expect(replay).toBe(false);
  });

  it("treats distinct event ids independently", () => {
    const guard = new InMemoryWebhookIdempotency();
    expect(guard.acceptOnce("evt_a")).toBe(true);
    expect(guard.acceptOnce("evt_b")).toBe(true);
    expect(guard.acceptOnce("evt_c")).toBe(true);
  });
});
