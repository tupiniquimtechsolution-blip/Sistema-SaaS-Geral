import type { SupabaseClient, Session, User } from "@supabase/supabase-js";

/**
 * Shared auth foundation over the canonical Supabase project.
 *
 * Scope of this wave (minimum for controlled live integration):
 * - getSession / onAuthStateChange / signInWithPassword / signOut
 * - a validated user projection for the tenancy layer
 *
 * Explicitly NOT implemented yet (future waves): password recovery,
 * OAuth/SSO, magic links, MFA. No mock auth — the real Supabase session is
 * the only source here (demo fallback lives at the adapter layer, gated by
 * DEMO_MODE, never faked at this layer).
 *
 * This package never reads import.meta.env; the app passes the client in.
 */

export interface AuthUserProjection {
  id: string;
  email: string | null;
  emailConfirmed: boolean;
  displayName: string | null;
}

export type AuthStateListener = (session: Session | null) => void;

export function projectUser(user: User | null): AuthUserProjection | null {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const displayName =
    typeof meta["display_name"] === "string" ? (meta["display_name"] as string) : null;
  return {
    id: user.id,
    email: user.email ?? null,
    emailConfirmed: (user.email_confirmed_at ?? null) != null,
    displayName,
  };
}

export async function getSession(client: SupabaseClient): Promise<Session | null> {
  const { data, error } = await client.auth.getSession();
  if (error) throw new Error(`auth session read failed: ${error.message}`);
  return data.session ?? null;
}

export function projectSession(session: Session | null): AuthUserProjection | null {
  return projectUser(session?.user ?? null);
}

/** Subscribes to auth changes; returns the unsubscribe function. */
export function onAuthStateChange(
  client: SupabaseClient,
  listener: AuthStateListener,
): () => void {
  const { data } = client.auth.onAuthStateChange((_event, session) => listener(session ?? null));
  return () => data.subscription.unsubscribe();
}

export async function signInWithPassword(
  client: SupabaseClient,
  email: string,
  password: string,
): Promise<Session> {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in failed: ${error.message}`);
  if (!data.session) throw new Error("sign-in failed: no session returned");
  return data.session;
}

export async function signOut(client: SupabaseClient): Promise<void> {
  const { error } = await client.auth.signOut();
  if (error) throw new Error(`sign-out failed: ${error.message}`);
}
