export const LGPD_POLICY_VERSION = '1.0';

export type ConsentKind = 'operational' | 'marketing' | 'image_use';

export interface ConsentRecord {
  kind: ConsentKind;
  granted: boolean;
  policyVersion: string;
  source: string;
  createdAt: string;
}

export function latestConsent(records: ConsentRecord[], kind: ConsentKind): ConsentRecord | null {
  return records.filter((item) => item.kind === kind).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
}

export function requireOperationalConsent(records: ConsentRecord[]): boolean {
  return latestConsent(records, 'operational')?.granted === true;
}

export function splitConsents(input: {
  operational: boolean;
  marketing: boolean;
  image: boolean;
  source: string;
  at?: string;
  policyVersion?: string;
}): ConsentRecord[] {
  const createdAt = input.at ?? new Date().toISOString();
  const policyVersion = input.policyVersion ?? LGPD_POLICY_VERSION;
  return [
    { kind: 'operational', granted: input.operational, policyVersion, source: input.source, createdAt },
    { kind: 'marketing', granted: input.marketing, policyVersion, source: input.source, createdAt },
    { kind: 'image_use', granted: input.image, policyVersion, source: input.source, createdAt },
  ];
}
