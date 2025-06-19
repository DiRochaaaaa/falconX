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
          api_key: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          api_key?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          api_key?: string
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: number
          name: string
          slug: string
          price: number
          clone_limit: number
          extra_clone_price: number
          features: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          price?: number
          clone_limit?: number
          extra_clone_price?: number
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string 
          price?: number
          clone_limit?: number
          extra_clone_price?: number
          features?: Json
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
          current_clone_count: number
          clone_limit: number
          extra_clones_used: number
          reset_date: string
          started_at: string
          expires_at: string | null
          webhook_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          plan_id: number // OBRIGATÓRIO - referencia plans.id
          status?: 'active' | 'expired' | 'cancelled' | 'pending'
          current_clone_count?: number
          clone_limit: number
          extra_clones_used?: number
          reset_date?: string
          started_at?: string
          expires_at?: string | null
          webhook_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          plan_id?: number
          status?: 'active' | 'expired' | 'cancelled' | 'pending'
          current_clone_count?: number
          clone_limit?: number
          extra_clones_used?: number
          reset_date?: string
          started_at?: string
          expires_at?: string | null
          webhook_data?: Json
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
          detection_count: number
          first_detected: string
          last_seen: string
          is_active: boolean
          created_at: string
          updated_at: string
          unique_visitors_count: number
          slugs_data: Json
        }
        Insert: {
          id?: number
          user_id: string
          clone_domain: string
          original_domain: string
          detection_count?: number
          first_detected?: string
          last_seen?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          unique_visitors_count?: number
          slugs_data?: Json
        }
        Update: {
          id?: number
          user_id?: string
          clone_domain?: string
          original_domain?: string
          detection_count?: number
          first_detected?: string
          last_seen?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          unique_visitors_count?: number
          slugs_data?: Json
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
    ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

// Profile (sem plan_type - migração para usar user_subscriptions)
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  api_key: string
  created_at: string
  updated_at: string
}

// Profile para inserção (sem plan_type)
export interface ProfileInsert {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  api_key?: string
  created_at?: string
  updated_at?: string
}

// Profile para atualização (sem plan_type)
export interface ProfileUpdate {
  email?: string
  full_name?: string | null
  avatar_url?: string | null
  api_key?: string
  updated_at?: string
}

// Novo tipo para Profile com informações do plano via JOIN
export interface ProfileWithPlan extends Profile {
  subscription: {
    plan_id: number
    current_clone_count: number
    clone_limit: number
    extra_clones_used: number
    reset_date: string
  }
  plan: {
    id: number
    name: string
    slug: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond'
    price: number
    clone_limit: number
    extra_clone_price: number
    features: any
  }
}
