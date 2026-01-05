import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // ログイン後の移動先（指定がなければトップページへ）
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies() // Next.js 15対応: awaitを入れる

    const supabase = createServerClient(
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
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 成功したらダッシュボードへリダイレクト
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('Auth Error:', error)
    }
  }

  // 失敗したらエラー付きでログイン画面に戻す
  return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
}