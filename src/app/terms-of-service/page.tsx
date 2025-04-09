import React from 'react';
import { Box, Container, Heading, Text, VStack, Link } from '@chakra-ui/react';

export const metadata = {
  title: 'Routineum - 利用規約',
  description: 'Routineumの利用規約について説明します。',
};

export default function TermsOfService() {
  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={6} align="start">
        <Heading as="h1" size="xl">利用規約</Heading>
        
        <Text>
          この利用規約（以下「本規約」）は、Routineum（以下「当サービス」）の利用条件を定めるものです。
          ユーザーの皆様（以下「ユーザー」）には、本規約に従って当サービスをご利用いただきます。
        </Text>

        <Heading as="h2" size="lg" mt={4}>1. 適用</Heading>
        <Text>
          本規約は、ユーザーと当サービスの利用に関わる一切の関係に適用されるものとします。
          当サービスに登録した時点で、ユーザーは本規約に同意したものとみなします。
        </Text>

        <Heading as="h2" size="lg" mt={4}>2. 登録</Heading>
        <Text>
          当サービスを利用するためには、登録が必要です。
          ユーザーは、自己の責任において、当サービスのアカウントを適切に管理するものとします。
          ユーザーは、いかなる場合にも、アカウントを第三者に譲渡または貸与することはできません。
        </Text>

        <Heading as="h2" size="lg" mt={4}>3. 禁止事項</Heading>
        <Text>
          ユーザーは、以下の行為をしてはなりません。
        </Text>
        <VStack spacing={2} align="start" pl={5}>
          <Text>・法令または公序良俗に違反する行為</Text>
          <Text>・犯罪行為に関連する行為</Text>
          <Text>・当サービスの運営を妨害する行為</Text>
          <Text>・他のユーザーに迷惑をかける行為</Text>
          <Text>・他者の知的財産権を侵害する行為</Text>
          <Text>・当サービスの信用を毀損する行為</Text>
          <Text>・その他、当サービスが不適切と判断する行為</Text>
        </VStack>

        <Heading as="h2" size="lg" mt={4}>4. サービスの変更・停止</Heading>
        <Text>
          当サービスは、ユーザーに通知することなく、サービスの内容を変更したり、提供を停止または中断することができるものとします。
          当サービスは、これによってユーザーに生じた損害について一切の責任を負いません。
        </Text>

        <Heading as="h2" size="lg" mt={4}>5. 保証の否認および免責事項</Heading>
        <Text>
          当サービスは、当サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます）がないことを明示的にも黙示的にも保証しておりません。
          当サービスは、ユーザーに生じたあらゆる損害について一切の責任を負いません。
        </Text>

        <Heading as="h2" size="lg" mt={4}>6. サービス内容の変更等</Heading>
        <Text>
          当サービスは、ユーザーに通知することなく、サービスの内容を変更したり、当サービスの提供を中止することができるものとします。
          当サービスは、これによってユーザーに生じた損害について一切の責任を負いません。
        </Text>

        <Heading as="h2" size="lg" mt={4}>7. 利用規約の変更</Heading>
        <Text>
          当サービスは、必要と判断した場合には、ユーザーに通知することなく本規約を変更することができるものとします。
          本規約の変更後、当サービスの利用を継続した場合、ユーザーは変更後の規約に同意したものとみなされます。
        </Text>

        <Heading as="h2" size="lg" mt={4}>8. 個人情報の取扱い</Heading>
        <Text>
          当サービスは、当サービスの利用によって取得する個人情報については、当サービスの「プライバシーポリシー」に従い適切に取り扱うものとします。
        </Text>

        <Heading as="h2" size="lg" mt={4}>9. 通知または連絡</Heading>
        <Text>
          ユーザーと当サービスとの間の通知または連絡は、当サービスの定める方法によって行うものとします。
          当サービスは、ユーザーから、当サービスが別途定める方式に従った変更届け出がない限り、現在登録されている連絡先が有効なものとみなして当該連絡先へ通知または連絡を行い、これらは、発信時にユーザーへ到達したものとみなします。
        </Text>

        <Heading as="h2" size="lg" mt={4}>10. 権利義務の譲渡の禁止</Heading>
        <Text>
          ユーザーは、当サービスの書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
        </Text>

        <Heading as="h2" size="lg" mt={4}>11. 準拠法・裁判管轄</Heading>
        <Text>
          本規約の解釈にあたっては、日本法を準拠法とします。
          当サービスに関して紛争が生じた場合には、当サービスの本店所在地を管轄する裁判所を専属的合意管轄とします。
        </Text>

        <Box mt={8} mb={4}>
          <Text fontWeight="bold">制定日: 2025年4月9日</Text>
        </Box>

        <Link href="/" color="blue.500">トップページに戻る</Link>
      </VStack>
    </Container>
  );
}
