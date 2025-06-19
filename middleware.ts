import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSecurityHeaders } from '@/lib/security/cors-config'
import { rateLimiter, getRequestIdentifier } from '@/lib/security/rate-limiter'

/**
 * Rate limiting simple em memória (para produção usar Redis)
 */
const rateLimit = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minuto
  const maxRequests = 100 // 100 requests por minuto

  const current = rateLimit.get(ip)

  if (!current || now > current.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= maxRequests) {
    return false
  }

  current.count++
  return true
}

export async function middleware(req: NextRequest) {
  // Security headers para todas as respostas
  const response = NextResponse.next()
  const securityHeaders = getSecurityHeaders()

  // Aplicar security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Permitir assets estáticos sempre (performance)
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/favicon') ||
    req.nextUrl.pathname.includes('.') ||
    req.nextUrl.pathname.startsWith('/api/js/') // Scripts gerados
  ) {
    return response
  }

  // Rate limiting GLOBAL - agora incluindo APIs críticas
  const identifier = getRequestIdentifier(req)
  let rateLimitType: 'public' | 'protected' | 'critical' = 'public'
  
  // Determinar tipo de rate limit baseado na rota
  if (req.nextUrl.pathname.startsWith('/api/')) {
    if (req.nextUrl.pathname.includes('plan-limits') || 
        req.nextUrl.pathname.includes('generate-script')) {
      rateLimitType = 'critical'
    } else if (req.nextUrl.pathname.includes('collect') || 
               req.nextUrl.pathname.includes('detect')) {
      rateLimitType = 'public'
    } else {
      rateLimitType = 'protected'
    }
  }

  const rateLimit = rateLimiter.checkLimit(identifier, rateLimitType)
  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetTime! - Date.now()) / 1000)
    
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          ...securityHeaders
        }
      }
    )
  }

  // Verificar variáveis de ambiente
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
    return response
  }

  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Copiar security headers para a resposta final
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.headers.set(key, value)
  })

  // Para APIs, não fazer verificação de sessão (cada API gerencia sua auth)
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return res
  }

  // Autenticação apenas para rotas do frontend
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

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Erro na verificação de sessão:', error)
      return res
    }

    // Rotas de autenticação (login e registro)
    const authRoutes = ['/login', '/register']
    const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)

    // Se usuário estiver logado e tentar acessar login/register, redireciona para dashboard
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Todas as outras rotas são tratadas no client-side via <ProtectedRoute />
    return res
  } catch (error) {
    console.error('Erro no middleware:', error)
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     * IMPORTANTE: Agora incluindo APIs para rate limiting
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|ico|woff|woff2|ttf|eot)$).*)',
  ],
}
