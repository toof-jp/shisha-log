# Route 53 DNS設定ガイド

## 概要

Shisha LogはAWS Route 53を使用してDNS管理を行います。Route 53を使用することで、TerraformでDNSレコードを自動管理し、ヘルスチェックやフェイルオーバーなどの高度な機能を利用できます。

## アーキテクチャ

```
Route 53 Hosted Zone (toof.jp)
├── shisha.toof.jp (A/ALIAS) → CloudFront Distribution
├── api.toof.jp (A) → Lightsail Static IP
└── Health Check → api.toof.jp/health
```

## 設定方法

### 方法1: 新規ドメインをRoute 53で購入する場合

1. **AWS Console → Route 53 → ドメインの登録**
2. 希望のドメイン名を検索して購入
3. ホストゾーンは自動的に作成される

### 方法2: 既存ドメインをRoute 53に移管する場合

1. **現在のレジストラでドメインロックを解除**
2. **認証コード（EPPコード）を取得**
3. **Route 53でドメイン移管を開始**
   ```bash
   # AWS CLIを使用する場合
   aws route53domains transfer-domain \
     --domain-name example.com \
     --auth-code "YOUR-EPP-CODE"
   ```

### 方法3: 外部レジストラを使用しRoute 53でDNSのみ管理する場合（推奨）

1. **Terraformでインフラをデプロイ**
   ```bash
   make infra-unified-apply
   ```

2. **Route 53のネームサーバーを確認**
   ```bash
   make infra-output | grep name_servers
   ```
   
   出力例：
   ```
   route53_name_servers = [
     "ns-123.awsdns-12.com",
     "ns-456.awsdns-34.net",
     "ns-789.awsdns-56.org",
     "ns-012.awsdns-78.co.uk"
   ]
   ```

3. **外部レジストラでネームサーバーを変更**
   - Google Domains、お名前.com等のレジストラにログイン
   - DNS設定でカスタムネームサーバーを選択
   - Route 53のネームサーバー4つを設定

## Terraform設定

### 既存のホストゾーンを使用する場合

Route 53に既にホストゾーンが存在する場合、それを使用するように設定できます。

#### 方法1: ドメイン名で自動検索（推奨）

```hcl
# Route 53 configuration
use_route53 = true
route53_domain_name = "example.com"  # 既存のホストゾーンのドメイン名（末尾のドットは不要）
create_apex_record = false           # サブドメインを使用する場合
subdomain = "shisha"                 # 空文字列でルートドメイン使用

# Domain configuration
domain_name = "shisha.example.com"
backend_domain_name = "api.example.com"
```

**注意**: 複数の同じ名前のホストゾーンがある場合は、ホストゾーンIDを直接指定してください。

#### 方法2: ホストゾーンIDを直接指定

```hcl
# Route 53 configuration
use_route53 = true
route53_domain_name = "example.com"
hosted_zone_id = "Z1234567890ABC"  # 既存のホストゾーンID
create_apex_record = false
subdomain = "shisha"

# Domain configuration
domain_name = "shisha.example.com"
backend_domain_name = "api.example.com"
```

既存のホストゾーンIDを確認する方法：
```bash
# AWS CLIで確認
aws route53 list-hosted-zones

# または
make route53-list-zones
```

### 設定パターン

#### パターン1: サブドメインを使用（推奨）
```hcl
route53_domain_name = "example.com"
subdomain = "shisha"
create_apex_record = false
# 結果: shisha.example.com, api.example.com
```

#### パターン2: ルートドメインを使用
```hcl
route53_domain_name = "example.com"
subdomain = ""
create_apex_record = true
# 結果: example.com, www.example.com, api.example.com
```

## デプロイ手順

1. **ACM証明書の作成（カスタムドメインを使用する場合）**
   ```bash
   make create-acm-cert
   ```

2. **Terraform設定を更新**
   ```bash
   # terraform-unified.tfvarsを編集
   vim infra/environments/prod/terraform-unified.tfvars
   ```

3. **インフラをデプロイ**
   ```bash
   make infra-unified-init
   make infra-unified-plan
   make infra-unified-apply
   ```

4. **DNS伝播を待つ**
   ```bash
   # DNSレコードの確認
   dig shisha.example.com
   dig api.example.com
   
   # 通常5-30分で伝播
   ```

## Route 53の機能

### ヘルスチェック

Terraformで自動的に設定される：
- **エンドポイント**: `https://api.example.com/health`
- **間隔**: 30秒
- **失敗しきい値**: 3回
- **プロトコル**: HTTPS

### レコードタイプ

- **Aレコード**: api.example.com → Lightsail IP
- **ALIASレコード**: shisha.example.com → CloudFront
- **CNAMEレコード**: www.example.com → CloudFront（オプション）

### 料金

- **ホストゾーン**: $0.50/月
- **クエリ**: $0.40/100万クエリ（最初の10億クエリ）
- **ヘルスチェック**: $0.50/月（HTTPSエンドポイント）

## トラブルシューティング

### 複数のホストゾーンエラー

エラー: `multiple Route 53 Hosted Zones matched`

解決方法：
1. ホストゾーン一覧を確認：
   ```bash
   aws route53 list-hosted-zones --query "HostedZones[?Name=='example.com.']"
   ```

2. 正しいホストゾーンIDを特定して、terraform.tfvarsで直接指定：
   ```hcl
   route53_hosted_zone_id = "Z1234567890ABC"
   ```

### DNS伝播の確認

```bash
# Route 53のネームサーバーに直接問い合わせ
dig @ns-123.awsdns-12.com shisha.example.com

# グローバルDNS伝播の確認
curl -s "https://dns.google/resolve?name=shisha.example.com&type=A" | jq
```

### ネームサーバーが反映されない

1. レジストラでの設定を再確認
2. 24-48時間待つ（TTLによる）
3. レジストラのサポートに問い合わせ

### CloudFrontエイリアスレコードエラー

```bash
# CloudFront配布のホストゾーンIDを確認
aws cloudfront get-distribution --id E1234567890ABC \
  --query 'Distribution.DistributionConfig.Aliases'
```

### ヘルスチェックが失敗する

```bash
# ヘルスチェックの詳細を確認
aws route53 get-health-check --health-check-id XXXXXX

# Lightsailのセキュリティグループを確認
aws lightsail get-instance --instance-name shisha-log-prod
```

## ベストプラクティス

1. **TTL設定**
   - 開発時: 60秒（変更を素早く反映）
   - 本番環境: 300秒以上（キャッシュ効率向上）

2. **セキュリティ**
   - Route 53のアクセスログを有効化
   - IAMポリシーで最小権限を設定
   - DNSSECの有効化を検討

3. **監視**
   - CloudWatchでヘルスチェックアラームを設定
   - クエリログを有効化して分析

4. **災害対策**
   - セカンダリリージョンへのフェイルオーバー設定
   - バックアップDNSプロバイダの検討

## 外部レジストラとの連携

### Google Domains
1. DNS → カスタムネームサーバー
2. Route 53の4つのネームサーバーを入力

### お名前.com
1. ドメイン詳細 → ネームサーバー設定
2. 「その他のネームサーバーを使う」を選択
3. Route 53のネームサーバーを設定

### Cloudflare Registrar
1. DNS設定をCloudflareからRoute 53に変更
2. ネームサーバーをRoute 53のものに更新

## 関連ドキュメント

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 完全なデプロイメントガイド
- [ARCHITECTURE.md](./ARCHITECTURE.md) - システムアーキテクチャ
- [AWS Route 53 Documentation](https://docs.aws.amazon.com/route53/)