/**
 * DEMO FALLBACK POLICY — shared across verticals (platform rule).
 *
 * - DEMO_MODE=true  → explicit fallback allowed; failures surface as
 *   "demo-fallback" (never silently presented as live data).
 * - DEMO_MODE=false → production posture: any failure yields an ERROR state;
 *   demo data must NEVER render as if real.
 *
 * Pure and unit-tested; vertical adapters (bakery first) consume this policy.
 */

export type DemoFallbackOutcome = "ok" | "tenant-not-resolved" | "failure";

export interface DemoFallbackDecision {
  mode: "live" | "demo-fallback" | "error";
  /** Present when mode === "error". Opaque reason; never raw backend text. */
  reason?: "tenant_not_resolved" | "failure";
}

export function resolveDemoFallback(input: {
  demoMode: boolean;
  outcome: DemoFallbackOutcome;
}): DemoFallbackDecision {
  if (input.outcome === "ok") return { mode: "live" };
  if (input.demoMode) return { mode: "demo-fallback" };
  return {
    mode: "error",
    reason: input.outcome === "tenant-not-resolved" ? "tenant_not_resolved" : "failure",
  };
}
