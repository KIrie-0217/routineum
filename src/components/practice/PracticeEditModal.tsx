import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
  Text,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface PracticeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  practice: {
    id: string;
    success_rate: number;
    notes: string | null;
    practice_date?: string;
  } | null;
  onSave: (id: string, updates: { success_rate: number; notes: string | null }) => Promise<void>;
  isLoading: boolean;
  unit?: string; // 単位（percent または streak）
}

export default function PracticeEditModal({
  isOpen,
  onClose,
  practice,
  onSave,
  isLoading,
  unit = 'percent' // デフォルトはpercent
}: PracticeEditModalProps) {
  const [successRate, setSuccessRate] = useState(practice?.success_rate || 0);
  const [notes, setNotes] = useState(practice?.notes || '');
  
  // 日付のフォーマット
  const formattedDate = practice?.practice_date 
    ? format(new Date(practice.practice_date), 'yyyy-MM-dd HH:mm')
    : '';

  // モーダルが開かれるたびに初期値を設定
  useEffect(() => {
    if (practice) {
      setSuccessRate(practice.success_rate);
      setNotes(practice.notes || '');
    }
  }, [practice]);

  const handleSave = async () => {
    if (!practice) return;
    await onSave(practice.id, {
      success_rate: successRate,
      notes: notes || null
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "md" }}>
      <ModalOverlay />
      <ModalContent mx={{ base: 2, md: "auto" }}>
        <ModalHeader>練習記録の編集</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {practice?.practice_date && (
            <Box mb={4}>
              <Text fontWeight="bold">練習日時:</Text>
              <Text>{formattedDate}</Text>
            </Box>
          )}
          <FormControl mb={4}>
            <FormLabel>{unit === 'percent' ? '成功率' : '連続成功回数'}</FormLabel>
            {unit === 'percent' ? (
              <HStack spacing={4}>
                <Box flex="1">
                  <Slider
                    value={successRate}
                    onChange={setSuccessRate}
                    min={0}
                    max={100}
                    step={5}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </Box>
                <Text width="40px" textAlign="right">{successRate}%</Text>
              </HStack>
            ) : (
              <NumberInput 
                min={0} 
                value={successRate} 
                onChange={(_, valueAsNumber) => setSuccessRate(valueAsNumber)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            )}
          </FormControl>
          <FormControl>
            <FormLabel>コメント</FormLabel>
            <Textarea
              value={notes || ''}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="練習の感想や気づきを記録しましょう"
              resize="vertical"
              rows={4}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>キャンセル</Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSave} 
            isLoading={isLoading}
          >
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
