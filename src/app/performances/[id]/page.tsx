'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  Button,
  Spinner,
  Center,
  VStack,
  HStack,
  Badge,
  Divider,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Link,
  SimpleGrid,
  GridItem,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ExternalLinkIcon, AddIcon } from '@chakra-ui/icons';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { getPerformance, deletePerformance } from '@/services/performanceService';
import { getPerformanceContributions } from '@/services/contributionService';
import { Performance } from '@/types/models/performance';
import { formatDate } from '@/utils/dateUtils';
import TechniqueList from '@/components/technique/TechniqueList';
import PerformancePracticeForm from '@/components/practice/PerformancePracticeForm';
import TechniquePracticeForm from '@/components/practice/TechniquePracticeForm';
import PracticeHistoryList from '@/components/practice/PracticeHistoryList';
import PracticeContributionGraph from '@/components/practice/PracticeContributionGraph';
import { PerformanceProgressChart, TechniqueProgressChart, WeeklyAverageGauge, TechniquesComparisonChart } from '@/components/charts';
import { getPerformancePractices, getTechniquePractices, deletePerformancePractice, deleteTechniquePractice, getAllPerformancePractices, getAllTechniquePractices } from '@/services/practiceService';

export default function PerformanceDetailPage({ params }: { params: { id: string } }) {
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [performancePractices, setPerformancePractices] = useState<any[]>([]);
  const [techniquePractices, setTechniquePractices] = useState<any[]>([]);
  const [selectedTechnique, setSelectedTechnique] = useState<any>(null);
  const [isPracticesLoading, setIsPracticesLoading] = useState(true);
  const [isTechniquePracticesLoading, setIsTechniquePracticesLoading] = useState(false);
  const [performancePracticePage, setPerformancePracticePage] = useState(1);
  const [techniquePracticePage, setTechniquePracticePage] = useState(1);
  const [performancePracticesTotalPages, setPerformancePracticesTotalPages] = useState(1);
  const [techniquePracticesTotalPages, setTechniquePracticesTotalPages] = useState(1);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [contributionData, setContributionData] = useState({
    techniquePractices: [],
    performancePractices: []
  });
  
  const { user } = useAuth();
  const router = useRouter();
   
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isPerformancePracticeModalOpen, 
    onOpen: onPerformancePracticeModalOpen, 
    onClose: onPerformancePracticeModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isTechniqueModalOpen, 
    onOpen: onTechniqueModalOpen, 
    onClose: handleTechniqueModalClose 
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  // paramsをReact.use()でラップして安全に使用
  const resolvedParams = use(params);

  useEffect(() => {
    async function loadPerformance() {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await getPerformance(resolvedParams.id);
        
        // 他のユーザーのルーチンにアクセスしようとした場合はリダイレクト
        if (data && data.user_id !== user.id) {
          toast({
            title: 'アクセス権限がありません',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          router.push('/performances');
          return;
        }
        
        setPerformance(data);
        
        // 残り日数の計算
        if (!data.is_completed) {
          const performanceDate = new Date(data.performance_date);
          const today = new Date();
          const diffTime = performanceDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysRemaining(diffDays);
        }

        // 練習記録の貢献グラフ用データを取得
        const contributions = await getPerformanceContributions(resolvedParams.id);
        setContributionData(contributions);
      } catch (error) {
        console.error('Failed to load performance:', error);
        toast({
          title: 'ルーチンの読み込みに失敗しました',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadPerformance();
  }, [resolvedParams.id, user, router, toast]);

  // ルーチン練習記録を取得
  useEffect(() => {
    async function loadPractices() {
      if (!user) return;
      
      try {
        setIsPracticesLoading(true);
        const result = await getPerformancePractices(resolvedParams.id, performancePracticePage);
        setPerformancePractices(result.practices);
        setPerformancePracticesTotalPages(result.totalPages);
      } catch (error) {
        console.error('練習記録の取得に失敗しました:', error);
        toast({
          title: '練習記録の取得に失敗しました',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsPracticesLoading(false);
      }
    }

    loadPractices();
  }, [resolvedParams.id, user, toast, performancePracticePage]);

  const handleEdit = () => {
    router.push(`/performances/${resolvedParams.id}/edit`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deletePerformance(resolvedParams.id);
      
      toast({
        title: 'ルーチンを削除しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      router.push('/performances');
    } catch (error) {
      console.error('Failed to delete performance:', error);
      toast({
        title: 'ルーチンの削除に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  // シークエンスを選択して練習記録モーダルを開く
  const handleTechniqueSelect = async (technique: any, action: 'record' | 'graph' | 'history') => {
    setSelectedTechnique(technique);
    setTechniquePracticePage(1); // ページをリセット
    
    try {
      setIsTechniquePracticesLoading(true);
      const result = await getTechniquePractices(technique.id, 1);
      setTechniquePractices(result.practices);
      setTechniquePracticesTotalPages(result.totalPages);
      
      // アクションに応じてタブインデックスを設定
      if (action === 'record') {
        setActiveTabIndex(0);
      } else if (action === 'graph') {
        setActiveTabIndex(1);
      } else if (action === 'history') {
        setActiveTabIndex(2);
      }
      
      // モーダルを開く
      onTechniqueModalOpen();
    } catch (error) {
      console.error('シークエンス練習記録の取得に失敗しました:', error);
      toast({
        title: 'シークエンス練習記録の取得に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTechniquePracticesLoading(false);
    }
  };

  // ルーチン練習記録追加後の処理
  const handlePerformancePracticeSuccess = async () => {
    try {
      const result = await getPerformancePractices(resolvedParams.id, performancePracticePage);
      setPerformancePractices(result.practices);
      setPerformancePracticesTotalPages(result.totalPages);
      
      toast({
        title: '練習記録を追加しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('練習記録の再取得に失敗しました:', error);
    }
  };

  // シークエンス練習記録追加後の処理
  const handleTechniquePracticeSuccess = async () => {
    if (selectedTechnique) {
      try {
        const result = await getTechniquePractices(selectedTechnique.id, techniquePracticePage);
        setTechniquePractices(result.practices);
        setTechniquePracticesTotalPages(result.totalPages);
        
        toast({
          title: `「${selectedTechnique.name}」の練習記録を追加しました`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('シークエンス練習記録の再取得に失敗しました:', error);
      }
    }
  };

  // ルーチン練習記録の削除
  const handleDeletePerformancePractice = async (practiceId: string) => {
    try {
      await deletePerformancePractice(practiceId);
      // 練習記録を再取得
      const result = await getPerformancePractices(resolvedParams.id, performancePracticePage);
      setPerformancePractices(result.practices);
      setPerformancePracticesTotalPages(result.totalPages);
      
      toast({
        title: '練習記録を削除しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('練習記録の削除に失敗しました:', error);
      toast({
        title: '練習記録の削除に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // シークエンス練習記録の削除
  const handleDeleteTechniquePractice = async (practiceId: string) => {
    try {
      await deleteTechniquePractice(practiceId);
      // シークエンス練習記録を再取得
      if (selectedTechnique) {
        const result = await getTechniquePractices(selectedTechnique.id, techniquePracticePage);
        setTechniquePractices(result.practices);
        setTechniquePracticesTotalPages(result.totalPages);
        
        toast({
          title: 'シークエンス練習記録を削除しました',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('シークエンス練習記録の削除に失敗しました:', error);
      toast({
        title: 'シークエンス練習記録の削除に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // ルーチン練習記録のページ変更
  const handlePerformancePracticePageChange = async (page: number) => {
    setPerformancePracticePage(page);
  };

  // シークエンス練習記録のページ変更
  const handleTechniquePracticePageChange = async (page: number) => {
    setTechniquePracticePage(page);
    if (selectedTechnique) {
      try {
        setIsTechniquePracticesLoading(true);
        const result = await getTechniquePractices(selectedTechnique.id, page);
        setTechniquePractices(result.practices);
        setTechniquePracticesTotalPages(result.totalPages);
      } catch (error) {
        console.error('シークエンス練習記録の取得に失敗しました:', error);
      } finally {
        setIsTechniquePracticesLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Center h="50vh">
          <Spinner size="xl" />
        </Center>
      </AppLayout>
    );
  }

  if (!performance) {
    return (
      <AppLayout>
        <Box p={{ base: 4, md: 8 }}>
          <Text>ルーチンが見つかりませんでした。</Text>
          <Button mt={4} onClick={() => router.push('/performances')} size={{ base: "sm", md: "md" }}>
            ルーチン一覧に戻る
          </Button>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box p={{ base: 4, md: 8 }}>
        {/* ヘッダー部分 - スマホでは縦並びに */}
        <VStack spacing={4} align="stretch" mb={6}>
          <Heading size="lg" wordBreak="break-word">{performance.name}</Heading>
          <HStack spacing={2} justifyContent={{ base: "flex-start", md: "flex-end" }} flexWrap="wrap">
            <Button leftIcon={<EditIcon />} onClick={handleEdit} size={{ base: "sm", md: "md" }} mb={{ base: 2, md: 0 }}>
              編集
            </Button>
            <Button leftIcon={<DeleteIcon />} colorScheme="red" onClick={onOpen} size={{ base: "sm", md: "md" }}>
              削除
            </Button>
          </HStack>
        </VStack>
 
        {/* 基本情報 */}
        <VStack align="start" spacing={4} mb={8}>
          <HStack flexWrap="wrap">
            <Text fontWeight="bold">公演日:</Text>
            <Text>{formatDate(performance.performance_date)}</Text>
          </HStack>
          
          <HStack flexWrap="wrap">
            <Text fontWeight="bold">ステータス:</Text>
            {performance.is_completed ? (
              <Badge colorScheme="green">完了</Badge>
            ) : (
              <Badge colorScheme="blue">準備中</Badge>
            )}
          </HStack>
          
          {!performance.is_completed && daysRemaining !== null && (
            <HStack flexWrap="wrap">
              <Text fontWeight="bold">残り日数:</Text>
              <Text fontWeight="bold" color={daysRemaining < 0 ? 'red.500' : daysRemaining < 7 ? 'orange.500' : 'green.500'}>
                {daysRemaining < 0 ? `${Math.abs(daysRemaining)}日過ぎています` : `あと${daysRemaining}日`}
              </Text>
            </HStack>
          )}
          
          {performance.is_completed && performance.result_percentage !== null && (
            <HStack flexWrap="wrap">
              <Text fontWeight="bold">成功率:</Text>
              <Text>{performance.result_percentage}%</Text>
            </HStack>
          )}
          
          {performance.is_completed && performance.ranking !== null && (
            <HStack flexWrap="wrap">
              <Text fontWeight="bold">順位:</Text>
              <Text>{performance.ranking}</Text>
            </HStack>
          )}
          
          {performance.music_link && (
            <VStack align="start" w="100%">
              <Text fontWeight="bold">楽曲リンク:</Text>
              <Box maxW="100%" overflowX="auto">
                <a href={performance.music_link} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
                  {performance.music_link}
                </a>
              </Box>
            </VStack>
          )}
        </VStack>
        
        {/* グラフとメモのグリッド - スマホでは1列に */}
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 4, md: 6 }}>
          <GridItem>
            <Box mb={{ base: 4, md: 8 }}>
              <PracticeContributionGraph 
                techniquePractices={contributionData.techniquePractices}
                performancePractices={contributionData.performancePractices}
                endDate={new Date(performance.performance_date)}
                startDate={new Date(performance.created_at)}
              />
            </Box>   
          </GridItem>
          <GridItem>
            {performance.notes && (
              <>
                <Divider my={{ base: 2, md: 4 }} />
                <VStack align="start" w="100%" mb={{ base: 4, md: 8 }}>
                  <Heading size="md" mb={2}>メモ</Heading>
                  <Text whiteSpace="pre-wrap" wordBreak="break-word">{performance.notes}</Text>
                </VStack>
              </>
            )}
          </GridItem>
        </SimpleGrid>

        <Divider my={{ base: 4, md: 6 }} />

        <Tabs variant="enclosed" colorScheme="blue" mt={{ base: 4, md: 8 }} isLazy>
          <TabList overflowX="auto" flexWrap={{ base: "nowrap", md: "wrap" }}>
            <Tab minW={{ base: "120px", md: "auto" }} fontSize={{ base: "sm", md: "md" }}>ダッシュボード</Tab>
            <Tab minW={{ base: "120px", md: "auto" }} fontSize={{ base: "sm", md: "md" }}>ルーチン記録</Tab>
            <Tab minW={{ base: "120px", md: "auto" }} fontSize={{ base: "sm", md: "md" }}>シークエンス一覧</Tab> 
          </TabList>
          <TabPanels>
            <TabPanel px={{ base: 2, md: 4 }} py={{ base: 3, md: 5 }}>  
              <Box mb={{ base: 6, md: 8 }}>
                <SimpleGrid columns={{ base: 1, md: 4 }} gap={{ base: 6, md: 6 }}>
                  <GridItem colSpan={{ base: 1, md: 1 }}>
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center" 
                      height="100%" 
                      mb={{ base: 4, md: 0 }}
                      maxW={{ base: "250px", md: "100%" }}
                      mx={{ base: "auto", md: 0 }}
                    >
                      <WeeklyAverageGauge 
                        title="直近1週間のルーチン平均成功率"
                        colorScheme="blue"
                        fetchPractices={() => getAllPerformancePractices(resolvedParams.id)}
                      /> 
                    </Box>
                  </GridItem>
                  <GridItem colSpan={{ base: 1, md: 3 }}>
                    <Box 
                      w="100%" 
                      overflowX="auto" 
                      overflowY="hidden"
                      minH={{ base: "350px", md: "300px" }}
                    >
                      <PerformanceProgressChart performanceId={resolvedParams.id} />
                    </Box>
                  </GridItem>
                </SimpleGrid>
              </Box>
              <Box p={{ base: 2, md: 4 }} mt={{ base: 4, md: 6 }}>
                <TechniquesComparisonChart performanceId={resolvedParams.id} />
              </Box>
            </TabPanel>
            <TabPanel px={{ base: 2, md: 4 }} py={{ base: 3, md: 5 }}>
              <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                <Box display="flex" justifyContent="flex-start" alignItems="center" mb={{ base: 2, md: 4 }}>
                  <Button 
                    leftIcon={<AddIcon />} 
                    colorScheme="blue" 
                    size={{ base: "sm", md: "md" }} 
                    onClick={onPerformancePracticeModalOpen}
                  >
                    練習記録を追加
                  </Button>
                </Box>
                <PracticeHistoryList 
                  practices={performancePractices} 
                  isLoading={isPracticesLoading} 
                  title="ルーチン通し練習履歴"
                  onDelete={handleDeletePerformancePractice}
                  currentPage={performancePracticePage}
                  totalPages={performancePracticesTotalPages}
                  onPageChange={handlePerformancePracticePageChange}
                />
              </VStack>
            </TabPanel>
            <TabPanel px={{ base: 2, md: 4 }} py={{ base: 3, md: 5 }}>
              <TechniqueList 
                performanceId={resolvedParams.id} 
                onTechniqueClick={handleTechniqueSelect}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* ルーチン練習記録モーダル */}
        <Modal isOpen={isPerformancePracticeModalOpen} onClose={onPerformancePracticeModalClose} size={{ base: "full", md: "lg" }}>
          <ModalOverlay />
          <ModalContent mx={{ base: 2, md: "auto" }}>
            <ModalHeader fontSize={{ base: "md", md: "lg" }}>ルーチン練習記録の追加</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <PerformancePracticeForm 
                performanceId={resolvedParams.id} 
                onSuccess={() => {
                  handlePerformancePracticeSuccess();
                  onPerformancePracticeModalClose();
                }} 
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* シークエンス練習記録モーダル */}
        <Modal isOpen={isTechniqueModalOpen} onClose={handleTechniqueModalClose} size={{ base: "full", md: "lg" }}>
          <ModalOverlay />
          <ModalContent mx={{ base: 2, md: "auto" }}>
            <ModalHeader fontSize={{ base: "md", md: "lg" }}>{selectedTechnique?.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Tabs variant="enclosed" colorScheme="blue" index={activeTabIndex} onChange={(index) => setActiveTabIndex(index)} isLazy>
                <TabList overflowX="auto" flexWrap={{ base: "nowrap", md: "wrap" }}>
                  <Tab minW={{ base: "80px", md: "auto" }}>記録</Tab>
                  <Tab minW={{ base: "80px", md: "auto" }}>グラフ</Tab>
                  <Tab minW={{ base: "80px", md: "auto" }}>履歴</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={{ base: 2, md: 4 }} py={{ base: 3, md: 5 }}>
                    {/* 練習記録フォーム */}
                    <Box p={{ base: 2, md: 4 }} borderWidth="1px" borderRadius="md">
                      {selectedTechnique && (
                        <TechniquePracticeForm 
                          techniqueId={selectedTechnique.id} 
                          techniqueName={selectedTechnique.name}
                          onSuccess={handleTechniquePracticeSuccess} 
                        />
                      )}
                    </Box>
                  </TabPanel>
                  <TabPanel px={{ base: 2, md: 4 }} py={{ base: 3, md: 5 }}>
                    {/* グラフ表示 */}
                    {selectedTechnique && (
                      <Box p={{ base: 2, md: 4 }} borderWidth="1px" borderRadius="md">
                        <VStack spacing={4}>
                          <Box w="100%">
                            <TechniqueProgressChart 
                              techniqueId={selectedTechnique.id} 
                              techniqueName={selectedTechnique.name} 
                            />
                          </Box>
                          <Box w="100%" maxW="300px" mx="auto">
                            <WeeklyAverageGauge 
                              title={`${selectedTechnique.name}の週間平均`}
                              colorScheme="green"
                              fetchPractices={() => getAllTechniquePractices(selectedTechnique.id)}
                            />
                          </Box>
                        </VStack>
                      </Box>
                    )}
                  </TabPanel>
                  <TabPanel px={{ base: 2, md: 4 }} py={{ base: 3, md: 5 }}>
                    {/* 練習履歴 */}
                    <PracticeHistoryList 
                      practices={techniquePractices} 
                      isLoading={isTechniquePracticesLoading} 
                      title="練習履歴"
                      onDelete={handleDeleteTechniquePractice}
                      currentPage={techniquePracticePage}
                      totalPages={techniquePracticesTotalPages}
                      onPageChange={handleTechniquePracticePageChange}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
          </ModalContent>
        </Modal>

        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
          size={{ base: "sm", md: "md" }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent mx={{ base: 4, md: "auto" }}>
              <AlertDialogHeader fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                ルーチンの削除
              </AlertDialogHeader>

              <AlertDialogBody>
                「{performance.name}」を削除してもよろしいですか？この操作は元に戻せません。
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose} size={{ base: "sm", md: "md" }}>
                  キャンセル
                </Button>
                <Button colorScheme="red" onClick={handleDelete} ml={3} isLoading={isDeleting} size={{ base: "sm", md: "md" }}>
                  削除
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </AppLayout>
  );
}
