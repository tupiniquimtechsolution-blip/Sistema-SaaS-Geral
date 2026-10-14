// Authenticated E2E against LOCAL, DISPOSABLE Supabase CLI stack ONLY.
// This test DOES NOT reproduce the remote canonical schema or satisfy commercial release.
// Never use production URL/keys, customer identities or hosted SaaS migrations.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

const apiUrl = process.env.LOCAL_SUPABASE_URL ?? '';
const anonKey = process.env.LOCAL_SUPABASE_ANON_KEY ?? '';
const serviceKey = process.env.LOCAL_SUPABASE_SERVICE_ROLE_KEY ?? '';
const dbUrl = process.env.LOCAL_SUPABASE_DB_URL ?? '';
function fail(message) { throw new Error('LOCAL_AUTH_QA: ' + message); }
const parsed = new URL(apiUrl || 'https://invalid.invalid');
const db = new URL(dbUrl || 'postgresql://invalid.invalid');
if (!['localhost', '127.0.0.1'].includes(parsed.hostname) || parsed.protocol !== 'http:'
    || !['localhost', '127.0.0.1'].includes(db.hostname) || !['postgres:', 'postgresql:'].includes(db.protocol)
    || !anonKey || !serviceKey || process.env.CI !== 'true') {
  fail('local-only guard rejected endpoint, credentials or CI environment');
}
const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const admin = createClient(apiUrl, serviceKey, options);
const unique = randomBytes(8).toString('hex');
const password = randomBytes(30).toString('base64url') + 'aA1!';
const uuids = {
  a: '00000000-0000-4000-8000-00000000000a',
  b: '00000000-0000-4000-8000-00000000000b',
};
async function createQaUser(label) {
  const { data, error } = await admin.auth.admin.createUser({
    email: `qa-${label}-${unique}@example.invalid`,
    password, email_confirm: true,
  });
  if (error || !data?.user?.id) fail(`createUser ${label} did not succeed`);
  return { email: data.user.email, id: data.user.id };
}
const a = await createQaUser('a');
const b = await createQaUser('b');
function psql(query) {
  // IDs come from GoTrue UUIDs, no external inputs. No SQL logs or secrets.
  execFileSync('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-q', '-d', dbUrl, '-c', query], { stdio: 'pipe' });
}
psql(`update public.memberships set user_id='${a.id}'::uuid where tenant_id='${uuids.a}'::uuid;
update public.memberships set user_id='${b.id}'::uuid where tenant_id='${uuids.b}'::uuid;`);
async function login(user) {
  const client = createClient(apiUrl, anonKey, options);
  const { data, error } = await client.auth.signInWithPassword({ email: user.email, password });
  assert.ifError(error);
  assert.equal(data.user?.id, user.id);
  assert.ok(data.session?.access_token, 'real GoTrue JWT missing');
  const { data: isAdmin, error: adminError } = await client.rpc('is_platform_admin');
  assert.ifError(adminError);
  assert.equal(isAdmin, false, 'ordinary QA actor must not be Platform Master');
  return client;
}
const ca = await login(a);
const cb = await login(b);
async function rows(client, table, tenantId) {
  const col = table === 'tenants' ? 'id' : 'tenant_id';
  const { data, error } = await client.from(table).select('*').eq(col, tenantId);
  assert.ifError(error);
  return data ?? [];
}
for (const table of ['tenants','memberships','contacts','subscriptions','tenant_entitlements']) {
  assert.equal((await rows(ca, table, uuids.b)).length, 0, `A leaked B ${table}`);
  assert.equal((await rows(cb, table, uuids.a)).length, 0, `B leaked A ${table}`);
}
assert.equal((await rows(ca,'tenants',uuids.a)).length,1);
assert.equal((await rows(cb,'tenants',uuids.b)).length,1);
assert.equal((await rows(ca,'contacts',uuids.a)).length,1);
assert.equal((await rows(cb,'contacts',uuids.b)).length,1);
assert.equal((await rows(ca,'subscriptions',uuids.a)).length,1);
assert.equal((await rows(cb,'subscriptions',uuids.b)).length,0, 'B viewer may not read billing');
// A is non-platform owner with CRM write on tenant A.
const id = crypto.randomUUID();
let response = await ca.from('contacts').insert({ id, tenant_id: uuids.a, name: 'local QA A' }).select('id');
assert.ifError(response.error);
assert.equal(response.data?.length,1);
// A may not create in tenant B; B viewer may not create in either tenant.
response = await ca.from('contacts').insert({ id: crypto.randomUUID(), tenant_id: uuids.b, name: 'cross denied' });
assert.ok(response.error, 'A inserted into B');
response = await cb.from('contacts').insert({ id: crypto.randomUUID(), tenant_id: uuids.b, name: 'viewer denied' });
assert.ok(response.error, 'B viewer inserted into own tenant');
response = await cb.from('contacts').insert({ id: crypto.randomUUID(), tenant_id: uuids.a, name: 'foreign denied' });
assert.ok(response.error, 'B viewer inserted into A');
response = await ca.from('contacts').update({name:'cross tamper'}).eq('tenant_id',uuids.b).select('id');
assert.ifError(response.error);
assert.equal(response.data?.length,0,'A modified B contact');
response = await cb.from('contacts').update({name:'cross tamper'}).eq('tenant_id',uuids.a).select('id');
assert.ifError(response.error);
assert.equal(response.data?.length,0,'B modified A contact');
response = await ca.from('platform_admins').insert({user_id:a.id});
assert.ok(response.error,'A self-escalated to Platform Master');
response = await cb.from('platform_admins').insert({user_id:b.id});
assert.ok(response.error,'B self-escalated to Platform Master');
response = await ca.from('subscriptions').insert({id:crypto.randomUUID(),tenant_id:uuids.a,status:'active'});
assert.ok(response.error,'A wrote billing state directly');
response = await ca.from('tenant_entitlements').insert({id:crypto.randomUUID(),tenant_id:uuids.a,feature_key:'unearned'});
assert.ok(response.error,'A granted entitlement directly');
console.log('LOCAL_SUPABASE_AUTH_A_B=PASS (real GoTrue sessions against disposable modeled-policy CI stack)');
