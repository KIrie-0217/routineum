# Routineum

ルーティンの記録と分析のためのウェブアプリケーション。日々の練習を追跡し、パフォーマンスを視覚化することで継続的な改善をサポートします。

## 概要

Routineum（ルーチニウム）は、ルーチンを効果的に管理し、継続するためのツールです。ユーザーはルーチンの練習を記録できます。データの可視化機能により、長期的な傾向を把握し、自己改善に役立てることができます。

## 主な機能

- **ユーザー認証**：Supabase を利用した安全なログイン/サインアップシステム
- **パフォーマンス管理**：練習や実績の記録と追跡
- **テクニック管理**：スキルや技術の登録と練習記録
- **データ分析**：
  - ヒートマップによる継続状況の可視化
  - グラフによる進捗と傾向の分析
  - ダッシュボードでの総合的なデータ表示
- **レスポンシブデザイン**：あらゆるデバイスでの最適な表示

## 技術スタック

### フロントエンド

- **フレームワーク**: [Next.js 15](https://nextjs.org/) (React 19)
- **UI ライブラリ**: [Chakra UI](https://chakra-ui.com/)
- **スタイリング**: [Emotion](https://emotion.sh/)
- **フォーム管理**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://github.com/colinhacks/zod)
- **データ可視化**:
  - [Chart.js](https://www.chartjs.org/) / [React-Chartjs-2](https://react-chartjs-2.js.org/)
  - [React Calendar Heatmap](https://github.com/kevinsqi/react-calendar-heatmap)
- **アイコン**: [React Icons](https://react-icons.github.io/react-icons/)
- **日付操作**: [date-fns](https://date-fns.org/)

### バックエンド

- **認証/データベース**: [Supabase](https://supabase.com/)
  - PostgreSQL データベース
  - ユーザー認証システム
  - リアルタイムデータ更新
- **API**: RESTful API + Supabase クライアント

### 開発ツール

- **言語**: [TypeScript](https://www.typescriptlang.org/)
- **テスト**: Jest + React Testing Library
- **リンター**: ESLint
- **デプロイ**: [Vercel](https://vercel.com)

## 開発環境のセットアップ

### 前提条件

- Node.js 18.0.0 以上
- npm 9.0.0 以上
- Supabase アカウント

### インストール手順

1. リポジトリをクローン:

```bash
git clone <repository-url>
cd routineum
```

2. 依存関係のインストール:

```bash
npm install
```

3. 環境変数の設定:
   `env.local.example` をコピーして `.env.local` を作成し、必要な環境変数を設定します。

```bash
cp env.local.example .env.local
```

必要な環境変数:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase プロジェクトの URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase の匿名キー

4. 開発サーバーの起動:

```bash
npm run dev
```

5. ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

### テストの実行

```bash
npm test          # すべてのテストを実行
```

## プロジェクト構造

```
routineum/
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API ルート
│   │   ├── auth/        # 認証関連ページ
│   │   ├── dashboard/   # ダッシュボード
│   │   └── performances/# パフォーマンス管理
│   ├── components/      # 再利用可能なコンポーネント
│   ├── contexts/        # React コンテキスト
│   ├── hooks/           # カスタムフック
│   ├── lib/             # ユーティリティライブラリ
│   ├── services/        # API サービス
│   │   ├── dashboardService.ts    # ダッシュボード関連
│   │   ├── performanceService.ts  # パフォーマンス関連
│   │   ├── practiceService.ts     # 練習関連
│   │   ├── techniqueService.ts    # テクニック関連
│   │   ├── techniquePracticeService.ts # テクニック練習関連
│   │   └── contributionService.ts # 貢献関連
│   ├── tests/           # テストファイル
│   ├── types/           # TypeScript 型定義
│   └── utils/           # ヘルパー関数
├── supabase/            # Supabase 関連ファイル
└── public/              # 静的アセット
    ├── file.svg         # アイコン
    ├── globe.svg        # アイコン
    ├── next.svg         # Next.js ロゴ
    ├── vercel.svg       # Vercel ロゴ
    └── window.svg       # アイコン
```

## データモデル

アプリケーションは以下の主要なデータモデルに基づいています：

- **ユーザー**: アプリケーションのユーザー情報
- **パフォーマンス**: 記録された実績や成果
- **テクニック**: 習得すべきスキルや技術
- **練習**: 日々の練習記録
- **テクニック練習**: 特定のテクニックに関する練習記録

## デプロイ

このアプリケーションは [Vercel](https://vercel.com) にデプロイすることを推奨します。

### Vercel へのデプロイ

1. [Vercel](https://vercel.com) アカウントを作成し、GitHub リポジトリと連携します。
2. 新しいプロジェクトを作成し、環境変数を設定します。
3. デプロイを実行します。

```bash
npm run build
vercel --prod
```

## 将来の機能拡張予定

- 目標設定と達成度追跡機能
- ソーシャル機能（友達との共有、チャレンジなど）
- カスタマイズ可能なダッシュボードウィジェット

## 貢献ガイドライン

1. このリポジトリをフォークします
2. 新しいブランチを作成します (`git checkout -b feature/amazing-feature`)
3. 変更をコミットします (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュします (`git push origin feature/amazing-feature`)
5. プルリクエストを作成します

## ライセンス

MIT
