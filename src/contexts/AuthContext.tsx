'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { fetchSession, signInWithGoogle, signOut, stateChangeCallback } from './authContextFunction';
import { Database } from '@/types/database';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: (supabase: SupabaseClient<Database>) => Promise<void>;
  signOut: (supabase: SupabaseClient<Database>) => Promise<void>;
  supabase: SupabaseClient<Database>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  
  useEffect(() => {
    console.log('AuthProvider: Initializing auth context');
   
    fetchSession(supabase,setSession,setUser,setIsLoading).finally(() => {
      console.log('AuthProvider: Session fetch completed, setting isLoading to false');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      stateChangeCallback(setSession,setUser,setIsLoading)
    );

    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);


  const value = {
    user,
    session,
    isLoading,
    signInWithGoogle,
    signOut,
    supabase
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
