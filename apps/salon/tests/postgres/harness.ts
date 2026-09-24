import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import postgres from 'postgres';

export function postgresUrl(): string | null {
  return process.env.DATABASE_URL ?? null;
}

export function requirePostgresUrl(): string {
  const url = postgresUrl();
  if (!url) {
    if (process.env.CI) {
      throw new Error('DATABASE_URL is required in CI for real migration/RLS tests.');
    }
    throw new Error('DATABASE_URL is not set');
  }
  return url;
}

const AUTH_STUB = `
create schema if not exists auth;
create table if not exists auth.users (
  id uuid primary key,
  email text unique,
  raw_user_meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
do $$ begin
  create role anon nologin noinherit;
exception when duplicate_object then null;
end $$;
do $$ begin
  create role authenticated nologin noinherit;
exception when duplicate_object then null;
end $$;
do $$ begin
  create role service_role nologin bypassrls;
exception when duplicate_object then null;
end $$;
`;

/**
 * The CI PostgreSQL service is shared by npm test, test:security, and
 * test:postgres. Reset the disposable schemas so every invocation exercises
 * the real migrations from an empty database.
 */
export async function resetPostgresTestSchemas(sql: postgres.Sql): Promise<void> {
  await sql.unsafe(`
    drop schema if exists public cascade;
    drop schema if exists auth cascade;
    create schema public;
  `);
}

export async function applyMigrations(sql: postgres.Sql): Promise<void> {
  await sql.unsafe(AUTH_STUB);
  const dir = join(process.cwd(), 'supabase/migrations');
  const files = readdirSync(dir).filter((name) => name.endsWith('.sql')).sort();
  for (const file of files) {
    const body = readFileSync(join(dir, file), 'utf8');
    await sql.unsafe(body);
  }
}

export type RlsIdentity = {
  role: 'anon' | 'authenticated';
  subject: string | null;
};

type RlsScenarioOptions = {
  commit?: boolean;
};

/**
 * Runs an RLS scenario on one reserved connection. Both the JWT subject and
 * database role are local to the explicit transaction. Scenarios roll back by
 * default; a committed fixture still clears SET LOCAL state at transaction end.
 */
export async function withRlsIdentity<T>(
  sql: postgres.Sql,
  identity: RlsIdentity,
  scenario: (connection: postgres.ReservedSql) => Promise<T>,
  options: RlsScenarioOptions = {},
): Promise<T> {
  const connection = await sql.reserve();
  let transactionOpen = false;

  try {
    await connection`begin`;
    transactionOpen = true;
    await connection`select set_config('request.jwt.claim.sub', ${identity.subject ?? ''}, true)`;

    if (identity.role === 'anon') {
      await connection`set local role anon`;
    } else {
      await connection`set local role authenticated`;
    }

    const result = await scenario(connection);
    if (options.commit) {
      await connection`commit`;
    } else {
      await connection`rollback`;
    }
    transactionOpen = false;
    return result;
  } catch (error) {
    if (transactionOpen) {
      await connection`rollback`;
    }
    throw error;
  } finally {
    connection.release();
  }
}

export function connect(url = requirePostgresUrl()) {
  return postgres(url, { max: 1, onnotice: () => undefined });
}
