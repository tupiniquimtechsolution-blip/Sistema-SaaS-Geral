import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd());
const SKIP = new Set(['node_modules', 'dist', '.git', 'apps']);

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx|js|jsx|md|json|env|toml)$/.test(entry) && !entry.endsWith('package-lock.json')) {
      acc.push(full);
    }
  }
  return acc;
}

describe('secret hygiene', () => {
  it('does not ship a service role key to frontend sources', () => {
    const files = walk(join(ROOT, 'src'));
    const leaks: string[] = [];
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      if (/SERVICE_ROLE|service_role_key|sk_live_|app_xxx/i.test(text) && !text.includes('must never')) {
        leaks.push(file);
      }
    }
    expect(leaks).toEqual([]);
  });

  it('env example documents service role as server-only', () => {
    const example = readFileSync(join(ROOT, '.env.example'), 'utf8');
    expect(example).toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(example).toMatch(/Nunca|never|server/i);
    expect(example).not.toMatch(/VITE_SUPABASE_SERVICE_ROLE/);
  });

  it('migrations enable RLS on every public table', () => {
    const rls = readFileSync(join(ROOT, 'supabase/migrations/20260915000003_rls.sql'), 'utf8');
    const schema = readFileSync(join(ROOT, 'supabase/migrations/20260915000001_init_schema.sql'), 'utf8');
    const tables = [...schema.matchAll(/create table public\.([a-z_]+)/g)].map((match) => match[1]);
    expect(tables.length).toBeGreaterThanOrEqual(17);
    for (const table of tables) {
      expect(rls).toContain(`alter table public.${table} enable row level security`);
    }
  });
});
