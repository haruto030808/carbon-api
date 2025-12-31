# Cloudflare Pages デプロイ設定

## 推奨設定

Cloudflare Pages のダッシュボードで以下の設定を使用してください：

### ビルド設定
- **フレームワークプリセット**: Next.js
- **ビルドコマンド**: `npm run build && npm run build:cloudflare`
- **出力ディレクトリ**: `.vercel/output/static`
- **ルートディレクトリ**: `/` (プロジェクトルート)

### 環境変数
必要な環境変数を Cloudflare Pages のダッシュボードで設定してください。

## 手動デプロイ

ローカルから手動でデプロイする場合：

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build && npm run build:cloudflare

# デプロイ（npx を使用）
npx wrangler pages deploy .vercel/output/static --project-name=carbon-api-app
```

## 注意事項

- `wrangler` は `devDependencies` に含まれていますが、Cloudflare Pages のビルド環境では `npx` を使用することを推奨します
- デプロイコマンドで `wrangler` が見つからない場合は、`npx wrangler` を使用してください

