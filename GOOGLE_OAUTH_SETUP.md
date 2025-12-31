# Google OAuth 設定ガイド

## エラー: "redirect_uri_mismatch" (Error 400)

このエラーは、Google OAuth と Supabase のリダイレクト URI 設定が一致していない場合に発生します。

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

### ステップ 2: Google Cloud Console での OAuth 設定

1. [Google Cloud Console](https://console.cloud.google.com) にログイン
2. プロジェクトを選択（または新規作成）
3. **APIs & Services** → **Credentials** に移動
4. **OAuth 2.0 Client IDs** セクションで、既存のクライアントを選択するか、**+ CREATE CREDENTIALS** → **OAuth client ID** をクリック
5. 初回の場合、**OAuth consent screen** の設定が必要です：
   - **User Type**: External（開発中）または Internal（Google Workspace）
   - **App name**: 任意の名前（例: "Carbon Workspace"）
   - **User support email**: あなたのメールアドレス
   - **Developer contact information**: あなたのメールアドレス
   - **Save and Continue** をクリック
   - **Scopes** はデフォルトのまま **Save and Continue**
   - **Test users** にテスト用のメールアドレスを追加（開発中のみ）
   - **Save and Continue**
6. **OAuth client ID** を作成：
   - **Application type**: Web application
   - **Name**: 任意の名前（例: "Carbon Workspace Dev"）
   - **Authorized redirect URIs**: 以下を追加
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
     - `<your-project-ref>` は Supabase のプロジェクト参照IDです
     - 確認方法: Supabase Dashboard → **Project Settings** → **General** → **Reference ID**
     - ⚠️ **重要**: GoogleにはアプリのURL（`localhost:3000`）ではなく、**SupabaseのURL**を登録します
7. **Create** をクリック
8. **Client ID** と **Client Secret** をコピー（次のステップで使用）

### ステップ 3: Supabase での Google プロバイダー設定

1. Supabase Dashboard → **Authentication** → **Providers** に移動
2. **Google** を有効化
3. **Client ID** と **Client Secret** を入力（Google Cloud Console から取得）
4. **Save** をクリック

## 確認事項

- ✅ Supabase の Redirect URLs に `http://localhost:3000/auth/callback` が登録されている
- ✅ Supabase の Site URL が `http://localhost:3000` に設定されている（開発環境）
- ✅ Google Cloud Console の Authorized redirect URIs に Supabase のコールバック URL が登録されている
- ✅ Supabase で Google プロバイダーが有効化されている
- ✅ Google Cloud Console の Client ID と Client Secret が Supabase に正しく設定されている

## 開発環境での完全な設定例

### Supabase 設定
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: 
  - `http://localhost:3000/auth/callback`

### Google Cloud Console 設定
- **Application type**: Web application
- **Authorized redirect URIs**: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
  （`abcdefghijklmnop` はあなたのプロジェクト参照IDに置き換え）

これで、ドメインがなくても開発環境でGoogleログインが動作します！

## トラブルシューティング

### まだエラーが発生する場合

1. **ブラウザのキャッシュをクリア**して再試行
2. **Google Cloud Console の設定を再確認**（特に Authorized redirect URIs）
3. **Supabase の Redirect URLs を再確認**（末尾のスラッシュに注意）
4. 開発環境では `http://localhost:3000` を使用（`https` ではない）
5. **OAuth consent screen** が正しく設定されているか確認（特に Test users が追加されているか）

### よくある間違い

- ❌ Google にアプリのコールバック URL (`/auth/callback` や `localhost:3000/auth/callback`) を直接登録する
- ✅ Google には Supabase のコールバック URL (`supabase.co/auth/v1/callback`) を登録する
- ❌ Supabase に Google のコールバック URL を登録する
- ✅ Supabase にはアプリのコールバック URL (`/auth/callback`) を登録する

### 追加の注意点

- Google OAuth は **OAuth consent screen** の設定が必要です（GitHubとは異なります）
- 開発中は **Test users** を追加する必要があります
- 本番環境では、OAuth consent screen を **Publish** する必要があります


