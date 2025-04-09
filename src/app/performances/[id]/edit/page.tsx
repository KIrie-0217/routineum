'use client';

import { useState, useEffect, use, Usable } from 'react';
import { Box, Heading, useToast, Spinner, Center } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import PerformanceForm from '@/components/performance/PerformanceForm';
import { getPerformance, updatePerformance } from '@/services/performanceService';
import { Performance, UpdatePerformance } from '@/types/models/performance';

type EditPerformancePageProps = Promise< { id: string }>

export default async function EditPerformancePage(props: {
  params: EditPerformancePageProps;
}) {
  const { id } = await props.params; 
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user ,supabase} = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    async function loadPerformance() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await getPerformance(id,supabase);
        
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
  }, [id, user, router, toast]);

  const handleSubmit = async (data: UpdatePerformance) => {
    try {
      setIsSubmitting(true);
      await updatePerformance(id, data,supabase);
      
      toast({
        title: 'ルーチンを更新しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      router.push(`/performances/${id}`);
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
