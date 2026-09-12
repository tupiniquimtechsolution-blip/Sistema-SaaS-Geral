/**
 * Media contracts — tenant-owned assets with explicit visibility.
 * Private assets always require signed URLs issued server-side.
 */

export type MediaVisibility = "public" | "private";

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

/** Builds the storage path enforcing tenant ownership in the object key itself. */
export function tenantMediaPath(tenantId: string, filename: string): string {
  // Slashes are replaced, so the result is always a single safe path segment
  // under the tenant prefix — path traversal is structurally impossible.
  let safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  // A filename made only of dots (e.g. "..") must not survive as-is.
  if (safe.length === 0 || /^\.+$/.test(safe)) safe = "_";
  return `tenants/${tenantId}/${safe}`;
}
