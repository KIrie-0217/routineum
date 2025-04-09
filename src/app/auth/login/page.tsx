'use client';

import { 
  Box, 
  Flex, 
  Heading, 
  VStack, 
  Text, 
  Button, 
  Container, 
  useBreakpointValue, 
  ResponsiveValue
} from '@chakra-ui/react';
import LoginButton from '@/components/auth/LoginButton';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextAlign } from 'chart.js';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // レスポンシブ対応のためのブレークポイント設定
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const subHeadingSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const boxPadding = useBreakpointValue({ base: 4, md: 8 });
  const containerMaxW = useBreakpointValue({ base: '90%', sm: '450px', md: '500px' });
  const spacing = useBreakpointValue({ base: 4, md: 8 });
  const textAlign : ResponsiveValue<TextAlign> = useBreakpointValue({ base: 'center', md: 'center' }) ?? 'center';

  useEffect(() => {
    if (user && !isLoading) {
      console.log('Login page: User authenticated, redirecting to dashboard'); 
      router.push('/dashboard'); 
    }
  }, [user, isLoading, router]);

  const handleManualRedirect = () => {
    console.log('Login page: Manual redirect triggered');
    window.location.href = '/dashboard';
  };

  // ユーザーが認証済みの場合、リダイレクト中のメッセージを表示
  if (user && !isLoading) {
    return (
      <Flex 
        minH={{ base: 'calc(100vh - 80px)', md: '100vh' }} 
        align="center" 
        justify="center"
        p={4}
      >
        <Container maxW={containerMaxW}>
          <VStack spacing={4} textAlign={textAlign}>
            <Heading as="h2" size={subHeadingSize}>
              ダッシュボードにリダイレクト中...
            </Heading>
            <Text fontSize={{ base: 'sm', md: 'md' }}>
              自動的にリダイレクトされない場合は下のボタンをクリックしてください。
            </Text>
            <Button colorScheme="blue" onClick={handleManualRedirect} w={{ base: 'full', md: 'auto' }}>
              ダッシュボードへ移動
            </Button>
          </VStack>
        </Container>
      </Flex>
    );
  }

  return (
    <Flex 
      minH={{ base: 'calc(100vh - 80px)', md: '100vh' }} 
      align="center" 
      justify="center"
      p={4}
      direction="column"
    >
      <Container maxW={containerMaxW}>
        <VStack spacing={spacing} textAlign={textAlign}>
          <Heading as="h1" size={headingSize}>
            Routineum
          </Heading>
          <Text fontSize={{ base: 'sm', md: 'md' }} px={2}>
            大会に向けてジャグリングのルーチン練習記録を管理するアプリケーション
          </Text> 
          <Box 
            p={boxPadding} 
            borderWidth={1} 
            borderRadius="lg" 
            boxShadow="lg"
            w="100%"
          >
            <VStack spacing={4}>
              <Heading as="h2" size={subHeadingSize}>
                ログイン
              </Heading>
              <LoginButton />
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Flex>
  );
}
