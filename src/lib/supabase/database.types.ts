export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          org_id: string
          patient_profile_id: string
          clinician_id: string
          starts_at: string
          ends_at: string
          duration_minutes: number
          type: Database["public"]["Enums"]["appointment_type"]
          status: Database["public"]["Enums"]["appointment_status"]
          title: string | null
          notes: string | null
          patient_notes: string | null
          location: string | null
          recurrence_rule: string | null
          recurrence_parent_id: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          patient_profile_id: string
          clinician_id: string
          starts_at: string
          ends_at: string
          duration_minutes?: number
          type?: Database["public"]["Enums"]["appointment_type"]
          status?: Database["public"]["Enums"]["appointment_status"]
          title?: string | null
          notes?: string | null
          patient_notes?: string | null
          location?: string | null
          recurrence_rule?: string | null
          recurrence_parent_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          patient_profile_id?: string
          clinician_id?: string
          starts_at?: string
          ends_at?: string
          duration_minutes?: number
          type?: Database["public"]["Enums"]["appointment_type"]
          status?: Database["public"]["Enums"]["appointment_status"]
          title?: string | null
          notes?: string | null
          patient_notes?: string | null
          location?: string | null
          recurrence_rule?: string | null
          recurrence_parent_id?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_recurrence_parent_id_fkey"
            columns: ["recurrence_parent_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          id: string
          org_id: string
          actor_id: string
          patient_profile_id: string | null
          action: string
          resource: string | null
          resource_id: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          actor_id: string
          patient_profile_id?: string | null
          action: string
          resource?: string | null
          resource_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          actor_id?: string
          patient_profile_id?: string | null
          action?: string
          resource?: string | null
          resource_id?: string | null
          metadata?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinical_notes: {
        Row: {
          id: string
          org_id: string
          patient_profile_id: string
          author_id: string
          type: Database["public"]["Enums"]["note_type"]
          title: string | null
          body: string
          protocol_id: string | null
          appointment_id: string | null
          is_signed: boolean
          signed_at: string | null
          signed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          patient_profile_id: string
          author_id: string
          type?: Database["public"]["Enums"]["note_type"]
          title?: string | null
          body?: string
          protocol_id?: string | null
          appointment_id?: string | null
          is_signed?: boolean
          signed_at?: string | null
          signed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          patient_profile_id?: string
          author_id?: string
          type?: Database["public"]["Enums"]["note_type"]
          title?: string | null
          body?: string
          protocol_id?: string | null
          appointment_id?: string | null
          is_signed?: boolean
          signed_at?: string | null
          signed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinical_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "patient_protocols"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_notes_signed_by_fkey"
            columns: ["signed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_clinical_notes_appointment"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      clinician_assignments: {
        Row: {
          id: string
          org_id: string
          clinician_id: string
          patient_profile_id: string
          assigned_at: string
          assigned_by: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          clinician_id: string
          patient_profile_id: string
          assigned_at?: string
          assigned_by?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          clinician_id?: string
          patient_profile_id?: string
          assigned_at?: string
          assigned_by?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinician_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinician_assignments_clinician_id_fkey"
            columns: ["clinician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinician_assignments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinician_assignments_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          id: string
          org_id: string
          patient_profile_id: string
          entered_by: string
          test_name: string
          test_category: string | null
          value: number | null
          value_text: string | null
          unit: string | null
          reference_range_low: number | null
          reference_range_high: number | null
          reference_range_text: string | null
          flag: Database["public"]["Enums"]["lab_flag"] | null
          lab_date: string
          lab_name: string | null
          specimen_type: string | null
          notes: string | null
          file_storage_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          patient_profile_id: string
          entered_by: string
          test_name: string
          test_category?: string | null
          value?: number | null
          value_text?: string | null
          unit?: string | null
          reference_range_low?: number | null
          reference_range_high?: number | null
          reference_range_text?: string | null
          flag?: Database["public"]["Enums"]["lab_flag"] | null
          lab_date: string
          lab_name?: string | null
          specimen_type?: string | null
          notes?: string | null
          file_storage_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          patient_profile_id?: string
          entered_by?: string
          test_name?: string
          test_category?: string | null
          value?: number | null
          value_text?: string | null
          unit?: string | null
          reference_range_low?: number | null
          reference_range_high?: number | null
          reference_range_text?: string | null
          flag?: Database["public"]["Enums"]["lab_flag"] | null
          lab_date?: string
          lab_name?: string | null
          specimen_type?: string | null
          notes?: string | null
          file_storage_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_entered_by_fkey"
            columns: ["entered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_results_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          id: string
          message_id: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          file_name: string
          file_type: string
          file_size?: number
          storage_path: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          id: string
          org_id: string
          patient_profile_id: string
          subject: string | null
          status: Database["public"]["Enums"]["thread_status"]
          last_message_at: string | null
          last_message_preview: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          patient_profile_id: string
          subject?: string | null
          status?: Database["public"]["Enums"]["thread_status"]
          last_message_at?: string | null
          last_message_preview?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          patient_profile_id?: string
          subject?: string | null
          status?: Database["public"]["Enums"]["thread_status"]
          last_message_at?: string | null
          last_message_preview?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          thread_id: string
          org_id: string
          sender_id: string
          body: string
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          org_id: string
          sender_id: string
          body: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          org_id?: string
          sender_id?: string
          body?: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          id: string
          org_id: string
          user_id: string
          role: Database["public"]["Enums"]["org_role"]
          invited_at: string | null
          invited_by: string | null
          invite_method: Database["public"]["Enums"]["invite_method"] | null
          joined_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id: string
          role?: Database["public"]["Enums"]["org_role"]
          invited_at?: string | null
          invited_by?: string | null
          invite_method?: Database["public"]["Enums"]["invite_method"] | null
          joined_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          invited_at?: string | null
          invited_by?: string | null
          invite_method?: Database["public"]["Enums"]["invite_method"] | null
          joined_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_subscriptions: {
        Row: {
          id: string
          org_id: string
          tier: Database["public"]["Enums"]["clinic_subscription_tier"]
          status: Database["public"]["Enums"]["clinic_subscription_status"]
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          seat_count: number
          max_patients: number | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          tier?: Database["public"]["Enums"]["clinic_subscription_tier"]
          status?: Database["public"]["Enums"]["clinic_subscription_status"]
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          seat_count?: number
          max_patients?: number | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          tier?: Database["public"]["Enums"]["clinic_subscription_tier"]
          status?: Database["public"]["Enums"]["clinic_subscription_status"]
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          seat_count?: number
          max_patients?: number | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string | null
          logo_url: string | null
          features: Json
          timezone: string
          business_hours: Json | null
          primary_color: string | null
          invite_code: string | null
          invite_code_enabled: boolean
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          logo_url?: string | null
          features?: Json
          timezone?: string
          business_hours?: Json | null
          primary_color?: string | null
          invite_code?: string | null
          invite_code_enabled?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          logo_url?: string | null
          features?: Json
          timezone?: string
          business_hours?: Json | null
          primary_color?: string | null
          invite_code?: string | null
          invite_code_enabled?: boolean
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_invites: {
        Row: {
          id: string
          org_id: string
          patient_profile_id: string
          email: string
          invite_token: string
          invited_by: string
          expires_at: string
          accepted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          patient_profile_id: string
          email: string
          invite_token?: string
          invited_by: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          patient_profile_id?: string
          email?: string
          invite_token?: string
          invited_by?: string
          expires_at?: string
          accepted_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_invites_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_profiles: {
        Row: {
          id: string
          org_id: string
          user_id: string | null
          first_name: string | null
          last_name: string | null
          email: string
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          allergies: string[] | null
          medical_history: string | null
          current_medications: string | null
          status: Database["public"]["Enums"]["patient_status"]
          primary_clinician_id: string | null
          discharged_at: string | null
          discharged_by: string | null
          transition_ends_at: string | null
          discharge_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          user_id?: string | null
          first_name?: string | null
          last_name?: string | null
          email: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          allergies?: string[] | null
          medical_history?: string | null
          current_medications?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          primary_clinician_id?: string | null
          discharged_at?: string | null
          discharged_by?: string | null
          transition_ends_at?: string | null
          discharge_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          user_id?: string | null
          first_name?: string | null
          last_name?: string | null
          email?: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          allergies?: string[] | null
          medical_history?: string | null
          current_medications?: string | null
          status?: Database["public"]["Enums"]["patient_status"]
          primary_clinician_id?: string | null
          discharged_at?: string | null
          discharged_by?: string | null
          transition_ends_at?: string | null
          discharge_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_profiles_discharged_by_fkey"
            columns: ["discharged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_profiles_primary_clinician_id_fkey"
            columns: ["primary_clinician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_protocol_items: {
        Row: {
          id: string
          protocol_id: string
          compound_name: string
          dose_amount: number
          dose_unit: string
          frequency: Database["public"]["Enums"]["dosing_frequency"]
          frequency_custom: string | null
          route: string | null
          instructions: string | null
          is_active: boolean
          sort_order: number
          titration_phases: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          protocol_id: string
          compound_name: string
          dose_amount: number
          dose_unit: string
          frequency?: Database["public"]["Enums"]["dosing_frequency"]
          frequency_custom?: string | null
          route?: string | null
          instructions?: string | null
          is_active?: boolean
          sort_order?: number
          titration_phases?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          protocol_id?: string
          compound_name?: string
          dose_amount?: number
          dose_unit?: string
          frequency?: Database["public"]["Enums"]["dosing_frequency"]
          frequency_custom?: string | null
          route?: string | null
          instructions?: string | null
          is_active?: boolean
          sort_order?: number
          titration_phases?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_protocol_items_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "patient_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_protocols: {
        Row: {
          id: string
          org_id: string
          patient_profile_id: string
          template_id: string | null
          assigned_by: string
          name: string
          description: string | null
          status: Database["public"]["Enums"]["protocol_status"]
          start_date: string | null
          end_date: string | null
          notes: string | null
          stacktrax_stack_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          patient_profile_id: string
          template_id?: string | null
          assigned_by: string
          name: string
          description?: string | null
          status?: Database["public"]["Enums"]["protocol_status"]
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          stacktrax_stack_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          patient_profile_id?: string
          template_id?: string | null
          assigned_by?: string
          name?: string
          description?: string | null
          status?: Database["public"]["Enums"]["protocol_status"]
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          stacktrax_stack_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_protocols_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_protocols_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_protocols_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_protocols_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "protocol_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      protocol_template_items: {
        Row: {
          id: string
          template_id: string
          compound_name: string
          dose_amount: number
          dose_unit: string
          frequency: Database["public"]["Enums"]["dosing_frequency"]
          frequency_custom: string | null
          route: string | null
          instructions: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          compound_name: string
          dose_amount: number
          dose_unit: string
          frequency?: Database["public"]["Enums"]["dosing_frequency"]
          frequency_custom?: string | null
          route?: string | null
          instructions?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          compound_name?: string
          dose_amount?: number
          dose_unit?: string
          frequency?: Database["public"]["Enums"]["dosing_frequency"]
          frequency_custom?: string | null
          route?: string | null
          instructions?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocol_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "protocol_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      protocol_templates: {
        Row: {
          id: string
          org_id: string
          created_by: string
          name: string
          description: string | null
          category: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          created_by: string
          name: string
          description?: string | null
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          created_by?: string
          name?: string
          description?: string | null
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocol_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocol_templates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sent_notifications: {
        Row: {
          id: string
          user_id: string
          notification_type: string
          reference_key: string
          sent_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notification_type: string
          reference_key: string
          sent_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notification_type?: string
          reference_key?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sent_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stacktrax_links: {
        Row: {
          id: string
          org_id: string
          patient_profile_id: string
          stacktrax_user_id: string | null
          stacktrax_email: string
          status: Database["public"]["Enums"]["link_status"]
          consent_given_at: string | null
          consent_revoked_at: string | null
          share_dose_logs: boolean
          share_checkins: boolean
          share_body_metrics: boolean
          share_protocols: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          patient_profile_id: string
          stacktrax_user_id?: string | null
          stacktrax_email: string
          status?: Database["public"]["Enums"]["link_status"]
          consent_given_at?: string | null
          consent_revoked_at?: string | null
          share_dose_logs?: boolean
          share_checkins?: boolean
          share_body_metrics?: boolean
          share_protocols?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          patient_profile_id?: string
          stacktrax_user_id?: string | null
          stacktrax_email?: string
          status?: Database["public"]["Enums"]["link_status"]
          consent_given_at?: string | null
          consent_revoked_at?: string | null
          share_dose_logs?: boolean
          share_checkins?: boolean
          share_body_metrics?: boolean
          share_protocols?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stacktrax_links_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stacktrax_links_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          event_id: string
          processed_at: string
        }
        Insert: {
          event_id: string
          processed_at?: string
        }
        Update: {
          event_id?: string
          processed_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_assigned_clinician: {
        Args: {
          _org_id: string
          _patient_profile_id: string
        }
        Returns: boolean
      }
      is_linked_patient: {
        Args: {
          _patient_profile_id: string
        }
        Returns: boolean
      }
      is_org_member_with_role: {
        Args: {
          _org_id: string
          _min_role: Database["public"]["Enums"]["org_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "checked_in"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      appointment_type:
        | "initial_consult"
        | "follow_up"
        | "lab_review"
        | "check_in"
        | "telehealth"
        | "other"
      clinic_subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "cancelled"
        | "paused"
      clinic_subscription_tier:
        | "starter"
        | "professional"
        | "enterprise"
      dosing_frequency:
        | "daily"
        | "twice_daily"
        | "three_times_daily"
        | "every_other_day"
        | "weekly"
        | "biweekly"
        | "monthly"
        | "as_needed"
        | "custom"
      invite_method: "email" | "clinic_code"
      lab_flag: "normal" | "low" | "high" | "critical_low" | "critical_high"
      link_status: "pending" | "active" | "revoked"
      note_type: "intake" | "progress" | "follow_up" | "discharge" | "general"
      org_role: "owner" | "admin" | "clinician" | "staff" | "patient"
      patient_status: "invited" | "active" | "inactive" | "discharged"
      protocol_status:
        | "draft"
        | "active"
        | "paused"
        | "completed"
        | "cancelled"
      thread_status: "open" | "closed" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type aliases
type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
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
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
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
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
