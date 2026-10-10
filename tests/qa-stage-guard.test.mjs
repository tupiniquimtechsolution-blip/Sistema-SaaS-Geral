import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateQaStage } from '../scripts/qa-stage-guard.mjs';
const valid = {
  QA_PROJECT_REF: 'abcdefghijklmnopqrst',
  QA_APPROVED_PROJECT_REF: 'abcdefghijklmnopqrst',
  QA_SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co',
  QA_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test_only',
  QA_TEST_A_EMAIL: 'a@example.invalid',
  QA_TEST_A_PASSWORD: 'test-secret-a',
  QA_TEST_B_EMAIL: 'b@example.invalid',
  QA_TEST_B_PASSWORD: 'test-secret-b',
  QA_TENANT_A_SLUG: 'qa-isolation-a',
  QA_TENANT_B_SLUG: 'qa-isolation-b',
  QA_WRITES_CONFIRM: 'AUTHORIZE_ISOLATED_QA_WRITES',
};
test('valid isolated config permits read and acknowledged write stages', () => {
  assert.equal(validateQaStage(valid).ref, valid.QA_PROJECT_REF);
  assert.equal(validateQaStage(valid, { writes: true }).slugB, 'qa-isolation-b');
});
test('rejects canonical and unrelated project refs even when labelled approved', () => {
  for (const ref of ['mmykyzzkcugxunmekwew', 'bccdypogqyrzmflimlom', 'brqokxlmxwyxwwbtsltc']) {
    const e = { ...valid, QA_PROJECT_REF: ref, QA_APPROVED_PROJECT_REF: ref, QA_SUPABASE_URL: `https://${ref}.supabase.co` };
    assert.throws(() => validateQaStage(e), /forbidden/);
  }
});
test('requires exact separately approved project ref and HTTPS URL', () => {
  assert.throws(() => validateQaStage({ ...valid, QA_APPROVED_PROJECT_REF: 'different' }), /approved/);
  assert.throws(() => validateQaStage({ ...valid, QA_SUPABASE_URL: 'http://abcdefghijklmnopqrst.supabase.co' }), /HTTPS/);
  assert.throws(() => validateQaStage({ ...valid, QA_SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co.evil.invalid' }), /HTTPS/);
});
test('rejects identity collision, missing keys and tenant collision', () => {
  assert.throws(() => validateQaStage({ ...valid, QA_TEST_B_EMAIL: valid.QA_TEST_A_EMAIL }), /distinct QA identities/);
  assert.throws(() => validateQaStage({ ...valid, QA_SUPABASE_PUBLISHABLE_KEY: '' }), /key is missing/);
  assert.throws(() => validateQaStage({ ...valid, QA_TENANT_B_SLUG: valid.QA_TENANT_A_SLUG }), /tenant slugs/);
});
test('writes fail closed without typed acknowledgement', () => {
  assert.throws(() => validateQaStage({ ...valid, QA_WRITES_CONFIRM: '' }, { writes: true }), /write acknowledgement/);
});
