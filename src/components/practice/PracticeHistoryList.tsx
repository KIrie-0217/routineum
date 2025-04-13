import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  Badge,
  Divider,
  Skeleton,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useToast
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import PracticeEditModal from './PracticeEditModal';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState, useRef } from 'react';
import Pagination from '../common/Pagination';

interface Practice {
  id: string;
  success_rate: number;
  practice_date: string;
  notes: string | null;
}

interface PracticeHistoryListProps {
  practices: Practice[];
  isLoading: boolean;
  title?: string;
  onDelete?: (practiceId: string) => Promise<boolean>;
  onEdit?: (practiceId: string, updates: { success_rate: number; notes: string | null }) => Promise<boolean>;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function PracticeHistoryList({ 
  practices, 
  isLoading, 
  title,
  onDelete,
  onEdit,
  totalPages = 1,
  currentPage = 1,
  onPageChange
}: PracticeHistoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  
  // 削除確認ダイアログ用
  const { isOpen, onOpen, onClose } = useDisclosure();
  // 編集モーダル用
  const { 
    isOpen: isEditModalOpen, 
    onOpen: onEditModalOpen, 
    onClose: onEditModalClose 
  } = useDisclosure();
  
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  const handleDeleteClick = (practiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(practiceId);
    onOpen();
  };
  
  const handleEditClick = (practice: Practice, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPractice(practice);
    onEditModalOpen();
  };
  
  const handleSaveEdit = async (practiceId: string, updates: { success_rate: number; notes: string | null }) => {
    if (!onEdit) return;
    
    try {
      setIsEditLoading(true);
      await onEdit(practiceId, updates);
      onEditModalClose();
      toast({
        title: '練習記録を更新しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('練習記録の更新に失敗しました:', error);
      toast({
        title: '練習記録の更新に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId || !onDelete) return;

    try {
      await onDelete(deletingId);
      toast({
        title: '記録を削除しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('記録の削除に失敗しました:', error);
      toast({
        title: '記録の削除に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeletingId(null);
      onClose();
    }
  };

  if (isLoading) {
    return (
      <Box>
        {title && <Heading size="md" mb={4}>{title}</Heading>}
        <VStack spacing={4} align="stretch">
          {[1, 2, 3].map((i) => (
            <Box key={i} p={4} borderWidth="1px" borderRadius="md">
              <Skeleton height="20px" mb={2} />
              <Skeleton height="15px" mb={2} />
              <Skeleton height="10px" />
            </Box>
          ))}
        </VStack>
      </Box>
    );
  }

  if (practices.length === 0) {
    return (
      <Box>
        {title && <Heading size="md" mb={4}>{title}</Heading>}
        <Text color="gray.500">まだ練習記録がありません。</Text>
      </Box>
    );
  }

  return (
    <Box>
      {title && <Heading size="md" mb={4}>{title}</Heading>}
      <VStack spacing={4} align="stretch">
        {practices.map((practice) => (
          <Box key={practice.id} p={4} borderWidth="1px" borderRadius="md">
            <HStack justify="space-between" mb={2}>
              <Badge colorScheme={getColorScheme(practice.success_rate)}>
                成功率: {practice.success_rate}%
              </Badge>
              <HStack>
                <Text fontSize="sm" color="gray.500">
                  {formatDistanceToNow(new Date(practice.practice_date), { addSuffix: true, locale: ja })}
                </Text>
                <HStack spacing={1}>
                  {onEdit && (
                    <IconButton
                      aria-label="記録を編集"
                      icon={<EditIcon />}
                      size="xs"
                      colorScheme="blue"
                      variant="ghost"
                      onClick={(e) => handleEditClick(practice, e)}
                    />
                  )}
                  {onDelete && (
                    <IconButton
                      aria-label="記録を削除"
                      icon={<DeleteIcon />}
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={(e) => handleDeleteClick(practice.id, e)}
                    />
                  )}
                </HStack>
              </HStack>
            </HStack>
            <Progress
              value={practice.success_rate}
              colorScheme={getColorScheme(practice.success_rate)}
              size="sm"
              mb={2}
            />
            {practice.notes && (
              <>
                <Divider my={2} />
                <Text fontSize="sm">{practice.notes}</Text>
              </>
            )}
          </Box>
        ))}
      </VStack>

      {/* ページネーション */}
      {onPageChange && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}

      {/* 削除確認ダイアログ */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              練習記録の削除
            </AlertDialogHeader>

            <AlertDialogBody>
              この練習記録を削除しますか？この操作は取り消せません。
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                キャンセル
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                削除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      
      {/* 編集モーダル */}
      <PracticeEditModal
        isOpen={isEditModalOpen}
        onClose={onEditModalClose}
        practice={editingPractice}
        onSave={handleSaveEdit}
        isLoading={isEditLoading}
      />
    </Box>
  );
}

// 成功率に応じた色を返す関数
function getColorScheme(rate: number): string {
  if (rate >= 80) return 'green';
  if (rate >= 60) return 'blue';
  if (rate >= 40) return 'yellow';
  if (rate >= 20) return 'orange';
  return 'red';
}
