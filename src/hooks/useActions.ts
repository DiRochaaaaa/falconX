'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export type ActionType = 'redirect_traffic' | 'blank_page' | 'custom_message'

export interface CloneAction {
  id: number
  user_id: string
  clone_id?: number
  action_type: ActionType
  redirect_url?: string
  redirect_percentage: number
  trigger_params: {
    fbclid?: boolean
    gclid?: boolean
    utm_source?: boolean
  }
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ActionConfig {
  action_type: ActionType
  redirect_url?: string
  redirect_percentage?: number
  trigger_params?: {
    fbclid?: boolean
    gclid?: boolean
    utm_source?: boolean
  }
  is_active?: boolean
}

export function useActions(userId: string) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createGlobalAction = useCallback(
    async (config: ActionConfig): Promise<CloneAction | null> => {
      if (!userId) return null

      setLoading(true)
      setError(null)

      try {
        const { data, error: insertError } = await supabase
          .from('clone_actions')
          .insert({
            user_id: userId,
            action_type: config.action_type,
            redirect_url: config.redirect_url || null,
            redirect_percentage: config.redirect_percentage || 100,
            trigger_params: config.trigger_params || { fbclid: true },
            is_active: true,
          })
          .select()
          .single()

        if (insertError) throw insertError

        return data as CloneAction
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    [userId]
  )

  const getGlobalActions = useCallback(async (): Promise<CloneAction[]> => {
    if (!userId) return []

    setLoading(true)
    setError(null)

    try {
      const { data, error: selectError } = await supabase
        .from('clone_actions')
        .select('*')
        .eq('user_id', userId)
        .is('clone_id', null) // Ações globais não têm clone_id específico
        .order('created_at', { ascending: false })

      if (selectError) throw selectError

      return (data as CloneAction[]) || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [userId])

  const updateAction = useCallback(
    async (actionId: number, updates: Partial<ActionConfig>): Promise<boolean> => {
      if (!userId) return false

      setLoading(true)
      setError(null)

      try {
        const { error: updateError } = await supabase
          .from('clone_actions')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', actionId)
          .eq('user_id', userId)

        if (updateError) throw updateError

        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        return false
      } finally {
        setLoading(false)
      }
    },
    [userId]
  )

  const deleteAction = useCallback(
    async (actionId: number): Promise<boolean> => {
      if (!userId) return false

      setLoading(true)
      setError(null)

      try {
        const { error: deleteError } = await supabase
          .from('clone_actions')
          .delete()
          .eq('id', actionId)
          .eq('user_id', userId)

        if (deleteError) throw deleteError

        return true
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        return false
      } finally {
        setLoading(false)
      }
    },
    [userId]
  )

  const toggleAction = useCallback(
    async (actionId: number, isActive: boolean): Promise<boolean> => {
      return updateAction(actionId, { is_active: isActive })
    },
    [updateAction]
  )

  return {
    loading,
    error,
    createGlobalAction,
    getGlobalActions,
    updateAction,
    deleteAction,
    toggleAction,
  }
}
