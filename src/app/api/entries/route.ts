export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const apiKey = request.headers.get('x-api-key');
    const cookieStore = await cookies();

    if (!id) {
      return NextResponse.json({ error: '削除対象のIDが必要です' }, { status: 400 });
    }

    let orgId: string | null = null;
    let supabase;

    // --- 認証ロジック ---
    if (apiKey) {
      // A. APIキー認証の場合
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey));
      const hashedInputKey = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      const { data: keyRecord } = await supabase
        .from('api_keys').select('org_id').eq('hashed_key', hashedInputKey).single();
      
      if (!keyRecord) return NextResponse.json({ error: '無効なAPIキー' }, { status: 403 });
      orgId = keyRecord.org_id;
    } else {
      // B. セッション認証（ブラウザ）の場合
      supabase = createServerClient(
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

      // 組織IDの取得 (Metadataから優先的に取得)
      orgId = user.user_metadata?.org_id;
      if (!orgId) {
        const { data: keyRec } = await supabase.from('api_keys').select('org_id').eq('user_id', user.id).limit(1).maybeSingle();
        orgId = keyRec?.org_id;
      }
    }

    if (!orgId) return NextResponse.json({ error: '組織IDが見つかりません' }, { status: 403 });

    // --- 削除実行 ---
    // 安全のため、削除対象のIDだけでなく、組織ID(org_id)も一致することを確認します
    const { error: deleteError } = await supabase
      .from('activity_entries')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId);

    if (deleteError) {
      console.error('Delete Error:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Delete API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}