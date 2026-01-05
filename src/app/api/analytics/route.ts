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
    const cookieStore = await cookies();
    
    // パラメータ取得
    const scopeFilter = searchParams.get('scope');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const sortBy = searchParams.get('sort_by') || 'start_date';

    let orgId: string | null = null;
    let supabase;

    // 1. 認証ロジック
    if (apiKey) {
      // APIキー認証
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey));
      const hashedInputKey = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      const { data: keyRecord } = await supabase.from('api_keys').select('org_id').eq('hashed_key', hashedInputKey).single();
      if (!keyRecord) return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
      orgId = keyRecord.org_id;
    } else {
      // セッション認証（ここが重要！）
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
      
      // org_id特定
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

    // 2. データ取得
    let query = supabase
      .from('activity_entries')
      .select(`*, emission_factors (name, unit, scope_type)`)
      .eq('org_id', orgId);

    if (startDate) query = query.gte('start_date', startDate);
    if (endDate) query = query.lte('end_date', endDate);

    const { data: rawEntries, error } = await query;
    if (error) throw error;

    // 3. データ加工・集計
    let filteredEntries = rawEntries.filter((item: any) => {
      if (scopeFilter) return item.emission_factors?.scope_type === scopeFilter;
      return true;
    });

    filteredEntries.sort((a: any, b: any) => {
      let valA, valB;
      if (sortBy === 'created_at') {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else {
        valA = new Date(a.start_date).getTime();
        valB = new Date(b.start_date).getTime();
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

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
    console.error("Analytics API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}