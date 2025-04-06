'use client';

import { Box, Heading, Text, Spinner, Center, useColorModeValue, SimpleGrid } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { getSupabaseClient } from '@/lib/supabase/client';

// Chart.jsの必要なコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardSummaryChartProps {
  userId: string;
}

export default function DashboardSummaryChart({
  userId
}: DashboardSummaryChartProps) {
  const [practiceCountData, setPracticeCountData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: []
  });
  const [successRateData, setSuccessRateData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: []
  });
  const [performanceStatusData, setPerformanceStatusData] = useState<ChartData<'doughnut'>>({
    labels: [],
    datasets: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // カラーテーマ
  const gridColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');
  const textColor = useColorModeValue('rgba(0, 0, 0, 0.8)', 'rgba(255, 255, 255, 0.8)');

  // 練習回数グラフのオプション
  const practiceCountOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '練習回数',
          color: textColor
        },
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor,
          stepSize: 1
        }
      },
      x: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: '過去7日間の練習回数',
        color: textColor
      }
    }
  };

  // 成功率グラフのオプション
  const successRateOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: '平均成功率 (%)',
          color: textColor
        },
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor
        }
      },
      x: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: '過去7日間の平均成功率',
        color: textColor
      }
    }
  };

  // ルーチンステータスグラフのオプション
  const performanceStatusOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor
        }
      },
      title: {
        display: true,
        text: 'ルーチンのステータス',
        color: textColor
      }
    }
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const supabase = getSupabaseClient();

        setIsLoading(true);
        setError(null);
        
        // 過去7日間の日付ラベルを生成
        const today = new Date();
        const dateLabels = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(today, 6 - i);
          return format(date, 'MM/dd', { locale: ja });
        });
        
        // 過去7日間の日付範囲を生成（ISO形式）
        const startDate = subDays(today, 6).toISOString();
        
        // ユーザーのルーチンIDを取得
        const { data: performances, error: perfError } = await supabase
          .from('performances')
          .select('id')
          .eq('user_id', userId);
          
        if (perfError) {
          throw new Error('ルーチンデータの取得に失敗しました');
        }
        
        if (!performances || performances.length === 0) {
          // ルーチンがない場合は空のデータを設定
          setIsLoading(false);
          return;
        }
        
        const performanceIds = performances.map(p => p.id);
        
        // 1. 過去7日間の練習回数データを取得
        const practiceCountsByDay = await fetchPracticeCountsByDay(performanceIds, startDate, dateLabels);
        
        // 2. 過去7日間の平均成功率データを取得
        const successRatesByDay = await fetchSuccessRatesByDay(performanceIds, startDate, dateLabels);
        
        // 3. ルーチンのステータス（完了/準備中）を取得
        const { data: statusData, error: statusError } = await supabase
          .from('performances')
          .select('is_completed')
          .eq('user_id', userId);
          
        if (statusError) {
          throw new Error('ルーチンステータスの取得に失敗しました');
        }
        
        // ルーチンステータスの集計
        const completedCount = statusData?.filter(p => p.is_completed).length || 0;
        const inProgressCount = statusData?.filter(p => !p.is_completed).length || 0;
        
        // グラフデータを設定
        setPracticeCountData({
          labels: dateLabels,
          datasets: [
            {
              label: '練習回数',
              data: practiceCountsByDay,
              backgroundColor: 'rgba(53, 162, 235, 0.7)',
              borderColor: 'rgba(53, 162, 235, 1)',
              borderWidth: 1
            }
          ]
        });
        
        setSuccessRateData({
          labels: dateLabels,
          datasets: [
            {
              label: '平均成功率',
              data: successRatesByDay,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.3,
              fill: true
            }
          ]
        });
        
        setPerformanceStatusData({
          labels: ['完了', '準備中'],
          datasets: [
            {
              data: [completedCount, inProgressCount],
              backgroundColor: [
                'rgba(75, 192, 192, 0.7)',
                'rgba(255, 159, 64, 0.7)'
              ],
              borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
            }
          ]
        });
        
      } catch (err) {
        console.error('ダッシュボードデータの取得に失敗しました:', err);
        setError('データの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [userId]);

  // 過去7日間の練習回数を日付ごとに取得する関数
  async function fetchPracticeCountsByDay(performanceIds: string[], startDate: string, dateLabels: string[]) {
    const supabase = getSupabaseClient();

    // ルーチン練習記録を取得
    const { data: perfPractices, error: perfPracticeError } = await supabase
      .from('performance_practices')
      .select('practice_date')
      .in('performance_id', performanceIds)
      .gte('practice_date', startDate);
      
    if (perfPracticeError) {
      throw new Error('ルーチン練習記録の取得に失敗しました');
    }
    
    // シークエンスIDを取得
    const { data: techniques, error: techError } = await supabase
      .from('techniques')
      .select('id')
      .in('performance_id', performanceIds);
      
    if (techError) {
      throw new Error('シークエンスデータの取得に失敗しました');
    }
    
    const techniqueIds = techniques?.map(t => t.id) || [];
    
    // シークエンス練習記録を取得
    const { data: techPractices, error: techPracticeError } = await supabase
      .from('technique_practices')
      .select('practice_date')
      .in('technique_id', techniqueIds)
      .gte('practice_date', startDate);
      
    if (techPracticeError) {
      throw new Error('シークエンス練習記録の取得に失敗しました');
    }
    
    // 日付ごとの練習回数を集計
    const today = new Date();
    const countsByDay = Array(7).fill(0);
    
    // ルーチン練習の集計
    perfPractices?.forEach(practice => {
      const practiceDate = new Date(practice.practice_date);
      const dayDiff = Math.floor((today.getTime() - practiceDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 0 && dayDiff < 7) {
        countsByDay[6 - dayDiff]++;
      }
    });
    
    // シークエンス練習の集計
    techPractices?.forEach(practice => {
      const practiceDate = new Date(practice.practice_date);
      const dayDiff = Math.floor((today.getTime() - practiceDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 0 && dayDiff < 7) {
        countsByDay[6 - dayDiff]++;
      }
    });
    
    return countsByDay;
  }

  // 過去7日間の平均成功率を日付ごとに取得する関数
  async function fetchSuccessRatesByDay(performanceIds: string[], startDate: string, dateLabels: string[]) {
    const supabase = getSupabaseClient();

    // ルーチン練習記録を取得
    const { data: perfPractices, error: perfPracticeError } = await supabase
      .from('performance_practices')
      .select('practice_date, success_rate')
      .in('performance_id', performanceIds)
      .gte('practice_date', startDate);
      
    if (perfPracticeError) {
      throw new Error('ルーチン練習記録の取得に失敗しました');
    }
    
    // シークエンスIDを取得
    const { data: techniques, error: techError } = await supabase
      .from('techniques')
      .select('id')
      .in('performance_id', performanceIds);
      
    if (techError) {
      throw new Error('シークエンスデータの取得に失敗しました');
    }
    
    const techniqueIds = techniques?.map(t => t.id) || [];
    
    // シークエンス練習記録を取得
    const { data: techPractices, error: techPracticeError } = await supabase
      .from('technique_practices')
      .select('practice_date, success_rate')
      .in('technique_id', techniqueIds)
      .gte('practice_date', startDate);
      
    if (techPracticeError) {
      throw new Error('シークエンス練習記録の取得に失敗しました');
    }
    
    // 日付ごとの成功率を集計
    const today = new Date();
    const ratesByDay = Array(7).fill(null);
    const countsByDay = Array(7).fill(0);
    const sumsByDay = Array(7).fill(0);
    
    // ルーチン練習の集計
    perfPractices?.forEach(practice => {
      const practiceDate = new Date(practice.practice_date);
      const dayDiff = Math.floor((today.getTime() - practiceDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff >= 0 && dayDiff < 7) {
        sumsByDay[6 - dayDiff] += practice.success_rate;
        countsByDay[6 - dayDiff]++;
      }
    }); 
    
    // 平均成功率を計算
    for (let i = 0; i < 7; i++) {
      if (countsByDay[i] > 0) {
        ratesByDay[i] = Math.round(sumsByDay[i] / countsByDay[i]);
      }
    }
    
    return ratesByDay;
  }

  if (isLoading) {
    return (
      <Box h="300px" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box h="300px" display="flex" alignItems="center" justifyContent="center">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  // データがない場合
  if (
    !practiceCountData.labels?.length || 
    !successRateData.labels?.length || 
    !performanceStatusData.labels?.length
  ) {
    return (
      <Box h="300px" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">まだデータがありません</Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={6}>
      <Box h="300px" p={4} borderWidth="1px" borderRadius="md">
        <Bar options={practiceCountOptions} data={practiceCountData} />
      </Box>
      
      <Box h="300px" p={4} borderWidth="1px" borderRadius="md">
        <Line options={successRateOptions} data={successRateData} />
      </Box>
       
    </SimpleGrid>
  );
}
