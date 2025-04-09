import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Flex, useColorModeValue, Spinner, Center } from '@chakra-ui/react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { getAllUserPerformanceContributions } from '@/services/contributionService';
import { useAuth } from '@/contexts/AuthContext';

// 日付ごとの練習記録をまとめた型
type DailyContribution = {
  date: string;
  count: number;
  details: {
    techniques: number;
    performances: number;
  };
};

interface UserContributionHeatmapProps {
  days?: number; // 表示する日数（デフォルトは365日）
  title?: string; // コンポーネントのタイトル
}

const UserContributionHeatmap: React.FC<UserContributionHeatmapProps> = ({
  days = 365,
  title = '練習記録の履歴',
}) => {
  const { user,supabase} = useAuth();
  const [contributions, setContributions] = useState<DailyContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const endDate = new Date();
  const startDate = subDays(endDate, days);
  
  // 色のテーマ設定
  const colors = useColorModeValue(
    ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'], // ライトモード
    ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']  // ダークモード
  );

  useEffect(() => {
    async function loadContributions() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await getAllUserPerformanceContributions(user.id, days,supabase);
        
        // 全ての練習記録を統合
        const allPractices = [
          ...data.techniquePractices.map(p => ({ ...p, type: 'technique' as const })),
          ...data.performancePractices.map(p => ({ ...p, type: 'performance' as const }))
        ];

        // 日付ごとにグループ化
        const practicesByDate = allPractices.reduce<Record<string, { techniques: number; performances: number }>>(
          (acc, practice) => {
            const dateStr = format(parseISO(practice.practice_date), 'yyyy-MM-dd');
            
            if (!acc[dateStr]) {
              acc[dateStr] = { techniques: 0, performances: 0 };
            }
            
            if (practice.type === 'technique') {
              acc[dateStr].techniques += 1;
            } else {
              acc[dateStr].performances += 1;
            }
            
            return acc;
          },
          {}
        );

        // 表示用のデータ形式に変換
        const contributionData: DailyContribution[] = Object.entries(practicesByDate).map(([date, details]) => ({
          date,
          // シークエンスの練習は1ポイント、ルーチンの練習は5ポイントとしてカウント
          count: details.techniques * 1 + details.performances * 5,
          details
        }));

        setContributions(contributionData);
      } catch (error) {
        console.error('Failed to load contribution data:', error);
        setError('練習記録の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    }

    loadContributions();
  }, [user, days]);

  // ツールチップの内容
  const getTooltipContent = (value: DailyContribution | null) => {
    if (!value) return '記録なし';
    
    const date = format(parseISO(value.date), 'yyyy年MM月dd日', { locale: ja });
    const { techniques, performances } = value.details;
    
    return (
      `${date}: 合計 ${value.count} ポイント\n` +
      `シークエンスの練習: ${techniques}回 (${techniques * 1}ポイント)\n` +
      `ルーチンの練習: ${performances}回 (${performances * 5}ポイント)`
    );
  };

  if (isLoading) {
    return (
      <Center py={8}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center py={8}>
        <Text color="red.500">{error}</Text>
      </Center>
    );
  }

  return (
    <VStack spacing={4} align="stretch" w="100%">

      <Text fontSize="lg" fontWeight="bold">{title}</Text>
      
      <HStack spacing={2} justify="center" pt={2}>
        <Text fontSize="sm">少ない</Text>
        {colors.map((color, i) => (
          <Box 
            key={i} 
            w="12px" 
            h="12px" 
            bg={color} 
            borderRadius="sm"
          />
        ))}
        <Text fontSize="sm">多い</Text>
      </HStack>

      <Flex justify="space-between" fontSize="sm" color="gray.500">
        <Text>{format(startDate, 'yyyy年MM月', { locale: ja })}</Text>
        <Text>{format(endDate, 'yyyy年MM月', { locale: ja })}</Text>
      </Flex>


      
      {contributions.length === 0 ? (
        <Center py={8}>
          <Text color="gray.500">練習記録がありません</Text>
        </Center>
      ) : (
        <Box className="calendar-heatmap-container" pb={4}>
          <Box maxW="100%" >
            <CalendarHeatmap
              startDate={startDate}
              endDate={endDate}
              values={contributions}
              classForValue={(value) => {
                if (!value || value.count === 0) return 'color-empty';
                return `color-scale-${Math.min(4, Math.floor(value.count / 3))}`;
              }}
              tooltipDataAttrs={(value: any) => {
                if (!value || !value.date) return {};
                return {
                  'string': getTooltipContent(value),
                };
              }}
              showWeekdayLabels={true}
              titleForValue={(value) => {
                if (!value || !value.date) return "";
                const contributionValue : DailyContribution = {
                  date: value.date,
                  count: value.count || 0,
                  details: {
                    techniques: value.details?.techniques || 0,
                    performances: value.details?.performances || 0,
                  } 
                }
                return value ? getTooltipContent(contributionValue) : '記録なし'
              }}
              gutterSize={1}
            />
          </Box>
        </Box>
      )}

      

      <style jsx global>{`
        .react-calendar-heatmap .color-empty { fill: ${colors[0]}; }
        .react-calendar-heatmap .color-scale-0 { fill: ${colors[1]}; }
        .react-calendar-heatmap .color-scale-1 { fill: ${colors[2]}; }
        .react-calendar-heatmap .color-scale-2 { fill: ${colors[3]}; }
        .react-calendar-heatmap .color-scale-3 { fill: ${colors[4]}; }
        .react-calendar-heatmap .color-scale-4 { fill: ${colors[4]}; }
        .react-calendar-heatmap text {
          font-size: 6px;
        }
        .react-calendar-heatmap rect {
          rx: 1;
        }
      `}</style>
    </VStack>
  );
};

export default UserContributionHeatmap;
