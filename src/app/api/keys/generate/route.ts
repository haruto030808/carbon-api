export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();

    // 1. セッション認証（ブラウザでログインしている本人か確認）
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
          remove(name: string, options: CookieOptions) { cookieStore.delete({ name, ...options }) },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 組織IDをメタデータから取得（さきほどSQLで設定した 0000... を使います）
    const orgId = user.user_metadata?.org_id;
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID not found in metadata' }, { status: 403 });
    }

    // 3. APIキーの生成（ランダムな文字列を作成）
    const apiKey = `sk_${crypto.randomUUID().replace(/-/g, '')}`;
    
    // 4. ハッシュ化（DB保存用。生キーは保存せずハッシュのみ保存する安全な設計）
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey));
    const hashedKey = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // 5. データベースに保存
    // 注意：以前のエラーで user_id カラムがないことが分かったので、org_id と hashed_key のみ保存します
    const { error: insertError } = await supabase
      .from('api_keys')
      .insert({
        org_id: orgId,
        hashed_key: hashedKey,
        name: body.name || 'Production Key',
      });

    if (insertError) {
      console.error('API Key Insert Error:', insertError);
      throw insertError;
    }

    // 6. 生のAPIキーを一度だけ表示するために返す
    return NextResponse.json({ apiKey });

  } catch (err: any) {
    console.error("Generate API Key Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}