import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runCrossTenantSmoke } from '../scripts/cross-tenant-smoke.ts';

const qa = {
  url: 'https://ynqbnimlpxlokrxlucdm.supabase.co',
  publishableKey: 'sb_publishable_fixture_only',
  a: { email: 'a@example.invalid', password: 'not-a-real-password', tenantSlug: 'qa-isolation-tenant-a', tenantId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
  b: { email: 'b@example.invalid', password: 'not-a-real-password', tenantSlug: 'qa-isolation-tenant-b', tenantId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' },
};

function clientFor(label, respondToForeignRead) {
  const identity = label === 'A' ? qa.a : qa.b;
  return {
    auth: {
      signInWithPassword: async ({ email }) => ({
        error: email === identity.email ? null : { message: 'Wrong mock identity' },
      }),
    },
    from(table) {
      return {
        select(fields) {
          if (table === 'memberships') {
            return {
              eq: async () => ({
                data: [{
                  tenant_id: identity.tenantId,
                  tenant: { id: identity.tenantId, slug: identity.tenantSlug, status: 'trialing' },
                }],
                error: null,
              }),
            };
          }
          if (table === 'tenant_brands' && fields === 'tenant_id') {
            return { eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) };
          }
          return { eq: async (_field, foreignId) => {
            assert.notEqual(foreignId, identity.tenantId, 'foreign probe must query opposite tenant');
            return respondToForeignRead(table, label);
          } };
        },
      };
    },
  };
}

async function matrix(responseForRead) {
  let call = 0;
  // Auth A / Auth B, then cross-probe A / cross-probe B.
  const identities = ['A', 'B', 'A', 'B'];
  const createClientFn = async () => clientFor(identities[call++], responseForRead);
  return runCrossTenantSmoke(createClientFn, structuredClone(qa));
}

test('hosted read-only harness accepts zero foreign rows', async () => {
  const result = await matrix(() => ({ data: [], error: null }));
  assert.equal(result.status, 'PASS');
  assert.equal(result.checks.filter(check => check.name.startsWith('cross:')).length, 2);
});

test('hosted read-only harness recognizes only SQLSTATE 42501 as explicit denial', async () => {
  const result = await matrix(() => ({ data: null, error: { code: '42501', message: 'RLS denied' } }));
  assert.equal(result.status, 'PASS');
});

test('hosted read-only harness fails on unauthorized JWT or expired session', async () => {
  const result = await matrix(() => ({ data: null, error: { code: 'PGRST301', message: 'JWT expired' } }));
  assert.equal(result.status, 'FAIL');
  assert.ok(result.checks.some(check => check.name.startsWith('cross:') && !check.pass));
});

test('hosted read-only harness fails on transport and schema failures', async () => {
  for (const code of ['NETWORK_ERROR', 'PGRST204', '401']) {
    const result = await matrix(() => ({ data: null, error: { code, message: 'Technical failure' } }));
    assert.equal(result.status, 'FAIL', code);
  }
});

test('hosted read-only harness fails on foreign row leaks and malformed results', async () => {
  for (const response of [
    { data: [{ id: 'leaked-row' }], error: null },
    { data: null, error: null },
    { data: [{ id: 'leaked-row' }], error: { code: '42501', message: 'Contradictory response' } },
  ]) {
    const result = await matrix(() => response);
    assert.equal(result.status, 'FAIL');
  }
});
