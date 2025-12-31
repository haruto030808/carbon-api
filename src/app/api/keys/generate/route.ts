export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: Request) {
  try {
    const { org_id, name } = await request.json();

    if (!org_id) {
      return NextResponse.json({ error: 'org_idが必要です' }, { status: 400 });
    }

    // 1. 本物のAPIキーを生成 (sk_live_ + ランダム文字列)
    // Edge Runtime 対応: crypto.getRandomValues を使用
    const randomBytes = new Uint8Array(24);
    crypto.getRandomValues(randomBytes);
    const randomHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const rawKey = `sk_live_${randomHex}`;
    const keyPrefix = 'sk_live_';

    // 2. キーをハッシュ化 (SHA-256)
    // これにより、万が一DBが漏洩しても、元のAPIキーは誰にもわかりません
    const encoder = new TextEncoder();
    const data = encoder.encode(rawKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 3. Supabaseに保存 (hashed_keyを保存)
    const { data, error } = await supabase
      .from('api_keys')
      .insert([
        {
          org_id,
          name: name || 'Default Key',
          key_prefix: keyPrefix,
          hashed_key: hashedKey,
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: `DB保存失敗: ${error.message}` }, { status: 500 });
    }

    // 4. 生のキー(rawKey)をレスポンスで返す
    // DBには保存していないため、ユーザーが確認できるのはこの一度きりです
    return NextResponse.json({
      message: 'APIキーが生成されました。このキーは二度と表示されません。必ず控えてください。',
      apiKey: rawKey,
      key_id: data.id,
      created_at: data.created_at
    }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: `サーバーエラー: ${err.message}` }, { status: 500 });
  }
}

