import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const requestUrl = new URL(req.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
      // 非同期で cookies() を使用
      const cookieStore = await cookies();
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
      
      // コードをセッションに交換
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        // エラーが発生した場合はエラーページにリダイレクト
        return NextResponse.redirect(new URL('/auth/error', req.url));
      }
      
      console.log('Successfully exchanged code for session');
    } else {
      console.error('No code provided in callback');
      // コードがない場合もエラーページにリダイレクト
      return NextResponse.redirect(new URL('/auth/error', req.url));
    }

    // 強制的にリダイレクト（ステータスコード303を使用）
    return NextResponse.redirect(new URL('/dashboard', req.url), { 
      status: 303,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Unexpected error in callback route:', error);
    return NextResponse.redirect(new URL('/auth/error', req.url));
  }
}
