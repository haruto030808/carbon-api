export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

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

    if (!apiKey) return NextResponse.json({ error: 'APIキーが必要です' }, { status: 401 });

    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedInputKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const { data: keyRecord } = await supabase
      .from('api_keys').select('org_id').eq('hashed_key', hashedInputKey).single();

    if (!keyRecord) return NextResponse.json({ error: '無効なAPIキー' }, { status: 403 });

    let query = supabase
      .from('activity_entries')
      .select(`*, emission_factors (name, unit, scope_type)`)
      .eq('org_id', keyRecord.org_id);

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