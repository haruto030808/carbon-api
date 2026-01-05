import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // APIルートの場合は認証チェックをスキップ（API側で個別に認証を行うため）
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    // レスポンスの初期化
    let response = NextResponse.next({
      request: { headers: request.headers },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // リクエストとレスポンスの両方でCookieを更新する（重要）
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({
              request: { headers: request.headers },
            })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options })
            response = NextResponse.next({
              request: { headers: request.headers },
            })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    // ユーザー情報を取得してセッションを更新（エラーハンドリング付き）
    let user = null
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Middleware auth error:', error)
      } else {
        user = data?.user ?? null
      }
    } catch (error) {
      console.error('Middleware error:', error)
      // エラーが発生しても処理を続行（未ログインとして扱う）
    }

    // 未ログインで、かつログインページ以外にアクセスしたら -> ログインへ
    if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // ログイン済みで、ログインページに来たら -> ダッシュボードへ
    if (user && request.nextUrl.pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware fatal error:', error)
    // APIルートの場合はエラーでもそのまま通過
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.next()
    }
    // 致命的なエラーが発生した場合、ログインページにリダイレクト
    if (!request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }
}

export const config = {
  // 静的ファイルやAPIルート以外のすべてのページで実行
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}