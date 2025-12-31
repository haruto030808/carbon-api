# GitHub OAuth 設定ガイド

## エラー: "The redirect_uri is not associated with this application"

このエラーは、GitHub OAuth App と Supabase のリダイレクト URI 設定が一致していない場合に発生します。

## 解決手順

### ステップ 1: Supabase ダッシュボードでの設定（開発環境）

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. プロジェクトを選択
3. **Authentication** → **URL Configuration** に移動
4. **Redirect URLs** セクションに以下を追加：
   - **開発環境（必須）**: `http://localhost:3000/auth/callback`
   - 本番環境（後で追加）: `https://your-domain.com/auth/callback`
5. **Site URL** も開発環境に設定：
   - `http://localhost:3000` （開発時）
6. **Save** をクリック

> 💡 **重要**: Supabaseは開発環境でも使用できます。localhostのURLを登録すれば、ドメインがなくても開発できます。

### ステップ 2: GitHub OAuth App の設定

1. [GitHub](https://github.com) にログイン
2. **Settings** → **Developer settings** → **OAuth Apps** に移動
3. 使用している OAuth App を選択（または新規作成）
   - 新規作成する場合：
     - **Application name**: 任意の名前（例: "Carbon Workspace Dev"）
     - **Homepage URL**: `http://localhost:3000` （開発環境）
     - **Authorization callback URL**: 下記を参照
4. **Authorization callback URL** に以下を追加：
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   - `<your-project-ref>` は Supabase のプロジェクト参照IDです
   - 確認方法: Supabase Dashboard → **Project Settings** → **General** → **Reference ID**
   - ⚠️ **注意**: GitHubにはアプリのURL（`localhost:3000`）ではなく、**SupabaseのURL**を登録します
5. **Update application** をクリック
6. **Client ID** と **Client Secret** をコピー（次のステップで使用）

### ステップ 3: Supabase での GitHub プロバイダー設定

1. Supabase Dashboard → **Authentication** → **Providers** に移動
2. **GitHub** を有効化
3. **Client ID** と **Client Secret** を入力（GitHub OAuth App から取得）
4. **Save** をクリック

## 確認事項

- ✅ Supabase の Redirect URLs に `http://localhost:3000/auth/callback` が登録されている
- ✅ Supabase の Site URL が `http://localhost:3000` に設定されている（開発環境）
- ✅ GitHub OAuth App の Authorization callback URL に Supabase のコールバック URL が登録されている
- ✅ Supabase で GitHub プロバイダーが有効化されている
- ✅ GitHub OAuth App の Client ID と Client Secret が Supabase に正しく設定されている

## 開発環境での完全な設定例

### Supabase 設定
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: 
  - `http://localhost:3000/auth/callback`

### GitHub OAuth App 設定
- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
  （`abcdefghijklmnop` はあなたのプロジェクト参照IDに置き換え）

これで、ドメインがなくても開発環境でGitHubログインが動作します！

## トラブルシューティング

### まだエラーが発生する場合

1. **ブラウザのキャッシュをクリア**して再試行
2. **GitHub OAuth App の設定を再確認**（特に Authorization callback URL）
3. **Supabase の Redirect URLs を再確認**（末尾のスラッシュに注意）
4. 開発環境では `http://localhost:3000` を使用（`https` ではない）

### よくある間違い

- ❌ GitHub にアプリのコールバック URL (`/auth/callback`) を直接登録する
- ✅ GitHub には Supabase のコールバック URL (`supabase.co/auth/v1/callback`) を登録する
- ❌ Supabase に GitHub のコールバック URL を登録する
- ✅ Supabase にはアプリのコールバック URL (`/auth/callback`) を登録する

