import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Cloudflare Pages (Edge Runtime) 用の指定
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // 1. Supabaseクライアントの初期化 (環境変数から直接生成)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
    );

    const { name, org_id } = await request.json();

    // 2. 認証チェック (Cookieからセッションを確認)
    const cookieStore = await cookies();
    // Supabaseのセッションクッキー名を動的に取得（プロジェクト参照をURLから抽出）
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1] || '';
    
    // セッションクッキーを取得（複数のクッキー名を試行）
    const authTokenCookie = cookieStore.get(`sb-${projectRef}-auth-token`);
    const accessTokenCookie = cookieStore.get(`sb-${projectRef}-auth-token.0`);
    
    // セッションクッキーからトークンを取得
    let accessToken: string | null = null;
    if (authTokenCookie?.value) {
      try {
        const sessionData = JSON.parse(authTokenCookie.value);
        accessToken = sessionData?.access_token || sessionData?.token || null;
      } catch {
        // クッキーがJSON形式でない場合、直接トークンとして扱う
        accessToken = authTokenCookie.value;
      }
    } else if (accessTokenCookie?.value) {
      accessToken = accessTokenCookie.value;
    }
    
    // Authorizationヘッダーからもトークンを取得（フォールバック）
    if (!accessToken) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // トークンを使用してユーザーを取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. APIキーの生成
    const randomValues = new Uint8Array(24);
    crypto.getRandomValues(randomValues);
    const rawKey = Array.from(randomValues)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const apiKey = `sk_live_${rawKey}`;

    // 4. APIキーのハッシュ化 (Web Crypto API)
    const encoder = new TextEncoder();
    const encodedKeyData = encoder.encode(apiKey); 
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedKeyData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 5. データベースへの保存
    const { data: savedKeyData, error: dbError } = await supabase
      .from('api_keys')
      .insert([
        {
          user_id: user.id,
          org_id: org_id,
          hashed_key: hashedKey,
          name: name || 'Default Key',
          display_key: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ error: 'Failed to store API key' }, { status: 500 });
    }

    return NextResponse.json({
      apiKey: apiKey,
      id: savedKeyData.id,
      name: savedKeyData.name
    });

  } catch (err) {
    console.error('Server Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}