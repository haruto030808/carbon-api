export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();

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

    const orgId = user.user_metadata?.org_id;
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID not found' }, { status: 403 });
    }

    // 1. APIキーの生成 (sk_live_ 形式に修正)
    const apiKey = `sk_live_${crypto.randomUUID().replace(/-/g, '')}`;
    
    // 2. ハッシュ化
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey));
    const hashedKey = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // 3. データベースに保存 (key_prefix を sk_live に修正)
    const { error: insertError } = await supabase
      .from('api_keys')
      .insert({
        org_id: orgId,
        hashed_key: hashedKey,
        key_prefix: 'sk_live', // ← ここを sk_live に合わせました
        name: body.name || 'Production Key',
      });

    if (insertError) {
      console.error('API Key Insert Error:', insertError);
      throw insertError;
    }

    return NextResponse.json({ apiKey });

  } catch (err: any) {
    console.error("Generate API Key Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}