import { createClient } from '@supabase/supabase-js';

// 環境変数が読み込めないときは、ビルドを止めないためにダミーの文字列("placeholder...")を入れます
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// プログラム全体で使い回すSupabaseクライアント
export const supabase = createClient(supabaseUrl, supabaseAnonKey);