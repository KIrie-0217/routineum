'use client';

import { useState, useEffect, use } from 'react';
import { Box, Heading, useToast, Spinner, Center } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import PerformanceForm from '@/components/performance/PerformanceForm';
import { getPerformance, updatePerformance } from '@/services/performanceService';
import { Performance, UpdatePerformance } from '@/types/models/performance';

export default function EditPerformancePage({ params }: { params: { id: string } }) {
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  // paramsをReact.use()でラップして安全に使用
  const resolvedParams = use(params);

  useEffect(() => {
    async function loadPerformance() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await getPerformance(resolvedParams.id);
        
        // 他のユーザーのルーチンにアクセスしようとした場合はリダイレクト
        if (data && data.user_id !== user.id) {
          toast({
            title: 'アクセス権限がありません',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          router.push('/performances');
          return;
        }
        
        setPerformance(data);
      } catch (error) {
        console.error('Failed to load performance:', error);
        toast({
          title: 'ルーチンの読み込みに失敗しました',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadPerformance();
  }, [resolvedParams.id, user, router, toast]);

  const handleSubmit = async (data: UpdatePerformance) => {
    try {
      setIsSubmitting(true);
      await updatePerformance(resolvedParams.id, data);
      
      toast({
        title: 'ルーチンを更新しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      router.push(`/performances/${resolvedParams.id}`);
    } catch (error) {
      console.error('Failed to update performance:', error);
      toast({
        title: 'ルーチンの更新に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Center h="50vh">
          <Spinner size="xl" />
        </Center>
      </AppLayout>
    );
  }

  if (!performance) {
    return (
      <AppLayout>
        <Box p={8}>
          <Heading size="lg">ルーチンが見つかりませんでした</Heading>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box p={8}>
        <Heading size="lg" mb={6}>
          ルーチンを編集: {performance.name}
        </Heading>
        <PerformanceForm
          initialData={performance}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Box>
    </AppLayout>
  );
}
