# トラブルシューティングガイド

## デプロイが更新されない場合

### 問題: デプロイが4日前から更新されていない

#### 解決方法1: Cloudflare Pagesで手動再デプロイ

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **Workers & Pages** → **Pages** に移動
3. プロジェクト `carbon-api-app` を選択
4. **Deployments** タブを開く
5. 最新のデプロイメントの右側にある **⋮** (三点メニュー) をクリック
6. **Retry deployment** を選択

または、新しいデプロイをトリガーする：

1. プロジェクトの設定ページに移動
2. **Settings** → **Builds & deployments** セクション
3. **Trigger new deployment** をクリック
4. ブランチ `main` を選択してデプロイ

#### 解決方法2: ビルド設定を確認

Cloudflare Pagesの設定で以下を確認：

1. **Settings** → **Builds & deployments** に移動
2. 以下の設定を確認：
   - **Build command**: `npm run build && npm run build:cloudflare`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/` (空白)
   - **Node.js version**: `20`

#### 解決方法3: ビルドログを確認

1. **Deployments** タブで最新のデプロイメントを選択
2. **Build logs** を確認
3. エラーがあれば修正

### 問題: `/auth/callback` にアクセスできない

#### 確認事項

1. **デプロイが完了しているか確認**
   - Cloudflare Pagesのダッシュボードで最新のデプロイメントが成功しているか確認

2. **ルーティング設定を確認**
   - `src/app/auth/callback/route.ts` が存在するか確認
   - ファイルが正しくコミット・プッシュされているか確認

3. **ビルドログを確認**
   - `/auth/callback` がビルドに含まれているか確認
   - エラーがないか確認

#### 解決方法

1. **最新のコードがプッシュされているか確認**
   ```bash
   git log --oneline -5
   git push origin main
   ```

2. **Cloudflare Pagesで再デプロイ**
   - 上記の「解決方法1」を実行

3. **環境変数が設定されているか確認**
   - Cloudflare Pagesの **Settings** → **Environment variables** で以下が設定されているか確認：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## よくあるエラーと解決方法

### ビルドエラー: "ENOENT: no such file or directory"

**原因**: `.next` ディレクトリが不完全

**解決方法**:
```bash
# ローカルで .next を削除して再ビルド
Remove-Item -Recurse -Force .next
npm run build
```

### デプロイエラー: "Build failed"

**原因**: ビルドコマンドが正しくない、または環境変数が不足

**解決方法**:
1. Cloudflare Pagesのビルドログを確認
2. ビルドコマンドを確認: `npm run build && npm run build:cloudflare`
3. 環境変数がすべて設定されているか確認

### ルーティングエラー: "404 Not Found"

**原因**: ルートファイルが正しくビルドされていない

**解決方法**:
1. ルートファイルが `src/app/` ディレクトリに正しく配置されているか確認
2. ファイル名が正しいか確認（例: `route.ts`）
3. 再デプロイを実行

## デプロイの確認方法

### 1. Cloudflare Pagesのダッシュボードで確認

1. **Workers & Pages** → **Pages** → プロジェクトを選択
2. **Deployments** タブで最新のデプロイメントの状態を確認
3. **Success** と表示されていれば成功

### 2. ブラウザで確認

1. デプロイされたURLにアクセス（例: `https://carbon-api-app.pages.dev`）
2. ページが正しく表示されるか確認
3. コンソールでエラーがないか確認（F12 → Console）

### 3. ビルドログで確認

1. **Deployments** タブでデプロイメントを選択
2. **Build logs** を開く
3. エラーや警告がないか確認

