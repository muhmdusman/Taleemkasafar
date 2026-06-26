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
      attempt_answers: {
        Row: {
          answered_at: string
          attempt_id: string
          created_at: string
          id: string
          is_correct: boolean | null
          question_id: string
          selected_option_id: string | null
          time_taken_ms: number | null
        }
        Insert: {
          answered_at?: string
          attempt_id: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          selected_option_id?: string | null
          time_taken_ms?: number | null
        }
        Update: {
          answered_at?: string
          attempt_id?: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          selected_option_id?: string | null
          time_taken_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          blueprint_id: string | null
          created_at: string
          entry_test_id: string
          expires_at: string | null
          id: string
          mode: Database["public"]["Enums"]["attempt_mode"]
          started_at: string
          status: Database["public"]["Enums"]["attempt_status"]
          submitted_at: string | null
          test_subject_id: string | null
          topic_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blueprint_id?: string | null
          created_at?: string
          entry_test_id: string
          expires_at?: string | null
          id?: string
          mode: Database["public"]["Enums"]["attempt_mode"]
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          submitted_at?: string | null
          test_subject_id?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blueprint_id?: string | null
          created_at?: string
          entry_test_id?: string
          expires_at?: string | null
          id?: string
          mode?: Database["public"]["Enums"]["attempt_mode"]
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          submitted_at?: string | null
          test_subject_id?: string | null
          topic_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "mock_test_blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_entry_test_id_fkey"
            columns: ["entry_test_id"]
            isOneToOne: false
            referencedRelation: "entry_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_test_subject_id_fkey"
            columns: ["test_subject_id"]
            isOneToOne: false
            referencedRelation: "test_subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          note: string | null
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_tests: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          external_id: string
          id: string
          is_active: boolean
          name: string
          slug: string
          source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          external_id: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          external_id?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_resources: {
        Row: {
          created_at: string
          deleted_at: string | null
          display_order: number
          id: string
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          resource_kind: Database["public"]["Enums"]["resource_kind"]
          storage_path: string | null
          title: string
          topic_id: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          display_order?: number
          id?: string
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          resource_kind: Database["public"]["Enums"]["resource_kind"]
          storage_path?: string | null
          title: string
          topic_id: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          display_order?: number
          id?: string
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          resource_kind?: Database["public"]["Enums"]["resource_kind"]
          storage_path?: string | null
          title?: string
          topic_id?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_resources_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_blueprint_slots: {
        Row: {
          blueprint_id: string
          created_at: string
          difficulty_mix: Json
          display_order: number
          id: string
          past_paper_min: number
          practice_max: number | null
          question_count: number
          test_subject_id: string
          updated_at: string
        }
        Insert: {
          blueprint_id: string
          created_at?: string
          difficulty_mix?: Json
          display_order?: number
          id?: string
          past_paper_min?: number
          practice_max?: number | null
          question_count: number
          test_subject_id: string
          updated_at?: string
        }
        Update: {
          blueprint_id?: string
          created_at?: string
          difficulty_mix?: Json
          display_order?: number
          id?: string
          past_paper_min?: number
          practice_max?: number | null
          question_count?: number
          test_subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_blueprint_slots_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "mock_test_blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mock_blueprint_slots_test_subject_id_fkey"
            columns: ["test_subject_id"]
            isOneToOne: false
            referencedRelation: "test_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_results: {
        Row: {
          attempt_id: string
          attempted_count: number
          correct_count: number
          created_at: string
          id: string
          incorrect_count: number
          per_subject: Json
          score_percent: number
          skipped_count: number
          total_questions: number
          total_time_ms: number | null
        }
        Insert: {
          attempt_id: string
          attempted_count: number
          correct_count: number
          created_at?: string
          id?: string
          incorrect_count: number
          per_subject?: Json
          score_percent: number
          skipped_count: number
          total_questions: number
          total_time_ms?: number | null
        }
        Update: {
          attempt_id?: string
          attempted_count?: number
          correct_count?: number
          created_at?: string
          id?: string
          incorrect_count?: number
          per_subject?: Json
          score_percent?: number
          skipped_count?: number
          total_questions?: number
          total_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mock_results_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: true
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      mock_test_blueprints: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          duration_seconds: number
          entry_test_id: string
          external_id: string | null
          id: string
          is_active: boolean
          name: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          duration_seconds: number
          entry_test_id: string
          external_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          total_questions: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          duration_seconds?: number
          entry_test_id?: string
          external_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mock_test_blueprints_entry_test_id_fkey"
            columns: ["entry_test_id"]
            isOneToOne: false
            referencedRelation: "entry_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          selected_test_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          selected_test_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          selected_test_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_selected_test_id_fkey"
            columns: ["selected_test_id"]
            isOneToOne: false
            referencedRelation: "entry_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          content: string
          content_format: Database["public"]["Enums"]["content_format"]
          created_at: string
          display_order: number
          id: string
          is_correct: boolean
          option_label: string
          question_id: string
          updated_at: string
        }
        Insert: {
          content: string
          content_format?: Database["public"]["Enums"]["content_format"]
          created_at?: string
          display_order?: number
          id?: string
          is_correct?: boolean
          option_label: string
          question_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          content_format?: Database["public"]["Enums"]["content_format"]
          created_at?: string
          display_order?: number
          id?: string
          is_correct?: boolean
          option_label?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_tests: {
        Row: {
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty"] | null
          entry_test_id: string
          id: string
          paper_session: string | null
          question_id: string
          source_year: number | null
          updated_at: string
          usage_type: Database["public"]["Enums"]["question_usage"]
        }
        Insert: {
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"] | null
          entry_test_id: string
          id?: string
          paper_session?: string | null
          question_id: string
          source_year?: number | null
          updated_at?: string
          usage_type: Database["public"]["Enums"]["question_usage"]
        }
        Update: {
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"] | null
          entry_test_id?: string
          id?: string
          paper_session?: string | null
          question_id?: string
          source_year?: number | null
          updated_at?: string
          usage_type?: Database["public"]["Enums"]["question_usage"]
        }
        Relationships: [
          {
            foreignKeyName: "question_tests_entry_test_id_fkey"
            columns: ["entry_test_id"]
            isOneToOne: false
            referencedRelation: "entry_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_tests_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          deleted_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty"]
          explanation: string | null
          explanation_format: Database["public"]["Enums"]["content_format"]
          external_id: string
          id: string
          image_path: string | null
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          review_note: string | null
          source: string | null
          statement: string
          statement_format: Database["public"]["Enums"]["content_format"]
          subject_id: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          explanation?: string | null
          explanation_format?: Database["public"]["Enums"]["content_format"]
          external_id: string
          id?: string
          image_path?: string | null
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          review_note?: string | null
          source?: string | null
          statement: string
          statement_format?: Database["public"]["Enums"]["content_format"]
          subject_id: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          explanation?: string | null
          explanation_format?: Database["public"]["Enums"]["content_format"]
          external_id?: string
          id?: string
          image_path?: string | null
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          review_note?: string | null
          source?: string | null
          statement?: string
          statement_format?: Database["public"]["Enums"]["content_format"]
          subject_id?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_questions_topic_subject"
            columns: ["topic_id", "subject_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id", "subject_id"]
          },
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          external_id: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_subjects: {
        Row: {
          created_at: string
          deleted_at: string | null
          difficulty_profile: Json
          display_order: number
          entry_test_id: string
          id: string
          is_active: boolean
          nature_of_questions: string | null
          subject_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          difficulty_profile?: Json
          display_order?: number
          entry_test_id: string
          id?: string
          is_active?: boolean
          nature_of_questions?: string | null
          subject_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          difficulty_profile?: Json
          display_order?: number
          entry_test_id?: string
          id?: string
          is_active?: boolean
          nature_of_questions?: string | null
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_subjects_entry_test_id_fkey"
            columns: ["entry_test_id"]
            isOneToOne: false
            referencedRelation: "entry_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          deleted_at: string | null
          display_order: number
          external_id: string
          id: string
          kind: Database["public"]["Enums"]["topic_kind"]
          parent_topic_id: string | null
          slug: string
          source_ref: string | null
          subject_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          display_order?: number
          external_id: string
          id?: string
          kind?: Database["public"]["Enums"]["topic_kind"]
          parent_topic_id?: string | null
          slug: string
          source_ref?: string | null
          subject_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          display_order?: number
          external_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["topic_kind"]
          parent_topic_id?: string | null
          slug?: string
          source_ref?: string | null
          subject_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_topics_parent_subject"
            columns: ["parent_topic_id", "subject_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id", "subject_id"]
          },
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      chapter_overview: {
        Row: {
          chapter_external_id: string | null
          chapter_id: string | null
          chapter_kind: Database["public"]["Enums"]["topic_kind"] | null
          chapter_slug: string | null
          chapter_title: string | null
          display_order: number | null
          entry_test_id: string | null
          entry_test_slug: string | null
          question_count: number | null
          subject_id: string | null
          subject_slug: string | null
          subtopic_count: number | null
        }
        Relationships: []
      }
      entry_test_public: {
        Row: {
          description: string | null
          display_order: number | null
          id: string | null
          name: string | null
          slug: string | null
          source: string | null
        }
        Relationships: []
      }
      subject_overview: {
        Row: {
          chapter_count: number | null
          display_order: number | null
          entry_test_id: string | null
          entry_test_slug: string | null
          nature_of_questions: string | null
          question_count: number | null
          subject_id: string | null
          subject_name: string | null
          subject_slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_subjects_entry_test_id_fkey"
            columns: ["entry_test_id"]
            isOneToOne: false
            referencedRelation: "entry_tests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      attempt_mode: "practice" | "mock"
      attempt_status: "in_progress" | "submitted" | "abandoned"
      content_format: "plain" | "latex" | "markdown"
      difficulty: "easy" | "medium" | "hard"
      moderation_status: "draft" | "flagged" | "approved"
      question_usage: "past_paper" | "practice"
      resource_kind: "note" | "slides" | "video"
      topic_kind: "chapter" | "topic" | "subtopic"
      user_role: "student" | "admin"
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
      attempt_mode: ["practice", "mock"],
      attempt_status: ["in_progress", "submitted", "abandoned"],
      content_format: ["plain", "latex", "markdown"],
      difficulty: ["easy", "medium", "hard"],
      moderation_status: ["draft", "flagged", "approved"],
      question_usage: ["past_paper", "practice"],
      resource_kind: ["note", "slides", "video"],
      topic_kind: ["chapter", "topic", "subtopic"],
      user_role: ["student", "admin"],
    },
  },
} as const
