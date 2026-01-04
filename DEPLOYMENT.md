# デプロイ手順

## Cloudflare Pages へのデプロイ方法

### 方法1: Cloudflare Pages ダッシュボードで直接接続（推奨）

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **Workers & Pages** → **Pages** に移動
3. **Create a project** → **Connect to Git** をクリック
4. GitHubリポジトリ `haruto030808/carbon-api` を選択
5. 以下の設定を入力：
   - **Project name**: `carbon-api-app`
   - **Production branch**: `main`
   - **Framework preset**: `Next.js`
   - **Build command**: `npm run build && npm run build:cloudflare`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/` (空白のまま)
   - **Node.js version**: `20`

6. **Environment variables** セクションで以下を設定：
   ```
   NEXT_PUBLIC_API_KEY=sk_live_your_api_key_here
   NEXT_PUBLIC_ORG_ID=your_org_id_here
   NEXT_PUBLIC_SUPABASE_URL=https://nhstkzvumwjwhldfcrfd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_TZ0PnxjArhcupfn4KCL2qQ_D1Rmcaan
   ```

7. **Save and Deploy** をクリック

### 方法2: GitHub Actions を使用（既に設定済み）

GitHub Actionsを使用する場合は、GitHubリポジトリのSecretsに以下を設定する必要があります：

1. GitHubリポジトリの **Settings** → **Secrets and variables** → **Actions** に移動
2. 以下のSecretsを追加：
   - `CLOUDFLARE_API_TOKEN`: Cloudflare APIトークン
   - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID

**Cloudflare APIトークンの取得方法：**
- [Cloudflare Dashboard](https://dash.cloudflare.com/) → **My Profile** → **API Tokens**
- **Create Token** → **Edit Cloudflare Workers** テンプレートを選択
- 権限: **Account** → **Cloudflare Pages** → **Edit**

**Cloudflare Account IDの取得方法：**
- Cloudflare Dashboardで任意のドメインを選択
- 右側のサイドバーに **Account ID** が表示されます

## 本番環境でのSupabase設定

デプロイ後、SupabaseのリダイレクトURLを本番環境用に更新する必要があります：

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. **Authentication** → **URL Configuration** に移動
4. **Redirect URLs** に本番環境のURLを追加：
   ```
   https://carbon-api-app.pages.dev/auth/callback
   ```
   （実際のCloudflare PagesのURLに置き換えてください）
5. **Site URL** も本番環境のURLに更新
6. **Save** をクリック

## デプロイの確認

デプロイが完了すると、以下のようなURLでアクセスできます：
- `https://carbon-api-app.pages.dev`
- または、カスタムドメインを設定している場合はそのドメイン

## デプロイが更新されない場合

### 手動で再デプロイする方法

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **Workers & Pages** → **Pages** に移動
3. プロジェクト `carbon-api-app` を選択
4. **Settings** → **Builds & deployments** セクションに移動
5. **Trigger new deployment** をクリック
6. ブランチ `main` を選択してデプロイを開始

または、**Deployments** タブから：
1. 最新のデプロイメントの右側にある **⋮** (三点メニュー) をクリック
2. **Retry deployment** を選択

### ビルドログの確認方法

1. **Deployments** タブで最新のデプロイメントを選択
2. **Build logs** を開いてエラーを確認
3. エラーがあれば修正して再デプロイ

## トラブルシューティング

詳細は `TROUBLESHOOTING.md` を参照してください。

### ビルドエラーが発生する場合
- Node.jsのバージョンが20であることを確認
- 環境変数が正しく設定されていることを確認
- Cloudflare Pagesのビルドログを確認

### 認証が動作しない場合
- SupabaseのリダイレクトURLが本番環境のURLに設定されていることを確認
- OAuthプロバイダー（GitHub/Google）のコールバックURLがSupabaseのURLに設定されていることを確認

### `/auth/callback` にアクセスできない場合
- デプロイが完了しているか確認
- ビルドログで `/auth/callback` が含まれているか確認
- 最新のコードがプッシュされているか確認（`git push origin main`）

