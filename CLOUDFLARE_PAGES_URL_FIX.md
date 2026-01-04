# Cloudflare Pages URL の問題解決

## 問題: WorkersのURLが表示される

Cloudflare Pagesのプロジェクトなのに、`*.workers.dev` のURLが表示される場合、以下の原因が考えられます。

## 解決方法

### 1. プロジェクトの種類を確認

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **Workers & Pages** に移動
3. 左側のメニューで以下を確認：
   - **Pages** を選択しているか確認
   - **Workers** を選択していないか確認

### 2. Cloudflare Pagesプロジェクトを確認

1. **Workers & Pages** → **Pages** に移動
2. プロジェクト一覧を確認
3. プロジェクト名を確認（例: `carbon-api-app`）
4. プロジェクトをクリックして開く

### 3. 正しいURLを確認

Cloudflare Pagesのプロジェクトでは、以下の場所でURLを確認できます：

1. プロジェクトのダッシュボードの上部
2. **Deployments** タブ → 成功したデプロイメントのURL
3. **Custom domains** タブ（カスタムドメインを設定している場合）

**正しいURL形式:**
- `https://[プロジェクト名].pages.dev`
- 例: `https://carbon-api-app.pages.dev`

**間違ったURL形式（Workers）:**
- `https://[プロジェクト名].[アカウント名].workers.dev`
- 例: `https://carbon-api.haruto030808.workers.dev`

### 4. プロジェクトがWorkersとして作成されている場合

もしプロジェクトがWorkersとして作成されている場合：

1. **Workers & Pages** → **Workers** を確認
2. 間違ってWorkersプロジェクトを作成していないか確認
3. 必要に応じて、正しくCloudflare Pagesプロジェクトを作成

### 5. 新規にCloudflare Pagesプロジェクトを作成

既存のプロジェクトがWorkersの場合、新規にPagesプロジェクトを作成：

1. **Workers & Pages** → **Pages** に移動
2. **Create a project** → **Connect to Git** をクリック
3. GitHubリポジトリを選択
4. 設定を入力：
   - **Project name**: `carbon-api-app`
   - **Production branch**: `main`
   - **Framework preset**: `Next.js`
   - **Build command**: `npm run build:cloudflare`
   - **Build output directory**: `.vercel/output/static`
5. 環境変数を設定
6. **Save and Deploy** をクリック

### 6. デプロイ後の確認

デプロイが完了したら：

1. **Deployments** タブで成功したデプロイメントを確認
2. デプロイメントのURLを確認（`*.pages.dev` の形式であることを確認）
3. そのURLにアクセスして動作確認

## 確認チェックリスト

- [ ] **Workers & Pages** → **Pages** を選択している
- [ ] プロジェクト名が正しい（例: `carbon-api-app`）
- [ ] URLが `*.pages.dev` の形式である
- [ ] デプロイが成功している
- [ ] 環境変数が設定されている

