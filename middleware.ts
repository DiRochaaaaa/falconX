import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { AuthSession } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Verificar se as variáveis de ambiente estão configuradas
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

  let session = null
  
  try {
    // Timeout para getSession para evitar travamento
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session timeout')), 5000)
    )
    
    const sessionPromise = supabase.auth.getSession()
    
    const result = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: AuthSession | null } }
    session = result?.data?.session
  } catch (error) {
    console.error('Erro ao verificar sessão no middleware:', error)
    // Em caso de erro, permitir acesso e deixar o cliente decidir
    return res
  }

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