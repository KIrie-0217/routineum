import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Text,
  FormErrorMessage,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTechniquePractice } from '@/services/practiceService';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// バリデーションスキーマ
const practiceSchema = z.object({
  success_rate: z.number().min(0).max(100),
  notes: z.string().optional(),
});

type PracticeFormData = z.infer<typeof practiceSchema>;

interface TechniquePracticeFormProps {
  techniqueId: string;
  techniqueName: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function TechniquePracticeForm({ 
  techniqueId, 
  techniqueName,
  onSuccess,
  onCancel
}: TechniquePracticeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const {supabase}= useAuth();
  
  const roundToStep = (value: number, step: number) => {
    return Math.round(value / step) * step;
  };
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PracticeFormData>({
    resolver: zodResolver(practiceSchema),
    defaultValues: {
      success_rate: 50,
      notes: '',
    },
  });

  const onSubmit = async (data: PracticeFormData) => {
    try {
      setIsSubmitting(true);
      await createTechniquePractice({
        technique_id: techniqueId,
        success_rate: data.success_rate,
        notes: data.notes || null,
      },supabase);
      
      reset();
      onSuccess();
    } catch (error) {
      console.error('練習記録の追加に失敗しました:', error);
      toast({
        title: '練習記録の追加に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} width="100%">
      <VStack spacing={4} align="stretch">
        <Text fontWeight="bold">{techniqueName}の練習記録</Text>
        
        <FormControl isInvalid={!!errors.success_rate}>
          <FormLabel>成功率 (%)</FormLabel>
          <Controller
            name="success_rate"
            control={control}
            render={({ field }) => (
              <Box pt={6} pb={2}>
                <Slider
                  aria-label="success-rate-slider"
                  value={field.value}
                  onChange={(val) => field.onChange(roundToStep(val, 5))}
                  min={0}
                  max={100}
                  step={5}
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
                  <SliderMark
                    value={field.value}
                    textAlign="center"
                    bg="blue.500"
                    color="white"
                    mt="-10"
                    ml="-5"
                    w="12"
                    borderRadius="md"
                  >
                    {field.value}%
                  </SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </Box>
            )}
          />
          {errors.success_rate && (
            <FormErrorMessage>{errors.success_rate.message}</FormErrorMessage>
          )}
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
          {errors.notes && (
            <FormErrorMessage>{errors.notes.message}</FormErrorMessage>
          )}
        </FormControl>

        <HStack justifyContent="flex-end" mt={4}>
          {onCancel && (
            <Button onClick={onCancel} mr={3}>
              キャンセル
            </Button>
          )}
          <Button
            colorScheme="blue"
            isLoading={isSubmitting}
            type="submit"
          >
            記録を追加
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
