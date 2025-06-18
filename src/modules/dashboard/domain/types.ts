export interface UserProfile {
  id?: string
  email?: string
  full_name?: string
  plan_type?: string
}

export interface User {
  id: string
  email?: string
}

export interface ActionData {
  id: number
  user_id: string
  action_type: 'redirect_traffic' | 'blank_page' | 'custom_message'
  redirect_url?: string
  redirect_percentage: number
  trigger_params: Record<string, boolean>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DomainData {
  id: string
  domain: string
  is_active: boolean
  created_at: string
}

export interface PlanLimits {
  domains: number
  price: number
}

export type Section =
  | 'dashboard'
  | 'domains'
  | 'scripts'
  | 'actions'
  | 'profile'
  | 'settings'
  | 'billing'
