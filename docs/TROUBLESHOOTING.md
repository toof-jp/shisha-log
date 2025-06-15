# トラブルシューティングガイド

## デプロイメント関連

### ❌ Error: S3_BUCKET_NAME not set

**原因**: インフラストラクチャがまだデプロイされていない

**解決方法**:
```bash
# 1. インフラをデプロイ
make infra-unified-apply

# 2. 出力を確認
make infra-output

# 3. .envに追加
S3_BUCKET_NAME=shisha-log-prod-frontend
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
```

### ❌ Error: ECR_ALIAS environment variable not set

**原因**: ECR_ALIASが.envに設定されていない

**解決方法**:
```bash
# ECR aliasを確認
aws ecr-public describe-registries --region us-east-1

# .envに追加
ECR_ALIAS=your-alias
```

### ❌ InvalidViewerCertificate: Missing ACMCertificateArn

**原因**: カスタムドメインを使用しているがACM証明書が設定されていない

**解決方法**:
```bash
# オプション1: CloudFrontデフォルトドメインを使用
# terraform-unified.tfvarsで以下を確認
domain_name = ""  # 空にする

# オプション2: ACM証明書を作成
make create-acm-cert
# ARNを.envに追加
ACM_CERTIFICATE_ARN=arn:aws:acm:us-east-1:xxx:certificate/xxx
```

### ❌ CloudFront: origin name cannot be an IP address

**原因**: CloudFrontのオリジンにIPアドレスを直接指定している

**解決方法**:
```hcl
# terraform-unified.tfvarsに追加
backend_domain_name = "api.shisha.toof.jp"
```

## 開発環境関連

### ❌ ポート8080が使用中

**症状**: `bind: address already in use`

**解決方法**:
```bash
# 使用中のプロセスを確認
lsof -i :8080

# プロセスを終了
kill -9 <PID>

# または別のポートを使用
PORT=8081 make backend-dev
```

### ❌ CORS エラー

**症状**: ブラウザコンソールに`CORS policy`エラー

**解決方法**:
```bash
# .envのALLOWED_ORIGINSを確認
ALLOWED_ORIGINS=http://localhost:5173,https://localhost:5173

# バックエンドを再起動
make backend-dev
```

### ❌ データベース接続エラー

**症状**: `connection refused`または`no such host`

**解決方法**:
```bash
# 1. Supabaseプロジェクトがアクティブか確認
# 2. DATABASE_URLを確認
# 3. ネットワーク接続を確認
ping db.xxxxx.supabase.co
```

## フロントエンド関連

### ❌ 自己署名証明書エラー

**症状**: `NET::ERR_CERT_AUTHORITY_INVALID`

**解決方法**:
1. Chromeで「詳細設定」→「(安全でない)サイトへ移動」
2. または`http://localhost:5173`を使用（HTTPSなし）

### ❌ ビルドエラー: Cannot find module

**解決方法**:
```bash
# node_modulesを削除して再インストール
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Docker関連

### ❌ ECR Public ログインエラー

**症状**: `no basic auth credentials`

**解決方法**:
```bash
# 再ログイン
aws ecr-public get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin public.ecr.aws
```

### ❌ Docker build失敗

**解決方法**:
```bash
# キャッシュをクリアして再ビルド
docker build --no-cache -t shisha-log .

# Dockerデーモンを再起動
sudo systemctl restart docker
```

## Terraform関連

### ❌ AWS認証エラー

**症状**: `InvalidClientTokenId`

**解決方法**:
```bash
# AWS認証情報を確認
aws sts get-caller-identity

# 必要に応じて再設定
aws configure
```

### ❌ Terraform state lock

**症状**: `Error acquiring the state lock`

**解決方法**:
```bash
# ロックを強制解除（注意して使用）
terraform force-unlock <LOCK_ID>
```

## よくある質問

### Q: ローカルでHTTPSが必要？

A: フロントエンド開発では自己署名証明書でHTTPSを使用しています。本番環境のセキュリティ要件をローカルでも再現するためです。

### Q: Supabaseの無料プランで大丈夫？

A: 開発とテストには十分です。本番環境では使用量に応じてアップグレードを検討してください。

### Q: なぜ統一ドメイン構成？

A: CORSの設定が簡単になり、SEOにも有利です。また、管理するドメインが1つで済みます。

## サポート

解決しない問題がある場合：

1. [GitHub Issues](https://github.com/toof-jp/shisha-log/issues)で報告
2. エラーログを含めて詳細に記載
3. 環境情報（OS、バージョン等）を含める