'use client';

import { Box, Heading, Text, Spinner, Center, useColorModeValue, Select, HStack } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { format, parseISO, subDays, subMonths, isAfter } from 'date-fns';
import { ja } from 'date-fns/locale';
import { getAllTechniquePractices } from '@/services/practiceService';
import { getSupabaseClient } from '@/lib/supabase/client';

// Chart.jsの必要なコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TechniqueProgressChartProps {
  techniqueId: string;
  techniqueName?: string;
  title?: string;
}

export default function TechniqueProgressChart({
  techniqueId,
  techniqueName,
  title
}: TechniqueProgressChartProps) {
  const [allPractices, setAllPractices] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('all'); // 'all', 'month', 'week'
  const supabase = getSupabaseClient();

  // カラーテーマ
  const lineColor = useColorModeValue('rgb(76, 175, 80)', 'rgb(129, 199, 132)');
  const gridColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');
  const textColor = useColorModeValue('rgba(0, 0, 0, 0.8)', 'rgba(255, 255, 255, 0.8)');

  
  const getLatestValue = () => {
    const data = chartData.datasets[0].data[0];
    if (typeof data === 'number') return data;
    if (data && 'y' in data) return data.y;
    return 0;
  };

  // グラフのオプション
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: '成功率 (%)',
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
        title: {
          display: true,
          text: '練習日',
          color: textColor
        },
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor,
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `成功率: ${context.parsed.y}%`;
          }
        }
      }
    }
  };

  useEffect(() => {
    async function fetchPracticeData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const practices = await getAllTechniquePractices(techniqueId,supabase);
        
        if (practices.length === 0) {
          setIsLoading(false);
          return;
        }
        
        // 日付でソート（古い順）
        const sortedPractices = [...practices].sort(
          (a, b) => new Date(a.practice_date).getTime() - new Date(b.practice_date).getTime()
        );

        setAllPractices(sortedPractices);
        updateChartData(sortedPractices);
      } catch (err) {
        console.error('練習データの取得に失敗しました:', err);
        setError('データの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPracticeData();
  }, [techniqueId]);

  // 時間範囲が変更されたときにチャートデータを更新
  useEffect(() => {
    if (allPractices.length > 0) {
      const filteredPractices = filterPracticesByTimeRange(allPractices, timeRange);
      updateChartData(filteredPractices);
    }
  }, [timeRange, allPractices]);

  // 時間範囲に基づいて練習データをフィルタリング
  const filterPracticesByTimeRange = (practices: any[], range: string) => {
    if (range === 'all') {
      return practices;
    }

    const now = new Date();
    let cutoffDate: Date;
    
    if (range === 'month') {
      cutoffDate = subMonths(now, 1);
    } else { // 'week'
      cutoffDate = subDays(now, 7);
    }

    return practices.filter(practice => 
      isAfter(new Date(practice.practice_date), cutoffDate)
    );
  };

  // チャートデータを更新する関数
  const updateChartData = (practices: any[]) => {
    if (practices.length === 0) {
      setChartData({
        labels: [],
        datasets: []
      });
      return;
    }

    // 日付と成功率のデータを抽出
    const labels = practices.map(practice => 
      format(parseISO(practice.practice_date), 'MM/dd', { locale: ja })
    );
    const successRates = practices.map(practice => practice.success_rate);

    // 移動平均を計算（3点移動平均）
    const movingAverages = calculateMovingAverage(successRates, 3);

    

    setChartData({
      labels,
      datasets: [
        {
          label: '成功率 (%)',
          data: successRates,
          borderColor: lineColor,
          backgroundColor: lineColor,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: '移動平均 (3回)',
          data: movingAverages,
          borderColor: 'rgba(255, 99, 132, 0.8)',
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    });
  };

  // n点移動平均を計算する関数
  function calculateMovingAverage(data: number[], window: number): (number | null)[] {
    const result: (number | null)[] = [];
    
    // データが少ない場合は移動平均を計算しない
    if (data.length < window) {
      return data.map(() => null);
    }
    
    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        // 最初のwindow-1個のデータポイントは移動平均を計算しない
        result.push(null);
      } else {
        // i-(window-1)からiまでのwindow個のデータポイントの平均を計算
        let sum = 0;
        for (let j = 0; j < window; j++) {
          sum += data[i - j];
        }
        result.push(Math.round(sum / window * 10) / 10); // 小数点第1位まで
      }
    }
    
    return result;
  }

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  // タイトルがない場合はシークエンス名を使用
  const chartTitle = title || (techniqueName ? `${techniqueName}の成功率推移` : 'シークエンスの成功率推移');

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

  if (chartData.labels?.length === 0) {
    return (
      <Box h="300px" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">まだ練習記録がありません</Text>
      </Box>
    );
  }

  if (chartData.labels?.length === 1) {
    return (
      <Box h="300px" display="flex" alignItems="center" justifyContent="center" flexDirection="column">
        <Text color="gray.500" mb={2}>グラフを表示するには2つ以上の記録が必要です</Text>
        <Text fontWeight="bold">最新の成功率: {getLatestValue()}%</Text>
      </Box>
    );
  }

  return (
    <Box>
      <HStack justifyContent="space-between" mb={4}>
        <Heading size="md">{chartTitle}</Heading>
        <Select 
          value={timeRange} 
          onChange={handleTimeRangeChange} 
          width="150px" 
          size="sm"
        >
          <option value="all">全期間</option>
          <option value="month">過去1ヶ月</option>
          <option value="week">過去1週間</option>
        </Select>
      </HStack>
      <Box h="300px" position="relative">
        <Line options={options} data={chartData} />
      </Box>
    </Box>
  );
}
