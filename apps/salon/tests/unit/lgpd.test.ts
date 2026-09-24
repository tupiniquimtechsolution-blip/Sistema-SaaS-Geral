import { describe, expect, it } from 'vitest';
import { latestConsent, requireOperationalConsent, splitConsents } from '../../src/lib/lgpd/consents';

describe('LGPD consents', () => {
  it('separates operational, marketing and image use', () => {
    const records = splitConsents({
      operational: true,
      marketing: false,
      image: true,
      source: 'signup',
      at: '2026-09-15T12:00:00.000Z',
      policyVersion: '1.0',
    });
    expect(records).toHaveLength(3);
    expect(records.map((item) => item.kind)).toEqual(['operational', 'marketing', 'image_use']);
    expect(requireOperationalConsent(records)).toBe(true);
    expect(latestConsent(records, 'marketing')?.granted).toBe(false);
    expect(latestConsent(records, 'image_use')?.policyVersion).toBe('1.0');
  });

  it('keeps history: latest grant wins without mutating previous rows', () => {
    const first = splitConsents({
      operational: true,
      marketing: false,
      image: false,
      source: 'signup',
      at: '2026-09-01T00:00:00.000Z',
    });
    const later = splitConsents({
      operational: true,
      marketing: true,
      image: false,
      source: 'settings',
      at: '2026-09-15T00:00:00.000Z',
    });
    const all = [...first, ...later];
    expect(all).toHaveLength(6);
    expect(latestConsent(all, 'marketing')?.granted).toBe(true);
    expect(latestConsent(all, 'marketing')?.source).toBe('settings');
  });
});
