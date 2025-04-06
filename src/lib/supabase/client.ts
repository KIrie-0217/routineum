import { Database } from '@/types/database';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が設定されていません。');
  // 開発環境では警告を表示するが、クライアントは作成する
  if (process.env.NODE_ENV === 'development') {
    console.warn('開発環境: デフォルト設定でクライアントを作成します。');
  }
} 

// Android向けに最適化されたオプションを追加
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      storageKey: 'routineum-auth-storage',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // PKCEフローを使用（モバイル向け）
    },
    global: {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
    realtime: {
      timeout: 20000 // タイムアウトを延長
    }
  }
)
