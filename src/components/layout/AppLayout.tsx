'use client';

import { Box, Center, Spinner, Text, VStack, useBreakpointValue } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Header from './Header';
import AuthGuard from '../auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

// 認証が必要なレイアウト（デフォルト）
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const [layoutReady, setLayoutReady] = useState(false);
  
  // モバイルデバイス向けのパディング調整
  const mainPadding = useBreakpointValue({ base: 2, md: 4 });
  const contentMaxWidth = useBreakpointValue({ base: '100%', md: '1200px' });

  useEffect(() => {
    // AuthGuardがユーザーを確認した後、レイアウトを表示する準備をする
    if (!isLoading && user) {
      console.log('AppLayout: Auth check completed, user is authenticated');
      // 少し遅延を入れてUIの準備を整える
      const timer = setTimeout(() => {
        setLayoutReady(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setLayoutReady(true);
    }
  }, [isLoading, user]);

  if (isLoading || !layoutReady) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>アプリケーションを読み込み中...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <AuthGuard>
      <Box minH="100vh" width="100%">
        <Header />
        <Box 
          as="main" 
          pt={mainPadding} 
          px={mainPadding}
          mx="auto"
          maxW={contentMaxWidth}
          overflowX="hidden"
        >
          {children}
        </Box>
      </Box>
    </AuthGuard>
  );
};

// 認証が不要なレイアウト（Aboutページなど公開ページ用）
export const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  // モバイルデバイス向けのパディング調整
  const mainPadding = useBreakpointValue({ base: 2, md: 4 });
  const contentMaxWidth = useBreakpointValue({ base: '100%', md: '1200px' });

  return (
    <Box minH="100vh" width="100%">
      <Header />
      <Box 
        as="main" 
        pt={mainPadding} 
        px={mainPadding}
        mx="auto"
        maxW={contentMaxWidth}
        overflowX="hidden"
      >
        {children}
      </Box>
    </Box>
  );
};

export { AppLayout };
export default AppLayout;
