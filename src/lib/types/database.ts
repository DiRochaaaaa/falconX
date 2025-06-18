export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          plan_type: 'free' | 'bronze' | 'silver' | 'gold'
          api_key: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          plan_type?: 'free' | 'bronze' | 'silver' | 'gold'
          api_key?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          plan_type?: 'free' | 'bronze' | 'silver' | 'gold'
          api_key?: string
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: number
          name: string
          price: number
          domain_limit: number
          extra_domain_price: number
          features: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          price?: number
          domain_limit?: number
          extra_domain_price?: number
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          price?: number
          domain_limit?: number
          extra_domain_price?: number
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      allowed_domains: {
        Row: {
          id: number
          user_id: string
          domain: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          domain: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          domain?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      detected_clones: {
        Row: {
          id: number
          user_id: string
          clone_domain: string
          original_domain: string
          ip_address: string | null
          user_agent: string | null
          first_detected: string
          last_seen: string
          detection_count: number
          is_blocked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          clone_domain: string
          original_domain: string
          ip_address?: string | null
          user_agent?: string | null
          first_detected?: string
          last_seen?: string
          detection_count?: number
          is_blocked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          clone_domain?: string
          original_domain?: string
          ip_address?: string | null
          user_agent?: string | null
          first_detected?: string
          last_seen?: string
          detection_count?: number
          is_blocked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clone_actions: {
        Row: {
          id: number
          user_id: string
          clone_id: number | null
          action_type: 'redirect_traffic' | 'blank_page' | 'custom_message'
          redirect_url: string | null
          redirect_percentage: number
          trigger_params: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          clone_id?: number | null
          action_type: 'redirect_traffic' | 'blank_page' | 'custom_message'
          redirect_url?: string | null
          redirect_percentage?: number
          trigger_params?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          clone_id?: number | null
          action_type?: 'redirect_traffic' | 'blank_page' | 'custom_message'
          redirect_url?: string | null
          redirect_percentage?: number
          trigger_params?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      detection_logs: {
        Row: {
          id: number
          user_id: string
          clone_id: number | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          page_url: string | null
          timestamp: string
        }
        Insert: {
          id?: number
          user_id: string
          clone_id?: number | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          page_url?: string | null
          timestamp?: string
        }
        Update: {
          id?: number
          user_id?: string
          clone_id?: number | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          page_url?: string | null
          timestamp?: string
        }
      }
      generated_scripts: {
        Row: {
          id: number
          user_id: string
          script_id: string
          script_content: string
          version: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          script_id?: string
          script_content: string
          version?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          script_id?: string
          script_content?: string
          version?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_trigger_configs: {
        Row: {
          id: number
          user_id: string
          trigger_params: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          trigger_params?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          trigger_params?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
