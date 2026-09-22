import { describe, expect, it, vi } from "vitest";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { BuilderAccessDependencies } from "./access";
import { loadBuilderAccess } from "./access";

const client = {} as SupabaseClient;
const session = { user: { id: "user-1" } } as Session;

function tenantResult(input?: {
  tenantId?: string | null;
  selectionOk?: boolean;
  memberships?: number;
}) {
  const tenantId = input?.tenantId === undefined ? "tenant-a" : input.tenantId;
  const count = input?.memberships ?? 1;
  const tenant = tenantId
    ? {
        id: tenantId,
        slug: tenantId,
        name: tenantId,
        vertical_id: "vertical-1",
        status: "active",
        created_by: "user-1",
        created_at: "2026-09-22T00:00:00.000Z",
        updated_at: "2026-09-22T00:00:00.000Z",
      }
    : null;

  return {
    memberships: Array.from({ length: count }, (_, index) => ({
      membership: {
        id: `membership-${index}`,
        tenant_id: tenant?.id ?? `tenant-${index}`,
        user_id: "user-1",
        status: "active",
        joined_at: null,
      },
      tenant:
        tenant ?? {
          id: `tenant-${index}`,
          slug: `tenant-${index}`,
          name: `Tenant ${index}`,
          vertical_id: "vertical-1",
          status: "active",
          created_by: "user-1",
          created_at: "2026-09-22T00:00:00.000Z",
          updated_at: "2026-09-22T00:00:00.000Z",
        },
    })),
    context: {
      selection: { ok: input?.selectionOk ?? Boolean(tenant) },
      tenant,
      brand: tenant ? { tenant_id: tenant.id, display_name: "Tenant A" } : null,
      theme: tenant ? { tenant_id: tenant.id, tokens: { primary: "#111" } } : null,
      settings: tenant
        ? { tenant_id: tenant.id, locale: "pt-BR", timezone: "America/Sao_Paulo", currency: "BRL" }
        : null,
      subscription: null,
      effectiveEntitlements: tenant ? [{ key: "cms", value: true, source: "plan" }] : [],
    },
  } as Awaited<ReturnType<BuilderAccessDependencies["resolveTenantContext"]>>;
}

describe("Builder access bootstrap", () => {
  it("is default-deny when there is no authenticated session", async () => {
    const resolve = vi.fn();
    const state = await loadBuilderAccess(client, {}, {
      getSession: async () => null,
      resolveTenantContext: resolve,
    });

    expect(state).toEqual({ status: "unauthorized" });
    expect(resolve).not.toHaveBeenCalled();
  });

  it("returns empty when the authenticated user has no active memberships", async () => {
    const state = await loadBuilderAccess(client, {}, {
      getSession: async () => session,
      resolveTenantContext: async () => tenantResult({ tenantId: null, memberships: 0 }),
    });

    expect(state).toEqual({ status: "empty" });
  });

  it("denies a tenant that canonical tenancy rejected", async () => {
    const state = await loadBuilderAccess(client, { requestedTenantId: "tenant-b" }, {
      getSession: async () => session,
      resolveTenantContext: async () => tenantResult({ tenantId: null, selectionOk: false }),
    });

    expect(state.status).toBe("forbidden");
    if (state.status === "forbidden") {
      expect(state.reason).toBe("TENANT_NOT_ALLOWED");
    }
  });

  it("denies a non-canonical vertical key", async () => {
    const state = await loadBuilderAccess(client, { requestedVerticalKey: "Cliente X" }, {
      getSession: async () => session,
      resolveTenantContext: async () => tenantResult(),
    });

    expect(state.status).toBe("forbidden");
    if (state.status === "forbidden") {
      expect(state.reason).toBe("INVALID_VERTICAL");
    }
  });

  it("returns the read-only tenant snapshot for an allowed tenant and vertical", async () => {
    const state = await loadBuilderAccess(
      client,
      { requestedTenantId: "tenant-a", requestedVerticalKey: "bakery" },
      {
        getSession: async () => session,
        resolveTenantContext: async (_client, input) => {
          expect(input.reads).toEqual(["brand", "theme", "settings", "entitlements"]);
          return tenantResult();
        },
      },
    );

    expect(state.status).toBe("selected");
    if (state.status === "selected") {
      expect(state.context.tenant?.id).toBe("tenant-a");
      expect(state.context.brand?.display_name).toBe("Tenant A");
      expect(state.verticalKey).toBe("bakery");
    }
  });
});
