import { supabase, supabaseAdmin } from '@/lib/supabase'
import { checkCloneLimits } from './check-clone-limits'

export interface DetectedClone {
  id: number
  clone_domain: string
  original_domain: string
  detection_count: number
  first_detected: string
  last_seen: string
  is_active: boolean
  is_within_limit: boolean // se está dentro do limite do plano
  is_blocked: boolean      // se está bloqueado por limite
  unique_visitors_count: number
  slugs_data: any
}

export async function getAllDetectedClones(userId: string): Promise<{
  clones: DetectedClone[]
  withinLimit: DetectedClone[]
  blocked: DetectedClone[]
  limitStatus: any
}> {
  try {
    // Buscar status dos limites
    const limitStatus = await checkCloneLimits(userId)
    
    // Usar cliente administrativo para bypassar RLS
    const adminClient = supabaseAdmin || supabase
    
    // Buscar TODOS os clones detectados
    const { data: allClones, error } = await adminClient
      .from('detected_clones')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('first_detected', { ascending: false })

    if (error) {
      throw error
    }

    if (!allClones || !limitStatus) {
      return {
        clones: [],
        withinLimit: [],
        blocked: [],
        limitStatus: null
      }
    }

    // Separar clones por status
    const clonesWithStatus: DetectedClone[] = allClones.map((clone, index) => {
      // Primeiros clones até o limite = dentro do limite
      // Resto = bloqueado (no plano gratuito) ou extra (planos pagos)
      const isWithinLimit = index < limitStatus.limit
      const isBlocked = !isWithinLimit && limitStatus.planName === 'Gratuito'
      
      return {
        ...clone,
        is_within_limit: isWithinLimit,
        is_blocked: isBlocked
      }
    })

    const withinLimit = clonesWithStatus.filter(c => c.is_within_limit)
    const blocked = clonesWithStatus.filter(c => c.is_blocked)

    return {
      clones: clonesWithStatus,
      withinLimit,
      blocked,
      limitStatus
    }

  } catch (error) {
    console.error('Erro ao buscar clones detectados:', error)
    return {
      clones: [],
      withinLimit: [],
      blocked: [],
      limitStatus: null
    }
  }
} 