export interface User {
  id: string
  email: string
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
  key: string
  name: string
  description: string
  platform: string
  category: 'facebook' | 'google' | 'utm' | 'tiktok' | 'twitter' | 'linkedin' | 'youtube' | 'other'
  enabled: boolean
}

export const DEFAULT_TRIGGER_PARAMS: TriggerParam[] = [
  // Facebook/Meta Ads
  {
    key: 'fbclid',
    name: 'Facebook Click ID',
    description: 'Identificador de clique do Facebook Ads',
    platform: 'Facebook',
    category: 'facebook',
    enabled: true,
  },
  {
    key: 'fb_action_ids',
    name: 'Facebook Action IDs',
    description: 'IDs de ação do Facebook',
    platform: 'Facebook',
    category: 'facebook',
    enabled: false,
  },
  {
    key: 'fb_action_types',
    name: 'Facebook Action Types',
    description: 'Tipos de ação do Facebook',
    platform: 'Facebook',
    category: 'facebook',
    enabled: false,
  },
  {
    key: 'fb_source',
    name: 'Facebook Source',
    description: 'Fonte do Facebook',
    platform: 'Facebook',
    category: 'facebook',
    enabled: false,
  },

  // Google Ads
  {
    key: 'gclid',
    name: 'Google Click ID',
    description: 'Identificador de clique do Google Ads',
    platform: 'Google',
    category: 'google',
    enabled: true,
  },
  {
    key: 'gclsrc',
    name: 'Google Click Source',
    description: 'Fonte do clique do Google',
    platform: 'Google',
    category: 'google',
    enabled: false,
  },
  {
    key: 'dclid',
    name: 'Display Click ID',
    description: 'ID de clique do Google Display',
    platform: 'Google',
    category: 'google',
    enabled: false,
  },
  {
    key: 'wbraid',
    name: 'Web Conversion ID',
    description: 'ID de conversão web do Google',
    platform: 'Google',
    category: 'google',
    enabled: false,
  },
  {
    key: 'gbraid',
    name: 'Google Ads Conversion ID',
    description: 'ID de conversão do Google Ads',
    platform: 'Google',
    category: 'google',
    enabled: false,
  },

  // UTM Parameters (Universal)
  {
    key: 'utm_source',
    name: 'UTM Source',
    description: 'Fonte da campanha (ex: google, facebook)',
    platform: 'Universal',
    category: 'utm',
    enabled: true,
  },
  {
    key: 'utm_medium',
    name: 'UTM Medium',
    description: 'Meio da campanha (ex: cpc, social)',
    platform: 'Universal',
    category: 'utm',
    enabled: true,
  },
  {
    key: 'utm_campaign',
    name: 'UTM Campaign',
    description: 'Nome da campanha',
    platform: 'Universal',
    category: 'utm',
    enabled: true,
  },
  {
    key: 'utm_term',
    name: 'UTM Term',
    description: 'Termo da palavra-chave',
    platform: 'Universal',
    category: 'utm',
    enabled: false,
  },
  {
    key: 'utm_content',
    name: 'UTM Content',
    description: 'Conteúdo do anúncio',
    platform: 'Universal',
    category: 'utm',
    enabled: false,
  },

  // TikTok Ads
  {
    key: 'ttclid',
    name: 'TikTok Click ID',
    description: 'Identificador de clique do TikTok Ads',
    platform: 'TikTok',
    category: 'tiktok',
    enabled: true,
  },
  {
    key: 'tt_content',
    name: 'TikTok Content',
    description: 'Conteúdo do TikTok',
    platform: 'TikTok',
    category: 'tiktok',
    enabled: false,
  },

  // Twitter/X Ads
  {
    key: 'twclid',
    name: 'Twitter Click ID',
    description: 'Identificador de clique do Twitter Ads',
    platform: 'Twitter/X',
    category: 'twitter',
    enabled: false,
  },

  // LinkedIn Ads
  {
    key: 'li_fat_id',
    name: 'LinkedIn First-Party Ad Tracking',
    description: 'Rastreamento de anúncio próprio do LinkedIn',
    platform: 'LinkedIn',
    category: 'linkedin',
    enabled: false,
  },
  {
    key: 'lipi',
    name: 'LinkedIn Page Impression',
    description: 'Impressão de página do LinkedIn',
    platform: 'LinkedIn',
    category: 'linkedin',
    enabled: false,
  },

  // YouTube Ads
  {
    key: 'ytclid',
    name: 'YouTube Click ID',
    description: 'Identificador de clique do YouTube Ads',
    platform: 'YouTube',
    category: 'youtube',
    enabled: false,
  },

  // Outros parâmetros comuns
  {
    key: 'ref',
    name: 'Referrer',
    description: 'Parâmetro de referência genérico',
    platform: 'Generic',
    category: 'other',
    enabled: false,
  },
  {
    key: 'source',
    name: 'Source',
    description: 'Fonte genérica',
    platform: 'Generic',
    category: 'other',
    enabled: false,
  },
  {
    key: 'medium',
    name: 'Medium',
    description: 'Meio genérico',
    platform: 'Generic',
    category: 'other',
    enabled: false,
  },
  {
    key: 'campaign',
    name: 'Campaign',
    description: 'Campanha genérica',
    platform: 'Generic',
    category: 'other',
    enabled: false,
  },
  {
    key: 'ad_id',
    name: 'Ad ID',
    description: 'ID do anúncio genérico',
    platform: 'Generic',
    category: 'other',
    enabled: false,
  },
  {
    key: 'creative_id',
    name: 'Creative ID',
    description: 'ID do criativo',
    platform: 'Generic',
    category: 'other',
    enabled: false,
  },
  {
    key: 'placement_id',
    name: 'Placement ID',
    description: 'ID do posicionamento',
    platform: 'Generic',
    category: 'other',
    enabled: false,
  },
]

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
