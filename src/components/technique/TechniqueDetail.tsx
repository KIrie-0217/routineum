'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Center,
  useToast,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider
} from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Technique } from '@/types/models/technique';
import { getTechniqueById } from '@/services/techniqueService';
import { getTechniquePractices, getLatestSuccessRate } from '@/services/techniquePracticeService';
import TechniquePracticeList from './TechniquePracticeList';
import { formatDate } from '@/utils/dateUtils';
import { useAuth } from '@/contexts/AuthContext';

// Chart.jsの設定
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TechniqueDetailProps {
  techniqueId: string;
}

export default function TechniqueDetail({ techniqueId }: TechniqueDetailProps) {
  const [technique, setTechnique] = useState<Technique | null>(null);
  const [latestRate, setLatestRate] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const supabase = useAuth().supabase;

  useEffect(() => {
    loadTechniqueData();
  }, [techniqueId]);

  const loadTechniqueData = async () => {
    try {
      setIsLoading(true);
      
      // シークエンスの基本情報を取得
      const techniqueData = await getTechniqueById(techniqueId,supabase);
      setTechnique(techniqueData);
      
      // 最新の成功率を取得
      const latestSuccessRate = await getLatestSuccessRate(techniqueId,supabase);
      setLatestRate(latestSuccessRate);
      
      // 練習記録の履歴を取得してグラフデータを作成
      const practices = await getTechniquePractices(techniqueId,supabase);
      
      if (practices.length > 0) {
        // 日付順に並べ替え
        const sortedPractices = [...practices].sort(
          (a, b) => new Date(a.practice_date).getTime() - new Date(b.practice_date).getTime()
        );
        
        // グラフデータの作成
        const labels = sortedPractices.map(p => formatDate(p.practice_date));
        const data = sortedPractices.map(p => p.success_rate);
        
        const isPercentUnit = techniqueData.unit === 'percent';
        
        setChartData({
          labels,
          datasets: [
            {
              label: isPercentUnit ? '成功率 (%)' : '連続成功回数',
              data,
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              tension: 0.3
            }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to load technique data:', error);
      toast({
        title: 'シークエンスの情報の読み込みに失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!technique) {
    return (
      <Box p={4}>
        <Text>シークエンスが見つかりませんでした。</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>{technique.name}</Heading>
      
      {technique.notes && (
        <Text mb={4}>{technique.notes}</Text>
      )}
      
      <Card mb={6}>
        <CardBody>
          <Stat>
            <StatLabel>{technique.unit === 'percent' ? '最新の成功率' : '最新の連続成功回数'}</StatLabel>
            <StatNumber>
              {latestRate !== null 
                ? technique.unit === 'percent' 
                  ? `${latestRate}%` 
                  : `${latestRate}回`
                : '記録なし'}
            </StatNumber>
            <StatHelpText>最後の練習記録から</StatHelpText>
          </Stat>
        </CardBody>
      </Card>
      
      <Divider my={6} />
      
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>{technique.unit === 'percent' ? '成功率の推移' : '連続成功回数の推移'}</Tab>
          <Tab>練習記録</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            {chartData ? (
              <Box h="300px">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        min: 0,
                        max: technique?.unit === 'percent' ? 100 : undefined,
                        title: {
                          display: true,
                          text: technique?.unit === 'percent' ? '成功率 (%)' : '連続成功回数'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: technique?.unit === 'percent' ? '成功率の推移' : '連続成功回数の推移'
                      }
                    }
                  }}
                />
              </Box>
            ) : (
              <Text>練習記録がありません。</Text>
            )}
          </TabPanel>
          
          <TabPanel>
            <TechniquePracticeList
              techniqueId={techniqueId}
              techniqueName={technique.name}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
