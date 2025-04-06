'use client';

import { useState, useEffect } from 'react';
import { Box, Heading, Button, Text, SimpleGrid, Card, CardHeader, CardBody, CardFooter, Stack, Badge, Spinner, Center, Divider } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { getPerformances } from '@/services/performanceService';
import { getUserPracticeContributions } from '@/services/contributionService';
import { Performance } from '@/types/models/performance';
import { formatDate } from '@/utils/dateUtils';
import PracticeContributionGraph from '@/components/practice/PracticeContributionGraph';

export default function PerformancesPage() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contributionData, setContributionData] = useState({
    techniquePractices: [],
    performancePractices: []
  });
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const performanceData = await getPerformances(user.id);
        setPerformances(performanceData);
         
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleAddNew = () => {
    router.push('/performances/new');
  };

  const handleViewDetails = (id: string) => {
    router.push(`/performances/${id}`);
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

  return (
    <AppLayout>
      <Box p={8}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg">ルーチン一覧</Heading>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddNew}>
            新規作成
          </Button>
        </Box>
 
        <Divider my={6} />

        {performances.length === 0 ? (
          <Text>ルーチンが登録されていません。新しいルーチンを追加しましょう。</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {performances.map((performance) => (
              <Card key={performance.id} variant="outline">
                <CardHeader>
                  <Heading size="md">{performance.name}</Heading>
                </CardHeader>
                <CardBody>
                  <Stack spacing={2}>
                    <Text>公演日: {formatDate(performance.performance_date)}</Text>
                    {performance.is_completed ? (
                      <Badge colorScheme="green">完了</Badge>
                    ) : (
                      <Badge colorScheme="blue">準備中</Badge>
                    )}
                    {performance.result_percentage !== null && (
                      <Text>結果: {performance.result_percentage}%</Text>
                    )}
                  </Stack>
                </CardBody>
                <CardFooter>
                  <Button variant="solid" colorScheme="blue" onClick={() => handleViewDetails(performance.id)}>
                    詳細
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </AppLayout>
  );
}
