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
  ResponsiveValue,
  Link
} from '@chakra-ui/react';
import LoginButton from '@/components/auth/LoginButton';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextAlign } from 'chart.js';
import NextLink from 'next/link';
import { PublicLayout } from '@/components/layout/AppLayout';

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
      <PublicLayout>
        <Flex 
          minH={{ base: 'calc(100vh - 80px)', md: 'calc(100vh - 80px)' }} 
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
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <Flex 
        minH={{ base: 'calc(100vh - 80px)', md: 'calc(100vh - 80px)' }} 
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
            <Text fontSize="sm" color="gray.500">
              アプリについての詳細は <Link as={NextLink} href="/about" color="blue.500">こちら</Link> をご覧ください
            </Text>
            <Text fontSize="sm" color="gray.500">
              <Link as={NextLink} href="/privacy-policy" color="blue.500">プライバシーポリシー</Link> | <Link as={NextLink} href="/terms-of-service" color="blue.500">利用規約</Link>
            </Text>
          </VStack>
        </Container>
      </Flex>
    </PublicLayout>
  );
}
