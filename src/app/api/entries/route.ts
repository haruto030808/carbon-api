export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey) return NextResponse.json({ error: 'APIキーが必要です' }, { status: 401 });
    if (!id) return NextResponse.json({ error: '削除対象のIDが必要です' }, { status: 400 });

    // APIキーの検証
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedInputKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const { data: keyRecord } = await supabase
      .from('api_keys').select('org_id').eq('hashed_key', hashedInputKey).single();

    if (!keyRecord) return NextResponse.json({ error: '無効なAPIキー' }, { status: 403 });

    // 削除実行（自分の組織のデータのみ削除可能）
    const { error } = await supabase
      .from('activity_entries')
      .delete()
      .eq('id', id)
      .eq('org_id', keyRecord.org_id); // 安全のため組織IDもチェック

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}