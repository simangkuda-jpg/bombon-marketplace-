import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (params: {
    email: string;
    password: string;
    name: string;
    username: string;
    whatsapp_number: string;
  }) => Promise<{ error: string | null }>;
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data as Profile | null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp: AuthContextValue['signUp'] = async ({ email, password, name, username, whatsapp_number }) => {
    // Supabase butuh format email untuk auth walau login utama pakai WhatsApp.
    // Jika user tidak isi email, kita buat email sintetis dari username agar tetap
    // bisa memakai Supabase Auth standar (bisa diganti dengan custom OTP WhatsApp nanti).
    const authEmail = email && email.trim() !== '' ? email : `${username}@wa.bombon.local`;

    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        data: { name, username, whatsapp_number },
      },
    });

    if (error) return { error: error.message };
    return { error: null };
  };

  const signIn: AuthContextValue['signIn'] = async (identifier, password) => {
    let email = identifier;

    // Jika identifier berupa nomor WhatsApp (bukan format email), cari email terkaitnya.
    if (!identifier.includes('@')) {
      const { data, error: lookupError } = await supabase
        .from('profiles')
        .select('email, id')
        .eq('whatsapp_number', identifier)
        .maybeSingle();

      if (lookupError || !data) {
        return { error: 'Nomor WhatsApp tidak terdaftar.' };
      }
      // email di profiles bisa null jika user daftar tanpa email asli;
      // dalam kasus itu kita perlu endpoint khusus (lihat catatan di README) karena
      // Supabase Auth mengunci akses via auth.users.email, bukan tabel profiles.
      email = data.email ?? '';
      if (!email) {
        return { error: 'Akun ini perlu login memakai email. Hubungi dukungan.' };
      }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Nomor WhatsApp/email atau password salah.' };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
}
