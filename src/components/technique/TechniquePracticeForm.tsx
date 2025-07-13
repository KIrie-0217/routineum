'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  VStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Tooltip,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  HStack
} from '@chakra-ui/react';
import { Technique } from '@/types/models/technique';
import { getTechniqueById } from '@/services/techniqueService';
import { useAuth } from '@/contexts/AuthContext';
import { createTechniquePractice as createTechniquePracticeService } from '@/services/techniquePracticeService';

import { dateToLocalISOString } from '@/utils/dateUtils';

// バリデーションスキーマ
const practiceSchema = z.object({
  technique_id: z.string().min(1, 'テクニックIDは必須です'),
  success_rate: z.number().min(0).max(100),
  notes: z.string().optional(),
  practice_date: z.string().min(1, '練習日は必須です'),
});

type PracticeFormData = z.infer<typeof practiceSchema>;

// 練習記録の型定義
export type NewTechniquePractice = {
  technique_id: string;
  success_rate: number;
  practice_date: string;
  notes?: string | null;
};

interface TechniquePracticeFormProps {
  techniqueId: string;
  techniqueName?: string;
  onSuccess?: () => void;
  onSubmit?: (data: NewTechniquePractice) => Promise<void>;
  onCancel: () => void;
}

export default function TechniquePracticeForm({
  techniqueId,
  techniqueName,
  onSuccess,
  onSubmit: propOnSubmit,
  onCancel
}: TechniquePracticeFormProps) {
  const [sliderValue, setSliderValue] = useState(50);
  const [streakValue, setStreakValue] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technique, setTechnique] = useState<Technique | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const { supabase } = useAuth();

  const roundToStep = (value: number, step: number) => {
    return Math.round(value / step) * step;
  };

  useEffect(() => {
    const loadTechnique = async () => {
      try {
        const techniqueData = await getTechniqueById(techniqueId, supabase);
        setTechnique(techniqueData);
      } catch (error) {
        console.error('Error loading technique:', error);
        toast({
          title: 'テクニックの読み込みに失敗しました',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTechnique();
  }, [techniqueId, supabase, toast]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PracticeFormData>({
    resolver: zodResolver(practiceSchema),
    defaultValues: {
      technique_id: techniqueId,
      success_rate: 50,
      practice_date: dateToLocalISOString(new Date()), // ローカルタイムゾーンでのISO文字列
      notes: ''
    }
  });

  // スライダーの値が変更されたときの処理
  const handleSliderChange = (value: number) => {
    const roundedValue = roundToStep(value, 5);
    setSliderValue(roundedValue);
  };

  // 連続成功回数の値が変更されたときの処理
  const handleStreakChange = (valueAsString: string, valueAsNumber: number) => {
    setStreakValue(valueAsNumber);
  };

  const onSubmit = async (data: PracticeFormData) => {
    try {
      setIsSubmitting(true);
      const practiceData: NewTechniquePractice = {
        technique_id: techniqueId,
        success_rate: technique?.unit === 'percent' ? sliderValue : streakValue,
        notes: data.notes || null,
        practice_date: data.practice_date
      };

      if (propOnSubmit) {
        // 親コンポーネントから渡されたonSubmitを使用
        await propOnSubmit(practiceData);
      } else {
        // デフォルトの処理を実行
        await createTechniquePracticeService(practiceData, supabase);
        if (onSuccess) onSuccess();
      }

      toast({
        title: '練習記録を保存しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      reset();
    } catch (error) {
      console.error('Error submitting practice:', error);
      toast({
        title: '保存に失敗しました',
        description: error instanceof Error ? error.message : '予期せぬエラーが発生しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Box>読み込み中...</Box>;
  }

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} width="100%">
      <VStack spacing={4} align="stretch">
        {techniqueName && (
          <Text fontWeight="bold">{techniqueName}の練習記録</Text>
        )}

        {technique?.unit === 'percent' ? (
          <FormControl isInvalid={!!errors.success_rate} isRequired>
            <FormLabel>成功率 (%)</FormLabel>
            <Controller
              name="success_rate"
              control={control}
              render={({ field }) => (
                <Box pt={6} pb={2}>
                  <Slider
                    aria-label="success-rate-slider"
                    value={sliderValue}
                    onChange={(val) => {
                      handleSliderChange(val);
                      field.onChange(roundToStep(val, 5));
                    }}
                    min={0}
                    max={100}
                    step={5}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <SliderMark value={0} mt={2} ml={-2.5} fontSize="sm">
                      0%
                    </SliderMark>
                    <SliderMark value={25} mt={2} ml={-2.5} fontSize="sm">
                      25%
                    </SliderMark>
                    <SliderMark value={50} mt={2} ml={-2.5} fontSize="sm">
                      50%
                    </SliderMark>
                    <SliderMark value={75} mt={2} ml={-2.5} fontSize="sm">
                      75%
                    </SliderMark>
                    <SliderMark value={100} mt={2} ml={-2.5} fontSize="sm">
                      100%
                    </SliderMark>
                    <Tooltip
                      hasArrow
                      bg="blue.500"
                      color="white"
                      placement="top"
                      isOpen={showTooltip}
                      label={`${sliderValue}%`}
                    >
                      <SliderThumb />
                    </Tooltip>
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                  </Slider>
                </Box>
              )}
            />
            <FormErrorMessage>
              {errors.success_rate && errors.success_rate.message}
            </FormErrorMessage>
          </FormControl>
        ) : (
          <FormControl isInvalid={!!errors.success_rate} isRequired>
            <FormLabel>連続成功回数</FormLabel>
            <Controller
              name="success_rate"
              control={control}
              render={({ field }) => (
                <NumberInput 
                  min={0} 
                  value={streakValue} 
                  onChange={(valueAsString, valueAsNumber) => {
                    handleStreakChange(valueAsString, valueAsNumber);
                    field.onChange(valueAsNumber);
                  }}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              )}
            />
            <FormErrorMessage>
              {errors.success_rate && errors.success_rate.message}
            </FormErrorMessage>
          </FormControl>
        )}

        <FormControl isInvalid={!!errors.practice_date} isRequired>
          <FormLabel>練習日時</FormLabel>
          <Controller
            name="practice_date"
            control={control}
            render={({ field }) => (
              <Box className="date-picker-container" width="100%">
                <DatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date: Date | null) => {
                    field.onChange(date ? dateToLocalISOString(date) : '');
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy/MM/dd HH:mm"
                  customInput={<Input />}
                  className="chakra-input"
                />
              </Box>
            )}
          />
          <FormErrorMessage>
            {errors.practice_date && errors.practice_date.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.notes}>
          <FormLabel>メモ</FormLabel>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="練習の詳細や気づいたことをメモしましょう"
                resize="vertical"
              />
            )}
          />
          <FormErrorMessage>
            {errors.notes && errors.notes.message}
          </FormErrorMessage>
        </FormControl>

        <HStack justifyContent="flex-end" mt={4}>
          <Button
            variant="outline"
            onClick={onCancel}
            isDisabled={isSubmitting}
            mr={3}
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
          >
            保存
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
