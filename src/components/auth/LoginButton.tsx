'use client';

import { Button } from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';

export default function LoginButton() {
  const { signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Button
      leftIcon={<FcGoogle />}
      onClick={handleLogin}
      colorScheme="blue"
      variant="outline"
    >
      Googleでログイン
    </Button>
  );
}
