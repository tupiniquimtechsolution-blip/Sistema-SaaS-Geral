import type { SupabaseClient } from "@supabase/supabase-js";

/** Tenant-approved public media only. Never use preview or unscoped external URLs live. */
export interface PublicSalonPhoto { src: string; alt: string; path: string }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const allowedMime = new Set(["image/webp", "image/avif", "image/jpeg", "image/png"]);
type Row = Record<string, unknown>;
function isRecord(value: unknown): value is Row {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function projectApprovedSalonPhotos(rows: unknown, tenantId: string): { path: string; alt: string }[] {
  if (!uuid.test(tenantId)) throw new Error("Invalid Salon tenant for media");
  if (!Array.isArray(rows)) throw new Error("Invalid Salon media projection");
  return rows.map((row: unknown) => {
    if (!isRecord(row) || row.tenant_id !== tenantId || row.storage_bucket !== "tenant-public" ||
        row.visibility !== "public" || typeof row.storage_path !== "string" ||
        typeof row.mime_type !== "string" || !allowedMime.has(row.mime_type) ||
        !row.storage_path.startsWith(tenantId + "/salon/") ||
        !/^[0-9a-zA-Z_\-/.]+$/.test(row.storage_path) ||
        row.storage_path.includes("..") || row.storage_path.includes("//") ||
        !/\.(webp|avif|jpe?g|png)$/i.test(row.storage_path)) {
      throw new Error("Rejected unapproved, private or cross-tenant Salon media");
    }
    return {
      path: row.storage_path as string,
      alt: typeof row.alt_text === "string" ? row.alt_text.slice(0, 240) : "Fotografia do salão",
    };
  });
}
export async function loadPublicSalonMedia(
  client: SupabaseClient, tenantId: string, mediaPublicationAuthorized: boolean,
): Promise<PublicSalonPhoto[]> {
  if (!uuid.test(tenantId)) throw new Error("Invalid Salon tenant for media");
  if (mediaPublicationAuthorized !== true) return [];
  const { data, error } = await client.from("media_assets")
    .select("tenant_id,storage_bucket,storage_path,visibility,mime_type,alt_text")
    .eq("tenant_id", tenantId).eq("visibility", "public")
    .eq("storage_bucket", "tenant-public").order("created_at", { ascending: true }).limit(24);
  if (error) throw new Error("Unable to confirm public Salon media");
  const projected = projectApprovedSalonPhotos(data, tenantId);
  return projected.map((photo) => {
    const { data: urlResult } = client.storage.from("tenant-public").getPublicUrl(photo.path);
    const url = urlResult?.publicUrl;
    if (typeof url !== "string" || !url.startsWith("https://"))
      throw new Error("Invalid public media origin");
    return { src: url, alt: photo.alt, path: photo.path };
  });
}
