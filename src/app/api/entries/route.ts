export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: Request) {
  try {
    // Supabaseクライアントの初期化
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) return NextResponse.json({ error: 'APIキーが必要です' }, { status: 401 });
    if (!id) return NextResponse.json({ error: '削除対象のIDが必要です' }, { status: 400 });

    // APIキーの検証
    const encoder = new TextEncoder();
    const keyData = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedInputKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const { data: keyRecord } = await supabase
      .from('api_keys').select('org_id').eq('hashed_key', hashedInputKey).single();

    if (!keyRecord) return NextResponse.json({ error: '無効なAPIキー' }, { status: 403 });

    // 削除実行（自分の組織のデータのみ削除可能）
    const { error: deleteError } = await supabase
      .from('activity_entries')
      .delete()
      .eq('id', id)
      .eq('org_id', keyRecord.org_id); // 安全のため組織IDもチェック

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}