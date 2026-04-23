import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, UserRole } from '@/lib/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<Profile>;
  register: (email: string, password: string, firstName: string, lastName: string, role: UserRole, phone?: string, companyName?: string) => Promise<Profile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    if (data) setProfile(data as Profile);
    return data as Profile | null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsInitialized(true);
    });

    // Then check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw new Error(authError.message === 'Invalid login credentials' ? 'Неверный email или пароль' : authError.message);
      if (!data.user) throw new Error('Ошибка входа');
      const p = await fetchProfile(data.user.id);
      if (!p) throw new Error('Профиль не найден');
      if (p.is_blocked) {
        await supabase.auth.signOut();
        throw new Error('Ваш аккаунт заблокирован. Обратитесь к администратору.');
      }
      return p;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string, role: UserRole, phone?: string, companyName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role,
            phone: phone || null,
            company_name: companyName || null,
          },
        },
      });
      if (authError) throw new Error(authError.message);
      if (!data.user) throw new Error('Ошибка регистрации');
      
      // Wait a bit for profile trigger to execute
      await new Promise(r => setTimeout(r, 500));
      const p = await fetchProfile(data.user.id);
      if (!p) throw new Error('Профиль не создан');
      
      // If employer, create a company
      if (role === 'employer' && companyName) {
        await supabase.from('companies').insert({
          user_id: data.user.id,
          name: companyName,
          description: `Компания ${companyName}`,
          location: '',
          industry: '',
        });
      }
      
      return p;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated: !!user && !!profile,
      isInitialized,
      isLoading,
      error,
      login,
      register,
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
