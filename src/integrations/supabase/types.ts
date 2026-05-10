export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          center_id: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          link_reserva: string | null
          location: string | null
          municipality_id: string | null
          price_cents: number | null
          slug: string
          starts_at: string | null
          status: Database["public"]["Enums"]["therapist_status"]
          therapist_id: string | null
          title: string
        }
        Insert: {
          center_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          link_reserva?: string | null
          location?: string | null
          municipality_id?: string | null
          price_cents?: number | null
          slug: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["therapist_status"]
          therapist_id?: string | null
          title: string
        }
        Update: {
          center_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          link_reserva?: string | null
          location?: string | null
          municipality_id?: string | null
          price_cents?: number | null
          slug?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["therapist_status"]
          therapist_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_search_queries: {
        Row: {
          ai_intro: string | null
          created_at: string
          id: string
          matched_help_areas: Json | null
          query: string
          suggested_therapies: Json | null
          user_id: string | null
        }
        Insert: {
          ai_intro?: string | null
          created_at?: string
          id?: string
          matched_help_areas?: Json | null
          query: string
          suggested_therapies?: Json | null
          user_id?: string | null
        }
        Update: {
          ai_intro?: string | null
          created_at?: string
          id?: string
          matched_help_areas?: Json | null
          query?: string
          suggested_therapies?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      centers: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          id: string
          lat: number | null
          lng: number | null
          municipality_id: string | null
          name: string
          owner_user_id: string | null
          phone: string | null
          photo_url: string | null
          plan_id: string | null
          slug: string
          status: Database["public"]["Enums"]["therapist_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          municipality_id?: string | null
          name: string
          owner_user_id?: string | null
          phone?: string | null
          photo_url?: string | null
          plan_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["therapist_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          municipality_id?: string | null
          name?: string
          owner_user_id?: string | null
          phone?: string | null
          photo_url?: string | null
          plan_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["therapist_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centers_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centers_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      help_areas: {
        Row: {
          created_at: string
          description: string | null
          id: string
          keywords: string[]
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          keywords?: string[]
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          keywords?: string[]
          name?: string
          slug?: string
        }
        Relationships: []
      }
      municipalities: {
        Row: {
          id: string
          lat: number | null
          lng: number | null
          name: string
          slug: string
        }
        Insert: {
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          slug: string
        }
        Update: {
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          name: string
          price_monthly_cents: number
          rank: number
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          name: string
          price_monthly_cents?: number
          rank?: number
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          name?: string
          price_monthly_cents?: number
          rank?: number
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          locale: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          locale?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          locale?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      therapies: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          short_description: string | null
          slug: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          short_description?: string | null
          slug: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          short_description?: string | null
          slug?: string
        }
        Relationships: []
      }
      therapist_help_areas: {
        Row: {
          help_area_id: string
          therapist_id: string
        }
        Insert: {
          help_area_id: string
          therapist_id: string
        }
        Update: {
          help_area_id?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_help_areas_help_area_id_fkey"
            columns: ["help_area_id"]
            isOneToOne: false
            referencedRelation: "help_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_help_areas_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_therapies: {
        Row: {
          therapist_id: string
          therapy_id: string
        }
        Insert: {
          therapist_id: string
          therapy_id: string
        }
        Update: {
          therapist_id?: string
          therapy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_therapies_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_therapies_therapy_id_fkey"
            columns: ["therapy_id"]
            isOneToOne: false
            referencedRelation: "therapies"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          address: string | null
          center_id: string | null
          created_at: string
          email: string | null
          especialidad: string | null
          experiencia: string | null
          formacion: string | null
          frase_clave: string | null
          full_name: string
          headline: string | null
          id: string
          languages: string[]
          lat: number | null
          link_reserva: string | null
          lng: number | null
          modalities: Database["public"]["Enums"]["modality"][]
          municipality_id: string | null
          phone: string | null
          photo_url: string | null
          plan_id: string | null
          slug: string
          sobre_mi: string | null
          status: Database["public"]["Enums"]["therapist_status"]
          subespecialidades: string[]
          updated_at: string
          user_id: string | null
          verified: boolean
          website: string | null
          whatsapp: string | null
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          center_id?: string | null
          created_at?: string
          email?: string | null
          especialidad?: string | null
          experiencia?: string | null
          formacion?: string | null
          frase_clave?: string | null
          full_name: string
          headline?: string | null
          id?: string
          languages?: string[]
          lat?: number | null
          link_reserva?: string | null
          lng?: number | null
          modalities?: Database["public"]["Enums"]["modality"][]
          municipality_id?: string | null
          phone?: string | null
          photo_url?: string | null
          plan_id?: string | null
          slug: string
          sobre_mi?: string | null
          status?: Database["public"]["Enums"]["therapist_status"]
          subespecialidades?: string[]
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          center_id?: string | null
          created_at?: string
          email?: string | null
          especialidad?: string | null
          experiencia?: string | null
          formacion?: string | null
          frase_clave?: string | null
          full_name?: string
          headline?: string | null
          id?: string
          languages?: string[]
          lat?: number | null
          link_reserva?: string | null
          lng?: number | null
          modalities?: Database["public"]["Enums"]["modality"][]
          municipality_id?: string | null
          phone?: string | null
          photo_url?: string | null
          plan_id?: string | null
          slug?: string
          sobre_mi?: string | null
          status?: Database["public"]["Enums"]["therapist_status"]
          subespecialidades?: string[]
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          website?: string | null
          whatsapp?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "therapists_center_id_fkey"
            columns: ["center_id"]
            isOneToOne: false
            referencedRelation: "centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapists_municipality_id_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "municipalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapists_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "therapist" | "user"
      modality: "presencial" | "online" | "domicilio"
      therapist_status: "draft" | "pending" | "published" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "therapist", "user"],
      modality: ["presencial", "online", "domicilio"],
      therapist_status: ["draft", "pending", "published", "suspended"],
    },
  },
} as const
