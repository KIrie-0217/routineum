'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Box, Flex, Heading, Spinner, Text, Button, Container } from '@chakra-ui/react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback: Processing authentication callback');
        console.log('URL:', window.location.href);
        console.log('Search params:', window.location.search);
        console.log('Hash:', window.location.hash);
        
        // Supabaseの自動セッション処理を使用
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError('認証処理中にエラーが発生しました。もう一度お試しください。');
          setIsProcessing(false);
          return;
        }
        
        if (data.session) {
          console.log('Auth callback: Session found, redirecting to dashboard');
          window.location.href = '/dashboard';
        } else {
          // セッションがない場合は手動でコードを処理
          console.log('Auth callback: No session found, trying to handle code manually');
          
          // URLからcodeパラメータを取得
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const queryParams = new URLSearchParams(window.location.search);
          
          // ハッシュまたはクエリパラメータからcodeを取得
          const code = hashParams.get('code') || queryParams.get('code');
          
          if (code) {
            console.log('Auth callback: Code found, exchanging for session');
            // コードをセッションに交換
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              console.error('Error exchanging code for session:', exchangeError);
              setError('認証処理中にエラーが発生しました。もう一度お試しください。');
              setIsProcessing(false);
              return;
            }
            
            // セッションが確立されたことを確認
            const { data: sessionData } = await supabase.auth.getSession();
            
            if (sessionData.session) {
              console.log('Auth callback: Session established, redirecting to dashboard');
              window.location.href = '/dashboard';
            } else {
              console.error('Auth callback: Session not established after exchange');
              setError('セッションの確立に失敗しました。もう一度お試しください。');
              setIsProcessing(false);
            }
          } else {
            console.error('Auth callback: No code provided');
            setError('認証コードが見つかりません。もう一度ログインしてください。');
            setIsProcessing(false);
          }
        }
      } catch (error) {
        console.error('Unexpected error in callback:', error);
        setError('予期せぬエラーが発生しました。もう一度お試しください。');
        setIsProcessing(false);
      }
    };
    
    handleCallback();
  }, [router]);
  
  const handleRetry = () => {
    window.location.href = '/auth/login';
  };
  
  return (
    <Flex 
      minH={{ base: 'calc(100vh - 80px)', md: '100vh' }} 
      align="center" 
      justify="center"
      p={4}
    >
      <Container maxW={{ base: '90%', sm: '450px', md: '500px' }}>
        <Box 
          p={{ base: 4, md: 8 }} 
          borderWidth={1} 
          borderRadius="lg" 
          boxShadow="lg"
          textAlign="center"
        >
          <Heading as="h2" size={{ base: 'md', md: 'lg' }} mb={4}>
            {error ? 'エラーが発生しました' : '認証処理中...'}
          </Heading>
          
          {isProcessing ? (
            <Flex direction="column" align="center" justify="center">
              <Spinner size="xl" color="blue.500" mb={4} />
              <Text>認証情報を処理しています。しばらくお待ちください...</Text>
            </Flex>
          ) : (
            <Box>
              <Text mb={4}>{error}</Text>
              <Button colorScheme="blue" onClick={handleRetry}>
                ログインページに戻る
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Flex>
  );
}
