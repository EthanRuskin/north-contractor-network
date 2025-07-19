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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      contractor_businesses: {
        Row: {
          address: string | null
          business_hours: Json | null
          business_name: string
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          gallery_images: string[] | null
          google_business_url: string | null
          google_business_verified: boolean | null
          google_place_id: string | null
          google_verification_date: string | null
          id: string
          insurance_verified: boolean | null
          latitude: number | null
          license_number: string | null
          logo_url: string | null
          longitude: number | null
          phone: string | null
          postal_code: string | null
          province: string | null
          rating: number | null
          review_count: number | null
          search_vector: unknown | null
          status: string
          updated_at: string
          user_id: string | null
          website: string | null
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          business_name: string
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          gallery_images?: string[] | null
          google_business_url?: string | null
          google_business_verified?: boolean | null
          google_place_id?: string | null
          google_verification_date?: string | null
          id?: string
          insurance_verified?: boolean | null
          latitude?: number | null
          license_number?: string | null
          logo_url?: string | null
          longitude?: number | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          rating?: number | null
          review_count?: number | null
          search_vector?: unknown | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          business_name?: string
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          gallery_images?: string[] | null
          google_business_url?: string | null
          google_business_verified?: boolean | null
          google_place_id?: string | null
          google_verification_date?: string | null
          id?: string
          insurance_verified?: boolean | null
          latitude?: number | null
          license_number?: string | null
          logo_url?: string | null
          longitude?: number | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          rating?: number | null
          review_count?: number | null
          search_vector?: unknown | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      contractor_projects: {
        Row: {
          contractor_id: string
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_contractor_projects_contractor"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contractor_projects_contractor"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_search_results"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_services: {
        Row: {
          contractor_id: string
          created_at: string
          id: string
          service_id: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          id?: string
          service_id: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contractor_services_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contractor_services_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_search_results"
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
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          user_type?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          contractor_id: string
          created_at: string
          id: string
          rating: number
          reviewer_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          comment?: string | null
          contractor_id: string
          created_at?: string
          id?: string
          rating: number
          reviewer_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          comment?: string | null
          contractor_id?: string
          created_at?: string
          id?: string
          rating?: number
          reviewer_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractor_search_results"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      contractor_search_results: {
        Row: {
          address: string | null
          base_ranking_score: number | null
          business_hours: Json | null
          business_name: string | null
          city: string | null
          created_at: string | null
          description: string | null
          email: string | null
          gallery_images: string[] | null
          id: string | null
          insurance_verified: boolean | null
          license_number: string | null
          logo_url: string | null
          phone: string | null
          postal_code: string | null
          province: string | null
          rating: number | null
          review_count: number | null
          search_vector: unknown | null
          service_ids: string[] | null
          service_names: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
          years_experience: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_contractor_ranking: {
        Args: {
          contractor_row: Database["public"]["Tables"]["contractor_businesses"]["Row"]
          search_query?: string
        }
        Returns: number
      }
      calculate_distance: {
        Args: { lat1: number; lon1: number; lat2: number; lon2: number }
        Returns: number
      }
      search_contractors_with_location: {
        Args: {
          search_query?: string
          service_filter?: string
          city_filter?: string
          province_filter?: string
          min_rating_filter?: number
          min_experience_filter?: number
          user_latitude?: number
          user_longitude?: number
          radius_km?: number
        }
        Returns: {
          id: string
          business_name: string
          description: string
          phone: string
          email: string
          website: string
          city: string
          province: string
          years_experience: number
          rating: number
          review_count: number
          logo_url: string
          gallery_images: string[]
          service_ids: string[]
          service_names: string[]
          base_ranking_score: number
          search_ranking_score: number
          latitude: number
          longitude: number
          distance_km: number
        }[]
      }
      search_contractors_with_ranking: {
        Args: {
          search_query?: string
          service_filter?: string
          city_filter?: string
          province_filter?: string
          min_rating_filter?: number
          min_experience_filter?: number
        }
        Returns: {
          id: string
          business_name: string
          description: string
          phone: string
          email: string
          website: string
          city: string
          province: string
          years_experience: number
          rating: number
          review_count: number
          logo_url: string
          gallery_images: string[]
          service_ids: string[]
          service_names: string[]
          base_ranking_score: number
          search_ranking_score: number
        }[]
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
