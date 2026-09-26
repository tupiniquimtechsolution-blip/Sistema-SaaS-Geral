import { describe, expect, it } from "vitest";
import { assertStudioComponentPatch, getStudioComponent } from "./studio-components";

describe("Studio component registry", () => {
  it("accepts registered fields", () => expect(assertStudioComponentPatch("hero", { headline: "Nova" }).key).toBe("hero"));
  it("rejects arbitrary component types", () => expect(() => assertStudioComponentPatch("unknown-widget", { text: "x" })).toThrow(/Unregistered/));
  it("rejects fields outside the schema", () => expect(() => assertStudioComponentPatch("hero", { unknownField: "x" })).toThrow(/not allowed/));
  it("honors protected user constraints", () => expect(() => assertStudioComponentPatch("hero", { media: "x" }, ["media"])).toThrow(/Protected/));
  it("returns null for unknown keys", () => expect(getStudioComponent("unknown-widget")).toBeNull());
});
