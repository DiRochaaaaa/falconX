import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://exemplo.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'exemplo-key',
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

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rotas que precisam de autenticação
  const protectedRoutes = ['/dashboard', '/domains', '/scripts', '/actions']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Rotas de autenticação (login/register)
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)

  // Se usuário não está logado e tenta acessar rota protegida
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Se usuário está logado e tenta acessar login/register
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/domains/:path*',
    '/scripts/:path*',
    '/actions/:path*',
    '/login',
    '/register'
  ]
} 