# ECR Public エイリアスの取得方法

## ECR_ALIASとは

ECR Public リポジトリのエイリアスは、リポジトリのURLの一部で、以下の形式で使用されます：
```
public.ecr.aws/[ECR_ALIAS]/[リポジトリ名]
```

## 取得方法

### 方法1: AWS CLIを使用

```bash
# ECR Publicにログイン
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws

# リポジトリ一覧を表示
aws ecr-public describe-registries --region us-east-1

# 出力例:
# {
#     "registries": [
#         {
#             "registryId": "123456789012",
#             "registryArn": "arn:aws:ecr-public::123456789012:registry/default",
#             "registryUri": "public.ecr.aws/a1b2c3d4",
#             "verified": false,
#             "aliases": [
#                 {
#                     "name": "a1b2c3d4",
#                     "status": "ACTIVE",
#                     "primaryRegistryAlias": true,
#                     "defaultRegistryAlias": true
#                 }
#             ]
#         }
#     ]
# }
```

エイリアスは `aliases[0].name` の値です（上記の例では `a1b2c3d4`）。

### 方法2: AWSコンソールから確認

1. [Amazon ECR Public Console](https://console.aws.amazon.com/ecr/public/home?region=us-east-1)にアクセス
2. 左メニューから「Registries」を選択
3. 「Registry alias」列に表示されているのがECR_ALIAS

### 方法3: 既存のリポジトリから確認

既にECR Publicリポジトリを作成している場合：

```bash
# リポジトリ一覧を表示
aws ecr-public describe-repositories --region us-east-1

# 出力のrepositoryUriから確認
# "repositoryUri": "public.ecr.aws/a1b2c3d4/shisha-log"
# この場合、a1b2c3d4がECR_ALIAS
```

## ECR Publicリポジトリの作成（まだ作成していない場合）

```bash
# リポジトリを作成
aws ecr-public create-repository \
    --repository-name shisha-log \
    --region us-east-1

# 作成されたリポジトリのURIを確認
# 出力の"repositoryUri"からECR_ALIASを確認できます
```

## .envファイルへの設定

取得したECR_ALIASを.envファイルに追加：

```bash
# .envファイルに追加
ECR_ALIAS=a1b2c3d4  # あなたのエイリアスに置き換え
```

または環境変数として設定：

```bash
export ECR_ALIAS=a1b2c3d4
```

## 使用例

```bash
# Docker imageをプッシュ
make docker-push

# 手動でプッシュする場合
docker tag shisha-log:latest public.ecr.aws/$ECR_ALIAS/shisha-log:latest
docker push public.ecr.aws/$ECR_ALIAS/shisha-log:latest
```

## トラブルシューティング

### エイリアスが見つからない場合

1. us-east-1リージョンを使用しているか確認
2. ECR Publicへのアクセス権限があるか確認
3. 初めての場合は、まずリポジトリを作成する必要があります

### 権限エラーの場合

以下のIAMポリシーが必要です：
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr-public:GetAuthorizationToken",
                "ecr-public:BatchCheckLayerAvailability",
                "ecr-public:GetRepositoryPolicy",
                "ecr-public:DescribeRepositories",
                "ecr-public:DescribeRegistries",
                "ecr-public:InitiateLayerUpload",
                "ecr-public:UploadLayerPart",
                "ecr-public:CompleteLayerUpload",
                "ecr-public:PutImage"
            ],
            "Resource": "*"
        }
    ]
}
```