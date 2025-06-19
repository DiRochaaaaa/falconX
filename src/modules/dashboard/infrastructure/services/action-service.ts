import { supabase } from '@/lib/supabase'
import { ActionData } from '../../domain'

export interface CreateActionRequest {
  action_type: 'redirect_traffic' | 'blank_page' | 'custom_message'
  redirect_url: string
  redirect_percentage: number
}

export class ActionService {
  async loadActions(userId: string): Promise<ActionData[]> {
    try {
      const { data, error } = await supabase
        .from('clone_actions')
        .select('*')
        .eq('user_id', userId)
        .is('clone_id', null)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data as ActionData[]) || []
    } catch (error) {
      console.error('Erro ao carregar ações:', error)
      return []
    }
  }

  async createAction(userId: string, actionData: CreateActionRequest): Promise<{ error?: string }> {
    try {
      // 🔧 NOVA LÓGICA: Substituir ação existente em vez de adicionar
      // 1. Primeiro, desativar qualquer ação ativa existente
      const { error: deactivateError } = await supabase
        .from('clone_actions')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('is_active', true)

      // Não falhar se não houver ações para desativar
      if (deactivateError) {
        console.warn('Aviso ao desativar ações anteriores:', deactivateError)
      }

      // 2. Agora criar a nova ação ativa
      const { error: insertError } = await supabase.from('clone_actions').insert({
        user_id: userId,
        action_type: actionData.action_type,
        redirect_url:
          actionData.action_type === 'redirect_traffic'
            ? actionData.redirect_url
            : actionData.action_type === 'custom_message'
              ? actionData.redirect_url
              : null,
        redirect_percentage: actionData.redirect_percentage,
        is_active: true,
      })

      if (insertError) {
        // Se ainda falhar por constraint, tentar abordagem alternativa
        if (insertError.code === '23505') {
          return { error: 'Você já possui uma ação ativa. Por favor, desative a ação atual antes de criar uma nova.' }
        }
        return { error: 'Erro ao criar ação' }
      }

      return {}
    } catch (error) {
      console.error('Erro ao criar ação:', error)
      return { error: 'Erro ao criar ação' }
    }
  }

  async updateAction(
    actionId: number,
    updates: Partial<CreateActionRequest>
  ): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('clone_actions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', actionId)

      if (error) {
        return { error: 'Erro ao atualizar ação' }
      }

      return {}
    } catch (error) {
      console.error('Erro ao atualizar ação:', error)
      return { error: 'Erro ao atualizar ação' }
    }
  }

  async toggleAction(actionId: number, isActive: boolean): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('clone_actions')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', actionId)

      if (error) {
        return { error: 'Erro ao atualizar status da ação' }
      }

      return {}
    } catch (error) {
      console.error('Erro ao atualizar status da ação:', error)
      return { error: 'Erro ao atualizar status da ação' }
    }
  }

  async deleteAction(actionId: number): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.from('clone_actions').delete().eq('id', actionId)

      if (error) {
        return { error: 'Erro ao deletar ação' }
      }

      return {}
    } catch (error) {
      console.error('Erro ao deletar ação:', error)
      return { error: 'Erro ao deletar ação' }
    }
  }
}
