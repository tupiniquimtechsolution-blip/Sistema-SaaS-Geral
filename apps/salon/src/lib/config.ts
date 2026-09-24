const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

export const appConfig = {
  appUrl: (import.meta.env.VITE_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')).replace(/\/$/, ''),
  supabaseUrl,
  supabaseAnonKey,
  paymentProvider: (import.meta.env.VITE_PAYMENT_PROVIDER ?? 'demo').toLowerCase(),
  demoCatalog: import.meta.env.VITE_DEMO_CATALOG === 'true',
  lgpdPolicyVersion: '1.0',
};

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (supabaseUrl.includes('YOUR_') || supabaseAnonKey.includes('YOUR_')) return false;
  if (supabaseAnonKey === 'public-anon-key') return false;
  return supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://localhost') || supabaseUrl.startsWith('http://127.0.0.1');
}

export function assertNoServiceRoleOnClient(): void {
  const env = import.meta.env as Record<string, string | undefined>;
  for (const [key, value] of Object.entries(env)) {
    if (/service[_-]?role/i.test(key) && value) {
      throw new Error('Service Role must never be exposed to the frontend.');
    }
  }
}
