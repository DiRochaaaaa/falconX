nimport { supabase } from '@/lib/supabase'

/**
 * Função helper para fazer requests autenticados às APIs internas
 * Automaticamente inclui o token JWT do usuário logado
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // 1. Obter token da sessão atual
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error || !session?.access_token) {
    throw new Error('Usuário não está autenticado')
  }

  // 2. Adicionar Authorization header
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    ...options.headers,
  }

  // 3. Fazer request com token
  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Wrapper para requests GET autenticados
 */
export async function authenticatedGet(url: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'GET' })
}

/**
 * Wrapper para requests POST autenticados
 */
export async function authenticatedPost(url: string, body?: unknown): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'POST',
    body: body ? JSON.stringify(body) : null,
  })
} 