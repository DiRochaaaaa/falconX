import { supabase } from '@/lib/supabase'
import { TriggerParam, DEFAULT_TRIGGER_PARAMS } from '../../domain'

export class TriggerService {
  /**
   * Busca a configuração de triggers do usuário
   */
  async getUserTriggerConfig(userId: string): Promise<TriggerParam[]> {
    try {
      const { data, error } = await supabase
        .from('user_trigger_configs')
        .select('trigger_params')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // Se não existe configuração, retorna padrões
      if (!data) {
        return DEFAULT_TRIGGER_PARAMS
      }

      // Mescla configuração salva com parâmetros padrão
      const savedParams = data.trigger_params as Record<string, boolean>
      return DEFAULT_TRIGGER_PARAMS.map(param => ({
        ...param,
        enabled: savedParams[param.key] ?? param.enabled,
      }))
    } catch (error) {
      console.error('Erro ao buscar configuração de triggers:', error)
      return DEFAULT_TRIGGER_PARAMS
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
      // Converte array para objeto Record<string, boolean>
      const paramsObject = triggerParams.reduce(
        (acc, param) => {
          acc[param.key] = param.enabled
          return acc
        },
        {} as Record<string, boolean>
      )

      const { error } = await supabase.from('user_trigger_configs').upsert(
        {
          user_id: userId,
          trigger_params: paramsObject,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      )

      if (error) {
        throw error
      }

      return {}
    } catch (error) {
      console.error('Erro ao salvar configuração de triggers:', error)
      return { error: 'Erro ao salvar configuração de triggers' }
    }
  }

  /**
   * Obtém triggers ativos para uma ação específica
   */
  async getActiveTriggers(userId: string): Promise<Record<string, boolean>> {
    try {
      const triggerParams = await this.getUserTriggerConfig(userId)
      return triggerParams.reduce(
        (acc, param) => {
          if (param.enabled) {
            acc[param.key] = true
          }
          return acc
        },
        {} as Record<string, boolean>
      )
    } catch (error) {
      console.error('Erro ao buscar triggers ativos:', error)
      return { fbclid: true } // Fallback para o padrão
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
