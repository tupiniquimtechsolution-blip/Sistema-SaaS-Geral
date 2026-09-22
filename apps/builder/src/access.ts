import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSession } from "tupiniquim-auth";
import { assertBuilderScope } from "tupiniquim-saas-core";
import {
  resolveTenantContext,
  type TenantContextResult,
} from "tupiniquim-tenancy";

export type BuilderAccessState =
  | { status: "unauthorized" }
  | { status: "empty" }
  | {
      status: "forbidden";
      reason: "TENANT_NOT_ALLOWED" | "INVALID_VERTICAL";
      memberships: TenantContextResult["memberships"];
    }
  | {
      status: "selected";
      memberships: TenantContextResult["memberships"];
      context: TenantContextResult["context"];
      verticalKey: string | null;
    };

export interface BuilderAccessRequest {
  requestedTenantId?: string;
  requestedVerticalKey?: string;
}

export interface BuilderAccessDependencies {
  getSession(client: SupabaseClient): Promise<Session | null>;
  resolveTenantContext(
    client: SupabaseClient,
    input: {
      session: Session;
      requestedTenantId?: string;
      reads?: ReadonlyArray<"brand" | "theme" | "settings" | "entitlements">;
    },
  ): Promise<TenantContextResult>;
}

const liveDependencies: BuilderAccessDependencies = {
  getSession,
  resolveTenantContext,
};

export async function loadBuilderAccess(
  client: SupabaseClient,
  request: BuilderAccessRequest,
  dependencies: BuilderAccessDependencies = liveDependencies,
): Promise<BuilderAccessState> {
  const session = await dependencies.getSession(client);
  if (!session) return { status: "unauthorized" };

  const result = await dependencies.resolveTenantContext(client, {
    session,
    requestedTenantId: request.requestedTenantId,
    reads: ["brand", "theme", "settings", "entitlements"],
  });

  if (result.memberships.length === 0) {
    return { status: "empty" };
  }

  const tenant = result.context.tenant;
  if (!result.context.selection.ok || !tenant) {
    return {
      status: "forbidden",
      reason: "TENANT_NOT_ALLOWED",
      memberships: result.memberships,
    };
  }

  const verticalKey = request.requestedVerticalKey?.trim() || null;
  if (verticalKey) {
    try {
      assertBuilderScope({ tenantId: tenant.id, verticalKey });
    } catch {
      return {
        status: "forbidden",
        reason: "INVALID_VERTICAL",
        memberships: result.memberships,
      };
    }
  }

  return {
    status: "selected",
    memberships: result.memberships,
    context: result.context,
    verticalKey,
  };
}
