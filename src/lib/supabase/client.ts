"use client";

import { Database } from "@/types/database";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase環境変数が設定されていません。");
  // 開発環境では警告を表示するが、クライアントは作成する
  if (process.env.NODE_ENV === "development") {
    console.warn("開発環境: デフォルト設定でクライアントを作成します。");
  }
}

let supabaseClient: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabaseClient) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true, // URLからセッション情報を自動検出
        storageKey: 'supabase-auth',
        storage: {
          getItem: (key) => {
            if (typeof window !== 'undefined') {
              return window.localStorage.getItem(key);
            }
            return null;
          },
          setItem: (key, value) => {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(key, value);
            }
          },
          removeItem: (key) => {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(key);
            }
          },
        },
      },
    });
  }

  return supabaseClient;
};
