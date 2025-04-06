# Routineum

ルーティンの記録と分析のためのウェブアプリケーション。日々の習慣を追跡し、パフォーマンスを視覚化することで継続的な改善をサポートします。

## 技術スタック

- **フロントエンド**: [Next.js 15](https://nextjs.org/) (React 19)
- **UI**: [Chakra UI](https://chakra-ui.com/)
- **認証/データベース**: [Supabase](https://supabase.com/)
- **フォーム管理**: React Hook Form + Zod
- **データ可視化**: Chart.js, React Calendar Heatmap
- **スタイリング**: Emotion
- **言語**: TypeScript

## 機能

- ユーザー認証（ログイン/サインアップ）
- ルーティン記録と管理
- パフォーマンス分析とデータ可視化
- レスポンシブデザイン

## 開発環境のセットアップ

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
   `.env.local.example` をコピーして `.env.local` を作成し、必要な環境変数を設定します。

4. 開発サーバーの起動:

```bash
npm run dev
```

5. ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## プロジェクト構造

```
routineum/
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/      # 再利用可能なコンポーネント
│   ├── contexts/        # React コンテキスト
│   ├── hooks/           # カスタムフック
│   ├── lib/             # ユーティリティライブラリ
│   ├── services/        # API サービス
│   ├── types/           # TypeScript 型定義
│   └── utils/           # ヘルパー関数
├── supabase/            # Supabase 関連ファイル
└── public/              # 静的アセット
```

## デプロイ

このアプリケーションは [Vercel](https://vercel.com) にデプロイすることを推奨します。

```bash
npm run build
```

## ライセンス

MIT
