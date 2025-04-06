'use client';

import { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, SimpleGrid, Stat, StatNumber, StatHelpText, Card, CardHeader, CardBody, Button, Center, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Link, Code, useToast, Divider, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { supabase } from '@/lib/supabase/client';
import { getTotalPerformancesCount, getTotalTechniquesCount, getTotalPracticeSessionsCount, getRecentPerformances } from '@/services/dashboardService';
import { getUserPracticeContributions } from '@/services/contributionService';
import { Performance } from '@/types/models/performance';
import { formatDate } from '@/utils/dateUtils';
import { DashboardSummaryChart, WeeklyAverageGauge } from '@/components/charts';
import UserContributionHeatmap from '@/components/practice/UserContributionHeatmap';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [performanceCount, setPerformanceCount] = useState<number>(0);
  const [techniqueCount, setTechniqueCount] = useState<number>(0);
  const [practiceCount, setPracticeCount] = useState<number>(0);
  const [recentPerformances, setRecentPerformances] = useState<Performance[]>([]);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [contributionData, setContributionData] = useState({
    techniquePractices: [],
    performancePractices: []
  });
  const toast = useToast();
  
  useEffect(() => {
    console.log('Dashboard: useEffect triggered, isLoading:', isLoading, 'user:', !!user);
    
    // 認証状態のロード完了時に処理
    if (!isLoading) {
      if (user) {
        console.log('Dashboard: User authenticated, checking user record');
        setIsPageLoading(true); // ここでローディング状態を有効化
        
        // タイムアウト処理を追加
        const timeoutId = setTimeout(() => {
          console.log('Dashboard: API request timeout, forcing loading state to false');
          setIsPageLoading(false);
          setError('ユーザー情報の取得がタイムアウトしました。再読み込みしてください。');
        }, 5000); // 5秒後にタイムアウト
        
        // ユーザーレコードが存在するか確認
        const checkUserRecord = async () => {
          try {
            console.log('Dashboard: Checking user record directly with Supabase client');
            
            // ユーザー情報を取得
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();
              
            clearTimeout(timeoutId); // タイムアウトをクリア
            
            if (userError && userError.code === 'PGRST116') {
              console.log('Dashboard: User record not found, creating new one');
              
              // ユーザーレコードを作成
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: user.id,
                  email: user.email || '',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
              if (insertError) {
                console.error('Error creating user record:', insertError);
                setError(`ユーザーレコードの作成に失敗しました: ${insertError.message}`);
                setDebugInfo({ error: insertError });
              } else {
                console.log('Dashboard: User record created successfully');
                toast({
                  title: 'ユーザー情報を作成しました',
                  description: 'ユーザープロフィールが正常に作成されました。',
                  status: 'success',
                  duration: 5000,
                  isClosable: true,
                });
              }
            } else if (userError) {
              console.error('Error fetching user record:', userError);
              setError(`ユーザー情報の取得に失敗しました: ${userError.message}`);
              setDebugInfo({ error: userError });
            } else {
              console.log('Dashboard: User record found:', userData);
              setDebugInfo({ user: userData });
            }
            
            // ユーザー情報の取得に成功したら統計情報を取得
            console.log('Dashboard: Fetching user stats');
            loadDashboardStats(user.id);
          } catch (err) {
            console.error('Unexpected error checking user record:', err);
            setError('ユーザー情報の確認中に予期しないエラーが発生しました。');
            setDebugInfo({ error: String(err) });
          } finally {
            console.log('Dashboard: Setting loading state to false');
            clearTimeout(timeoutId); // 念のためタイムアウトをクリア
            setIsPageLoading(false); // ローディング状態を解除
          }
        };
        
        checkUserRecord();
      } else {
        // ユーザーがログインしていない場合はログインページにリダイレクト
        console.log('Dashboard: No user found, redirecting to login');
        window.location.href = '/auth/login'; // 直接URLを変更
      }
    }
    
    // コンポーネントのアンマウント時にスピナーの状態をリセット
    return () => {
      console.log('Dashboard: Component unmounting, resetting loading states');
      setIsPageLoading(false);
      setStatsLoading(false);
    };
  }, [user, isLoading, toast]);
  
  // ダッシュボードの統計情報を取得する関数
  const loadDashboardStats = async (userId: string) => {
    try {
      setStatsLoading(true);
      console.log('Dashboard: Loading dashboard stats for user', userId);
      
      // 各統計情報を順番に取得し、エラーが発生しても他の情報は取得できるようにする
      try {
        console.log('Dashboard: Starting to fetch performance count');
        const performances = await getTotalPerformancesCount(userId);
        console.log('Dashboard: Performance count fetch completed successfully');
        setPerformanceCount(performances);
        console.log('Dashboard: Performance count loaded:', performances);
      } catch (error) {
        console.error('Error loading performance count:', error);
        setPerformanceCount(0);
      }
      
      try {
        console.log('Dashboard: Starting to fetch technique count');
        const techniques = await getTotalTechniquesCount(userId);
        console.log('Dashboard: Technique count fetch completed successfully');
        setTechniqueCount(techniques);
        console.log('Dashboard: Technique count loaded:', techniques);
      } catch (error) {
        console.error('Error loading technique count:', error);
        setTechniqueCount(0);
      }
      
      try {
        console.log('Dashboard: Starting to fetch practice count');
        const practices = await getTotalPracticeSessionsCount(userId);
        console.log('Dashboard: Practice count fetch completed successfully');
        setPracticeCount(practices);
        console.log('Dashboard: Practice count loaded:', practices);
      } catch (error) {
        console.error('Error loading practice count:', error);
        setPracticeCount(0);
      }
      
      try {
        console.log('Dashboard: Starting to fetch recent performances');
        const recent = await getRecentPerformances(userId, 3);
        console.log('Dashboard: Recent performances fetch completed successfully');
        setRecentPerformances(recent);
        console.log('Dashboard: Recent performances loaded:', recent.length);
      } catch (error) {
        console.error('Error loading recent performances:', error);
        setRecentPerformances([]);
      }
      
      try {
        console.log('Dashboard: Starting to fetch contribution data');
        const contributions = await getUserPracticeContributions(userId);
        console.log('Dashboard: Contribution data fetch completed successfully');
        setContributionData(contributions);
        console.log('Dashboard: Contribution data loaded');
      } catch (error) {
        console.error('Error loading contribution data:', error);
        setContributionData({ techniquePractices: [], performancePractices: [] });
      }
      
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
      
      // 直接Supabaseクライアントを使用してユーザーレコードを作成
      const { error: insertError } = await supabase
        .from('users')
        .upsert({
          id: user?.id || '',
          email: user?.email || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (insertError) {
        toast({
          title: '失敗',
          description: `ユーザー情報の作成に失敗しました: ${insertError.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setError(`再試行に失敗しました: ${insertError.message}`);
        setDebugInfo({ error: insertError });
      } else {
        toast({
          title: '成功',
          description: 'ユーザー情報の作成に成功しました。',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setError(null);
        
        // 再試行が成功したら統計情報も再取得
        if (user) {
          loadDashboardStats(user.id);
        }
      }
    } catch (err) {
      console.error('Error retrying user creation:', err);
      setError('再試行中にエラーが発生しました。');
      setDebugInfo({ error: String(err) });
    } finally {
      setIsPageLoading(false);
    }
  };

  // ユーザーが認証済みでもローディング中でもない場合は、コンテンツを表示
  if (!user && !isLoading) {
    console.log('Dashboard: No user and not loading, redirecting to login');
    // 直接リダイレクト
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
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
              再試行
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
        
        {debugInfo && (
          <Alert status={debugInfo.error ? "warning" : "info"} mb={6}>
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>{debugInfo.error ? "デバッグ情報 (エラー)" : "デバッグ情報"}</AlertTitle>
              <AlertDescription>
                <Text>{debugInfo.message || debugInfo.error || 'デバッグ情報を取得しました'}</Text>
                {debugInfo.user && (
                  <Text mt={2}>ユーザーID: {debugInfo.user.id}</Text>
                )}
                {debugInfo.details && (
                  <Box mt={2}>
                    <Text fontWeight="bold">詳細:</Text>
                    <Code p={2} mt={1} fontSize="sm" whiteSpace="pre-wrap">
                      {JSON.stringify(debugInfo.details, null, 2)}
                    </Code>
                  </Box>
                )}
              </AlertDescription>
            </Box>
            <CloseButton onClick={() => setDebugInfo(null)} />
          </Alert>
        )}
        

        
        {/* ダッシュボードサマリーチャートを追加 */}
        {user && !statsLoading && (performanceCount > 0 || techniqueCount > 0 || practiceCount > 0) && (
          <Box mb={8}>
            <Heading size="md" mb={4}>ルーチンデータ分析</Heading>
            <VStack spacing={6} mb={6} align="center">
              <Box w="100%" maxW="300px">
                <WeeklyAverageGauge 
                  title="週間平均成功率"
                  colorScheme="blue"
                  fetchPractices={async () => {
                    // ユーザーの全ルーチンとシークエンスの練習記録を取得
                    const { data: performances } = await supabase
                      .from('performances')
                      .select('id')
                      .eq('user_id', user.id);
                      
                    if (!performances || performances.length === 0) return [];
                    
                    const performanceIds = performances.map(p => p.id);
                    
                    // ルーチン練習記録を取得
                    const { data: perfPractices } = await supabase
                      .from('performance_practices')
                      .select('success_rate, practice_date')
                      .in('performance_id', performanceIds);
                      
                    return perfPractices || [];
                  }}
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
