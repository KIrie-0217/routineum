'use client';

import { Button } from '@chakra-ui/react';
import { useAuth } from '@/contexts/AuthContext';

export default function LogoutButton() {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Button onClick={handleLogout} variant="ghost">
      ログアウト
    </Button>
  );
}
