'use client';

import { useState } from 'react';
import { Box, Heading, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import PerformanceForm from '@/components/performance/PerformanceForm';
import { createPerformance } from '@/services/performanceService';
import { NewPerformance } from '@/types/models/performance';

export default function NewPerformancePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user ,supabase} = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (data: NewPerformance| Partial<NewPerformance>) => {
    if (!user) {
      toast({
        title: 'ログインが必要です',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // ユーザーIDを追加（auth.userのuidを使用）
      const performanceData: NewPerformance = {
        ...data,
        name: data.name || '',
        performance_date: data.performance_date || new Date().toISOString().split('T')[0],
        is_completed: data.is_completed ?? false,
        user_id: user.id,
      };
      
      console.log('User ID:', user.id);
      console.log('User object:', user);
      console.log('Submitting performance data:', performanceData);
      
      await createPerformance(performanceData,supabase);
      
      toast({
        title: 'ルーチンを作成しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      router.push('/performances');
    } catch (error) {
      console.error('Failed to create performance:', error);
      toast({
        title: 'ルーチンの作成に失敗しました',
        description: error instanceof Error ? error.message : '予期せぬエラーが発生しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <Box p={8}>
        <Heading size="lg" mb={6}>
          新しいルーチンを作成
        </Heading>
        <PerformanceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </Box>
    </AppLayout>
  );
}
