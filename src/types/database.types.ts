// Routineum データベース型定義

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
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
      };
      techniques: {
        Row: {
          id: string;
          performance_id: string;
          name: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          performance_id: string;
          name: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          performance_id?: string;
          name?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
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
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
