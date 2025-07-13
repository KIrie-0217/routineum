// Routineum データベース型定義

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      performances: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          performance_date: string;
          music_link: string | null;
          notes: string | null;
          is_completed: boolean;
          result_percentage: number | null;
          ranking: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          performance_date: string;
          music_link?: string | null;
          notes?: string | null;
          is_completed?: boolean;
          result_percentage?: number | null;
          ranking?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          performance_date?: string;
          music_link?: string | null;
          notes?: string | null;
          is_completed?: boolean;
          result_percentage?: number | null;
          ranking?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "performances_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      techniques: {
        Row: {
          id: string;
          performance_id: string;
          name: string;
          notes: string | null;
          unit: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          performance_id: string;
          name: string;
          notes?: string | null;
          unit?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          performance_id?: string;
          name?: string;
          notes?: string | null;
          unit?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "techniques_performance_id_fkey";
            columns: ["performance_id"];
            referencedRelation: "performances";
            referencedColumns: ["id"];
          }
        ];
      };
      performance_practices: {
        Row: {
          id: string;
          performance_id: string;
          success_rate: number;
          practice_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          performance_id: string;
          success_rate: number;
          practice_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          performance_id?: string;
          success_rate?: number;
          practice_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "performance_practices_performance_id_fkey";
            columns: ["performance_id"];
            referencedRelation: "performances";
            referencedColumns: ["id"];
          }
        ];
      };
      technique_practices: {
        Row: {
          id: string;
          technique_id: string;
          success_rate: number;
          practice_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          technique_id: string;
          success_rate: number;
          practice_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          technique_id?: string;
          success_rate?: number;
          practice_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "technique_practices_technique_id_fkey";
            columns: ["technique_id"];
            referencedRelation: "techniques";
            referencedColumns: ["id"];
          }
        ];
      };
      tricks: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          difficulty: number;
          mastery_level: number;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          difficulty?: number;
          mastery_level?: number;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          difficulty?: number;
          mastery_level?: number;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tricks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_user_record: {
        Args: {
          user_id: string;
          created_timestamp: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
