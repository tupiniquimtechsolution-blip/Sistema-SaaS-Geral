import { describe, expect, it } from "vitest";
import { projectUser } from "./session";
import type { User } from "@supabase/supabase-js";

describe("auth user projection", () => {
  it("projects a Supabase user into the minimal tenant-facing shape", () => {
    const user = {
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      email: "a@example.test",
      email_confirmed_at: "2026-01-01T00:00:00Z",
      user_metadata: { display_name: "Owner A" },
    } as unknown as User;
    const p = projectUser(user);
    expect(p).not.toBeNull();
    expect(p?.id).toBe(user.id);
    expect(p?.email).toBe("a@example.test");
    expect(p?.emailConfirmed).toBe(true);
    expect(p?.displayName).toBe("Owner A");
  });

  it("returns null for a null user (signed out)", () => {
    expect(projectUser(null)).toBeNull();
  });

  it("does not leak raw metadata beyond the projection fields", () => {
    const user = {
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      email: "b@example.test",
      user_metadata: { display_name: 123, phone: "+5511...", role: "service_role" },
    } as unknown as User;
    const p = projectUser(user)!;
    expect(p.displayName).toBeNull();
    expect(Object.keys(p).sort()).toEqual(["displayName", "email", "emailConfirmed", "id"]);
  });
});
