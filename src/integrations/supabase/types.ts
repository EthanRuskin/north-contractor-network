export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          client_id: string | null
          contractor_id: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          location: string | null
          project_id: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          client_id?: string | null
          contractor_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          location?: string | null
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          client_id?: string | null
          contractor_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          location?: string | null
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          close_time: string | null
          contractor_id: string
          created_at: string | null
          day_of_week: number
          is_closed: boolean | null
          open_time: string | null
          updated_at: string | null
        }
        Insert: {
          close_time?: string | null
          contractor_id: string
          created_at?: string | null
          day_of_week: number
          is_closed?: boolean | null
          open_time?: string | null
          updated_at?: string | null
        }
        Update: {
          close_time?: string | null
          contractor_id?: string
          created_at?: string | null
          day_of_week?: number
          is_closed?: boolean | null
          open_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      contractor_certifications: {
        Row: {
          certification_id: number
          contractor_id: string
          created_at: string | null
          expiry_date: string | null
          issue_date: string | null
        }
        Insert: {
          certification_id: number
          contractor_id: string
          created_at?: string | null
          expiry_date?: string | null
          issue_date?: string | null
        }
        Update: {
          certification_id?: number
          contractor_id?: string
          created_at?: string | null
          expiry_date?: string | null
          issue_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contractor_certifications_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_certifications_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_licenses: {
        Row: {
          contractor_id: string
          created_at: string | null
          expiration_date: string | null
          has_insurance: boolean | null
          id: string
          insurance_coverage: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          license_number: string
          license_type: string
          updated_at: string | null
        }
        Insert: {
          contractor_id: string
          created_at?: string | null
          expiration_date?: string | null
          has_insurance?: boolean | null
          id?: string
          insurance_coverage?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          license_number: string
          license_type: string
          updated_at?: string | null
        }
        Update: {
          contractor_id?: string
          created_at?: string | null
          expiration_date?: string | null
          has_insurance?: boolean | null
          id?: string
          insurance_coverage?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          license_number?: string
          license_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contractor_licenses_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_profiles: {
        Row: {
          business_name: string
          created_at: string | null
          description: string | null
          employees: string | null
          featured: boolean | null
          founded_year: number | null
          id: string
          latitude: number | null
          longitude: number | null
          primary_trade: string | null
          service_area: string | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          business_name: string
          created_at?: string | null
          description?: string | null
          employees?: string | null
          featured?: boolean | null
          founded_year?: number | null
          id: string
          latitude?: number | null
          longitude?: number | null
          primary_trade?: string | null
          service_area?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          business_name?: string
          created_at?: string | null
          description?: string | null
          employees?: string | null
          featured?: boolean | null
          founded_year?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          primary_trade?: string | null
          service_area?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contractor_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_services: {
        Row: {
          contractor_id: string
          created_at: string | null
          price_range: string | null
          service_id: number
        }
        Insert: {
          contractor_id: string
          created_at?: string | null
          price_range?: string | null
          service_id: number
        }
        Update: {
          contractor_id?: string
          created_at?: string | null
          price_range?: string | null
          service_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "contractor_services_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_images: {
        Row: {
          caption: string | null
          contractor_id: string | null
          created_at: string | null
          id: string
          image_url: string
          project_id: string | null
        }
        Insert: {
          caption?: string | null
          contractor_id?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          project_id?: string | null
        }
        Update: {
          caption?: string | null
          contractor_id?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      homeowner_profiles: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homeowner_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_collection_projects: {
        Row: {
          collection_id: string
          created_at: string | null
          project_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string | null
          project_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_collection_projects_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "inspiration_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspiration_collection_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "inspiration_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_collections: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image_url: string
          project_count: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image_url: string
          project_count?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string
          project_count?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inspiration_comment_replies: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          reply: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          reply: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          reply?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_comment_replies_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "inspiration_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          project_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          project_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "inspiration_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_likes: {
        Row: {
          created_at: string | null
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspiration_likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "inspiration_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      inspiration_projects: {
        Row: {
          ai_insights: string | null
          before_after_images: Json | null
          budget: number | null
          category: string
          completion_date: string | null
          contractor_id: string | null
          created_at: string | null
          description: string
          duration: string | null
          gallery_images: string[] | null
          id: string
          image_url: string
          likes_count: number | null
          location: string | null
          materials: Json | null
          size: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          ai_insights?: string | null
          before_after_images?: Json | null
          budget?: number | null
          category: string
          completion_date?: string | null
          contractor_id?: string | null
          created_at?: string | null
          description: string
          duration?: string | null
          gallery_images?: string[] | null
          id?: string
          image_url: string
          likes_count?: number | null
          location?: string | null
          materials?: Json | null
          size?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          ai_insights?: string | null
          before_after_images?: Json | null
          budget?: number | null
          category?: string
          completion_date?: string | null
          contractor_id?: string | null
          created_at?: string | null
          description?: string
          duration?: string | null
          gallery_images?: string[] | null
          id?: string
          image_url?: string
          likes_count?: number | null
          location?: string | null
          materials?: Json | null
          size?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          project_id: string | null
          recipient_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          project_id?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          project_id?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link_url: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          is_read?: boolean
          link_url?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          client_name: string | null
          completion_date: string | null
          contractor_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          title: string
        }
        Insert: {
          client_name?: string | null
          completion_date?: string | null
          contractor_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          title: string
        }
        Update: {
          client_name?: string | null
          completion_date?: string | null
          contractor_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          profile_image: string | null
          state: string | null
          updated_at: string | null
          user_type: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          profile_image?: string | null
          state?: string | null
          updated_at?: string | null
          user_type: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          profile_image?: string | null
          state?: string | null
          updated_at?: string | null
          user_type?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      project_bids: {
        Row: {
          contractor_id: string | null
          created_at: string | null
          estimated_duration: string | null
          id: string
          price: number | null
          project_id: string | null
          proposal: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contractor_id?: string | null
          created_at?: string | null
          estimated_duration?: string | null
          id?: string
          price?: number | null
          project_id?: string | null
          proposal?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contractor_id?: string | null
          created_at?: string | null
          estimated_duration?: string | null
          id?: string
          price?: number | null
          project_id?: string | null
          proposal?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_bids_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget_range: string | null
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          budget_range?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          budget_range?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          identifier: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          identifier: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          client_id: string | null
          contractor_id: string | null
          created_at: string | null
          id: string
          project_id: string | null
          rating: number
          response_text: string | null
          review_text: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          contractor_id?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          rating: number
          response_text?: string | null
          review_text?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          contractor_id?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          rating?: number
          response_text?: string | null
          review_text?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_contractors: {
        Row: {
          client_id: string
          contractor_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          client_id: string
          contractor_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          client_id?: string
          contractor_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_contractors_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_contractors_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_area_cities: {
        Row: {
          city: string
          created_at: string | null
          id: number
          state: string
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: number
          state: string
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: number
          state?: string
        }
        Relationships: []
      }
      service_areas: {
        Row: {
          city: string
          contractor_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
        }
        Insert: {
          city: string
          contractor_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          city?: string
          contractor_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "service_areas_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: number | null
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement: {
        Args: { x: number }
        Returns: number
      }
      increment: {
        Args: { x: number }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
