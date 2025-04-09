'use client';

import { useState } from 'react';
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
  useToast
} from '@chakra-ui/react';
import { NewTechnique, Technique } from '@/types/models/technique';
import { useAuth } from '@/contexts/AuthContext';

interface TechniqueFormProps {
  performanceId: string;
  initialData?: Technique;
  onSubmit: (data: NewTechnique | Technique) => Promise<void>;
  onCancel: () => void;
}

export default function TechniqueForm({ 
  performanceId, 
  initialData, 
  onSubmit, 
  onCancel 
}: TechniqueFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<NewTechnique>({
    defaultValues: initialData || {
      performance_id: performanceId,
      name: '',
      notes: ''
    }
  });

  const handleFormSubmit = async (data: NewTechnique) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast({
        title: initialData ? 'シークエンスを更新しました' : 'シークエンスを作成しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error submitting technique:', error);
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

  return (
    <Box as="form" onSubmit={handleSubmit(handleFormSubmit)} width="100%">
      <VStack spacing={4} align="flex-start">
        <FormControl isInvalid={!!errors.name} isRequired>
          <FormLabel htmlFor="name">シークエンス名</FormLabel>
          <Input
            id="name"
            placeholder="シークエンスの名前を入力"
            {...register('name', {
              required: 'シークエンス名は必須です',
              maxLength: {
                value: 100,
                message: 'シークエンス名は100文字以内で入力してください'
              }
            })}
          />
          <FormErrorMessage>
            {errors.name && errors.name.message}
          </FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.notes}>
          <FormLabel htmlFor="notes">メモ</FormLabel>
          <Textarea
            id="notes"
            placeholder="シークエンスに関するメモを入力（任意）"
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
            {initialData ? '更新' : '作成'}
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}
