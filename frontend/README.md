# Shisha Log Frontend

シーシャセッションを記録・管理するReact SPAアプリケーション

## 機能

- **認証システム**: ユーザー登録・ログイン・JWT認証
- **プロフィール管理**: ユーザー情報の表示・編集
- **セッション記録**: シーシャセッションの詳細記録
  - 日時、店舗名、ミックス名
  - フレーバーとブランドの記録
  - 注文詳細とメモ
- **セッション管理**: 一覧表示・詳細表示・編集・削除
- **レスポンシブデザイン**: モバイル・デスクトップ対応

## 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite
- **ルーティング**: React Router DOM v6
- **スタイリング**: Tailwind CSS
- **HTTP クライアント**: Axios
- **フォーム**: React Hook Form + Zod

## セットアップ

1. **依存関係のインストール**
   ```bash
   npm install
   ```

2. **環境変数の設定**
   ```bash
   cp .env.example .env
   ```
   必要に応じて`.env`ファイルのAPIベースURLを調整してください。

3. **SSL証明書の生成（初回のみ）**
   ```bash
   mkdir -p certs
   openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Development/OU=IT/CN=localhost"
   ```

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

5. **ブラウザでアクセス**
   https://localhost:3000
   
   ⚠️ **注意**: 初回アクセス時に「安全でない」という警告が表示されますが、これは自己署名証明書を使用しているためです。開発環境では「詳細設定」→「localhost にアクセスする（安全でない）」をクリックして続行してください。

## バックエンド連携

このフロントエンドは以下のバックエンドAPIと連携します：
- ベースURL: `http://localhost:8080/api/v1`
- 認証: JWT Bearer Token
- CORS対応が必要

詳細なAPI仕様は`../backend/API.md`を参照してください。

## ビルド

```bash
# 本番ビルド
npm run build

# ビルドファイルのプレビュー
npm run preview

# 型チェック
npm run typecheck

# リント
npm run lint
```

## プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
├── hooks/              # カスタムフック
├── pages/              # ページコンポーネント
├── services/           # API サービス
├── types/              # TypeScript 型定義
└── utils/              # ユーティリティ関数
```

## 主な機能詳細

### 認証フロー
1. ユーザー登録時に自動でプロフィールが作成される
2. JWTトークンがlocalStorageに保存される
3. 保護されたルートは認証チェックを行う
4. トークン期限切れ時は自動ログアウト

### セッション記録
- 複数フレーバーの記録が可能
- 日時の設定（デフォルトは現在時刻）
- 自由記述のメモ機能
- 注文詳細の記録

### データ管理
- ページネーション対応の一覧表示
- セッションの詳細表示・編集・削除
- プロフィール情報の更新
- エラーハンドリングとローディング状態