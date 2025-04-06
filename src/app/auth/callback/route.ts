import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const requestUrl = new URL(req.url);
    const code = requestUrl.searchParams.get('code');
    
    // デバッグ情報を追加
    console.log('Auth callback received with URL:', requestUrl.toString());
    console.log('Auth code present:', !!code);
    
    if (code) {
      // 非同期で cookies() を使用
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient({ 
        cookies: () => cookieStore,
        options: {
          global: {
            fetch: (url, options) => {
              // Android向けにタイムアウトを延長
              return fetch(url, {
                ...options,
                headers: {
                  ...options?.headers,
                  'Cache-Control': 'no-store, no-cache, must-revalidate',
                  'Pragma': 'no-cache',
                  'Expires': '0'
                }
              });
            }
          },
          db: {
            schema: 'public',
          },
          realtime: {
            timeout: 20000 // タイムアウトを延長
          }
        }
      });
      
      // コードをセッションに交換
      console.log('Attempting to exchange code for session...');
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(new URL('/auth/error?reason=exchange&error=' + encodeURIComponent(error.message), req.url));
      }
      
      console.log('Successfully exchanged code for session');
    } else {
      console.error('No code provided in callback');
      return NextResponse.redirect(new URL('/auth/error?reason=nocode', req.url));
    }

    // Android向けに明示的なキャッシュ無効化ヘッダーを追加
    return NextResponse.redirect(new URL('/dashboard', req.url), { 
      status: 303,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Location': '/dashboard'
      }
    });
  } catch (error) {
    console.error('Unexpected error in callback route:', error);
    return NextResponse.redirect(new URL('/auth/error?reason=unexpected', req.url));
  }
}
