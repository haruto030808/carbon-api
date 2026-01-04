# Supabase URL設定ガイド

## エラー: "Please provide a valid URL"

このエラーは、SupabaseのURL ConfigurationでURLの形式が正しくない場合に発生します。

## 正しいURL形式

### 開発環境（localhost）

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/auth/callback
```

### 本番環境（Cloudflare Pages）

Cloudflare Pagesのデプロイが完了したら、以下の形式で設定してください：

**Site URL:**
```
https://carbon-api-app.pages.dev
```
（実際のCloudflare PagesのURLに置き換えてください）

**Redirect URLs:**
```
https://carbon-api-app.pages.dev/auth/callback
```
（実際のCloudflare PagesのURLに置き換えてください）

## よくある間違いと解決方法

### ❌ 間違った例

1. **プロトコルがない**
   ```
   localhost:3000/auth/callback
   ```
   → ✅ 正しい: `http://localhost:3000/auth/callback`

2. **末尾にスラッシュがある**
   ```
   http://localhost:3000/auth/callback/
   ```
   → ✅ 正しい: `http://localhost:3000/auth/callback`（末尾のスラッシュなし）

3. **まだ存在しないURLを入力**
   ```
   https://carbon-api-app.pages.dev/auth/callback
   ```
   → デプロイが完了してから設定してください

4. **スペースが含まれている**
   ```
   http://localhost:3000 /auth/callback
   ```
   → ✅ 正しい: `http://localhost:3000/auth/callback`（スペースなし）

## 設定手順

### ステップ1: 開発環境の設定（まずこちらを設定）

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. **Authentication** → **URL Configuration** に移動
4. **Site URL** に以下を入力：
   ```
   http://localhost:3000
   ```
5. **Redirect URLs** セクションで **Add URL** をクリック
6. 以下を入力：
   ```
   http://localhost:3000/auth/callback
   ```
7. **Save** をクリック

### ステップ2: 本番環境の設定（デプロイ後）

1. Cloudflare Pagesでデプロイが完了するまで待つ
2. デプロイが完了したら、Cloudflare PagesのURLを確認
   - 例: `https://carbon-api-app.pages.dev`
3. Supabase Dashboard → **Authentication** → **URL Configuration** に移動
4. **Redirect URLs** セクションで **Add URL** をクリック
5. 以下を入力（実際のURLに置き換え）：
   ```
   https://carbon-api-app.pages.dev/auth/callback
   ```
6. **Site URL** も本番環境のURLに更新（オプション）
7. **Save** をクリック

## URL形式チェックリスト

入力するURLが正しいか確認：

- ✅ `http://` または `https://` で始まっている
- ✅ スペースが含まれていない
- ✅ 末尾にスラッシュがない（`/auth/callback` の後）
- ✅ 実際にアクセス可能なURLである（デプロイ済み）
- ✅ 大文字小文字が正しい

## トラブルシューティング

### まだエラーが出る場合

1. **ブラウザのキャッシュをクリア**して再試行
2. **URLをコピー&ペースト**で入力（手入力のタイプミスを防ぐ）
3. **一度すべてのURLを削除**して、再度追加してみる
4. **開発環境のURLから設定**して、動作確認してから本番環境のURLを追加

### 本番環境のURLが分からない場合

1. Cloudflare Pagesのダッシュボードにログイン
2. **Workers & Pages** → **Pages** に移動
3. プロジェクト `carbon-api-app` を選択
4. **Custom domains** または **Deployments** タブでURLを確認
5. 通常は `https://carbon-api-app.pages.dev` の形式です

