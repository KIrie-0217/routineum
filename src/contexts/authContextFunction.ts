import { createUser, hasUser } from "@/services/authProviderService";
import { Database } from "@/types/database";
import { sanitizeLogInput } from "@/utils/inputUtils";
import {
  AuthChangeEvent,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
import { SetStateAction } from "react";

// ユーザーレコードを作成または確認する関数
const ensureUserRecord = async (
  userId: string,
  supabase: SupabaseClient<Database>
) => {
  try {
    const existingUser = await hasUser(userId, supabase);

    // ユーザーが存在しない場合は作成を試みる
    if (existingUser) {
      console.log("AuthProvider: User record already exists");
    } else {
      console.log("AuthProvider: User record not found, creating new one");

      const error = await createUser(userId, supabase);
      if (error) {
        console.error("Error creating user record:", error);
      }
    }
  } catch (err) {
    console.error("Error in ensureUserRecord:", err);
  }
};

export async function fetchSession(
  supabase: SupabaseClient<Database>,
  setSession: (value: SetStateAction<Session | null>) => void,
  setUser: (value: SetStateAction<User | null>) => void,
  setIsLoading: (value: SetStateAction<boolean>) => void
) {
  try {
    console.log("AuthProvider: Fetching session");
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error fetching session:", error);
      setIsLoading(false);
      return;
    }

    if (session) {
      console.log("AuthProvider: Session found");
      setSession(session);
      setUser(session.user);

      // ユーザーレコードを確認/作成
      if (session.user) {
        await ensureUserRecord(session.user.id, supabase);
      }
    } else {
      console.log("AuthProvider: No session found");
      setSession(null);
      setUser(null);
    }
  } catch (err) {
    console.error("Unexpected error in fetchSession:", err);
  } finally {
    console.log("AuthProvider: Session fetch completed");
    setIsLoading(false);
  }
}

export function stateChangeCallback(
  setSession: (value: SetStateAction<Session | null>) => void,
  setUser: (value: SetStateAction<User | null>) => void,
  setIsLoading: (value: SetStateAction<boolean>) => void
) {
  return async (event: AuthChangeEvent, session: Session | null) => {
    const sanitizedEvent = sanitizeLogInput(event);
    console.log(`AuthProvider: Auth state changed - event: ${sanitizedEvent}`);

    try {
      if (session) {
        console.log("Auth state changed - user:", session.user);
        setSession(session);
        setUser(session.user);
      } else {
        console.log("Auth state changed - no user");
        setSession(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Error in stateChangeCallback:", err);
    } finally {
      setIsLoading(false);
    }
  };
}

export async function signInWithGoogle(supabase: SupabaseClient<Database>) {
  try {
    console.log("AuthProvider: Initiating Google sign in");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

export async function signOut(supabase: SupabaseClient<Database>) {
  try {
    console.log("AuthProvider: Signing out");
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      throw error;
    }

    console.log("AuthProvider: Sign out successful");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}
