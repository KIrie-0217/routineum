import { Button, HStack, Text } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // ページが1ページしかない場合は表示しない
  if (totalPages <= 1) {
    return null;
  }

  // 表示するページ番号の範囲を決定
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // 表示するページ番号の最大数
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // 表示するページ数が最大数に満たない場合、startPageを調整
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <HStack spacing={2} justifyContent="center" mt={6}>
      <Button
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage === 1}
        aria-label="前のページ"
      >
        <ChevronLeftIcon />
      </Button>
      
      {getPageNumbers().map((page) => (
        <Button
          key={page}
          size="sm"
          colorScheme={page === currentPage ? 'blue' : 'gray'}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      
      <Button
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages}
        aria-label="次のページ"
      >
        <ChevronRightIcon />
      </Button>
      
      <Text fontSize="sm" color="gray.500" ml={2}>
        {currentPage} / {totalPages}ページ
      </Text>
    </HStack>
  );
}
