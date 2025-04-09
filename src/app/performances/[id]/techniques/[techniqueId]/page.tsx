'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Center,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { getPerformance } from '@/services/performanceService';
import { getTechniqueById } from '@/services/techniqueService';
import { Performance } from '@/types/models/performance';
import { Technique } from '@/types/models/technique';
import TechniqueDetail from '@/components/technique/TechniqueDetail';

type TechniquePageProps = Promise<{
    id: string;
    techniqueId: string;
    }>

export default async function TechniquePage(props : { params : TechniquePageProps}) {
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [technique, setTechnique] = useState<Technique | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user,supabase } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const params = await props.params;

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // ルーチン情報の取得
        const performanceData = await getPerformance(params.id,supabase);
        
        // 権限チェック
        if (performanceData.user_id !== user.id) {
          toast({
            title: 'アクセス権限がありません',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          router.push('/performances');
          return;
        }
        
        setPerformance(performanceData);
        
        // シークエンス情報の取得
        const techniqueData = await getTechniqueById(params.techniqueId,supabase);
        
        // シークエンスが指定されたルーチンに属しているか確認
        if (techniqueData.performance_id !== params.id) {
          toast({
            title: '無効なシークエンスIDです',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          router.push(`/performances/${params.id}`);
          return;
        }
        
        setTechnique(techniqueData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: 'データの読み込みに失敗しました',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [params.id, params.techniqueId, user, router, toast]);

  const handleBack = () => {
    router.push(`/performances/${params.id}`);
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

  if (!performance || !technique) {
    return (
      <AppLayout>
        <Box p={8}>
          <Button onClick={handleBack}>ルーチン詳細に戻る</Button>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box p={8}>
        <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />} mb={6}>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => router.push('/performances')}>ルーチン一覧</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => router.push(`/performances/${params.id}`)}>
              {performance.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{technique.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Heading size="lg" mb={6}>{technique.name}</Heading>
        
        <TechniqueDetail techniqueId={params.techniqueId} />
        
        <Box mt={8}>
          <Button onClick={handleBack}>ルーチン詳細に戻る</Button>
        </Box>
      </Box>
    </AppLayout>
  );
}
