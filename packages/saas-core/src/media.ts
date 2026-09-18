/**
 * Media contracts — tenant-owned assets with explicit visibility.
 * Private assets always require signed URLs issued server-side.
 *
 * ALIGNED with the canonical remote Supabase storage design
 * (project mmykyzzkcugxunmekwew, storage_security_v1):
 * - Buckets: tenant-public / tenant-private
 * - Object key convention: <tenant-uuid>/<folder>/<file>
 *   The FIRST path segment is always the tenant UUID; write policies parse
 *   that segment and reject uploads whose prefix does not match the caller's
 *   tenant. The application MUST adapt to these policies (this file does).
 */

export type MediaVisibility = "public" | "private";

/** Canonical storage buckets (remote, confirmed 2026-09-15). */
export type MediaBucket = "tenant-public" | "tenant-private";

export const BUCKETS: Readonly<{ public: MediaBucket; private: MediaBucket }> = {
  public: "tenant-public",
  private: "tenant-private",
} as const;

export function bucketForVisibility(visibility: MediaVisibility): MediaBucket {
  return visibility === "public" ? BUCKETS.public : BUCKETS.private;
}

export interface MediaAsset {
  id: string;
  tenantId: string;
  bucket: string;
  path: string;
  filename: string;
  mimeType: string;
  size: number;
  visibility: MediaVisibility;
  altText?: string;
  tags: string[];
  createdBy?: string;
  createdAt: string;
}

/** Executable / dangerous MIME types are never accepted for upload. */
const BLOCKED_MIME_PREFIXES = ["application/x-", "text/javascript", "application/javascript"];

const ALLOWED_MIME_PATTERN = /^(image\/|video\/|audio\/|application\/pdf|text\/plain)/;

export function isUploadAllowed(mimeType: string, size: number, maxFileSize: number): boolean {
  if (size <= 0 || size > maxFileSize) return false;
  if (BLOCKED_MIME_PREFIXES.some((p) => mimeType.startsWith(p))) return false;
  return ALLOWED_MIME_PATTERN.test(mimeType);
}

/** Canonical UUID v4-ish shape (any version nibble accepted, case-insensitive). */
const UUID_PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Builds the canonical object key: <tenant-uuid>/<folder>/<file>.
 *
 * SECURITY CONTRACTS (all enforced structurally):
 * - tenantId must be a canonical UUID; it becomes the FIRST path segment
 *   (lowercased), matching remote write policies that parse segment 1.
 * - `/` never survives in folder or filename segments → traversal is
 *   structurally impossible; the key can never escape the tenant prefix.
 * - A segment made only of dots (".", "..") collapses to "_", so the first
 *   segment stays the UUID and no segment resolves to a parent directory.
 *
 * The legacy `tenants/<uuid>/...` prefix is intentionally gone: remote
 * storage policies expect the tenant UUID as segment 1.
 */
export function tenantMediaPath(tenantId: string, folder: string, filename: string): string {
  if (!UUID_PATTERN.test(tenantId)) {
    throw new Error(`tenantMediaPath: tenantId must be a canonical UUID, got "${tenantId}"`);
  }
  const sanitizeSegment = (raw: string): string => {
    const safe = raw.replace(/[^a-zA-Z0-9._-]/g, "_");
    // Dots-only names ("..", ".") would fake a relative directory — collapse them.
    return safe.length === 0 || /^\.+$/.test(safe) ? "_" : safe;
  };
  const uuid = tenantId.toLowerCase();
  return `${uuid}/${sanitizeSegment(folder)}/${sanitizeSegment(filename)}`;
}

/** Structural defense-in-depth: validates an object key against the convention. */
export function isCanonicalMediaPath(path: string, tenantId: string): boolean {
  const segments = path.split("/");
  if (segments.length !== 3) return false;
  if (segments[0].toLowerCase() !== tenantId.toLowerCase() || !UUID_PATTERN.test(segments[0])) {
    return false;
  }
  return segments[1].length > 0 && segments[2].length > 0 && segments[1] !== "." && segments[1] !== ".." && segments[2] !== "." && segments[2] !== "..";
}
