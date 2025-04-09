import React from 'react';
import { Box, Container, Heading, Text, VStack, Link, UnorderedList, ListItem } from '@chakra-ui/react';

export const metadata = {
  title: 'プライバシーポリシー | Routineum',
  description: 'Routineumのプライバシーポリシーについて説明します。',
};

export default function PrivacyPolicy() {
  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="start">
        <Heading as="h1" size="2xl">プライバシーポリシー</Heading>
        
        <Text>
          Routineum（以下、「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
          このプライバシーポリシーでは、当サービスが収集する情報とその使用方法について説明します。
        </Text>

        <Box w="100%">
          <Heading as="h2" size="lg" mb={4}>1. 収集する情報</Heading>
          <VStack align="start" spacing={4}>
            <Box>
              <Heading as="h3" size="md" mb={2}>1.1 アカウント情報</Heading>
              <Text>
                当サービスへの登録時に、以下の情報を収集することがあります：
              </Text>
              <UnorderedList pl={5} mt={2}>
                <ListItem>メールアドレス</ListItem>
                <ListItem>ユーザー名</ListItem>
                <ListItem>パスワード（暗号化して保存）</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={2}>1.2 利用データ</Heading>
              <Text>
                当サービスの利用に関する以下の情報を収集することがあります：
              </Text>
              <UnorderedList pl={5} mt={2}>
                <ListItem>ルーチンや練習の記録</ListItem>
                <ListItem>パフォーマンスデータ</ListItem>
                <ListItem>テクニック情報</ListItem>
                <ListItem>アプリケーション利用状況</ListItem>
              </UnorderedList>
            </Box>

            <Box>
              <Heading as="h3" size="md" mb={2}>1.3 技術情報</Heading>
              <Text>
                当サービスの利用時に、以下の技術情報を自動的に収集することがあります：
              </Text>
              <UnorderedList pl={5} mt={2}>
                <ListItem>IPアドレス</ListItem>
                <ListItem>ブラウザの種類</ListItem>
                <ListItem>デバイス情報</ListItem>
                <ListItem>アクセス日時</ListItem>
                <ListItem>Cookieおよび類似技術による情報</ListItem>
              </UnorderedList>
            </Box>
          </VStack>
        </Box>

        <Box w="100%">
          <Heading as="h2" size="lg" mb={4}>2. 情報の利用目的</Heading>
          <Text>
            収集した情報は、以下の目的で利用します：
          </Text>
          <UnorderedList pl={5} mt={2}>
            <ListItem>サービスの提供および維持</ListItem>
            <ListItem>ユーザー認証および本人確認</ListItem>
            <ListItem>データの分析と可視化機能の提供</ListItem>
            <ListItem>サービスの改善および新機能の開発</ListItem>
            <ListItem>技術的な問題の診断および解決</ListItem>
            <ListItem>ユーザーサポートの提供</ListItem>
          </UnorderedList>
        </Box>

        <Box w="100%">
          <Heading as="h2" size="lg" mb={4}>3. 情報の共有</Heading>
          <Text>
            当サービスは、以下の場合を除き、ユーザーの個人情報を第三者と共有しません：
          </Text>
          <UnorderedList pl={5} mt={2}>
            <ListItem>ユーザーの同意がある場合</ListItem>
            <ListItem>法的要請に応じる必要がある場合</ListItem>
            <ListItem>当サービスの権利、財産、安全を保護する必要がある場合</ListItem>
            <ListItem>サービス提供に必要なパートナー企業（データ処理の委託先など）と共有する場合</ListItem>
          </UnorderedList>
        </Box>

        <Box w="100%">
          <Heading as="h2" size="lg" mb={4}>4. データの保管</Heading>
          <Text>
            当サービスは、Supabaseを利用してデータを安全に保管しています。データは暗号化され、
            不正アクセスや漏洩を防ぐための適切なセキュリティ対策を講じています。
          </Text>
          <Text mt={2}>
            ユーザーデータは、アカウントが有効である限り、または法的義務を果たすために必要な期間保管されます。
            アカウント削除をリクエストした場合、個人データは適切な期間内に削除されます。
          </Text>
        </Box>

        <Box w="100%">
          <Heading as="h2" size="lg" mb={4}>5. ユーザーの権利</Heading>
          <Text>
            ユーザーには以下の権利があります：
          </Text>
          <UnorderedList pl={5} mt={2}>
            <ListItem>個人情報へのアクセス</ListItem>
            <ListItem>個人情報の訂正</ListItem>
            <ListItem>個人情報の削除（「忘れられる権利」）</ListItem>
            <ListItem>データ処理の制限</ListItem>
            <ListItem>データポータビリティ（自分のデータの取得）</ListItem>
            <ListItem>特定の状況下での処理への異議申し立て</ListItem>
          </UnorderedList>
          <Text mt={2}>
            これらの権利を行使するには、下記の連絡先までお問い合わせください。
          </Text>
        </Box>

        <Box w="100%">
          <Heading as="h2" size="lg" mb={4}>6. Cookieの使用</Heading>
          <Text>
            当サービスでは、ユーザー体験の向上やサービス機能の提供のためにCookieを使用しています。
            Cookieは、ブラウザの設定から無効にすることができますが、一部のサービス機能が正常に動作しなくなる可能性があります。
          </Text>
        </Box>

        <Box w="100%">
          <Heading as="h2" size="lg" mb={4}>7. 子どものプライバシー</Heading>
          <Text>
            当サービスは、13歳未満の子どもを対象としていません。13歳未満の子どもから個人情報を収集していることが判明した場合、
            速やかにその情報を削除するための措置を講じます。
          </Text>
        </Box>

        <Box w="100%">
          <Heading as="h2" size="lg" mb={4}>8. プライバシーポリシーの変更</Heading>
          <Text>
            当サービスは、必要に応じてプライバシーポリシーを更新することがあります。
            重要な変更がある場合は、サービス内での通知やメールでお知らせします。
            定期的にこのページを確認することをお勧めします。
          </Text>
        </Box>

        <Box w="100%">
          <Heading as="h2" size="lg" mb={4}>9. お問い合わせ</Heading>
          <Text>
            プライバシーポリシーに関するご質問やご懸念がある場合は、以下の連絡先までお問い合わせください：
          </Text>
          <Text mt={2}>
            メール: kook.cuckoo@gmail.com
          </Text>
        </Box>

        <Text>
          最終更新日: 2025年4月9日
        </Text>
      </VStack>
    </Container>
  );
}
