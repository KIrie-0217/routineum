'use client';

import { Box, Heading, Text, Button, Center, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function AuthErrorPage() {
  const router = useRouter();

  const handleRetry = () => {
    router.push('/auth/login');
  };

  return (
    <Center h="100vh">
      <VStack spacing={6} p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" maxW="md">
        <Heading as="h1" size="xl" color="red.500">
          認証エラー
        </Heading>
        <Text align="center">
          ログイン処理中にエラーが発生しました。時間をおいて再度お試しください。
        </Text>
        <Box pt={4}>
          <Button colorScheme="blue" onClick={handleRetry}>
            ログインページに戻る
          </Button>
        </Box>
      </VStack>
    </Center>
  );
}
