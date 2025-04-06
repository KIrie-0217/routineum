'use client';

import { Button, useToast } from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { useState } from 'react';

export default function LoginButton() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      // Android向けのデバッグ情報
      const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
      console.log(`Login attempt from ${isAndroid ? 'Android' : 'non-Android'} device`);
      
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: 'ログインに失敗しました',
        description: 'もう一度お試しください',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      leftIcon={<FcGoogle />}
      onClick={handleLogin}
      colorScheme="blue"
      variant="outline"
      isLoading={isLoading}
      loadingText="ログイン中..."
    >
      Googleでログイン
    </Button>
  );
}
