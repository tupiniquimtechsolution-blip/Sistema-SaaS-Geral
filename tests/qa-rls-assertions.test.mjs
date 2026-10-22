import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  foreignRowsDenied,
  foreignCountDenied,
  updateDenied,
  insertDenied,
  viewerOnly,
} from '../scripts/qa-rls-assertions.mjs';

const denied = { code: '42501', message: 'RLS denies access' };
const authError = { code: '401', message: 'JWT expired' };
const networkError = { code: 'NETWORK_ERROR', message: 'connection timed out' };
const schemaError = { code: 'PGRST204', message: 'column missing' };

test('foreign rows: [] and 42501 pass; leaked rows and malformed data fail', () => {
  assert.equal(foreignRowsDenied({ data: [], error: null }), true);
  assert.equal(foreignRowsDenied({ data: null, error: denied }), true);
  assert.equal(foreignRowsDenied({ data: [{ id: 'foreign' }], error: null }), false);
  assert.equal(foreignRowsDenied({ data: null, error: null }), false);
  assert.equal(foreignRowsDenied({ data: undefined, error: null }), false);
});

test('foreign rows: JWT, network, schema, and generic permission errors fail', () => {
  for (const error of [authError, networkError, schemaError, { code: 'PGRST301' }, { code: '403' }]) {
    assert.equal(foreignRowsDenied({ data: null, error }), false, error.code);
  }
});

test('count-based cross-tenant reads recognize only empty or SQLSTATE 42501', () => {
  assert.equal(foreignCountDenied({ n: 0 }), true);
  assert.equal(foreignCountDenied({ n: -1, err: denied.message, code: '42501' }), true);
  assert.equal(foreignCountDenied({ n: 1 }), false);
  assert.equal(foreignCountDenied({ n: -1, err: authError.message, code: '401' }), false);
  assert.equal(foreignCountDenied({ n: -1, err: networkError.message, code: 'NETWORK_ERROR' }), false);
  assert.equal(foreignCountDenied({ n: -1, err: schemaError.message, code: 'PGRST204' }), false);
  assert.equal(foreignCountDenied({ n: -1, err: 'unknown', code: undefined }), false);
  assert.equal(foreignCountDenied({ n: -1 }), false);
});

test('negative UPDATE accepts zero affected rows or 42501 only', () => {
  assert.equal(updateDenied({ data: [], error: null }), true);
  assert.equal(updateDenied({ data: null, error: denied }), true);
  assert.equal(updateDenied({ data: [{ id: 'mutated' }], error: null }), false);
  assert.equal(updateDenied({ data: null, error: networkError }), false);
});

test('negative INSERT requires 42501; a created record or other error fails', () => {
  assert.equal(insertDenied({ data: null, error: denied }), true);
  assert.equal(insertDenied({ data: [{ id: 'created' }], error: null }), false);
  assert.equal(insertDenied({ data: null, error: schemaError }), false);
  assert.equal(insertDenied({ data: null, error: authError }), false);
});

test('Viewer role persistence rejects owner/extra roles and query errors', () => {
  const viewer = 'viewer-test-role-id';
  assert.equal(viewerOnly({ data: [{ role_id: viewer }], error: null }, viewer), true);
  assert.equal(viewerOnly({ data: [{ role_id: 'owner' }], error: null }, viewer), false);
  assert.equal(viewerOnly({ data: [{ role_id: viewer }, { role_id: 'owner' }], error: null }, viewer), false);
  assert.equal(viewerOnly({ data: null, error: networkError }, viewer), false);
  assert.equal(viewerOnly({ data: null, error: null }, viewer), false);
});
