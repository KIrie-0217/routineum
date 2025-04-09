import React, { useEffect, useState } from 'react';
import { Box, Text, Tooltip, VStack, HStack, Flex, useColorModeValue } from '@chakra-ui/react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

// 練習記録の型定義
type PracticeRecord = {
  id: string;
  practice_date: string;
  type: 'technique' | 'performance'; // シークエンスの練習かルーチンの練習か
};

// 日付ごとの練習記録をまとめた型
type DailyContribution = {
  date: string;
  count: number;
  details: {
    techniques: number;
    performances: number;
  };
};

interface PracticeContributionGraphProps {
  techniquePractices: { id: string; practice_date: string }[];
  performancePractices: { id: string; practice_date: string }[];
  startDate?: Date; // 表示開始日（デフォルトは1年前）
  endDate?: Date; // 表示終了日（デフォルトは今日）
}

const PracticeContributionGraph: React.FC<PracticeContributionGraphProps> = ({
  techniquePractices,
  performancePractices,
  startDate,
  endDate = new Date(),
}) => {
  const [contributions, setContributions] = useState<DailyContribution[]>([]);
  const defaultStartDate = startDate || subDays(endDate, 365); // デフォルトは1年前から
  
  // 色のテーマ設定
  const colors = useColorModeValue(
    ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'], // ライトモード
    ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']  // ダークモード
  );

  useEffect(() => {
    // 全ての練習記録を統合
    const allPractices: PracticeRecord[] = [
      ...techniquePractices.map(p => ({ ...p, type: 'technique' as const })),
      ...performancePractices.map(p => ({ ...p, type: 'performance' as const }))
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
  }, [techniquePractices, performancePractices]);

  // カラースケールの決定
  const getColorScale = (count: number) => {
    if (count === 0) return colors[0];
    if (count <= 2) return colors[1];
    if (count <= 5) return colors[2];
    if (count <= 10) return colors[3];
    return colors[4];
  };

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

  // 日付の範囲を計算
  const numDays = differenceInDays(endDate, defaultStartDate) + 1;

  return (
    <VStack align="stretch" w="50%"> 
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
        <Text>{format(defaultStartDate, 'yyyy年MM月', { locale: ja })}</Text>
        <Text>{format(endDate, 'yyyy年MM月', { locale: ja })}</Text>
      </Flex>
      
      <Box className="calendar-heatmap-container" >
          <Box maxW="100%" >
          <CalendarHeatmap
            startDate={defaultStartDate}
            endDate={endDate}
            values={contributions}
            classForValue={(value) => {
              if (!value || value.count === 0) return 'color-empty';
              return `color-scale-${Math.min(4, Math.floor(value.count / 3))}`;
            }}
            tooltipDataAttrs={(value: any) => {
              if (!value || !value.date) return {};
              return {
                'data-tip': getTooltipContent(value),
              };
            }}
            showWeekdayLabels={true}
            titleForValue={(value) => value ? getTooltipContent(value) : '記録なし'}
            gutterSize={1}
          />
        </Box>
      </Box>

      

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

export default PracticeContributionGraph;
