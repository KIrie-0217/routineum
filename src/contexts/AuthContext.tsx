'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = getSupabaseClient();

  // ユーザーレコードを作成または確認する関数
  const ensureUserRecord = async (userId: string, email: string) => {
    try {
      console.log(`AuthProvider: Ensuring user record for ${userId}`);
      
      // utils/supabaseUtils から汎用関数をインポート
      const { fetchWithRetry } = await import('@/utils/supabaseUtils');
 
      // まずユーザーが存在するか確認
      const supabaseQuery = supabase
          .from('users')
          .select()
          .eq('id', userId)
      const { data: existingUser, error: fetchError } = await fetchWithRetry(supabaseQuery,
        {
          maxRetries: 5,
          timeoutMs: 1000,
          exponentialBackoff: true,
          onRetry: (attempt, error) => {
            console.log(`Retry attempt ${attempt} checking user existence:`, error);
          }
        }
      );
      
      // ユーザーが存在しない場合は作成を試みる
      if (existingUser) { 
        console.log('AuthProvider: User record already exists'); 
      } else {
        console.log('AuthProvider: User record not found, creating new one');
        
        // RLS ポリシーをバイパスするために管理者権限で操作
        const { data, error: insertError } = await supabase.rpc('create_user_record', {
          user_id: userId,
          user_email: email || '',
          created_timestamp: new Date().toISOString()
        });
        
        if (insertError) {
          console.error('Error creating user record via RPC:', insertError);  
        } else {
          console.log('Created new user record via RPC function');
        }
      }
    } catch (err) {
      console.error('Error in ensureUserRecord:', err);
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Initializing auth context');
    
    const fetchSession = async () => {
      try {
        console.log('AuthProvider: Fetching session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          console.log('AuthProvider: Session found');
          setSession(session);
          setUser(session.user);
          
          // ユーザーレコードを確認/作成
          if (session.user) {
            await ensureUserRecord(session.user.id, session.user.email || '');
          }
        } else {
          console.log('AuthProvider: No session found');
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Unexpected error in fetchSession:', err);
      } finally {
        console.log('AuthProvider: Session fetch completed');
        setIsLoading(false);
      }
    };

  
    fetchSession().finally(() => {
      console.log('AuthProvider: Session fetch completed, setting isLoading to false');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`AuthProvider: Auth state changed - event: ${event}`);
 
        try {
          if (session) {
            console.log('Auth state changed - user:', session.user);
            setSession(session);
            setUser(session.user);
            
            // ユーザーレコードを確認/作成
            await ensureUserRecord(session.user.id, session.user.email || '');
          } else {
            console.log('Auth state changed - no session');
            setSession(null);
            setUser(null);
          }
        } catch (err) {
          console.error('Unexpected error in auth state change:', err);
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('AuthProvider: Initiating Google sign in');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      
      });
      
      if (error) {
        console.error('Error signing in with Google:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthProvider: Signing out');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      
      console.log('AuthProvider: Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signInWithGoogle,
    signOut,
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
