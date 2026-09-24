import { describe, expect, it } from "vitest";
import { VERTICAL_REGISTRY, getVerticalDefinition, isVerticalRunnable } from "./verticals";

describe("VERTICAL_REGISTRY", () => {
  it("keeps every adopted Wave 01 vertical explicit", () => {
    expect(Object.keys(VERTICAL_REGISTRY)).toEqual(
      expect.arrayContaining(["bakery", "pet", "restaurant", "heavy-machinery", "religious-house", "led"]),
    );
  });

  it("keeps LED blocked instead of inventing a source", () => {
    expect(getVerticalDefinition("led")?.sourceStatus).toBe("blocked-source");
    expect(isVerticalRunnable("led")).toBe(false);
  });

  it("keeps sensitive religious-house modules out of the default module list", () => {
    const religious = getVerticalDefinition("religious-house");
    expect(religious?.modules).not.toEqual(expect.arrayContaining(["members", "attendance", "volunteers"]));
    expect(religious?.privacyNotes.join(" ")).toMatch(/sensitive|privacy/i);
  });

  it("fails closed for unknown verticals", () => {
    expect(getVerticalDefinition("unknown")).toBeNull();
    expect(isVerticalRunnable("unknown")).toBe(false);
  });
});
