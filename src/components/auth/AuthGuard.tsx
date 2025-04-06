'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner, Center, Text, VStack, Button } from '@chakra-ui/react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [waitingTime, setWaitingTime] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);
  const [redirectTriggered, setRedirectTriggered] = useState(false);

  useEffect(() => {
    // 認証状態が確定したら処理を行う
    if (!isLoading) {
      if (!user) {
        console.log('AuthGuard: User not authenticated, redirecting to login');
        
        if (!redirectTriggered) {
          setRedirectTriggered(true);
          
          // 直接URLを変更してリダイレクト
          if (typeof window !== 'undefined') {
            console.log('AuthGuard: Using window.location.href for redirect');
            window.location.href = '/auth/login';
          } else {
            console.log('AuthGuard: Using router.push for redirect');
            router.push('/auth/login');
          }
        }
      } else {
        console.log('AuthGuard: User authenticated, allowing access');
        setAuthChecked(true);
      }
    }
  }, [user, isLoading, router, redirectTriggered]);

  // デバッグ用：長時間ローディング状態が続く場合のタイマー
  useEffect(() => {
    if (isLoading || (!authChecked && !redirectTriggered)) {
      const timer = setInterval(() => {
        setWaitingTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLoading, authChecked, redirectTriggered]); 

  const handleForceAccess = () => {
    console.log('AuthGuard: Force access button clicked');
    setAuthChecked(true);
  };

  const handleForceRedirect = () => {
    console.log('AuthGuard: Force redirect button clicked');
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  };

  if (isLoading || (!authChecked && !redirectTriggered)) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>ログイン情報を確認中...</Text>
          {waitingTime > 5 && (
            <Text fontSize="sm" color="gray.500">
              {waitingTime}秒経過しました。時間がかかっています。
            </Text>
          )}
          {waitingTime > 8 && (
            <VStack spacing={2}>
              <Button colorScheme="blue" size="sm" onClick={handleForceAccess}>
                このままアクセスする
              </Button>
              <Button colorScheme="red" size="sm" onClick={handleForceRedirect}>
                ログインページへ移動
              </Button>
            </VStack>
          )}
        </VStack>
      </Center>
    );
  }

  // この時点でユーザーは認証済み
  return <>{children}</>;
}
