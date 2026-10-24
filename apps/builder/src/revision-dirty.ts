import { assertPageRevisionSnapshot, type PageRevisionSnapshot } from "tupiniquim-database";

/**
 * JSONB returned by PostgreSQL may reorder object keys. The draft must be
 * considered dirty only when validated snapshot values actually differ,
 * not when object property order changes across a save + reload.
 */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonical(item)]),
    );
  }
  return value;
}

export function isRevisionSnapshotDirty(
  working: PageRevisionSnapshot,
  saved: PageRevisionSnapshot,
): boolean {
  return JSON.stringify(canonical(assertPageRevisionSnapshot(working))) !==
    JSON.stringify(canonical(assertPageRevisionSnapshot(saved)));
}
