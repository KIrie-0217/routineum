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
import { getAllPerformancePractices } from '@/services/practiceService';
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

interface PerformanceProgressChartProps {
  performanceId: string;
  title?: string;
}



export default function PerformanceProgressChart({
  performanceId,
  title = 'ルーチンの成功率推移'
}: PerformanceProgressChartProps) {
  const [allPractices, setAllPractices] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('all'); // 'all', 'month', 'week'
  const [isMobile, setIsMobile] = useState(false);
  const supabase = getSupabaseClient();

  const getLatestValue = () => {
    const data = chartData.datasets[0].data[0];
    if (typeof data === 'number') return data;
    if (data && 'y' in data) return data.y;
    return 0;
  };

  // 画面サイズの検出
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初期チェック
    checkIfMobile();
    
    // リサイズイベントのリスナー
    window.addEventListener('resize', checkIfMobile);
    
    // クリーンアップ
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // カラーテーマ
  const lineColor = useColorModeValue('rgb(53, 162, 235)', 'rgb(99, 179, 237)');
  const gridColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');
  const textColor = useColorModeValue('rgba(0, 0, 0, 0.8)', 'rgba(255, 255, 255, 0.8)');

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
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: isMobile ? 6 : 12 // モバイルでは表示数を制限
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          boxWidth: isMobile ? 10 : 40, // モバイルでは凡例を小さく
          font: {
            size: isMobile ? 10 : 12 // モバイルではフォントサイズを小さく
          }
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
        
        const practices = await getAllPerformancePractices(performanceId,supabase);
        
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
  }, [performanceId]);

  // 時間範囲が変更されたときにチャートデータを更新
  useEffect(() => {
    if (allPractices.length > 0) {
      const filteredPractices = filterPracticesByTimeRange(allPractices, timeRange);
      updateChartData(filteredPractices);
    }
  }, [timeRange, allPractices, isMobile]);

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
      format(parseISO(practice.practice_date), isMobile ? 'd日' : 'MM/dd', { locale: ja })
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
          pointRadius: isMobile ? 2 : 4,
          pointHoverRadius: isMobile ? 4 : 6
        },
        {
          label: '移動平均 (3回)',
          data: movingAverages,
          borderColor: 'rgba(255, 99, 132, 0.8)',
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 0,
          borderWidth: isMobile ? 1 : 2
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

  if (isLoading) {
    return (
      <Box 
        h={{ base: "200px", md: "300px" }} 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        width="100%"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        h={{ base: "200px", md: "300px" }} 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        width="100%"
      >
        <Text color="red.500" fontSize={{ base: "sm", md: "md" }}>{error}</Text>
      </Box>
    );
  }

  if (chartData.labels?.length === 0) {
    return (
      <Box width="100%">
        <HStack justifyContent="space-between" mb={4} flexWrap="wrap">
          {title && <Heading size="md" fontSize={{ base: "sm", md: "md" }}>{title}</Heading>}
          <Select 
            value={timeRange} 
            onChange={handleTimeRangeChange} 
            width={{ base: "120px", md: "150px" }} 
            size="sm"
            ml={{ base: "auto", md: 0 }}
          >
            <option value="all">全期間</option>
            <option value="month">過去1ヶ月</option>
            <option value="week">過去1週間</option>
          </Select>
        </HStack>
        <Box 
          h={{ base: "200px", md: "300px" }} 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          width="100%"
        >
          <Text color="gray.500" fontSize={{ base: "sm", md: "md" }}>まだ練習記録がありません</Text>
        </Box>
      </Box>
    );
  }

  if (chartData.labels?.length === 1) {
    return (
      <Box width="100%">
        <HStack justifyContent="space-between" mb={4} flexWrap="wrap">
          {title && <Heading size="md" fontSize={{ base: "sm", md: "md" }}>{title}</Heading>}
          <Select 
            value={timeRange} 
            onChange={handleTimeRangeChange} 
            width={{ base: "120px", md: "150px" }} 
            size="sm"
            ml={{ base: "auto", md: 0 }}
          >
            <option value="all">全期間</option>
            <option value="month">過去1ヶ月</option>
            <option value="week">過去1週間</option>
          </Select>
        </HStack>
        <Box 
          h={{ base: "200px", md: "300px" }} 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          flexDirection="column"
          width="100%"
        >
          <Text color="gray.500" mb={2} fontSize={{ base: "sm", md: "md" }}>グラフを表示するには2つ以上の記録が必要です</Text>
          <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }}>最新の成功率: {getLatestValue()}%</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box width="100%">
      <HStack justifyContent="space-between" mb={4} flexWrap="wrap">
        {title && <Heading size="md" fontSize={{ base: "sm", md: "md" }}>{title}</Heading>}
        <Select 
          value={timeRange} 
          onChange={handleTimeRangeChange} 
          width={{ base: "120px", md: "150px" }} 
          size="sm"
          ml={{ base: "auto", md: 0 }}
        >
          <option value="all">全期間</option>
          <option value="month">過去1ヶ月</option>
          <option value="week">過去1週間</option>
        </Select>
      </HStack>
      <Box 
        h={{ base: "250px", md: "300px" }} 
        position="relative"
        minWidth={{ base: "300px", md: "auto" }}
      >
        <Line options={options} data={chartData} />
      </Box>
    </Box>
  );
}
