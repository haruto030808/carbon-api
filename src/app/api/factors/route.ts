export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Supabaseクライアントの初期化
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
    
    console.log('Supabase config check:', {
      hasUrl: !!supabaseUrl,
      urlPrefix: supabaseUrl?.substring(0, 20) || 'missing',
      hasKey: !!supabaseKey,
      keyPrefix: supabaseKey?.substring(0, 10) || 'missing'
    });
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      console.error('ERROR: Supabase environment variables are not properly configured!');
      return NextResponse.json({ 
        factors: [],
        categories: [],
        error: 'Supabase configuration missing. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
      }, { status: 500 });
    }
    
    const cookieStore = await cookies();
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // APIルートなので設定不要だが型定義のため空関数
          },
          remove(name: string, options: CookieOptions) {
            // APIルートなので設定不要だが型定義のため空関数
          },
        },
      }
    );

    // 1. カテゴリを全取得
    console.log('Fetching categories from emission_categories table...');
    const { data: categories, error: catError } = await supabase
      .from('emission_categories')
      .select('*')
      .order('name');
    
    console.log('Categories query result:', { 
      dataLength: categories?.length || 0, 
      error: catError,
      categories: categories 
    });
    
    if (catError) {
      console.error('Error fetching categories:', catError);
      throw catError;
    }
    
    if (!categories || categories.length === 0) {
      console.warn('WARNING: No categories found in emission_categories table!');
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
    const responseData = {
      factors: joinedData || [],
      categories: categories || []
    };
    console.log(`Factors API: Found ${categories?.length || 0} categories and ${joinedData?.length || 0} factors`);
    console.log('Response data structure:', {
      hasFactors: Array.isArray(responseData.factors),
      factorsCount: responseData.factors.length,
      hasCategories: Array.isArray(responseData.categories),
      categoriesCount: responseData.categories.length,
      categoriesSample: responseData.categories.slice(0, 3).map((c: any) => ({ id: c?.id, name: c?.name }))
    });
    return NextResponse.json(responseData);

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