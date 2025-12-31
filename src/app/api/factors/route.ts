export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. カテゴリを全取得
    const { data: categories, error: catError } = await supabase
      .from('emission_categories')
      .select('*')
      .order('name');
    
    if (catError) {
      console.error('Error fetching categories:', catError);
      throw catError;
    }

    // 2. 係数を全取得
    const { data: factors, error: facError } = await supabase
      .from('emission_factors')
      .select('*')
      .order('id');

    if (facError) {
      console.error('Error fetching factors:', facError);
      throw facError;
    }

    // 3. JS側で手動結合（これが一番確実です）
    const joinedData = factors.map((factor) => {
      // 係数の category_id に一致するカテゴリを探してくっつける
      const category = categories.find((c) => c.id === factor.category_id);
      return {
        ...factor,
        emission_categories: category || null
      };
    });

    return NextResponse.json(joinedData);

  } catch (err: any) {
    console.error("Factors API Critical Error:", err);
    // エラー時でもフロントが落ちないように空配列を返す手もありますが、
    // 今回はデバッグ用にエラーを返します（フロント側でガード済み）
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}