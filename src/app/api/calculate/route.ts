export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiKey = request.headers.get('x-api-key');
    const cookieStore = await cookies();

    // 1. バリデーション
    if (!body.factor_id || !body.activity_value || !body.start_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let orgId: string | null = null;
    let supabase;

    // 2. 認証ロジック (APIキー or セッション)
    if (apiKey) {
      // A. APIキーがある場合
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );
      
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey));
      const hashedInputKey = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      const { data: keyRecord, error: keyError } = await supabase
        .from('api_keys').select('org_id').eq('hashed_key', hashedInputKey).single();
      
      if (keyError || !keyRecord) {
        return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
      }
      orgId = keyRecord.org_id;
    } else {
      // B. セッション認証 (ブラウザ)
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

      // org_idを特定 (Metadata -> API Keys -> Profiles)
      orgId = user.user_metadata?.org_id;
      if (!orgId) {
        const { data: keyRec } = await supabase.from('api_keys').select('org_id').eq('user_id', user.id).limit(1).maybeSingle();
        orgId = keyRec?.org_id;
      }
      if (!orgId) {
        const { data: prof } = await supabase.from('profiles').select('org_id').eq('id', user.id).maybeSingle();
        orgId = prof?.org_id;
      }
    }

    if (!orgId) return NextResponse.json({ error: 'Organization not found' }, { status: 403 });

    // 3. 係数の取得 (同じ supabase インスタンスを使用)
    const { data: factorData, error: factorError } = await supabase
      .from('emission_factors')
      .select('co2_factor')
      .eq('id', body.factor_id)
      .single();

    if (factorError || !factorData) {
      return NextResponse.json({ error: 'Factor not found' }, { status: 404 });
    }

    // 4. 計算と保存
    const co2Emissions = Number(body.activity_value) * Number(factorData.co2_factor);

    const { data: insertedEntry, error: insertError } = await supabase
      .from('activity_entries')
      .insert({
        org_id: orgId,
        factor_id: body.factor_id,
        activity_value: Number(body.activity_value),
        co2_emissions: co2Emissions,
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