import { supabase } from '@/lib/supabase'
import { TriggerParam, TRIGGER_PARAMS } from '../../domain'

export class TriggerService {
  /**
   * Busca a configuração de triggers do usuário
   */
  async getTriggerConfig(userId: string): Promise<TriggerParam[]> {
    try {
      const { data, error } = await supabase
        .from('user_trigger_configs')
        .select('trigger_params')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // Se não há configuração, retorna padrão
      if (!data?.trigger_params) {
        return TRIGGER_PARAMS
      }

      // Combina configuração salva com definições padrão
      return TRIGGER_PARAMS.map(param => ({
        ...param,
        enabled: data.trigger_params[param.name] ?? param.enabled,
      }))
    } catch (error) {
      console.error('Erro ao carregar configuração de triggers:', error)
      return TRIGGER_PARAMS
    }
  }

  /**
   * Salva a configuração de triggers do usuário
   */
  async saveTriggerConfig(
    userId: string,
    triggerParams: TriggerParam[]
  ): Promise<{ error?: string }> {
    try {
      // Converte array para objeto { paramName: enabled }
      const triggerParamsObj = triggerParams.reduce(
        (acc, param) => {
          acc[param.name] = param.enabled
          return acc
        },
        {} as Record<string, boolean>
      )

      const { error } = await supabase.from('user_trigger_configs').upsert({
        user_id: userId,
        trigger_params: triggerParamsObj,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        return { error: 'Erro ao salvar configuração' }
      }

      return {}
    } catch (error) {
      console.error('Erro ao salvar configuração de triggers:', error)
      return { error: 'Erro ao salvar configuração' }
    }
  }

  /**
   * Obtém triggers ativos para uma ação específica
   */
  async getActiveTriggers(userId: string): Promise<Record<string, boolean>> {
    try {
      const { data, error } = await supabase
        .from('user_trigger_configs')
        .select('trigger_params')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // Se não há configuração, retorna triggers padrão ativos
      if (!data?.trigger_params) {
        return TRIGGER_PARAMS.filter(param => param.enabled).reduce(
          (acc, param) => {
            acc[param.name] = true
            return acc
          },
          {} as Record<string, boolean>
        )
      }

      return data.trigger_params
    } catch (error) {
      console.error('Erro ao carregar triggers ativos:', error)
      // Retorna configuração de fallback
      return { fbclid: true }
    }
  }

  /**
   * Verifica se uma URL contém triggers ativos
   */
  async shouldTriggerAction(userId: string, url: string): Promise<boolean> {
    try {
      const activeTriggers = await this.getActiveTriggers(userId)
      const urlObj = new URL(url)

      return Object.entries(activeTriggers).some(([param, enabled]) => {
        if (!enabled) return false
        return urlObj.searchParams.has(param)
      })
    } catch (error) {
      console.error('Erro ao verificar triggers:', error)
      return false
    }
  }

  /**
   * Reseta configuração para os padrões
   */
  async resetToDefaults(userId: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.from('user_trigger_configs').delete().eq('user_id', userId)

      if (error) {
        throw error
      }

      return {}
    } catch (error) {
      console.error('Erro ao resetar configuração:', error)
      return { error: 'Erro ao resetar configuração' }
    }
  }
}
