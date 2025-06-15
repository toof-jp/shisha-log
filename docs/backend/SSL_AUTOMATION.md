# SSL証明書自動化ガイド

このガイドでは、Lightsailインスタンスで SSL証明書を自動的に設定する方法を説明します。

## 概要

SSL証明書の自動化により：
- インスタンス起動後、自動的にSSL証明書を取得
- DNS伝播を待機してから証明書を取得
- 証明書の自動更新設定
- **BuyPass Go SSL**を使用（Let's Encryptのレート制限を回避）

## 自動化の仕組み

### 1. DNS伝播待機
- インスタンス起動5分後に自動実行
- 最大30分間、DNS伝播を待機
- 1分ごとにDNSをチェック

### 2. SSL証明書取得
- BuyPass Go SSLから無料SSL証明書を取得
- Nginxに自動設定
- HTTPSリダイレクト設定
- Let's Encryptと同等の信頼性

### 3. 自動更新
- Cronで毎日2時に更新チェック
- 期限30日前に自動更新

## 設定方法

### 方法1: Route53を使用（完全自動化）

```hcl
# terraform.tfvars に追加
create_dns_record = true
hosted_zone_name  = "shisha.toof.jp"  # Route53のホストゾーン名

# 環境変数は通常通り設定
export TF_VAR_supabase_url="..."
# ... 他の環境変数

# デプロイ
terraform apply -var-file=environments/prod/terraform.tfvars
```

これにより：
1. Lightsailインスタンス作成
2. Static IP割り当て
3. Route53にAレコード自動作成
4. 5分後にSSL証明書自動取得

### 方法2: 外部DNS使用（半自動）

```bash
# 1. Terraformでインフラ構築
terraform apply -var-file=environments/prod/terraform.tfvars

# 2. Static IPを確認
terraform output static_ip_address

# 3. DNSプロバイダーでAレコードを設定
# api.shisha.toof.jp → [STATIC_IP]

# 4. SSL証明書は自動的に取得される（5分後）
```

## 手動でSSL証明書を設定

自動化がうまくいかない場合：

```bash
# SSHでインスタンスに接続
ssh ubuntu@[STATIC_IP]

# SSL設定スクリプトを実行
sudo /opt/shisha-log/setup-ssl.sh

# または手動で（BuyPass）
sudo certbot --nginx -d api.shisha.toof.jp \
  --non-interactive --agree-tos --email admin@shisha.toof.jp \
  --server 'https://api.buypass.com/acme/directory'
```

## ログの確認

### SSL設定のログ
```bash
# systemdのログを確認
sudo journalctl -u setup-ssl.service -f

# タイマーの状態確認
sudo systemctl status setup-ssl.timer
sudo systemctl status setup-ssl.service
```

### Nginxのログ
```bash
# アクセスログ
sudo tail -f /var/log/nginx/access.log

# エラーログ
sudo tail -f /var/log/nginx/error.log
```

## トラブルシューティング

### DNS伝播が遅い場合
```bash
# DNSの確認
dig api.shisha.toof.jp
nslookup api.shisha.toof.jp

# 手動でSSL設定を再実行
sudo systemctl start setup-ssl.service
```

### 証明書の取得に失敗
```bash
# Certbotのログ確認
sudo less /var/log/letsencrypt/letsencrypt.log

# ポート80/443が開いているか確認
sudo netstat -tlnp | grep -E ':80|:443'

# Nginxの設定確認
sudo nginx -t
```

### 証明書の状態確認
```bash
# 証明書の一覧
sudo certbot certificates

# 証明書の詳細
sudo openssl x509 -in /etc/letsencrypt/live/api.shisha.toof.jp/cert.pem -text -noout

# 手動更新テスト（BuyPass）
sudo certbot renew --dry-run --server 'https://api.buypass.com/acme/directory'
```

## セキュリティ設定

### Nginx SSL設定の強化
```nginx
# /etc/nginx/sites-available/shisha-log に追加
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
add_header Strict-Transport-Security "max-age=31536000" always;
```

### ファイアウォール設定
```bash
# HTTPSのみ許可したい場合
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw deny 80/tcp
sudo ufw enable
```

## 証明書の管理

### 手動更新
```bash
sudo certbot renew --nginx --server 'https://api.buypass.com/acme/directory'
```

### 証明書の削除
```bash
sudo certbot delete --cert-name api.shisha.toof.jp
```

### 新しいドメインの追加
```bash
sudo certbot --nginx -d api.shisha.toof.jp -d www.api.shisha.toof.jp \
  --server 'https://api.buypass.com/acme/directory'
```

## BuyPass vs Let's Encrypt

### なぜBuyPassを使用するか？

1. **レート制限の回避**
   - Let's Encrypt: 同一ドメインに対して週5証明書まで
   - BuyPass: より緩やかな制限

2. **同等の信頼性**
   - 主要ブラウザでサポート
   - 無料SSL証明書
   - ACME v2プロトコル対応

3. **互換性**
   - Certbotで同じように使用可能
   - 設定変更は`--server`オプションのみ

## ベストプラクティス

1. **DNS TTLを短くする**
   - デプロイ前にTTLを300秒に設定
   - 迅速なDNS伝播のため

2. **ステージング環境でテスト**
   - 開発環境で自動化をテスト
   - 本番環境適用前に検証

3. **監視設定**
   - SSL証明書の有効期限監視
   - 自動更新の成功確認

4. **バックアップ**
   - 証明書のバックアップ
   - Nginx設定のバックアップ