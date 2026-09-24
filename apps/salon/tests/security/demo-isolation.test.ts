import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { services, testimonials, businessInfo, isWhatsAppConfigured } from '../../src/lib/data';

describe('production catalog isolation', () => {
  it('does not expose invented services, prices, testimonials or demo whatsapp', () => {
    expect(services).toEqual([]);
    expect(testimonials).toEqual([]);
    expect(isWhatsAppConfigured(businessInfo.whatsapp)).toBe(false);
    expect(businessInfo.email).toMatch(/PENDENTE/);
    expect(businessInfo.instagram).toMatch(/PENDENTE/);
  });

  it('keeps invented commercial seed out of versioned migrations', () => {
    const dir = join(process.cwd(), 'supabase/migrations');
    const joined = readdirSync(dir)
      .filter((name) => name.endsWith('.sql'))
      .map((name) => readFileSync(join(dir, name), 'utf8'))
      .join('\n');
    expect(joined).not.toMatch(/5511999999999/);
    expect(joined).not.toMatch(/contato@vanessabraz\.com\.br/);
    expect(joined).not.toMatch(/45000/);
    expect(joined).not.toMatch(/Carolina M/);
  });

  it('documents demo seed outside migrations', () => {
    const demo = readFileSync(join(process.cwd(), 'supabase/seed/demo.sql'), 'utf8');
    expect(demo).toMatch(/DEMO ONLY/);
    expect(demo).toMatch(/never applied by supabase db push/i);
  });
});
