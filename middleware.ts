import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { AuthSession } from '@supabase/supabase-js'

// Cache para otimização (em produção seria Redis/Memcached)
const sessionCache = new Map<string, { session: AuthSession | null; timestamp: number }>()
const CACHE_DURATION = 10000 // 10 segundos

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
  const protectedRoutes = ['/dashboard', '/domains', '/scripts', '/actions']
  const authRoutes = ['/login', '/register']
  const publicRoutes = ['/', '/about', '/contact']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  // Permitir acesso direto a rotas públicas
  if (isPublicRoute) {
    return res
  }

  let session = null
  
  try {
    // Gerar chave de cache baseada nos cookies de sessão
    const sessionCookies = [
      req.cookies.get('sb-access-token')?.value,
      req.cookies.get('sb-refresh-token')?.value,
    ].filter(Boolean).join('|')
    
    const cacheKey = `session:${sessionCookies}`
    const cached = sessionCache.get(cacheKey)
    
    // Verificar cache primeiro
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      session = cached.session
    } else {
      // Timeout mais agressivo para middleware
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Middleware timeout')), 2000)
      )
      
      const sessionPromise = supabase.auth.getSession()
      
      try {
        const result = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: AuthSession | null } }
        session = result?.data?.session
        
        // Atualizar cache
        sessionCache.set(cacheKey, { session, timestamp: Date.now() })
        
        // Limpar cache antigo (manter apenas 100 entradas)
        if (sessionCache.size > 100) {
          const oldestKey = sessionCache.keys().next().value
          if (oldestKey) {
            sessionCache.delete(oldestKey)
          }
        }
      } catch (timeoutError) {
        // Em caso de timeout, verificar se temos cache antigo
        if (cached) {
          session = cached.session
        }
      }
    }
  } catch (error) {
    console.error('Erro no middleware:', error)
    // Em caso de erro crítico, permitir acesso e deixar o cliente decidir
    return res
  }

  // Lógica de redirecionamento otimizada
  if (isProtectedRoute && !session) {
    // Adicionar header para indicar redirect por falta de auth
    res.headers.set('X-Auth-Required', 'true')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthRoute && session) {
    // Adicionar header para indicar redirect por já estar autenticado
    res.headers.set('X-Already-Authenticated', 'true')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Adicionar headers úteis para o cliente
  if (session) {
    res.headers.set('X-User-Authenticated', 'true')
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