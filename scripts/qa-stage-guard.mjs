/** Fail closed: never run QA mutations against the canonical Supabase project. */
const RESERVED_REFS = new Set([
  'mmykyzzkcugxunmekwew',
  'bccdypogqyrzmflimlom',
  'brqokxlmxwyxwwbtsltc',
]);
export function validateQaStage(env, { writes = false } = {}) {
  const approved = String(env.QA_APPROVED_PROJECT_REF ?? '').trim();
  const selected = String(env.QA_PROJECT_REF ?? '').trim();
  const url = String(env.QA_SUPABASE_URL ?? '').trim();
  if (!/^[a-z0-9]{20}$/.test(selected) || RESERVED_REFS.has(selected)) {
    throw new Error('QA project ref is invalid or forbidden (production/unrelated project)');
  }
  if (!approved || selected !== approved) {
    throw new Error('QA project ref does not match the separately approved QA environment ref');
  }
  if (url !== `https://${selected}.supabase.co`) {
    throw new Error('QA URL is not the exact approved HTTPS project host');
  }
  if (!String(env.QA_SUPABASE_PUBLISHABLE_KEY ?? '').trim()) {
    throw new Error('QA publishable key is missing');
  }
  const emailA = String(env.QA_TEST_A_EMAIL ?? '').trim().toLowerCase();
  const emailB = String(env.QA_TEST_B_EMAIL ?? '').trim().toLowerCase();
  if (!emailA || !emailB || emailA === emailB || !emailA.includes('@') || !emailB.includes('@')) {
    throw new Error('Two distinct QA identities are required');
  }
  if (!env.QA_TEST_A_PASSWORD || !env.QA_TEST_B_PASSWORD) {
    throw new Error('QA passwords are missing');
  }
  const slugA = String(env.QA_TENANT_A_SLUG ?? '').trim();
  const slugB = String(env.QA_TENANT_B_SLUG ?? '').trim();
  if (!/^qa-isolation-[a-z0-9-]+$/.test(slugA) || !/^qa-isolation-[a-z0-9-]+$/.test(slugB) || slugA === slugB) {
    throw new Error('Two distinct isolated QA tenant slugs are required');
  }
  if (writes && env.QA_WRITES_CONFIRM !== 'AUTHORIZE_ISOLATED_QA_WRITES') {
    throw new Error('Isolated QA write acknowledgement missing');
  }
  return { url, ref: selected, emailA, emailB, slugA, slugB };
}
if (process.argv[1]?.endsWith('/qa-stage-guard.mjs')) {
  try {
    validateQaStage(process.env, { writes: process.env.QA_TEST_MODE === 'write' });
    console.log('QA_STAGE_GUARD=PASS (approved isolated ref, unique QA identities and tenant slugs)');
  } catch (error) {
    console.error(`QA_STAGE_GUARD=FAIL (${error.message})`);
    process.exitCode = 1;
  }
}
