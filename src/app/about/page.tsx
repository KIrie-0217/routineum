'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Flex,
  Image,
  SimpleGrid,
  Divider,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import { PublicLayout } from '@/components/layout/AppLayout';
import logoImage from '@/images/routineumlogo.jpg'

export default function AboutPage() {
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const headingSize = useBreakpointValue({ base: 'xl', md: '2xl' });
  const subHeadingSize = useBreakpointValue({ base: 'md', md: 'lg' });

  return (
    <PublicLayout>
      <Box bg={bgColor} py={10} minH="calc(100vh - 60px)">
        <Container maxW="container.xl">
          <VStack spacing={10} align="stretch">
            {/* ヒーローセクション */}
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              align="center" 
              justify="space-between"
              gap={8}
            >
              <Box flex={1}>
                <Heading as="h1" size={headingSize} color={headingColor} mb={4}>
                  Routineum について
                </Heading>
                <Text fontSize={{ base: 'md', md: 'lg' }} mb={6}>
                  Routineum（ルーチニウム）は、日々の練習ルーチンを記録し、継続的な改善をサポートするためのウェブアプリケーションです。
                  特にジャグリングのルーチン練習に焦点を当て、パフォーマンスの向上と目標達成をサポートします。
                  本アプリケーションは実際に競技ディアボロプレイヤーである制作者のニーズに基づき作成されました。
                </Text>
              </Box>
              <Box 
                flex={1} 
                boxShadow="lg" 
                borderRadius="md" 
                overflow="hidden"
                maxW={{ base: '100%', md: '500px' }}
              >
                <Image 
                  src={logoImage.src} 
                  alt="Routineum" 
                  w="100%" 
                  h="auto"
                  p={6}
                />
              </Box>
            </Flex>

            <Divider />

            {/* 主な機能 */}
            <Box>
              <Heading as="h2" size={subHeadingSize} color={headingColor} mb={6}>
                主な機能
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                <Box p={6} bg={cardBgColor} borderRadius="md" boxShadow="md">
                  <Heading as="h3" size="md" mb={4}>
                    ルーチン通し練習記録機能
                  </Heading>
                  <Text>
                    練習や実績を記録し、時間の経過とともにパフォーマンスを追跡します。
                    達成度をグラフィカルに確認でき、定量的に自分の練習を振り返ることが可能です。
                  </Text>
                </Box>
                <Box p={6} bg={cardBgColor} borderRadius="md" boxShadow="md">
                  <Heading as="h3" size="md" mb={4}>
                    シークエンス練習記録機能
                  </Heading>
                  <Text>
                    シークエンス単位での練習についても、通し練習と同様に記録可能です。
                  </Text>
                </Box>
                <Box p={6} bg={cardBgColor} borderRadius="md" boxShadow="md">
                  <Heading as="h3" size="md" mb={4}>
                    データ分析
                  </Heading>
                  <Text>
                    ヒートマップやグラフを通じて練習の継続状況や進捗を視覚化します。
                    ユーザーはデータに基づいた練習計画の最適化が可能です。
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* 技術スタック */}
            <Box>
              <Heading as="h2" size={subHeadingSize} color={headingColor} mb={6}>
                技術スタック
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <Box>
                  <Heading as="h3" size="md" mb={4}>
                    フロントエンド
                  </Heading>
                  <List spacing={3}>
                    <ListItem>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      Next.js 15 (React 19)
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      Chakra UI
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      TypeScript
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      Chart.js / React Calendar Heatmap
                    </ListItem>
                  </List>
                </Box>
                <Box>
                  <Heading as="h3" size="md" mb={4}>
                    バックエンド
                  </Heading>
                  <List spacing={3}>
                    <ListItem>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      Supabase (PostgreSQL)
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      RESTful API
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      Google Auth による認証
                    </ListItem>
                  </List>
                </Box>
              </SimpleGrid>
            </Box>

            <Divider />

            {/* FAQ */}
            <Box>
              <Heading as="h2" size={subHeadingSize} color={headingColor} mb={6}>
                FAQ
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={8}>
                <Box p={6} bg={cardBgColor} borderRadius="md" boxShadow="md">
                  <Heading as="h3" size="md" mb={4}>
                    このアプリケーションは無料ですか？
                  </Heading>
                  <Text>
                    原則無料です。生活に困窮した場合寄附を募る可能性もございますが、現時点ではその予定はございません。
                  </Text>
                </Box>
                <Box p={6} bg={cardBgColor} borderRadius="md" boxShadow="md">
                  <Heading as="h3" size="md" mb={4}>
                    セキュリティは大丈夫ですか？
                  </Heading>
                  <Text>
                    本アプリケーションは Google 認証を使用しており、アプリケーション側のデータベースにはユーザーの個人情報が含まれないように設計されています。
                    また、ユーザーレベルでの RLS を設定しており、他のユーザーにユーザーの個人情報や練習記録が漏れることはございません。
                  </Text>
                </Box>
                <Box p={6} bg={cardBgColor} borderRadius="md" boxShadow="md">
                  <Heading as="h3" size="md" mb={4}>
                    記録したデータは第三者へ提供されますか？
                  </Heading>
                  <Text>
                    いいえ。ユーザーの練習記録データは、一切第三者へ提供されることはありません。
                    一方、アプリケーションの改善・分析を目的として内部にてデータを参照する場合がございます。
                    </Text>                                                    
                </Box>
                <Box p={6} bg={cardBgColor} borderRadius="md" boxShadow="md">
                  <Heading as="h3" size="md" mb={4}>
                    制作者は信頼できますか？
                  </Heading>
                  <Text>
                    制作者 irie_2d は競技ディアボロプレイヤーとして実際に大会の出場・入賞経験のある人物です。そのため本アプリケーションは制作者の実際のニーズおよび練習に基づき作成された実績のあるアプリケーションです。
                    irie_2d の人間性という観点につきましては、賛否の分かれるものかと存じますため、言及を差し控えさせていただきます。
                  </Text>                                                    
                </Box>
                <Box p={6} bg={cardBgColor} borderRadius="md" boxShadow="md">
                  <Heading as="h3" size="md" mb={4}>
                    制作者はやっぱり信頼できません。この人にデータを見られたくないです。
                  </Heading>
                  <Text>
                    制作者が信頼できない場合、ご自身でアプリケーションをデプロイすることも可能です。<br/>
                    本アプリケーションコードは OSS のソフトウェアとして公開されておりますため、そちらを元に作成ください。(デプロイの手順等のサポートはいたしかねる点ご了承ください。)<br/>
                    <a href="https://github.com/KIrie-0217/routineum" target="_blank" rel="noopener noreferrer">https://github.com/KIrie-0217/routineum</a>                  
                  </Text>                                                    
                </Box>
              </SimpleGrid>
            </Box>

          </VStack>
        </Container>
      </Box>
    </PublicLayout>
  );
}
