import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    // サーバーサイドでSupabaseクライアントを作成
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore,
      options: {
        global: {
          fetch: (url, options) => {
            return fetch(url, {
              ...options,
              headers: {
                ...options?.headers,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            });
          }
        },
        db: {
          schema: 'public',
        },
        realtime: {
          timeout: 15000
        }
      }
    });
    
    // 接続テスト
    const startTime = Date.now();
    const { data, error } = await supabase.from('users').select('count(*)', { count: 'exact', head: true });
    const endTime = Date.now();
    
    if (error) {
      console.error('API: Supabase connection test failed:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error,
        duration: endTime - startTime
      }, { status: 500 });
    }
    
    // 環境変数の確認（機密情報は含めない）
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV
    };
    
    return NextResponse.json({ 
      success: true, 
      data,
      envCheck,
      duration: endTime - startTime
    });
  } catch (error) {
    console.error('API: Unexpected error in connection test:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
}
