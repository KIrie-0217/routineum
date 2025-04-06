'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Heading,
  Button,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  Spinner,
  Center,
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Flex,
  ButtonGroup,
  Tooltip
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, InfoIcon, ChevronRightIcon, ViewIcon, TimeIcon, StarIcon } from '@chakra-ui/icons';
import { Technique, NewTechnique } from '@/types/models/technique';
import { getTechniquesByPerformanceId, createTechnique, updateTechnique, deleteTechnique } from '@/services/techniqueService';
import TechniqueForm from './TechniqueForm';
import { getAverageSuccessRate } from '@/services/techniquePracticeService';

interface TechniqueListProps {
  performanceId: string;
  onTechniqueClick?: (technique: Technique, action: 'record' | 'graph' | 'history') => void;
}

export default function TechniqueList({ performanceId, onTechniqueClick }: TechniqueListProps) {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [techniqueRates, setTechniqueRates] = useState<{[key: string]: number | null}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRatesLoading, setIsRatesLoading] = useState(true);
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Technique | null>(null);
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    loadTechniques();
  }, [performanceId]);

  const loadTechniques = async () => {
    try {
      setIsLoading(true);
      const data = await getTechniquesByPerformanceId(performanceId);
      setTechniques(data);
      
      // 各シークエンスの直近10回の平均成功率を取得
      setIsRatesLoading(true);
      const rates: {[key: string]: number | null} = {};
      await Promise.all(data.map(async (technique) => {
        try {
          const rate = await getAverageSuccessRate(technique.id);
          rates[technique.id] = rate;
        } catch (error) {
          console.error(`Failed to load success rate for technique ${technique.id}:`, error);
          rates[technique.id] = null;
        }
      }));
      setTechniqueRates(rates);
      setIsRatesLoading(false);
    } catch (error) {
      console.error('Failed to load techniques:', error);
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

  const handleAddNew = () => {
    setSelectedTechnique(null);
    onFormOpen();
  };

  const handleEdit = (technique: Technique, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTechnique(technique);
    onFormOpen();
  };

  const handleDelete = (technique: Technique, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(technique);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      await deleteTechnique(deleteTarget.id);
      setTechniques(techniques.filter(t => t.id !== deleteTarget.id));
      toast({
        title: 'シークエンスを削除しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to delete technique:', error);
      toast({
        title: 'シークエンスの削除に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onDeleteClose();
    }
  };

  const handleSubmit = async (data: NewTechnique | Technique) => {
    try {
      if (selectedTechnique) {
        // 更新
        const updated = await updateTechnique(selectedTechnique.id, data as NewTechnique);
        setTechniques(techniques.map(t => t.id === updated.id ? updated : t));
      } else {
        // 新規作成
        const created = await createTechnique({
          ...data as NewTechnique,
          performance_id: performanceId
        });
        setTechniques([...techniques, created]);
      }
      onFormClose();
    } catch (error) {
      throw error;
    }
  };

  const handleCardClick = (technique: Technique, action: 'record' | 'graph' | 'history') => {
    if (onTechniqueClick) {
      onTechniqueClick(technique, action);
    }
  };

  // 成功率に基づいて色を決定する関数
  const getSuccessRateColor = (rate: number | null) => {
    if (rate === null) return 'gray.500';
    if (rate >= 90) return 'green.500';
    if (rate >= 70) return 'blue.500';
    if (rate >= 50) return 'yellow.500';
    return 'red.500';
  };

  if (isLoading) {
    return (
      <Center py={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Button leftIcon={<AddIcon />} colorScheme="blue" size={{ base: "xs", md: "sm" }} onClick={handleAddNew}>
          シークエンスを追加
        </Button>
      </Box>

      {techniques.length === 0 ? (
        <Text>シークエンスが登録されていません。新しいシークエンスを追加しましょう。</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {techniques.map((technique) => (
            <Card 
              key={technique.id} 
              variant="outline" 
              _hover={{ boxShadow: "md" }}
            >
              <CardHeader pb={2}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading size="sm" wordBreak="break-word">{technique.name}</Heading>
                  {!isRatesLoading && techniqueRates[technique.id] !== null && (
                    <Badge 
                      colorScheme={getSuccessRateColor(techniqueRates[technique.id]) === 'gray.500' ? 'gray' : 
                                  getSuccessRateColor(techniqueRates[technique.id]) === 'green.500' ? 'green' :
                                  getSuccessRateColor(techniqueRates[technique.id]) === 'blue.500' ? 'blue' :
                                  getSuccessRateColor(techniqueRates[technique.id]) === 'yellow.500' ? 'yellow' : 'red'}
                      fontSize="sm"
                      ml={1}
                      flexShrink={0}
                    >
                      平均{techniqueRates[technique.id]}%
                    </Badge>
                  )}
                </Flex>
              </CardHeader>
              <CardBody py={2}>
                <Text fontSize="sm" noOfLines={2}>
                  {technique.notes || '説明なし'}
                </Text>
              </CardBody>
              <CardFooter pt={2} flexDirection={{ base: "column", sm: "row" }} alignItems="center" gap={2}>
                <ButtonGroup size="sm" isAttached variant="outline" flexWrap={{ base: "wrap", md: "nowrap" }} w={{ base: "100%", sm: "auto" }}>
                  <Tooltip label="練習記録を追加">
                    <Button 
                      leftIcon={<StarIcon />} 
                      colorScheme="blue"
                      onClick={() => handleCardClick(technique, 'record')}
                      flex={{ base: 1, sm: "auto" }}
                      fontSize={{ base: "xs", md: "sm" }}
                    >
                      記録
                    </Button>
                  </Tooltip>
                  <Tooltip label="グラフを表示">
                    <Button 
                      leftIcon={<ViewIcon />} 
                      colorScheme="teal"
                      onClick={() => handleCardClick(technique, 'graph')}
                      flex={{ base: 1, sm: "auto" }}
                      fontSize={{ base: "xs", md: "sm" }}
                    >
                      グラフ
                    </Button>
                  </Tooltip>
                  <Tooltip label="履歴を表示">
                    <Button 
                      leftIcon={<TimeIcon />} 
                      colorScheme="purple"
                      onClick={() => handleCardClick(technique, 'history')}
                      flex={{ base: 1, sm: "auto" }}
                      fontSize={{ base: "xs", md: "sm" }}
                    >
                      履歴
                    </Button>
                  </Tooltip>
                </ButtonGroup>
                <ButtonGroup size="sm" ml={{ base: 0, sm: "auto" }} mt={{ base: 2, sm: 0 }} w={{ base: "100%", sm: "auto" }} justifyContent={{ base: "flex-end", sm: "flex-start" }}>
                  <IconButton
                    aria-label="Edit technique"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={(e) => handleEdit(technique, e)}
                  />
                  <IconButton
                    aria-label="Delete technique"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={(e) => handleDelete(technique, e)}
                  />
                </ButtonGroup>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* シークエンスフォームモーダル */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size={{ base: "full", md: "md" }}>
        <ModalOverlay />
        <ModalContent mx={{ base: 2, md: "auto" }}>
          <ModalHeader fontSize={{ base: "md", md: "lg" }}>{selectedTechnique ? 'シークエンスを編集' : '新しいシークエンスを追加'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <TechniqueForm
              performanceId={performanceId}
              initialData={selectedTechnique || undefined}
              onSubmit={handleSubmit}
              onCancel={onFormClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 削除確認ダイアログ */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        size={{ base: "sm", md: "md" }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent mx={{ base: 4, md: "auto" }}>
            <AlertDialogHeader fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
              シークエンスの削除
            </AlertDialogHeader>

            <AlertDialogBody>
              「{deleteTarget?.name}」を削除しますか？この操作は取り消せません。
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose} size={{ base: "sm", md: "md" }}>
                キャンセル
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3} size={{ base: "sm", md: "md" }}>
                削除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
