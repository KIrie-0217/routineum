'use client';

import { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, SimpleGrid, Stat, StatNumber, StatHelpText, Card, CardHeader, CardBody, Button, Center, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Link, Code, useToast, Divider, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { getTotalPerformancesCount, getTotalTechniquesCount, getTotalPracticeSessionsCount, getRecentPerformances, fetchPractices } from '@/services/dashboardService';
import { getUserPracticeContributions,totalCotributionData } from '@/services/contributionService';
import { Performance } from '@/types/models/performance';
import { formatDate } from '@/utils/dateUtils';
import { DashboardSummaryChart, WeeklyAverageGauge } from '@/components/charts';
import UserContributionHeatmap from '@/components/practice/UserContributionHeatmap';


export default function DashboardPage() {
  const { user, isLoading,supabase } = useAuth();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performanceCount, setPerformanceCount] = useState<number>(0);
  const [techniqueCount, setTechniqueCount] = useState<number>(0);
  const [practiceCount, setPracticeCount] = useState<number>(0);
  const [recentPerformances, setRecentPerformances] = useState<Performance[]>([]);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [contributionData, setContributionData] = useState<totalCotributionData>({
    techniquePractices: [],
    performancePractices: []
  });
  const toast = useToast();
  
  useEffect(() => {
    console.log('Dashboard: useEffect triggered, isLoading:', isLoading, 'user:', !!user);
    
    // 認証状態のロード完了時に処理
    if (!isLoading) {
      if (user) {
        console.log('Dashboard: User authenticated, loading dashboard stats');
        setIsPageLoading(true); // ローディング状態を有効化
         
        // ダッシュボードの統計情報を取得する
        loadDashboardStats(user.id)
          .then(() => {
            setIsPageLoading(false); // ローディング状態を解除
          })
          .catch((err) => {
            console.error('Error loading dashboard stats:', err);
            setError('統計情報の取得中にエラーが発生しました。');
            setIsPageLoading(false); // ローディング状態を解除
          });
      } else {
        // ユーザーがログインしていない場合はログインページにリダイレクト
        console.log('Dashboard: No user found, redirecting to login');
        router.push('/auth/login'); // Next.jsのルーターを使用
      }
    }
    
    // コンポーネントのアンマウント時にスピナーの状態をリセット
    return () => {
      console.log('Dashboard: Component unmounting, resetting loading states');
      setIsPageLoading(false);
      setStatsLoading(false);
    };
  }, [user, isLoading, router]);
  
  // ダッシュボードの統計情報を取得する関数
  const loadDashboardStats = async (userId: string) => {
    try {
      setStatsLoading(true);
      console.log('Dashboard: Loading dashboard stats for user', userId);
      
      const performances = await getTotalPerformancesCount(userId,supabase).catch(err => {
          console.error('Error loading performance count:', err);
          return 0;
        });
      const techniques = await getTotalTechniquesCount(userId,supabase).catch(err => {
          console.error('Error loading technique count:', err);
          return 0;
        });
      const practices = await getTotalPracticeSessionsCount(userId,supabase).catch(err => {
          console.error('Error loading practice count:', err);
          return 0;
        });
      const recent = await getRecentPerformances(userId, 3,supabase).catch(err => {
          console.error('Error loading recent performances:', err);
          return [];
        })
      const contributions = await getUserPracticeContributions(userId,365,supabase).catch(err => {
          console.error('Error loading contribution data:', err);
          return { techniquePractices: [], performancePractices: [] };
        }); 
      
      // 状態を更新
      setPerformanceCount(performances);
      setTechniqueCount(techniques);
      setPracticeCount(practices);
      setRecentPerformances(recent);
      setContributionData(contributions);
      
      console.log('Dashboard: All stats loaded successfully');
      
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: '統計情報の取得に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      console.log('Dashboard: Stats loading completed, setting statsLoading to false');
      setStatsLoading(false);
    }
  };
 
  // ユーザー名を取得（user_metadataから名前を取得、なければメールアドレスの@前を使用）
  const displayName = user?.user_metadata?.name || 
                     user?.user_metadata?.full_name || 
                     (user?.email ? user.email.split('@')[0] : 'ユーザー');

  const handleGoToPerformances = () => {
    router.push('/performances');
  };

  // 統計情報の手動更新ボタン
  const handleRefreshStats = () => {
    if (user) {
      console.log('Dashboard: Manually refreshing stats');
      loadDashboardStats(user.id);
    }
  };
  
  // エラーを閉じる関数
  const handleDismissError = () => {
    setError(null);
  };

  const handleRetryUserCreation = async () => {
    try {
      setIsPageLoading(true);
      
      // 統計情報を再取得
      if (user) {
        await loadDashboardStats(user.id);
        setError(null);
        toast({
          title: '成功',
          description: 'データの再取得に成功しました。',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error retrying data fetch:', err);
      setError('再試行中にエラーが発生しました。');
    } finally {
      setIsPageLoading(false);
    }
  };

  // ユーザーが認証済みでもローディング中でもない場合は、コンテンツを表示
  if (!user && !isLoading) {
    console.log('Dashboard: No user and not loading, redirecting to login');
    // Next.jsのルーターを使用してリダイレクト
    router.push('/auth/login');
    return null;
  }

  if (isPageLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>ダッシュボードを準備中...</Text>
          <Text fontSize="sm" color="gray.500">
            {user ? `ユーザー: ${user.email}` : 'ユーザー情報を読み込み中...'}
          </Text>
          <Button 
            size="sm" 
            colorScheme="blue" 
            onClick={() => {
              console.log('Force loading to false');
              setIsPageLoading(false);
            }}
          >
            読み込みをスキップ
          </Button>
        </VStack>
      </Center>
    );
  }

  return (
    <AppLayout>
      <Box p={8}>
        {error && (
          <Alert status="error" mb={6}>
            <AlertIcon />
            <Box flex="1">
              <AlertTitle mr={2}>エラーが発生しました</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
            <Button colorScheme="red" size="sm" onClick={handleRetryUserCreation} mr={2}>
              再読み込み
            </Button>
            <CloseButton onClick={handleDismissError} />
          </Alert>
        )}
        
        <Heading size="lg" mb={6}>ダッシュボード</Heading>
        
        <Text mb={8}>こんにちは、{displayName}さん！今日も練習を記録しましょう。</Text>

        <VStack spacing={4} align="stretch" mb={4}>
          <Heading size="md">最近のルーチン</Heading>
          
          {statsLoading ? (
            <Center py={4}>
              <Spinner />
            </Center>
          ) : recentPerformances.length > 0 ? (
            <Box>
              {recentPerformances.map((performance: Performance) => (
                <Box 
                  key={performance.id} 
                  p={4} 
                  mb={3} 
                  borderWidth="1px" 
                  borderRadius="md"
                  _hover={{ bg: 'gray.50', cursor: 'pointer' }}
                  onClick={() => router.push(`/performances/${performance.id}`)}
                >
                  <Text fontWeight="bold">{performance.name}</Text>
                  <Text fontSize="sm">公演日: {formatDate(performance.performance_date)}</Text>
                </Box>
              ))}
              <Button mt={2} variant="outline" onClick={handleGoToPerformances}>
                すべてのルーチンを表示
              </Button>
            </Box>
          ) : (
            <>
              <Text>まだルーチンが登録されていません。新しいルーチンを追加しましょう。</Text>
              <Button colorScheme="blue" onClick={handleGoToPerformances}>
                ルーチンを管理する
              </Button>
            </>
          )}
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">ルーチン数</Heading>
            </CardHeader>
            <CardBody>
              <Stat>
                {statsLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <StatNumber>{performanceCount}</StatNumber>
                )}
                <StatHelpText>登録済みルーチン</StatHelpText>
              </Stat>
              {statsLoading && (
                <Text fontSize="xs" color="gray.500" mt={2}>読み込み中...</Text>
              )}
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">ルーチン練習回数</Heading>
            </CardHeader>
            <CardBody>
              <Stat>
                {statsLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <StatNumber>{practiceCount}</StatNumber>
                )}
                <StatHelpText>ルーチンの通し練習総回数</StatHelpText>
              </Stat>
              {statsLoading && (
                <Text fontSize="xs" color="gray.500" mt={2}>読み込み中...</Text>
              )}
            </CardBody>
          </Card>

          
          <Card>
            <CardHeader pb={0}>
              <Heading size="md">シークエンス練習回数</Heading>
            </CardHeader>
            <CardBody>
              <Stat>
                {statsLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <StatNumber>{techniqueCount}</StatNumber>
                )}
                <StatHelpText>シークエンスの練習総回数</StatHelpText>
              </Stat>
              {statsLoading && (
                <Text fontSize="xs" color="gray.500" mt={2}>読み込み中...</Text>
              )}
            </CardBody>
          </Card>
          
          </SimpleGrid>
        
        {/* 練習記録の草グラフ */}
        <Box  bg="white" > 
          <UserContributionHeatmap 
                  title="全ルーチン通し練習"
                  days={365}
                /> 
        </Box>
        
        <Divider my={6} />
          
        {/* ダッシュボードサマリーチャートを追加 */}
        {user && !statsLoading && (
          <Box mb={8}>
            <Heading size="md" mb={4}>ルーチンデータ分析</Heading>
            <VStack spacing={6} mb={6} align="center">
              <Box w="100%" maxW="300px">
                <WeeklyAverageGauge 
                  title="週間平均成功率"
                  colorScheme="blue"
                  fetchPractices={async () => { return fetchPractices(user.id,supabase)}}
                />
              </Box>
            </VStack>
            <DashboardSummaryChart userId={user.id} />
          </Box>
        )}
         
      </Box>
    </AppLayout>
  );
}
