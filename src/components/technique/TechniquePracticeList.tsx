'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { TechniquePractice, NewTechniquePractice, getTechniquePractices, createTechniquePractice, deleteTechniquePractice } from '@/services/techniquePracticeService';
import TechniquePracticeForm from './TechniquePracticeForm';
import { formatDate } from '@/utils/dateUtils';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTechniqueById } from '@/services/techniqueService';
import { Technique } from '@/types/models/technique';

interface TechniquePracticeListProps {
  techniqueId: string;
  techniqueName: string;
}

export default function TechniquePracticeList({ techniqueId, techniqueName }: TechniquePracticeListProps) {
  const [practices, setPractices] = useState<TechniquePractice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<TechniquePractice | null>(null);
  const [technique, setTechnique] = useState<Technique | null>(null);
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const supabase = useAuth().supabase;

  useEffect(() => {
    loadData();
  }, [techniqueId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [practicesData, techniqueData] = await Promise.all([
        getTechniquePractices(techniqueId, supabase),
        getTechniqueById(techniqueId, supabase)
      ]);
      setPractices(practicesData);
      setTechnique(techniqueData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'データの読み込みに失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    onFormOpen();
  };

  const handleDelete = (practice: TechniquePractice) => {
    setDeleteTarget(practice);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      await deleteTechniquePractice(deleteTarget.id, supabase);
      setPractices(practices.filter(p => p.id !== deleteTarget.id));
      toast({
        title: '練習記録を削除しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to delete practice:', error);
      toast({
        title: '練習記録の削除に失敗しました',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onDeleteClose();
    }
  };

  const handleSubmit = async (data: NewTechniquePractice) => {
    try {
      const created = await createTechniquePractice(data, supabase);
      setPractices([created, ...practices]);
      onFormClose();
    } catch (error) {
      throw error;
    }
  };

  const getSuccessRateBadge = (rate: number) => {
    if (!technique) return null;

    if (technique.unit === 'percent') {
      let colorScheme = 'red';
      if (rate >= 80) colorScheme = 'green';
      else if (rate >= 50) colorScheme = 'yellow';
      else if (rate >= 30) colorScheme = 'orange';
      
      return (
        <Badge colorScheme={colorScheme} fontSize="0.8em" px={2} py={1} borderRadius="full">
          {rate}%
        </Badge>
      );
    } else {
      // streakの場合
      let colorScheme = 'blue';
      if (rate >= 10) colorScheme = 'green';
      else if (rate >= 5) colorScheme = 'teal';
      else if (rate >= 3) colorScheme = 'blue';
      
      return (
        <Badge colorScheme={colorScheme} fontSize="0.8em" px={2} py={1} borderRadius="full">
          {rate}回
        </Badge>
      );
    }
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
        <Heading size="md">{techniqueName}の練習記録</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" size="sm" onClick={handleAddNew}>
          記録を追加
        </Button>
      </Box>

      {practices.length === 0 ? (
        <Text>練習記録がありません。新しい記録を追加しましょう。</Text>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>練習日</Th>
              <Th>{technique?.unit === 'percent' ? '成功率' : '連続成功回数'}</Th>
              <Th>メモ</Th>
              <Th width="50px">操作</Th>
            </Tr>
          </Thead>
          <Tbody>
            {practices.map((practice) => (
              <Tr key={practice.id}>
                <Td>{formatDate(practice.practice_date)}</Td>
                <Td>{getSuccessRateBadge(practice.success_rate)}</Td>
                <Td>{practice.notes || '-'}</Td>
                <Td>
                  <IconButton
                    aria-label="Delete practice"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(practice)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* 練習記録フォームモーダル */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>練習記録を追加</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <TechniquePracticeForm
              techniqueId={techniqueId}
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
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              練習記録の削除
            </AlertDialogHeader>

            <AlertDialogBody>
              {formatDate(deleteTarget?.practice_date || '')}の練習記録を削除しますか？この操作は取り消せません。
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                キャンセル
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                削除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
