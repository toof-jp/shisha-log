# クイックスタートガイド

5分でShisha Logを起動する手順です。

## 前提条件

- Git
- Node.js 18+
- Go 1.21+
- Docker
- AWS CLI（デプロイする場合）

## 1. リポジトリのクローン

```bash
git clone https://github.com/toof-jp/shisha-log.git
cd shisha-log
```

## 2. 環境設定

```bash
# 環境ファイルのセットアップ
make setup-env

# .envファイルを編集
# 最低限以下を設定：
# - Supabase関連の認証情報
# - JWT_SECRET（ランダムな文字列）
# - DATABASE_URL
```

## 3. 依存関係のインストール

```bash
# すべての依存関係をインストール
make install
```

## 4. 開発サーバーの起動

### ターミナル1: バックエンド
```bash
make backend-dev
# http://localhost:8080 で起動
```

### ターミナル2: フロントエンド
```bash
make frontend-dev
# https://localhost:5173 で起動
```

## 5. 動作確認

1. https://localhost:5173 にアクセス
2. 新規ユーザー登録
3. ログイン
4. シーシャセッションの記録

## よく使うコマンド

```bash
# ヘルプ表示
make help

# テスト実行
make backend-test

# ビルド
make backend-build
make frontend-build

# デプロイ（要AWS設定）
make deploy-all
```

## 次のステップ

- [デプロイメントガイド](DEPLOYMENT.md) - 本番環境へのデプロイ
- [API仕様書](http://localhost:8080/swagger/index.html) - Swagger UIでAPIを確認
- [アーキテクチャ](ARCHITECTURE.md) - システム構成の理解