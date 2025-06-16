import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Verificar variáveis de ambiente
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Variáveis de ambiente do Supabase não configuradas!')
    return res
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.delete({
            name,
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  // Definir rotas
  const authRoutes = ['/login', '/register']
  const publicRoutes = ['/', '/about', '/contact']
  
  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  // Permitir acesso direto a rotas públicas e de teste
  if (isPublicRoute) {
    return res
  }

  // Só verificar sessão para rotas de auth (para evitar redirecionamento duplo)
  if (isAuthRoute) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    } catch (error) {
      console.error('Erro no middleware:', error)
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 