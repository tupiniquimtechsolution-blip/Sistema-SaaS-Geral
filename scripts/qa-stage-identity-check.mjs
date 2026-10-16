/** Read-only, network-authenticated identity check for the approved isolated QA branch. */
import { createClient } from '@supabase/supabase-js';
import { validateQaStage } from './qa-stage-guard.mjs';

const config = validateQaStage(process.env, { writes: process.env.QA_TEST_MODE === 'write' });
const clientOptions = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };

async function examine(label, email, password, expectedSlug) {
  const client = createClient(config.url, process.env.QA_SUPABASE_PUBLISHABLE_KEY, clientOptions);
  const { data: session, error: loginError } = await client.auth.signInWithPassword({ email, password });
  if (loginError || !session?.user?.id) throw new Error(`${label}: real Supabase Auth session could not be established`);
  const userId = session.user.id;
  const { data: isAdmin, error: adminError } = await client.rpc('is_platform_admin');
  if (adminError || isAdmin !== false) throw new Error(`${label}: account is Platform Master or platform admin status is unverified`);
  const { data: memberships, error: membershipError } = await client.from('memberships')
    .select('user_id,tenant_id,status,tenant:tenants!inner(id,slug)')
    .eq('status', 'active');
  if (membershipError || !Array.isArray(memberships) || memberships.length !== 1) {
    throw new Error(`${label}: expected exactly one visible active membership (least privilege)`);
  }
  const m = memberships[0];
  if (m.user_id !== userId || m.tenant?.slug !== expectedSlug || !m.tenant_id) {
    throw new Error(`${label}: membership is not bound to the expected isolated tenant`);
  }
  console.log(`${label}: authenticated QA identity PASS; platform admin false; one isolated tenant membership`);
  return { userId, tenantId: m.tenant_id };
}

const first = await examine('QA-A', config.emailA, process.env.QA_TEST_A_PASSWORD, config.slugA);
const second = await examine('QA-B', config.emailB, process.env.QA_TEST_B_PASSWORD, config.slugB);
if (first.userId === second.userId || first.tenantId === second.tenantId) {
  throw new Error('QA identities must have distinct user IDs and tenant IDs');
}
console.log('QA_IDENTITIES=PASS (two real non-Platform-Master sessions, isolated A/B tenants)');
