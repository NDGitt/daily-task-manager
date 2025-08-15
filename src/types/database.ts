// Database types for Supabase integration

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          settings: UserSettings;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          settings?: UserSettings;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          settings?: UserSettings;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          date_created: string;
          date_completed: string | null;
          order: number;
          completed: boolean;
          project_id: string | null;
          carry_over_count: number;
          eisenhower_quadrant: 1 | 2 | 3 | 4 | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          date_created?: string;
          date_completed?: string | null;
          order: number;
          completed?: boolean;
          project_id?: string | null;
          carry_over_count?: number;
          eisenhower_quadrant?: 1 | 2 | 3 | 4 | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          date_created?: string;
          date_completed?: string | null;
          order?: number;
          completed?: boolean;
          project_id?: string | null;
          carry_over_count?: number;
          eisenhower_quadrant?: 1 | 2 | 3 | 4 | null;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date_created: string;
          last_accessed: string;
          archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          date_created?: string;
          last_accessed?: string;
          archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          date_created?: string;
          last_accessed?: string;
          archived?: boolean;
          updated_at?: string;
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
}

export interface UserSettings {
  task_completion_behavior: 'change_color' | 'move_to_bottom' | 'hide' | 'stay_visible';
  smart_suggestions_enabled: boolean;
  task_overload_threshold: number;
}
