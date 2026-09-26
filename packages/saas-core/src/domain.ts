/**
 * Canonical hostname normalization/resolution contract.
 * Authorization remains database-side; this helper never trusts query-string
 * tenant selection and never falls back to a demo tenant.
 */
export interface TenantDomainRecord {
  tenantId: string;
  hostname: string;
  verified: boolean;
  active: boolean;
}

export function normalizeHostname(value: string): string {
  const hostname = value.trim().toLowerCase().replace(/\.$/, "");
  if (!hostname || hostname.includes("/") || hostname.includes(":") || hostname.length > 253) {
    throw new Error("Invalid hostname");
  }
  return hostname;
}

export function resolveTenantByHostname(hostHeader: string, domains: readonly TenantDomainRecord[]): string | null {
  const hostname = normalizeHostname(hostHeader);
  const matches = domains.filter((domain) =>
    domain.verified && domain.active && normalizeHostname(domain.hostname) === hostname
  );
  if (matches.length !== 1) return null;
  return matches[0].tenantId;
}
