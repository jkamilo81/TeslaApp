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
    PostgrestVersion: "14.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          created_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          created_by?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      family_invitations: {
        Row: {
          id: string
          family_id: string
          code: string
          created_by: string | null
          expires_at: string
          created_at: string | null
        }
        Insert: {
          id?: string
          family_id: string
          code: string
          created_by?: string | null
          expires_at: string
          created_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          code?: string
          created_by?: string | null
          expires_at?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_invitations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          role: string
          joined_at: string | null
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          role: string
          joined_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          role?: string
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      food_purchases: {
        Row: {
          id: string
          pet_id: string | null
          brand: string
          quantity: number
          quantity_unit: string
          purchase_date: string
          cost_cop: number
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          pet_id?: string | null
          brand: string
          quantity: number
          quantity_unit?: string
          purchase_date: string
          cost_cop: number
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          pet_id?: string | null
          brand?: string
          quantity?: number
          quantity_unit?: string
          purchase_date?: string
          cost_cop?: number
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_purchases_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance: {
        Row: {
          cost_cop: number | null
          created_at: string | null
          expiry_date: string
          id: string
          notes: string | null
          pet_id: string | null
          policy_number: string | null
          provider: string
          start_date: string
          status: string
        }
        Insert: {
          cost_cop?: number | null
          created_at?: string | null
          expiry_date: string
          id?: string
          notes?: string | null
          pet_id?: string | null
          policy_number?: string | null
          provider: string
          start_date: string
          status?: string
        }
        Update: {
          cost_cop?: number | null
          created_at?: string | null
          expiry_date?: string
          id?: string
          notes?: string | null
          pet_id?: string | null
          policy_number?: string | null
          provider?: string
          start_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_exams: {
        Row: {
          id: string
          pet_id: string | null
          name: string
          exam_date: string
          vet_name: string | null
          file_url: string | null
          cost_cop: number | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          pet_id?: string | null
          name: string
          exam_date: string
          vet_name?: string | null
          file_url?: string | null
          cost_cop?: number | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          pet_id?: string | null
          name?: string
          exam_date?: string
          vet_name?: string | null
          file_url?: string | null
          cost_cop?: number | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_exams_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          id: string
          appointment_id: string | null
          notification_type: string
          sent_at: string | null
        }
        Insert: {
          id?: string
          appointment_id?: string | null
          notification_type: string
          sent_at?: string | null
        }
        Update: {
          id?: string
          appointment_id?: string | null
          notification_type?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_log_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "vet_appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      parasite_control: {
        Row: {
          administered_date: string
          cost_cop: number | null
          created_at: string | null
          id: string
          next_due_date: string | null
          notes: string | null
          pet_id: string | null
          product_name: string
          type: string
        }
        Insert: {
          administered_date: string
          cost_cop?: number | null
          created_at?: string | null
          id?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string | null
          product_name: string
          type: string
        }
        Update: {
          administered_date?: string
          cost_cop?: number | null
          created_at?: string | null
          id?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string | null
          product_name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "parasite_control_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      payers: {
        Row: {
          id: string
          name: string
          is_default: boolean | null
          family_id: string | null
          user_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          is_default?: boolean | null
          family_id?: string | null
          user_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          is_default?: boolean | null
          family_id?: string | null
          user_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payers_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_distributions: {
        Row: {
          id: string
          record_table: string
          record_id: string
          payer_id: string | null
          amount: number
          created_at: string | null
        }
        Insert: {
          id?: string
          record_table: string
          record_id: string
          payer_id?: string | null
          amount: number
          created_at?: string | null
        }
        Update: {
          id?: string
          record_table?: string
          record_id?: string
          payer_id?: string | null
          amount?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_distributions_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "payers"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          birth_date: string | null
          breed: string | null
          created_at: string | null
          family_id: string | null
          id: string
          name: string
          type: string
          user_id: string | null
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          name: string
          type: string
          user_id?: string | null
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string | null
          family_id?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          family_id: string | null
          id: string
          p256dh: string
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          family_id?: string | null
          id?: string
          p256dh: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          family_id?: string | null
          id?: string
          p256dh?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      service_certificates: {
        Row: {
          certificate_number: string | null
          certificate_type: string
          cost_cop: number | null
          created_at: string | null
          expiry_date: string | null
          id: string
          issued_date: string
          issuing_authority: string | null
          notes: string | null
          pet_id: string | null
        }
        Insert: {
          certificate_number?: string | null
          certificate_type: string
          cost_cop?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issued_date: string
          issuing_authority?: string | null
          notes?: string | null
          pet_id?: string | null
        }
        Update: {
          certificate_number?: string | null
          certificate_type?: string
          cost_cop?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          issued_date?: string
          issuing_authority?: string | null
          notes?: string | null
          pet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_certificates_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccines: {
        Row: {
          administered_date: string
          cost_cop: number | null
          created_at: string | null
          file_url: string | null
          id: string
          name: string
          next_due_date: string | null
          notes: string | null
          pet_id: string | null
          vet_name: string | null
        }
        Insert: {
          administered_date: string
          cost_cop?: number | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          name: string
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string | null
          vet_name?: string | null
        }
        Update: {
          administered_date?: string
          cost_cop?: number | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          name?: string
          next_due_date?: string | null
          notes?: string | null
          pet_id?: string | null
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccines_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      vet_appointments: {
        Row: {
          appointment_date: string
          clinic_name: string | null
          cost_cop: number | null
          created_at: string | null
          id: string
          notes: string | null
          pet_id: string | null
          reason: string
          status: string
          vet_name: string | null
        }
        Insert: {
          appointment_date: string
          clinic_name?: string | null
          cost_cop?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          pet_id?: string | null
          reason: string
          status?: string
          vet_name?: string | null
        }
        Update: {
          appointment_date?: string
          clinic_name?: string | null
          cost_cop?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          pet_id?: string | null
          reason?: string
          status?: string
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vet_appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
