export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // Supabaseクライアントの初期化
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const body = await request.json();
    const apiKey = request.headers.get('x-api-key');

    // 1. バリデーション
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is required' }, { status: 401 });
    }
    if (!body.factor_id || !body.activity_value || !body.start_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. APIキーから組織ID (org_id) を特定
    const encoder = new TextEncoder();
    const keyData = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedInputKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const { data: keyRecord, error: keyError } = await supabase
      .from('api_keys')
      .select('org_id')
      .eq('hashed_key', hashedInputKey)
      .single();

    if (keyError || !keyRecord) {
      return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
    }

    // 3. 排出係数 (co2_factor) を取得
    const { data: factorData, error: factorError } = await supabase
      .from('emission_factors')
      .select('co2_factor') // 新しいカラム名
      .eq('id', body.factor_id)
      .single();

    if (factorError || !factorData) {
      return NextResponse.json({ error: 'Factor not found' }, { status: 404 });
    }

    // 4. 排出量を計算 (活動量 × 係数)
    // DBの数値型はJavaScriptでは正確に計算するため一旦Numberにするなどの配慮が必要ですが、
    // ここでは簡易的に計算します。
    const activityValue = Number(body.activity_value);
    const co2Factor = Number(factorData.co2_factor);
    const co2Emissions = activityValue * co2Factor;

    // 5. データを保存
    const { data: insertedEntry, error: insertError } = await supabase
      .from('activity_entries')
      .insert({
        org_id: keyRecord.org_id,
        factor_id: body.factor_id,
        activity_value: activityValue,
        co2_emissions: co2Emissions, // 計算結果を保存
        start_date: body.start_date,
        end_date: body.end_date || body.start_date,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert Error:', insertError);
      throw insertError;
    }

    return NextResponse.json({ success: true, data: insertedEntry });

  } catch (err: any) {
    console.error("Calculate API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}