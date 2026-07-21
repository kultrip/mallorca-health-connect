export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      admin_email_logs: {
        Row: {
          created_at: string;
          error_message: string | null;
          id: string;
          message: string;
          recipient_email: string;
          recipient_name: string | null;
          resend_email_id: string | null;
          sent_by_user_id: string | null;
          status: string;
          subject: string;
          therapist_id: string | null;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          message: string;
          recipient_email: string;
          recipient_name?: string | null;
          resend_email_id?: string | null;
          sent_by_user_id?: string | null;
          status: string;
          subject: string;
          therapist_id?: string | null;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          message?: string;
          recipient_email?: string;
          recipient_name?: string | null;
          resend_email_id?: string | null;
          sent_by_user_id?: string | null;
          status?: string;
          subject?: string;
          therapist_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "admin_email_logs_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
        ];
      };
      activities: {
        Row: {
          center_id: string | null;
          category: string | null;
          created_at: string;
          description: string | null;
          ends_at: string | null;
          email: string | null;
          facilitator_name: string | null;
          id: string;
          image_url: string | null;
          instagram: string | null;
          link_reserva: string | null;
          location: string | null;
          municipality_id: string | null;
          price_cents: number | null;
          slug: string;
          starts_at: string | null;
          status: Database["public"]["Enums"]["therapist_status"];
          therapist_id: string | null;
          title: string;
          website: string | null;
          whatsapp: string | null;
        };
        Insert: {
          center_id?: string | null;
          category?: string | null;
          created_at?: string;
          description?: string | null;
          ends_at?: string | null;
          email?: string | null;
          facilitator_name?: string | null;
          id?: string;
          image_url?: string | null;
          instagram?: string | null;
          link_reserva?: string | null;
          location?: string | null;
          municipality_id?: string | null;
          price_cents?: number | null;
          slug: string;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["therapist_status"];
          therapist_id?: string | null;
          title: string;
          website?: string | null;
          whatsapp?: string | null;
        };
        Update: {
          center_id?: string | null;
          category?: string | null;
          created_at?: string;
          description?: string | null;
          ends_at?: string | null;
          email?: string | null;
          facilitator_name?: string | null;
          id?: string;
          image_url?: string | null;
          instagram?: string | null;
          link_reserva?: string | null;
          location?: string | null;
          municipality_id?: string | null;
          price_cents?: number | null;
          slug?: string;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["therapist_status"];
          therapist_id?: string | null;
          title?: string;
          website?: string | null;
          whatsapp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "activities_center_id_fkey";
            columns: ["center_id"];
            isOneToOne: false;
            referencedRelation: "centers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_municipality_id_fkey";
            columns: ["municipality_id"];
            isOneToOne: false;
            referencedRelation: "municipalities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_search_queries: {
        Row: {
          ai_intro: string | null;
          created_at: string;
          id: string;
          matched_help_areas: Json | null;
          query: string;
          suggested_therapies: Json | null;
          user_id: string | null;
        };
        Insert: {
          ai_intro?: string | null;
          created_at?: string;
          id?: string;
          matched_help_areas?: Json | null;
          query: string;
          suggested_therapies?: Json | null;
          user_id?: string | null;
        };
        Update: {
          ai_intro?: string | null;
          created_at?: string;
          id?: string;
          matched_help_areas?: Json | null;
          query?: string;
          suggested_therapies?: Json | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      analytics_events: {
        Row: {
          activity_id: string | null;
          created_at: string;
          event_type: string;
          id: string;
          metadata: Json;
          search_query_id: string | null;
          therapist_id: string | null;
          user_id: string | null;
          visitor_id: string | null;
        };
        Insert: {
          activity_id?: string | null;
          created_at?: string;
          event_type: string;
          id?: string;
          metadata?: Json;
          search_query_id?: string | null;
          therapist_id?: string | null;
          user_id?: string | null;
          visitor_id?: string | null;
        };
        Update: {
          activity_id?: string | null;
          created_at?: string;
          event_type?: string;
          id?: string;
          metadata?: Json;
          search_query_id?: string | null;
          therapist_id?: string | null;
          user_id?: string | null;
          visitor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "analytics_events_activity_id_fkey";
            columns: ["activity_id"];
            isOneToOne: false;
            referencedRelation: "activities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_search_query_id_fkey";
            columns: ["search_query_id"];
            isOneToOne: false;
            referencedRelation: "ai_search_queries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analytics_events_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
        ];
      };
      billing_profiles: {
        Row: {
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          country: string;
          created_at: string;
          id: string;
          legal_name: string | null;
          postal_code: string | null;
          stripe_customer_id: string | null;
          tax_id_type: string | null;
          tax_id_value: string | null;
          therapist_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          country?: string;
          created_at?: string;
          id?: string;
          legal_name?: string | null;
          postal_code?: string | null;
          stripe_customer_id?: string | null;
          tax_id_type?: string | null;
          tax_id_value?: string | null;
          therapist_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          country?: string;
          created_at?: string;
          id?: string;
          legal_name?: string | null;
          postal_code?: string | null;
          stripe_customer_id?: string | null;
          tax_id_type?: string | null;
          tax_id_value?: string | null;
          therapist_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "billing_profiles_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
        ];
      };
      founder_invites: {
        Row: {
          created_at: string;
          id: string;
          invite_token: string;
          invited_at: string;
          invited_email: string | null;
          invited_name: string | null;
          normalized_whatsapp?: string;
          updated_at: string;
          used_at: string | null;
          used_by_email: string | null;
          used_by_user_id: string | null;
          whatsapp: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          invite_token?: string;
          invited_at?: string;
          invited_email?: string | null;
          invited_name?: string | null;
          normalized_whatsapp: string;
          updated_at?: string;
          used_at?: string | null;
          used_by_email?: string | null;
          used_by_user_id?: string | null;
          whatsapp: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          invite_token?: string;
          invited_at?: string;
          invited_email?: string | null;
          invited_name?: string | null;
          normalized_whatsapp?: string;
          updated_at?: string;
          used_at?: string | null;
          used_by_email?: string | null;
          used_by_user_id?: string | null;
          whatsapp?: string;
        };
        Relationships: [];
      };
      centers: {
        Row: {
          address: string | null;
          created_at: string;
          description: string | null;
          id: string;
          lat: number | null;
          lng: number | null;
          municipality_id: string | null;
          name: string;
          owner_user_id: string | null;
          phone: string | null;
          photo_url: string | null;
          plan_id: string | null;
          slug: string;
          status: Database["public"]["Enums"]["therapist_status"];
          updated_at: string;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          municipality_id?: string | null;
          name: string;
          owner_user_id?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          plan_id?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["therapist_status"];
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          lat?: number | null;
          lng?: number | null;
          municipality_id?: string | null;
          name?: string;
          owner_user_id?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          plan_id?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["therapist_status"];
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "centers_municipality_id_fkey";
            columns: ["municipality_id"];
            isOneToOne: false;
            referencedRelation: "municipalities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "centers_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      help_areas: {
        Row: {
          created_at: string;
          description: string | null;
          category: string | null;
          id: string;
          keywords: string[];
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          category?: string | null;
          id?: string;
          keywords?: string[];
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          category?: string | null;
          id?: string;
          keywords?: string[];
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      municipalities: {
        Row: {
          id: string;
          lat: number | null;
          lng: number | null;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          lat?: number | null;
          lng?: number | null;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          lat?: number | null;
          lng?: number | null;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          billing_enabled: boolean;
          billing_interval: string;
          created_at: string;
          description: string | null;
          features: Json;
          founder_price_monthly_cents: number | null;
          founder_stripe_price_id: string | null;
          id: string;
          name: string;
          price_monthly_cents: number;
          rank: number;
          slug: string;
          stripe_price_id: string | null;
          stripe_product_id: string | null;
        };
        Insert: {
          billing_enabled?: boolean;
          billing_interval?: string;
          created_at?: string;
          description?: string | null;
          features?: Json;
          founder_price_monthly_cents?: number | null;
          founder_stripe_price_id?: string | null;
          id?: string;
          name: string;
          price_monthly_cents?: number;
          rank?: number;
          slug: string;
          stripe_price_id?: string | null;
          stripe_product_id?: string | null;
        };
        Update: {
          billing_enabled?: boolean;
          billing_interval?: string;
          created_at?: string;
          description?: string | null;
          features?: Json;
          founder_price_monthly_cents?: number | null;
          founder_stripe_price_id?: string | null;
          id?: string;
          name?: string;
          price_monthly_cents?: number;
          rank?: number;
          slug?: string;
          stripe_price_id?: string | null;
          stripe_product_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          locale: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          locale?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          locale?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      therapies: {
        Row: {
          benefits: string[];
          category: string | null;
          created_at: string;
          description: string | null;
          detail_sections: Json;
          empty_professionals_message: string | null;
          id: string;
          medical_disclaimer: string | null;
          name: string;
          session_description: string | null;
          short_description: string | null;
          slug: string;
        };
        Insert: {
          benefits?: string[];
          category?: string | null;
          created_at?: string;
          description?: string | null;
          detail_sections?: Json;
          empty_professionals_message?: string | null;
          id?: string;
          medical_disclaimer?: string | null;
          name: string;
          session_description?: string | null;
          short_description?: string | null;
          slug: string;
        };
        Update: {
          benefits?: string[];
          category?: string | null;
          created_at?: string;
          description?: string | null;
          detail_sections?: Json;
          empty_professionals_message?: string | null;
          id?: string;
          medical_disclaimer?: string | null;
          name?: string;
          session_description?: string | null;
          short_description?: string | null;
          slug?: string;
        };
        Relationships: [];
      };
      therapist_help_areas: {
        Row: {
          help_area_id: string;
          therapist_id: string;
        };
        Insert: {
          help_area_id: string;
          therapist_id: string;
        };
        Update: {
          help_area_id?: string;
          therapist_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "therapist_help_areas_help_area_id_fkey";
            columns: ["help_area_id"];
            isOneToOne: false;
            referencedRelation: "help_areas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "therapist_help_areas_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
        ];
      };
      therapist_therapies: {
        Row: {
          therapist_id: string;
          therapy_id: string;
        };
        Insert: {
          therapist_id: string;
          therapy_id: string;
        };
        Update: {
          therapist_id?: string;
          therapy_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "therapist_therapies_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "therapist_therapies_therapy_id_fkey";
            columns: ["therapy_id"];
            isOneToOne: false;
            referencedRelation: "therapies";
            referencedColumns: ["id"];
          },
        ];
      };
      therapist_sessions: {
        Row: {
          created_at: string;
          duration: string | null;
          id: string;
          name: string;
          position: number;
          price_cents: number | null;
          therapist_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          duration?: string | null;
          id?: string;
          name: string;
          position?: number;
          price_cents?: number | null;
          therapist_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          duration?: string | null;
          id?: string;
          name?: string;
          position?: number;
          price_cents?: number | null;
          therapist_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "therapist_sessions_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
        ];
      };
      therapists: {
        Row: {
          address: string | null;
          accepted_deontological_code: boolean | null;
          accepted_truthfulness: boolean | null;
          accepted_privacy_policy: boolean | null;
          accepted_terms_of_use: boolean | null;
          accepted_publication: boolean | null;
          accompaniment_modalities: string[] | null;
          approach_text: string | null;
          declares_legal_authority: boolean | null;
          center_id: string | null;
          center_name: string | null;
          city: string | null;
          created_at: string;
          email: string | null;
          differentiator_text: string | null;
          especialidad: string | null;
          experiencia: string | null;
          facilities: string[] | null;
          formacion: string | null;
          frase_clave: string | null;
          full_name: string;
          fresha_url: string | null;
          gallery_urls: string[] | null;
          has_liability_insurance: boolean | null;
          headline: string | null;
          id: string;
          is_founder: boolean;
          instagram_url: string | null;
          languages: string[];
          linkedin_url: string | null;
          lat: number | null;
          logo_url: string | null;
          link_reserva: string | null;
          lng: number | null;
          mission_text: string | null;
          modalities: Database["public"]["Enums"]["modality"][];
          municipality_id: string | null;
          organization_signature_name: string | null;
          organisation_type: string | null;
          organization_signed_at: string | null;
          organization_signed_ip: string | null;
          pending_plan_id: string | null;
          pending_plan_slug: string | null;
          other_booking_url: string | null;
          professional_name: string | null;
          legal_entity_name: string | null;
          legal_entity_tax_id: string | null;
          responsible_email: string | null;
          responsible_first_name: string | null;
          responsible_last_name: string | null;
          responsible_phone: string | null;
          responsible_role: string | null;
          phone: string | null;
          photo_url: string | null;
          plan_id: string | null;
          show_email_public: boolean | null;
          show_whatsapp_public: boolean | null;
          slug: string;
          session_modalities: string[] | null;
          sobre_mi: string | null;
          tagline: string | null;
          target_audience: string[] | null;
          team_members: Json | null;
          stripe_customer_id: string | null;
          stripe_price_id: string | null;
          stripe_subscription_id: string | null;
          stripe_payment_method_id: string | null;
          stripe_pending_checkout_session_id: string | null;
          stripe_setup_intent_id: string | null;
          subscription_status: string | null;
          subscription_activation_error: string | null;
          status: Database["public"]["Enums"]["therapist_status"];
          subespecialidades: string[];
          youtube_url: string | null;
          whatsapp_business_url: string | null;
          updated_at: string;
          user_id: string | null;
          verification_document_name: string | null;
          verification_document_path: string | null;
          verification_extra_document_name: string | null;
          verification_extra_document_path: string | null;
          verification_review_note: string | null;
          verification_reviewed_at: string | null;
          verification_reviewed_by: string | null;
          verification_submitted_at: string | null;
          verified: boolean;
          website: string | null;
          whatsapp: string | null;
          years_experience: number | null;
          business_name: string | null;
          description: string | null;
          postal_code: string | null;
          profession: string | null;
          extracted_therapies: string[] | null;
          extracted_municipality: string | null;
          profile_image_url: string | null;
          opening_hours: string | null;
          is_claimed: boolean;
          verification_date: string | null;
          source: string | null;
          source_url: string | null;
          imported_by_ai: boolean;
          crm_status: string;
          first_contact_date: string | null;
          last_contact_date: string | null;
          owner_user_id: string | null;
          internal_notes: string | null;
          import_metadata: Json;
        };
        Insert: {
          address?: string | null;
          accepted_deontological_code?: boolean | null;
          accepted_truthfulness?: boolean | null;
          accepted_privacy_policy?: boolean | null;
          accepted_terms_of_use?: boolean | null;
          accepted_publication?: boolean | null;
          accompaniment_modalities?: string[] | null;
          approach_text?: string | null;
          declares_legal_authority?: boolean | null;
          center_id?: string | null;
          center_name?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string | null;
          differentiator_text?: string | null;
          especialidad?: string | null;
          experiencia?: string | null;
          facilities?: string[] | null;
          formacion?: string | null;
          frase_clave?: string | null;
          full_name: string;
          fresha_url?: string | null;
          gallery_urls?: string[] | null;
          has_liability_insurance?: boolean | null;
          headline?: string | null;
          id?: string;
          is_founder?: boolean;
          instagram_url?: string | null;
          languages?: string[];
          linkedin_url?: string | null;
          lat?: number | null;
          logo_url?: string | null;
          link_reserva?: string | null;
          lng?: number | null;
          mission_text?: string | null;
          modalities?: Database["public"]["Enums"]["modality"][];
          municipality_id?: string | null;
          organization_signature_name?: string | null;
          organisation_type?: string | null;
          organization_signed_at?: string | null;
          organization_signed_ip?: string | null;
          pending_plan_id?: string | null;
          pending_plan_slug?: string | null;
          other_booking_url?: string | null;
          professional_name?: string | null;
          legal_entity_name?: string | null;
          legal_entity_tax_id?: string | null;
          responsible_email?: string | null;
          responsible_first_name?: string | null;
          responsible_last_name?: string | null;
          responsible_phone?: string | null;
          responsible_role?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          plan_id?: string | null;
          show_email_public?: boolean | null;
          show_whatsapp_public?: boolean | null;
          slug: string;
          session_modalities?: string[] | null;
          sobre_mi?: string | null;
          tagline?: string | null;
          target_audience?: string[] | null;
          team_members?: Json | null;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_payment_method_id?: string | null;
          stripe_pending_checkout_session_id?: string | null;
          stripe_setup_intent_id?: string | null;
          subscription_status?: string | null;
          subscription_activation_error?: string | null;
          status?: Database["public"]["Enums"]["therapist_status"];
          subespecialidades?: string[];
          youtube_url?: string | null;
          whatsapp_business_url?: string | null;
          updated_at?: string;
          user_id?: string | null;
          verification_document_name?: string | null;
          verification_document_path?: string | null;
          verification_extra_document_name?: string | null;
          verification_extra_document_path?: string | null;
          verification_review_note?: string | null;
          verification_reviewed_at?: string | null;
          verification_reviewed_by?: string | null;
          verification_submitted_at?: string | null;
          verified?: boolean;
          website?: string | null;
          whatsapp?: string | null;
          years_experience?: number | null;
          business_name?: string | null;
          description?: string | null;
          postal_code?: string | null;
          profession?: string | null;
          extracted_therapies?: string[] | null;
          extracted_municipality?: string | null;
          profile_image_url?: string | null;
          opening_hours?: string | null;
          is_claimed?: boolean;
          verification_date?: string | null;
          source?: string | null;
          source_url?: string | null;
          imported_by_ai?: boolean;
          crm_status?: string;
          first_contact_date?: string | null;
          last_contact_date?: string | null;
          owner_user_id?: string | null;
          internal_notes?: string | null;
          import_metadata?: Json;
        };
        Update: {
          address?: string | null;
          accepted_deontological_code?: boolean | null;
          accepted_truthfulness?: boolean | null;
          accepted_privacy_policy?: boolean | null;
          accepted_terms_of_use?: boolean | null;
          accepted_publication?: boolean | null;
          accompaniment_modalities?: string[] | null;
          approach_text?: string | null;
          declares_legal_authority?: boolean | null;
          center_id?: string | null;
          center_name?: string | null;
          city?: string | null;
          created_at?: string;
          email?: string | null;
          differentiator_text?: string | null;
          especialidad?: string | null;
          experiencia?: string | null;
          facilities?: string[] | null;
          formacion?: string | null;
          frase_clave?: string | null;
          full_name?: string;
          fresha_url?: string | null;
          gallery_urls?: string[] | null;
          has_liability_insurance?: boolean | null;
          headline?: string | null;
          id?: string;
          is_founder?: boolean;
          instagram_url?: string | null;
          languages?: string[];
          linkedin_url?: string | null;
          lat?: number | null;
          logo_url?: string | null;
          link_reserva?: string | null;
          lng?: number | null;
          mission_text?: string | null;
          modalities?: Database["public"]["Enums"]["modality"][];
          municipality_id?: string | null;
          organization_signature_name?: string | null;
          organisation_type?: string | null;
          organization_signed_at?: string | null;
          organization_signed_ip?: string | null;
          pending_plan_id?: string | null;
          pending_plan_slug?: string | null;
          other_booking_url?: string | null;
          professional_name?: string | null;
          legal_entity_name?: string | null;
          legal_entity_tax_id?: string | null;
          responsible_email?: string | null;
          responsible_first_name?: string | null;
          responsible_last_name?: string | null;
          responsible_phone?: string | null;
          responsible_role?: string | null;
          phone?: string | null;
          photo_url?: string | null;
          plan_id?: string | null;
          show_email_public?: boolean | null;
          show_whatsapp_public?: boolean | null;
          slug?: string;
          session_modalities?: string[] | null;
          sobre_mi?: string | null;
          tagline?: string | null;
          target_audience?: string[] | null;
          team_members?: Json | null;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_payment_method_id?: string | null;
          stripe_pending_checkout_session_id?: string | null;
          stripe_setup_intent_id?: string | null;
          subscription_status?: string | null;
          subscription_activation_error?: string | null;
          status?: Database["public"]["Enums"]["therapist_status"];
          subespecialidades?: string[];
          youtube_url?: string | null;
          whatsapp_business_url?: string | null;
          updated_at?: string;
          user_id?: string | null;
          verification_document_name?: string | null;
          verification_document_path?: string | null;
          verification_extra_document_name?: string | null;
          verification_extra_document_path?: string | null;
          verification_review_note?: string | null;
          verification_reviewed_at?: string | null;
          verification_reviewed_by?: string | null;
          verification_submitted_at?: string | null;
          verified?: boolean;
          website?: string | null;
          whatsapp?: string | null;
          years_experience?: number | null;
          business_name?: string | null;
          description?: string | null;
          postal_code?: string | null;
          profession?: string | null;
          extracted_therapies?: string[] | null;
          extracted_municipality?: string | null;
          profile_image_url?: string | null;
          opening_hours?: string | null;
          is_claimed?: boolean;
          verification_date?: string | null;
          source?: string | null;
          source_url?: string | null;
          imported_by_ai?: boolean;
          crm_status?: string;
          first_contact_date?: string | null;
          last_contact_date?: string | null;
          owner_user_id?: string | null;
          internal_notes?: string | null;
          import_metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "therapists_center_id_fkey";
            columns: ["center_id"];
            isOneToOne: false;
            referencedRelation: "centers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "therapists_municipality_id_fkey";
            columns: ["municipality_id"];
            isOneToOne: false;
            referencedRelation: "municipalities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "therapists_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "therapists_pending_plan_id_fkey";
            columns: ["pending_plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      professional_reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          is_published: boolean;
          rating: number;
          therapist_id: string;
          reviewer_email: string | null;
          reviewer_name: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          rating: number;
          therapist_id: string;
          reviewer_email?: string | null;
          reviewer_name: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          rating?: number;
          therapist_id?: string;
          reviewer_email?: string | null;
          reviewer_name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "professional_reviews_therapist_id_fkey";
            columns: ["therapist_id"];
            isOneToOne: false;
            referencedRelation: "therapists";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_analytics_summary: {
        Args: { _since?: string };
        Returns: Json;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      therapist_analytics_summary: {
        Args: { _since?: string };
        Returns: Json;
      };
      track_profile_view: {
        Args: {
          _therapist_id: string;
        };
        Returns: undefined;
      };
      track_analytics_event: {
        Args: {
          _activity_id?: string;
          _event_type: string;
          _metadata?: Json;
          _search_query_id?: string;
          _therapist_id?: string;
          _visitor_id?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      app_role: "admin" | "therapist" | "user";
      modality: "presencial" | "online" | "domicilio";
      therapist_status: "draft" | "pending" | "published" | "suspended";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "therapist", "user"],
      modality: ["presencial", "online", "domicilio"],
      therapist_status: ["draft", "pending", "published", "suspended"],
    },
  },
} as const;
