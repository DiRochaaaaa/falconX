export interface Database {
  falconx: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string
          plan_type: 'free' | 'bronze' | 'silver' | 'gold'
          api_key: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          avatar_url?: string
          plan_type?: 'free' | 'bronze' | 'silver' | 'gold'
          api_key?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string
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
          features: Record<string, unknown>
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          price?: number
          domain_limit?: number
          extra_domain_price?: number
          features?: Record<string, unknown>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          price?: number
          domain_limit?: number
          extra_domain_price?: number
          features?: Record<string, unknown>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: number
          user_id: string
          plan_id: number
          status: 'active' | 'expired' | 'cancelled' | 'pending'
          started_at: string
          expires_at?: string
          webhook_data: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          plan_id: number
          status?: 'active' | 'expired' | 'cancelled' | 'pending'
          started_at?: string
          expires_at?: string
          webhook_data?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          plan_id?: number
          status?: 'active' | 'expired' | 'cancelled' | 'pending'
          started_at?: string
          expires_at?: string
          webhook_data?: Record<string, unknown>
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
          user_id: string
          domain: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          domain?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
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
          user_id: string
          script_id?: string
          script_content: string
          version?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          script_id?: string
          script_content?: string
          version?: number
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
          ip_address?: string
          user_agent?: string
          first_detected: string
          last_seen: string
          detection_count: number
          is_blocked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          clone_domain: string
          original_domain: string
          ip_address?: string
          user_agent?: string
          first_detected?: string
          last_seen?: string
          detection_count?: number
          is_blocked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          clone_domain?: string
          original_domain?: string
          ip_address?: string
          user_agent?: string
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
          clone_id: number
          action_type: 'redirect_traffic' | 'blank_page' | 'custom_message'
          redirect_url?: string
          redirect_percentage: number
          trigger_params: Record<string, boolean | string | number>
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          clone_id: number
          action_type: 'redirect_traffic' | 'blank_page' | 'custom_message'
          redirect_url?: string
          redirect_percentage?: number
          trigger_params?: Record<string, boolean | string | number>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          clone_id?: number
          action_type?: 'redirect_traffic' | 'blank_page' | 'custom_message'
          redirect_url?: string
          redirect_percentage?: number
          trigger_params?: Record<string, boolean | string | number>
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      detection_logs: {
        Row: {
          id: number
          user_id: string
          clone_id: number
          ip_address?: string
          user_agent?: string
          referrer?: string
          page_url?: string
          timestamp: string
        }
        Insert: {
          user_id: string
          clone_id: number
          ip_address?: string
          user_agent?: string
          referrer?: string
          page_url?: string
          timestamp?: string
        }
        Update: {
          user_id?: string
          clone_id?: number
          ip_address?: string
          user_agent?: string
          referrer?: string
          page_url?: string
          timestamp?: string
        }
      }
    }
  }
} 