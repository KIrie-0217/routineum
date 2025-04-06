'use client';

import { Box, Heading, Text, Spinner, Center } from '@chakra-ui/react';
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
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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

interface PracticeData {
  id: string;
  success_rate: number;
  practice_date: string;
}

interface PracticeSuccessRateChartProps {
  practices: PracticeData[];
  isLoading: boolean;
  title?: string;
  color?: string;
}

export default function PracticeSuccessRateChart({
  practices,
  isLoading,
  title = '成功率の推移',
  color = 'rgb(53, 162, 235)'
}: PracticeSuccessRateChartProps) {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension: number;
    }[];
  }>({
    labels: [],
    datasets: [
      {
        label: '成功率 (%)',
        data: [],
        borderColor: color,
        backgroundColor: color,
        tension: 0.3
      }
    ]
  });

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
          text: '成功率 (%)'
        }
      },
      x: {
        title: {
          display: true,
          text: '練習日'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
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

  // 練習データが変更されたらグラフデータを更新
  useEffect(() => {
    if (practices && practices.length > 0) {
      // 日付でソート（古い順）
      const sortedPractices = [...practices].sort(
        (a, b) => new Date(a.practice_date).getTime() - new Date(b.practice_date).getTime()
      );

      // 日付と成功率のデータを抽出
      const labels = sortedPractices.map(practice => 
        format(new Date(practice.practice_date), 'MM/dd', { locale: ja })
      );
      const successRates = sortedPractices.map(practice => practice.success_rate);

      setChartData({
        labels,
        datasets: [
          {
            label: '成功率 (%)',
            data: successRates,
            borderColor: color,
            backgroundColor: color,
            tension: 0.3
          }
        ]
      });
    }
  }, [practices, color]);

  if (isLoading) {
    return (
      <Box h="300px" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!practices || practices.length === 0) {
    return (
      <Box h="300px" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">まだ練習記録がありません</Text>
      </Box>
    );
  }

  if (practices.length === 1) {
    return (
      <Box h="300px" display="flex" alignItems="center" justifyContent="center" flexDirection="column">
        <Text color="gray.500" mb={2}>グラフを表示するには2つ以上の記録が必要です</Text>
        <Text fontWeight="bold">最新の成功率: {practices[0].success_rate}%</Text>
      </Box>
    );
  }

  return (
    <Box>
      {title && <Heading size="md" mb={4}>{title}</Heading>}
      <Box h="300px" position="relative">
        <Line options={options} data={chartData} />
      </Box>
    </Box>
  );
}
