export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = request.headers.get('x-api-key');

    // パラメータ取得
    const scopeFilter = searchParams.get('scope');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    
    // ソート用パラメータ (追加・変更)
    const sortOrder = searchParams.get('sort_order') || 'desc'; // 'asc' or 'desc'
    const sortBy = searchParams.get('sort_by') || 'start_date'; // 'start_date' or 'created_at'

    let orgId: string | null = null;

    // 1. APIキー認証のチェック
    if (apiKey) {
      // Supabaseクライアントの初期化（APIキー認証用）
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
      );

      const encoder = new TextEncoder();
      const keyData = encoder.encode(apiKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedInputKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const { data: keyRecord } = await supabase
        .from('api_keys').select('org_id').eq('hashed_key', hashedInputKey).single();

      if (!keyRecord) {
        return NextResponse.json({ error: '無効なAPIキー' }, { status: 403 });
      }

      orgId = keyRecord.org_id;
    } else {
      // 2. セッション認証のチェック（APIキーがない場合）
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

      // ユーザーの org_id を取得（api_keys テーブルから）
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
      );

      const { data: userKeyRecord } = await supabase
        .from('api_keys')
        .select('org_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!userKeyRecord) {
        // api_keys テーブルにレコードがない場合、profiles テーブルを確認
        const { data: profile } = await supabase
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

    // org_id が取得できなかった場合のエラーチェック
    if (!orgId) {
      return NextResponse.json({ error: 'Organization ID could not be determined' }, { status: 403 });
    }

    // 3. データ取得（org_id を使って既存のロジックを実行）
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
    );

    let query = supabase
      .from('activity_entries')
      .select(`*, emission_factors (name, unit, scope_type)`)
      .eq('org_id', orgId);

    if (startDate) query = query.gte('start_date', startDate);
    if (endDate) query = query.lte('end_date', endDate);

    const { data: rawEntries, error } = await query;
    if (error) throw error;

    // JS側でフィルタリング (Scope)
    let filteredEntries = rawEntries.filter((item: any) => {
      if (scopeFilter) return item.emission_factors?.scope_type === scopeFilter;
      return true;
    });

    // ソートロジックの強化
    filteredEntries.sort((a: any, b: any) => {
      let valA, valB;
      
      // ソート基準によって比較する値を変える
      if (sortBy === 'created_at') {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else {
        // デフォルトは start_date (Target Month)
        valA = new Date(a.start_date).getTime();
        valB = new Date(b.start_date).getTime();
      }
      
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    // 集計
    const summary = filteredEntries.reduce((acc: any, item: any) => {
      const s = item.emission_factors?.scope_type;
      if (s) acc[s] = (acc[s] || 0) + item.co2_emissions;
      acc.total += item.co2_emissions;
      return acc;
    }, { total: 0, scope1: 0, scope2: 0 });

    const monthlyMap: any = {};
    filteredEntries.forEach((item: any) => {
      const month = item.start_date.substring(0, 7);
      if (!monthlyMap[month]) monthlyMap[month] = { month, scope1: 0, scope2: 0 };
      const s = item.emission_factors?.scope_type;
      if (s) monthlyMap[month][s] += item.co2_emissions;
    });
    const monthly = Object.values(monthlyMap).sort((a: any, b: any) => a.month.localeCompare(b.month));

    // ページネーション
    const startIndex = (page - 1) * limit;
    const paginatedHistory = filteredEntries.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      summary,
      monthly,
      history: paginatedHistory,
      pagination: {
        page,
        limit,
        total: filteredEntries.length,
        total_pages: Math.ceil(filteredEntries.length / limit)
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}