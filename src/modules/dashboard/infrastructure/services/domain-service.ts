import { supabase } from '@/lib/supabase'

export class DomainService {
  async addDomain(userId: string, domain: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.from('allowed_domains').insert([
        {
          user_id: userId,
          domain: domain.toLowerCase(),
          is_active: true,
        },
      ])

      if (error) {
        if (error.code === '23505') {
          return { error: 'Este domínio já está cadastrado' }
        }
        return { error: 'Erro ao adicionar domínio' }
      }

      return {}
    } catch {
      return { error: 'Erro ao adicionar domínio' }
    }
  }

  async toggleDomain(
    userId: string,
    domainId: string,
    currentStatus: boolean
  ): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('allowed_domains')
        .update({ is_active: !currentStatus })
        .eq('id', domainId)
        .eq('user_id', userId)

      if (error) {
        return { error: 'Erro ao atualizar status do domínio' }
      }

      return {}
    } catch {
      return { error: 'Erro ao atualizar status do domínio' }
    }
  }

  async deleteDomain(userId: string, domainId: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('allowed_domains')
        .delete()
        .eq('id', domainId)
        .eq('user_id', userId)

      if (error) {
        return { error: 'Erro ao excluir domínio' }
      }

      return {}
    } catch {
      return { error: 'Erro ao excluir domínio' }
    }
  }
}
