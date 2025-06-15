# 開発環境構築ガイド

## 開発環境の要件

### 必須ソフトウェア
- **Go** 1.21以上
- **Node.js** 18以上
- **Docker** & Docker Compose
- **PostgreSQL** 14以上（Supabase経由）
- **Make**（オプション）

### 推奨ツール
- **Air** - Go hot reload
- **AWS CLI** - デプロイメント用
- **Supabase CLI** - データベース管理

## セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でプロジェクト作成
2. プロジェクトURLとAPIキーを取得
3. データベースパスワードを設定

### 2. データベースのマイグレーション

```bash
# Supabase CLIのインストール
npm install -g supabase

# プロジェクトとリンク
supabase link --project-ref <your-project-ref>

# マイグレーション実行
supabase db push backend/migrations/20250106_password_auth.sql
```

### 3. 環境変数の設定

```bash
# .envファイルを作成
make setup-env

# 必須の環境変数を設定
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=$(openssl rand -base64 64)
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

### 4. 開発サーバーの起動

```bash
# バックエンド（ホットリロード付き）
make backend-dev

# フロントエンド（別ターミナル）
make frontend-dev
```

## 開発のヒント

### バックエンド開発

```bash
# 新しいハンドラーを追加
# internal/api/your_handler.go

# テストの実行
make backend-test

# 特定のテストを実行
go test -v ./internal/api -run TestYourHandler

# lintの実行
make backend-lint
```

### フロントエンド開発

```bash
# コンポーネントの作成
# app/components/YourComponent.tsx

# 型チェック
make frontend-typecheck

# lintの実行
make frontend-lint
```

### データベース操作

```bash
# Supabase Studio（GUI）を開く
supabase db remote

# SQLを直接実行
supabase db execute -f your_query.sql
```

## デバッグ

### バックエンドのデバッグ

1. VSCodeの場合、`.vscode/launch.json`を作成：
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "go",
      "request": "launch",
      "mode": "debug",
      "program": "${workspaceFolder}/backend/cmd/server",
      "env": {
        "PORT": "8080"
      },
      "envFile": "${workspaceFolder}/.env"
    }
  ]
}
```

### フロントエンドのデバッグ

React Developer Toolsを使用：
1. Chrome/Firefox拡張機能をインストール
2. コンポーネントツリーの確認
3. stateとpropsの検査

### APIのデバッグ

```bash
# ヘルスチェック
curl http://localhost:8080/health

# ログイン
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","password":"Test1234"}'

# 認証付きリクエスト
curl http://localhost:8080/api/v1/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## トラブルシューティング

### よくある問題

**ポートが使用中**
```bash
# 8080ポートを使用しているプロセスを確認
lsof -i :8080
# プロセスを終了
kill -9 <PID>
```

**CORS エラー**
- `.env`の`ALLOWED_ORIGINS`を確認
- フロントエンドのURLが含まれているか確認

**データベース接続エラー**
- Supabaseプロジェクトがアクティブか確認
- DATABASE_URLが正しいか確認
- ファイアウォール設定を確認

## コーディング規約

### Go
- `gofmt`でフォーマット
- エラーは必ず処理
- テストを書く

### TypeScript/React
- 関数コンポーネントを使用
- TypeScriptの型を活用
- カスタムフックでロジックを分離

### Git
- conventional commitsを使用
- feature/fix/docsプレフィックス
- PRにはテストを含める