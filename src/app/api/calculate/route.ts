export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = request.headers.get('x-api-key');

    // 1. バリデーション
    if (!body.factor_id || !body.activity_value || !body.start_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let orgId: string | null = null;

    // 2. 認証ロジックの分岐
    if (apiKey) {
      // APIキー認証の場合
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
      );

      // APIキーから組織ID (org_id) を特定
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

      orgId = keyRecord.org_id;
    } else {
      // セッション認証の場合（APIキーがない場合）
      const cookieStore = await cookies();
      
      const supabaseServer = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.delete({ name, ...options })
            },
          },
        }
      );

      // ユーザー認証チェック
      const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // ユーザーの org_id を取得（user_metadata または api_keys テーブルから）
      if (user.user_metadata?.org_id) {
        orgId = user.user_metadata.org_id;
      } else {
        // user_metadata に org_id がない場合、api_keys テーブルから取得
        const supabaseForLookup = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
        );

        const { data: userKeyRecord } = await supabaseForLookup
          .from('api_keys')
          .select('org_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (!userKeyRecord) {
          // api_keys テーブルにレコードがない場合、profiles テーブルを確認
          const { data: profile } = await supabaseForLookup
            .from('profiles')
            .select('org_id')
            .eq('id', user.id)
            .single();

          if (!profile || !profile.org_id) {
            return NextResponse.json({ error: 'Organization not found for user' }, { status: 403 });
          }

          orgId = profile.org_id;
        } else {
          orgId = userKeyRecord.org_id;
        }
      }
    }

    // org_id が取得できなかった場合のエラーチェック
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID could not be determined' }, { status: 403 });
    }

    // 3. データ操作（org_id を使って既存のロジックを実行）
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
    );

    // 4. 排出係数 (co2_factor) を取得
    const { data: factorData, error: factorError } = await supabase
      .from('emission_factors')
      .select('co2_factor') // 新しいカラム名
      .eq('id', body.factor_id)
      .single();

    if (factorError || !factorData) {
      return NextResponse.json({ error: 'Factor not found' }, { status: 404 });
    }

    // 5. 排出量を計算 (活動量 × 係数)
    // DBの数値型はJavaScriptでは正確に計算するため一旦Numberにするなどの配慮が必要ですが、
    // ここでは簡易的に計算します。
    const activityValue = Number(body.activity_value);
    const co2Factor = Number(factorData.co2_factor);
    const co2Emissions = activityValue * co2Factor;

    // 6. データを保存
    const { data: insertedEntry, error: insertError } = await supabase
      .from('activity_entries')
      .insert({
        org_id: orgId,
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