export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Supabaseクライアントの初期化
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
    );

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

    // カテゴリと係数の両方を返す（カテゴリは全て、係数に関連付けられていないものも含む）
    console.log(`Factors API: Found ${categories?.length || 0} categories and ${joinedData?.length || 0} factors`);
    return NextResponse.json({
      factors: joinedData || [],
      categories: categories || []
    });

  } catch (err: any) {
    console.error("Factors API Critical Error:", err);
    // エラー時でもフロントが落ちないように空配列を返す
    return NextResponse.json({ 
      factors: [],
      categories: [],
      error: err.message 
    }, { status: 500 });
  }
}