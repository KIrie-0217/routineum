import { Database } from '@/types/database';
import { createClient,SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey : string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が設定されていません。');
  // 開発環境では警告を表示するが、クライアントは作成する
  if (process.env.NODE_ENV === 'development') {
    console.warn('開発環境: デフォルト設定でクライアントを作成します。');
  }
} 

export const supabase : SupabaseClient<Database> = createClient(
  supabaseUrl,supabaseAnonKey
)
