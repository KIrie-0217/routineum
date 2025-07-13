'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  NumberDecrementStepper
} from '@chakra-ui/react';
import { NewTechniquePractice } from '@/services/techniquePracticeService';
import { Technique } from '@/types/models/technique';
import { getTechniqueById } from '@/services/techniqueService';
import { useAuth } from '@/contexts/AuthContext';

interface TechniquePracticeFormProps {
  techniqueId: string;
  onSubmit: (data: NewTechniquePractice) => Promise<void>;
  onCancel: () => void;
}

export default function TechniquePracticeForm({
  techniqueId,
  onSubmit,
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

  useEffect(() => {
    const loadTechnique = async () => {
      try {
        const techniqueData = await getTechniqueById(techniqueId, supabase);
        setTechnique(techniqueData);
      } catch (error) {
        console.error('Error loading technique:', error);
        toast({
          title: 'シークエンスの読み込みに失敗しました',
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
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<NewTechniquePractice>({
    defaultValues: {
      technique_id: techniqueId,
      success_rate: 50,
      practice_date: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });

  // スライダーの値が変更されたときにフォームの値も更新
  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    setValue('success_rate', value);
  };

  // 連続成功回数の値が変更されたときにフォームの値も更新
  const handleStreakChange = (valueAsString: string, valueAsNumber: number) => {
    setStreakValue(valueAsNumber);
    setValue('success_rate', valueAsNumber);
  };

  const handleFormSubmit = async (data: NewTechniquePractice) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        success_rate: technique?.unit === 'percent' ? sliderValue : streakValue
      });
      toast({
        title: '練習記録を保存しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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
    <Box as="form" onSubmit={handleSubmit(handleFormSubmit)} width="100%">
      <VStack spacing={4} align="flex-start">
        {technique?.unit === 'percent' ? (
          <FormControl isInvalid={!!errors.success_rate} isRequired>
            <FormLabel htmlFor="success_rate">成功率</FormLabel>
            <Box pt={6} pb={2}>
              <Slider
                id="success_rate"
                min={0}
                max={100}
                step={1}
                value={sliderValue}
                onChange={handleSliderChange}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <SliderMark value={0} mt={2} ml={-2} fontSize="sm">
                  0%
                </SliderMark>
                <SliderMark value={50} mt={2} ml={-2} fontSize="sm">
                  50%
                </SliderMark>
                <SliderMark value={100} mt={2} ml={-2} fontSize="sm">
                  100%
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
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
              </Slider>
            </Box>
            <FormErrorMessage>
              {errors.success_rate && errors.success_rate.message}
            </FormErrorMessage>
          </FormControl>
        ) : (
          <FormControl isInvalid={!!errors.success_rate} isRequired>
            <FormLabel htmlFor="success_rate">連続成功回数</FormLabel>
            <NumberInput 
              min={0} 
              value={streakValue} 
              onChange={handleStreakChange}
            >
              <NumberInputField id="success_rate" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage>
              {errors.success_rate && errors.success_rate.message}
            </FormErrorMessage>
          </FormControl>
        )}

        <FormControl isInvalid={!!errors.practice_date} isRequired>
          <FormLabel htmlFor="practice_date">練習日</FormLabel>
          <Input
            id="practice_date"
            type="date"
            {...register('practice_date', {
              required: '練習日は必須です'
            })}
          />
          <FormErrorMessage>
            {errors.practice_date && errors.practice_date.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.notes}>
          <FormLabel htmlFor="notes">メモ</FormLabel>
          <Textarea
            id="notes"
            placeholder="練習に関するメモを入力（任意）"
            {...register('notes')}
          />
          <FormErrorMessage>
            {errors.notes && errors.notes.message}
          </FormErrorMessage>
        </FormControl>

        <Box width="100%" display="flex" justifyContent="space-between" pt={4}>
          <Button
            variant="outline"
            onClick={onCancel}
            isDisabled={isSubmitting}
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
        </Box>
      </VStack>
    </Box>
  );
}
