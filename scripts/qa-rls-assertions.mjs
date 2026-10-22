/**
 * Pure authorization-result classifiers shared by hosted read-only QA and
 * explicitly approved negative-write QA gates.
 *
 * RLS denial may be represented by zero visible rows or SQLSTATE 42501.
 * Never treat network, authentication, missing-table, or malformed responses
 * as proof of isolation.
 */
export function isRlsPermissionDenial(error) {
  return Boolean(error && typeof error === "object" && error.code === "42501");
}

/** A foreign-tenant SELECT is denied only on [] or explicit SQLSTATE 42501. */
export function foreignRowsDenied({ data, error }) {
  if (error != null) return isRlsPermissionDenial(error);
  return Array.isArray(data) && data.length === 0;
}

/** The countRows helper returns {n,err?,code?} instead of PostgREST rows. */
export function foreignCountDenied({ n, err, code }) {
  if (err !== undefined) return typeof err === "string" && code === "42501";
  return n === 0;
}

/** UPDATE ... SELECT id returns [] for RLS-hidden rows or 42501 on explicit denial. */
export function updateDenied({ data, error }) {
  return foreignRowsDenied({ data, error });
}

/** INSERT denial must be explicit 42501, not a schema/FK/network failure. */
export function insertDenied({ error }) {
  return isRlsPermissionDenial(error);
}

/** QA Viewer membership must have exactly one role, and it must be Viewer. */
export function viewerOnly({ data, error }, expectedViewerRoleId) {
  return error == null &&
    Array.isArray(data) &&
    data.length === 1 &&
    data[0]?.role_id === expectedViewerRoleId;
}
