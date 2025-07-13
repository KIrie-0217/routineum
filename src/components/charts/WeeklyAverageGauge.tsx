'use client';

import { Box, Heading, Text, Spinner, Center, useColorModeValue } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { subDays, parseISO } from 'date-fns';

// Chart.jsの必要なコンポーネントを登録
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface WeeklyAverageGaugeProps {
  title?: string;
  fetchPractices: () => Promise<{ success_rate: number; practice_date: string; unit?: string }[]>;
  colorScheme?: 'blue' | 'green' | 'orange' | 'purple';
  unit?: string; // 単位（percent または streak）
}

export default function WeeklyAverageGauge({
  title = '直近1週間の平均成功率',
  fetchPractices,
  colorScheme = 'blue',
  unit = 'percent' // デフォルトはpercent
}: WeeklyAverageGaugeProps) {
  const [average, setAverage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practiceCount, setPracticeCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

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
  const getColorScheme = () => {
    switch (colorScheme) {
      case 'green':
        return {
          main: useColorModeValue('rgba(72, 187, 120, 0.8)', 'rgba(72, 187, 120, 0.6)'),
          background: useColorModeValue('rgba(72, 187, 120, 0.2)', 'rgba(72, 187, 120, 0.1)')
        };
      case 'orange':
        return {
          main: useColorModeValue('rgba(237, 137, 54, 0.8)', 'rgba(237, 137, 54, 0.6)'),
          background: useColorModeValue('rgba(237, 137, 54, 0.2)', 'rgba(237, 137, 54, 0.1)')
        };
      case 'purple':
        return {
          main: useColorModeValue('rgba(159, 122, 234, 0.8)', 'rgba(159, 122, 234, 0.6)'),
          background: useColorModeValue('rgba(159, 122, 234, 0.2)', 'rgba(159, 122, 234, 0.1)')
        };
      case 'blue':
      default:
        return {
          main: useColorModeValue('rgba(66, 153, 225, 0.8)', 'rgba(66, 153, 225, 0.6)'),
          background: useColorModeValue('rgba(66, 153, 225, 0.2)', 'rgba(66, 153, 225, 0.1)')
        };
    }
  };

  const colors = getColorScheme();
  const textColor = useColorModeValue('gray.800', 'gray.100');

  useEffect(() => {
    async function calculateWeeklyAverage() {
      try {
        setIsLoading(true);
        setError(null);
        
        // 練習記録を取得
        const practices = await fetchPractices();
        
        if (!practices || practices.length === 0) {
          setAverage(null);
          setPracticeCount(0);
          setIsLoading(false);
          return;
        }
        
        // 1週間前の日付を計算
        const oneWeekAgo = subDays(new Date(), 7);
        
        // 直近1週間の練習記録をフィルタリング
        const recentPractices = practices.filter(practice => {
          const practiceDate = parseISO(practice.practice_date);
          return practiceDate >= oneWeekAgo;
        });
        
        if (recentPractices.length === 0) {
          setAverage(null);
          setPracticeCount(0);
          setIsLoading(false);
          return;
        }
        
        // 平均成功率を計算
        const sum = recentPractices.reduce((acc, practice) => acc + practice.success_rate, 0);
        
        // unit が streak の場合は、最大値を計算する
        let avg;
        if (unit === 'streak') {
          // 連続成功回数の場合は、最大値を表示
          avg = Math.max(...recentPractices.map(practice => practice.success_rate));
        } else {
          // 成功率の場合は、平均値を計算
          avg = Math.round(sum / recentPractices.length);
        }
        
        setAverage(avg);
        setPracticeCount(recentPractices.length);
      } catch (err) {
        console.error('週間平均の計算に失敗しました:', err);
        setError('データの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    }

    calculateWeeklyAverage();
  }, [fetchPractices, unit]);

  // 半円形ゲージのデータ
  const getChartData = (): ChartData<'doughnut'> => {
    if (average === null) {
      return {
        labels: ['データなし'],
        datasets: [
          {
            data: [1],
            backgroundColor: [useColorModeValue('rgba(160, 174, 192, 0.2)', 'rgba(160, 174, 192, 0.1)')],
            borderColor: [useColorModeValue('rgba(160, 174, 192, 0.5)', 'rgba(160, 174, 192, 0.3)')],
            borderWidth: 1,
          }
        ]
      };
    }
    
    // unit が streak の場合は、最大値を調整する
    const maxValue = unit === 'percent' ? 100 : Math.max(20, average * 1.5);
    const remainingValue = unit === 'percent' ? 100 - average : maxValue - average;
    
    return {
      labels: [unit === 'percent' ? '成功率' : '連続成功回数', '残り'],
      datasets: [
        {
          data: [average, remainingValue],
          backgroundColor: [colors.main, colors.background],
          borderColor: [colors.main, 'transparent'],
          borderWidth: 1,
        }
      ]
    };
  };

  // 半円形ゲージのオプション
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    circumference: 180,
    rotation: -90,
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };

  if (isLoading) {
    return (
      <Box 
        h={{ base: "140px", md: "160px" }} 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        width="100%"
      >
        <Spinner size="md" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        h={{ base: "140px", md: "160px" }} 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        width="100%"
      >
        <Text color="red.500" fontSize={{ base: "xs", md: "sm" }}>{error}</Text>
      </Box>
    );
  }

  return (
    <Box 
      textAlign="center" 
      position="relative" 
      h={{ base: "140px", md: "160px" }}
      width="100%"
    >
      <Heading size="sm" mb={2} fontSize={{ base: "xs", md: "sm" }}>{title}</Heading>
      
      <Box h={{ base: "100px", md: "120px" }} position="relative">
        <Doughnut data={getChartData()} options={options} />
        
        <Center
          position="absolute"
          top="60%"
          left="50%"
          transform="translate(-50%, -50%)"
          flexDirection="column"
        >
          {average !== null ? (
            <>
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color={textColor}>
                {average}{unit === 'percent' ? '%' : '回'}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {practiceCount}回の練習
              </Text>
            </>
          ) : (
            <Text fontSize="sm" color="gray.500">
              データなし
            </Text>
          )}
        </Center>
      </Box>
    </Box>
  );
}
