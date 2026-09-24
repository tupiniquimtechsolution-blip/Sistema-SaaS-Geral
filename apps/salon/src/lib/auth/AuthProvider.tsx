import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { appConfig, isSupabaseConfigured } from '../config';
import { tryGetSupabaseClient } from '../supabase/client';
import type { Profile, UserRole } from '../supabase/types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
}

interface AuthContextValue {
  ready: boolean;
  configured: boolean;
  session: Session | null;
  user: AuthUser | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    marketingConsent: boolean;
    imageConsent: boolean;
  }) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function profileToUser(profile: Profile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.full_name,
    phone: profile.phone,
    role: profile.role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();
  const [ready, setReady] = useState(!configured);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const loadProfile = useCallback(async (userId: string, fallbackEmail: string) => {
    const supabase = tryGetSupabaseClient();
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) {
      setUser(profileToUser(data as Profile));
      return;
    }
    setUser({
      id: userId,
      email: fallbackEmail,
      name: '',
      phone: '',
      role: 'customer',
    });
  }, []);

  useEffect(() => {
    const supabase = tryGetSupabaseClient();
    if (!supabase) {
      setReady(true);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      if (data.session?.user) {
        void loadProfile(data.session.user.id, data.session.user.email ?? '');
      }
      setReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        void loadProfile(nextSession.user.id, nextSession.user.email ?? '');
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = tryGetSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
    marketingConsent: boolean;
    imageConsent: boolean;
  }) => {
    const supabase = tryGetSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado.');
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: `${appConfig.appUrl}/login`,
        data: {
          full_name: input.name,
          phone: input.phone,
          marketing_consent: input.marketingConsent ? 'true' : 'false',
          image_consent: input.imageConsent ? 'true' : 'false',
        },
      },
    });
    if (error) throw error;
    return { needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = tryGetSupabaseClient();
    if (!supabase) {
      setUser(null);
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const supabase = tryGetSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appConfig.appUrl}/recuperar-senha`,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const supabase = tryGetSupabaseClient();
    if (!supabase) throw new Error('Supabase não configurado.');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await loadProfile(session.user.id, session.user.email ?? '');
    }
  }, [loadProfile, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      configured,
      session,
      user,
      isAdmin: user?.role === 'admin',
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      refreshProfile,
    }),
    [ready, configured, session, user, signIn, signUp, signOut, resetPassword, updatePassword, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
