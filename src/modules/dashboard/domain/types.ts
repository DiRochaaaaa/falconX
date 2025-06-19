export interface User {
  id: string
  email?: string
  full_name?: string
}

export interface UserProfile extends User {
  api_key?: string
  plan_id?: number
  plan_type?: 'free' | 'bronze' | 'silver' | 'gold'
  created_at: string
}

// Parâmetros de tracking completos para diferentes plataformas de ads
export interface TriggerParam {
  name: string
  label: string
  enabled: boolean
  platform: 'facebook' | 'google' | 'tiktok' | 'taboola' | 'generic'
  description: string
}

export const TRIGGER_PARAMS: TriggerParam[] = [
  // Facebook Ads
  {
    name: 'fbclid',
    label: 'Facebook Click ID',
    enabled: true,
    platform: 'facebook',
    description: 'Identificador único do clique no Facebook',
  },
  {
    name: 'fb_action_ids',
    label: 'Facebook Action IDs',
    enabled: true,
    platform: 'facebook',
    description: 'IDs das ações no Facebook',
  },
  {
    name: 'fb_action_types',
    label: 'Facebook Action Types',
    enabled: true,
    platform: 'facebook',
    description: 'Tipos de ações no Facebook',
  },
  {
    name: 'fb_source',
    label: 'Facebook Source',
    enabled: true,
    platform: 'facebook',
    description: 'Fonte do tráfego do Facebook',
  },

  // Google Ads
  {
    name: 'gclid',
    label: 'Google Click ID',
    enabled: true,
    platform: 'google',
    description: 'Identificador único do clique no Google',
  },
  {
    name: 'gclsrc',
    label: 'Google Click Source',
    enabled: true,
    platform: 'google',
    description: 'Fonte do clique no Google',
  },
  {
    name: 'gbraid',
    label: 'Google Brand ID',
    enabled: true,
    platform: 'google',
    description: 'Identificador de marca do Google',
  },
  {
    name: 'wbraid',
    label: 'Google Web Brand ID',
    enabled: true,
    platform: 'google',
    description: 'Identificador de marca web do Google',
  },
  {
    name: 'dclid',
    label: 'Display Click ID',
    enabled: true,
    platform: 'google',
    description: 'ID do clique em display do Google',
  },

  // UTM Parameters (Universal)
  {
    name: 'utm_source',
    label: 'UTM Source',
    enabled: true,
    platform: 'generic',
    description: 'Fonte da campanha (ex: google, facebook)',
  },
  {
    name: 'utm_medium',
    label: 'UTM Medium',
    enabled: true,
    platform: 'generic',
    description: 'Meio da campanha (ex: cpc, email)',
  },
  {
    name: 'utm_campaign',
    label: 'UTM Campaign',
    enabled: true,
    platform: 'generic',
    description: 'Nome da campanha',
  },
  {
    name: 'utm_term',
    label: 'UTM Term',
    enabled: true,
    platform: 'generic',
    description: 'Palavras-chave da campanha',
  },
  {
    name: 'utm_content',
    label: 'UTM Content',
    enabled: true,
    platform: 'generic',
    description: 'Conteúdo específico do anúncio',
  },

  // TikTok Ads
  {
    name: 'ttclid',
    label: 'TikTok Click ID',
    enabled: true,
    platform: 'tiktok',
    description: 'Identificador único do clique no TikTok',
  },
  {
    name: 'tt_content',
    label: 'TikTok Content',
    enabled: true,
    platform: 'tiktok',
    description: 'Conteúdo específico do TikTok',
  },

  // Twitter/X
  {
    name: 'twclid',
    label: 'Twitter Click ID',
    enabled: true,
    platform: 'generic',
    description: 'Identificador único do clique no Twitter',
  },

  // LinkedIn
  {
    name: 'li_fat_id',
    label: 'LinkedIn Fat ID',
    enabled: true,
    platform: 'generic',
    description: 'Identificador do LinkedIn',
  },
  {
    name: 'lipi',
    label: 'LinkedIn Insight',
    enabled: true,
    platform: 'generic',
    description: 'Parâmetro de insight do LinkedIn',
  },

  // YouTube
  {
    name: 'ytclid',
    label: 'YouTube Click ID',
    enabled: true,
    platform: 'google',
    description: 'Identificador único do clique no YouTube',
  },

  // Taboola
  {
    name: 'placement_id',
    label: 'Placement ID',
    enabled: true,
    platform: 'taboola',
    description: 'ID do posicionamento do anúncio',
  },
  {
    name: 'creative_id',
    label: 'Creative ID',
    enabled: true,
    platform: 'taboola',
    description: 'ID do criativo do anúncio',
  },

  // Genéricos
  {
    name: 'source',
    label: 'Source',
    enabled: true,
    platform: 'generic',
    description: 'Fonte genérica do tráfego',
  },
  {
    name: 'medium',
    label: 'Medium',
    enabled: true,
    platform: 'generic',
    description: 'Meio genérico do tráfego',
  },
  {
    name: 'campaign',
    label: 'Campaign',
    enabled: true,
    platform: 'generic',
    description: 'Campanha genérica',
  },
  {
    name: 'ad_id',
    label: 'Ad ID',
    enabled: true,
    platform: 'generic',
    description: 'ID genérico do anúncio',
  },
  {
    name: 'ref',
    label: 'Referrer',
    enabled: true,
    platform: 'generic',
    description: 'Parâmetro de referência genérico',
  },
]

export interface ActionData {
  id: number
  user_id: string
  clone_id?: number
  action_type: 'redirect_traffic' | 'blank_page' | 'custom_message'
  redirect_url?: string
  redirect_percentage: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TriggerConfiguration {
  id?: number
  user_id: string
  trigger_params: Record<string, boolean>
  created_at?: string
  updated_at?: string
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
