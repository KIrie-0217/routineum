'use client';

import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

export default function DashboardLoading() {
  return (
    <Center h="100vh">
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.500" />
        <Text>ダッシュボードを読み込み中...</Text>
      </VStack>
    </Center>
  );
}
