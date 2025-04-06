'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Switch,
  FormHelperText,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { NewPerformance, Performance, UpdatePerformance } from '@/types/models/performance';
import { formatDate } from '@/utils/dateUtils';

// Zodスキーマの定義
const performanceSchema = z.object({
  name: z.string().min(1, 'ルーチン名は必須です'),
  performance_date: z.string().min(1, '公演日は必須です'),
  music_link: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_completed: z.boolean().default(false),
  result_percentage: z.union([
    z.number().min(0).max(100),
    z.null()
  ]).nullable().optional(),
  ranking: z.union([
    z.number().min(1),
    z.null()
  ]).nullable().optional(),
});

type PerformanceFormData = z.infer<typeof performanceSchema>;

interface PerformanceFormProps {
  initialData?: Performance;
  onSubmit: (data: NewPerformance | UpdatePerformance) => Promise<void>;
  isSubmitting: boolean;
}

export default function PerformanceForm({ initialData, onSubmit, isSubmitting }: PerformanceFormProps) {
  const [showResults, setShowResults] = useState(initialData?.is_completed || false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PerformanceFormData>({
    resolver: zodResolver(performanceSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          performance_date: formatDate(initialData.performance_date),
        }
      : {
          name: '',
          performance_date: formatDate(new Date().toISOString()),
          music_link: null,
          notes: null,
          is_completed: false,
          result_percentage: null,
          ranking: null,
        },
  });

  const isCompleted = watch('is_completed');

  const handleFormSubmit = async (data: PerformanceFormData) => {
    try {
      console.log('Form data before submission:', data);
      
      // 完了していない場合は結果をnullに設定
      const submissionData = {
        ...data,
        result_percentage: data.is_completed ? data.result_percentage : null,
        ranking: data.is_completed ? data.ranking : null,
      };
      
      console.log('Processed form data for submission:', submissionData);
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error in form submission:', error);
      throw error;
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(handleFormSubmit)} w="100%">
      <VStack spacing={4} align="start">
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel htmlFor="name">ルーチン名</FormLabel>
          <Input id="name" {...register('name')} />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.performance_date} isRequired>
          <FormLabel htmlFor="performance_date">公演日</FormLabel>
          <Input id="performance_date" type="date" {...register('performance_date')} />
          <FormErrorMessage>{errors.performance_date?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="music_link">楽曲リンク（オプション）</FormLabel>
          <Input id="music_link" {...register('music_link')} placeholder="YouTubeやSpotifyのURL" />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="notes">メモ（オプション）</FormLabel>
          <Textarea id="notes" {...register('notes')} placeholder="ルーチンに関するメモ" />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="is_completed" mb="0">
            ルーチンは完了しましたか？
          </FormLabel>
          <Switch
            id="is_completed"
            {...register('is_completed')}
            isChecked={isCompleted}
            onChange={(e) => {
              // フォームの値を直接更新
              const newValue = e.target.checked;
              const event = {
                target: {
                  name: 'is_completed',
                  value: newValue
                }
              };
              register('is_completed').onChange(event);
              setShowResults(newValue);
            }}
          />
        </FormControl>

        {isCompleted && (
          <>
            <FormControl isInvalid={!!errors.result_percentage}>
              <FormLabel htmlFor="result_percentage">本番成功率（%）: {watch('result_percentage') || 0}%</FormLabel>
              <input
                id="result_percentage"
                type="range"
                min="0"
                max="100"
                step="5"
                style={{ width: '100%' }}
                {...register('result_percentage', { 
                  valueAsNumber: true,
                  setValueAs: v => v === '' ? null : Number(v)
                })}
              />
              <FormHelperText>0〜100の値を5%刻みで選択してください</FormHelperText>
              <FormErrorMessage>{errors.result_percentage?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.ranking}>
              <FormLabel htmlFor="ranking">順位（オプション）</FormLabel>
              <Input 
                id="ranking" 
                type="number" 
                min="1" 
                {...register('ranking', { 
                  valueAsNumber: true,
                  setValueAs: v => v === '' ? null : Number(v)
                })} 
              />
              <FormErrorMessage>{errors.ranking?.message}</FormErrorMessage>
            </FormControl>
          </>
        )}

        <HStack spacing={4} w="100%" justify="flex-end">
          <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
            {initialData ? '更新' : '作成'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
