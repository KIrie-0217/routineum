'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, Heading, Text, Spinner, Center, useColorModeValue, Select, Switch, FormControl, FormLabel, HStack } from '@chakra-ui/react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { format, parseISO, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';

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

interface TechniquesComparisonChartProps {
  performanceId: string;
}

interface TechniquePractice {
  id: string;
  technique_id: string;
  practice_date: string;
  success_rate: number;
}

interface TechniqueWithPractices {
  id: string;
  name: string;
  practices: TechniquePractice[];
}

interface DailyAverageData {
  date: string;
  formattedDate: string;
  techniqueAverages: {
    [techniqueId: string]: {
      sum: number;
      count: number;
      average: number;
    }
  }
}

export default function TechniquesComparisonChart({ performanceId }: TechniquesComparisonChartProps) {
  const [techniquesWithPractices, setTechniquesWithPractices] = useState<TechniqueWithPractices[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('all'); // 'all', 'month', 'week'
  const [useAverages, setUseAverages] = useState<boolean>(true); // 日毎の平均値を使用するかどうか 
  const supabase = getSupabaseClient();

  const textColor = useColorModeValue('rgba(0, 0, 0, 0.8)', 'rgba(255, 255, 255, 0.8)');
  const gridColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');

  useEffect(() => {
    async function fetchTechniquesData() {
      try {
        setIsLoading(true);
        setError(null);

        // ルーチンに含まれる全てのシークエンスを取得
        const { data: techniques, error: techniquesError } = await supabase
          .from('techniques')
          .select('id, name')
          .eq('performance_id', performanceId)
          .order('created_at', { ascending: true });

        if (techniquesError) throw techniquesError;
        if (!techniques || techniques.length === 0) {
          setTechniquesWithPractices([]);
          setIsLoading(false);
          return;
        }

        // 各シークエンスの練習データを取得
        const techniquesWithPracticesData = await Promise.all(
          techniques.map(async (technique) => {
            const { data: practices, error: practicesError } = await supabase
              .from('technique_practices')
              .select('id, technique_id, practice_date, success_rate')
              .eq('technique_id', technique.id)
              .order('practice_date', { ascending: true });

            if (practicesError) throw practicesError;

            return {
              id: technique.id,
              name: technique.name,
              practices: practices || []
            };
          })
        );

        setTechniquesWithPractices(techniquesWithPracticesData);
      } catch (err) {
        console.error('シークエンスの練習データの取得に失敗しました:', err);
        setError('データの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    }

    if (performanceId) {
      fetchTechniquesData();
    }
  }, [performanceId]);

  // 時間範囲に基づいてデータをフィルタリング
  const getFilteredData = () => {
    if (timeRange === 'all') {
      return techniquesWithPractices;
    }

    const now = new Date();
    const cutoffDate = new Date();
    
    if (timeRange === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    }

    return techniquesWithPractices.map(technique => ({
      ...technique,
      practices: technique.practices.filter(practice => 
        new Date(practice.practice_date) >= cutoffDate
      )
    }));
  };

  // 全ての練習日を取得して重複を排除し、ソート
  const getAllPracticeDates = () => {
    const filteredData = getFilteredData();
    const allDates = new Set<string>();
    
    filteredData.forEach(technique => {
      technique.practices.forEach(practice => {
        allDates.add(format(parseISO(practice.practice_date), 'yyyy-MM-dd'));
      });
    });
    
    return Array.from(allDates).sort();
  };

  // 日毎の平均値を計算
  const calculateDailyAverages = () => {
    const filteredData = getFilteredData();
    const allDates = getAllPracticeDates();
    const dailyAverages: DailyAverageData[] = [];

    allDates.forEach(dateStr => {
      const date = parseISO(dateStr);
      const formattedDate = format(date, 'MM/dd', { locale: ja });
      const techniqueAverages: { [key: string]: { sum: number; count: number; average: number } } = {};

      // 各シークエンスの当日の練習データを集計
      filteredData.forEach(technique => {
        const dailyPractices = technique.practices.filter(practice => 
          isSameDay(parseISO(practice.practice_date), date)
        );

        if (dailyPractices.length > 0) {
          const sum = dailyPractices.reduce((acc, practice) => acc + practice.success_rate, 0);
          const count = dailyPractices.length;
          const average = Math.round(sum / count);

          techniqueAverages[technique.id] = {
            sum,
            count,
            average
          };
        }
      });

      dailyAverages.push({
        date: dateStr,
        formattedDate,
        techniqueAverages
      });
    });

    return dailyAverages;
  };

  // 日付ごとの成功率データを作成（全ての記録または日毎の平均）
  const createChartData = () => {
    const filteredData = getFilteredData();
    
    if (useAverages) {
      // 日毎の平均値を使用
      const dailyAverages = calculateDailyAverages();
      const labels = dailyAverages.map(day => day.formattedDate);
      
      // 各シークエンスのデータセットを作成
      const datasets = filteredData.map((technique, index) => {
        // 色の配列
        const colors = [
          'rgba(66, 153, 225, 1)',  // blue
          'rgba(72, 187, 120, 1)',  // green
          'rgba(237, 137, 54, 1)',  // orange
          'rgba(159, 122, 234, 1)', // purple
          'rgba(237, 100, 166, 1)', // pink
          'rgba(49, 151, 149, 1)',  // teal
          'rgba(113, 128, 150, 1)'  // gray
        ];
        
        // 日付ごとの平均成功率データを作成
        const data = dailyAverages.map(day => {
          const techniqueAverage = day.techniqueAverages[technique.id];
          return techniqueAverage ? techniqueAverage.average : null;
        });
        
        return {
          label: technique.name.length > 10 ? technique.name.substring(0, 10) + '...' : technique.name,
          data,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length].replace('1)', '0.2)'),
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: true // nullの値をスキップして線を繋げる
        };
      });
      
      return { labels, datasets };
    } else {
      // 全ての記録を個別に表示（元の実装）
      const allDates = getAllPracticeDates();
      
      // 日付のラベルを作成（MM/dd形式）
      const labels = allDates.map(date => 
        format(parseISO(date), 'MM/dd', { locale: ja })
      );
      
      // 各シークエンスのデータセットを作成
      const datasets = filteredData.map((technique, index) => {
        // 色の配列
        const colors = [
          'rgba(66, 153, 225, 1)',  // blue
          'rgba(72, 187, 120, 1)',  // green
          'rgba(237, 137, 54, 1)',  // orange
          'rgba(159, 122, 234, 1)', // purple
          'rgba(237, 100, 166, 1)', // pink
          'rgba(49, 151, 149, 1)',  // teal
          'rgba(113, 128, 150, 1)'  // gray
        ];
        
        // 日付ごとの成功率データを作成
        const data = allDates.map(date => {
          const practice = technique.practices.find(p => 
            format(parseISO(p.practice_date), 'yyyy-MM-dd') === date
          );
          return practice ? practice.success_rate : null;
        });
        
        return {
          label: technique.name.length > 10 ? technique.name.substring(0, 10) + '...' : technique.name,
          data,
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length].replace('1)', '0.2)'),
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: true // nullの値をスキップして線を繋げる
        };
      });
      
      return { labels, datasets };
    }
  };

  const chartData = createChartData();

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
          color: textColor,
          font: {
            size: 10
          }
        },
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor,
          font: {
            size: 9
          },
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        title: {
          display: true,
          text: '練習日',
          color: textColor,
          font: {
            size: 10
          }
        },
        grid: {
          color: gridColor
        },
        ticks: {
          color: textColor,
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 9
          },
          autoSkip: true,
          maxTicksLimit: 15
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          boxWidth: 10,
          padding: 6,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          },
          afterLabel: function(context) {
            if (useAverages) {
              const techniqueId = getFilteredData()[context.datasetIndex].id;
              const dateStr = getAllPracticeDates()[context.dataIndex];
              const dailyAverages = calculateDailyAverages();
              const dayData = dailyAverages.find(day => day.date === dateStr);
              
              if (dayData && dayData.techniqueAverages[techniqueId]) {
                const { count } = dayData.techniqueAverages[techniqueId];
                return `${count}回の練習の平均`;
              }
            }
            return '';
          }
        }
      }
    }
  };

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeRange(e.target.value);
  };

  const handleAverageToggle = () => {
    setUseAverages(!useAverages);
  };

  if (isLoading) {
    return (
      <Box h={{ base: "200px", md: "300px" }} display="flex" alignItems="center" justifyContent="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box h={{ base: "200px", md: "300px" }} display="flex" alignItems="center" justifyContent="center">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  if (techniquesWithPractices.length === 0) {
    return (
      <Box h={{ base: "200px", md: "300px" }} display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">シークエンスの練習データがありません</Text>
      </Box>
    );
  }

  // 練習データがない場合
  const hasPracticeData = techniquesWithPractices.some(t => t.practices.length > 0);
  if (!hasPracticeData) {
    return (
      <Box h={{ base: "200px", md: "300px" }} display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">まだ練習記録がありません</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" flexDirection={{ base: "column", md: "row" }} justifyContent="space-between" alignItems={{ base: "start", md: "center" }} mb={4} gap={2}>
        <Heading size="md" mb={{ base: 2, md: 0 }}>シークエンスの成功率推移</Heading>
        <HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap">
          <FormControl display="flex" alignItems="center" width="auto" minW="120px">
            <FormLabel htmlFor="average-toggle" mb="0" fontSize="sm" mr={2}>
              日毎の平均
            </FormLabel>
            <Switch 
              id="average-toggle" 
              isChecked={useAverages} 
              onChange={handleAverageToggle}
              colorScheme="blue"
            />
          </FormControl>
          <Select 
            value={timeRange} 
            onChange={handleTimeRangeChange} 
            width={{ base: "120px", md: "150px" }} 
            size="sm"
          >
            <option value="all">全期間</option>
            <option value="month">過去1ヶ月</option>
            <option value="week">過去1週間</option>
          </Select>
        </HStack>
      </Box>
      <Box h="300px" position="relative">
        <Line data={chartData} options={options} />
      </Box>
      <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
        {useAverages 
          ? '各シークエンスの日毎の平均成功率を表示しています' 
          : '各シークエンスの成功率の時系列推移を表示しています'}
      </Text>
    </Box>
  );
}
