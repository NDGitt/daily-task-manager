// Core data models for the Daily Task Manager

export interface User {
  id: string;
  email?: string;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  task_completion_behavior: 'change_color' | 'move_to_bottom' | 'hide' | 'stay_visible';
  task_completion_visual: 'change_color' | 'no_change';
  smart_suggestions_enabled: boolean;
  task_overload_threshold: number;
  project_auto_archive_days: number;
  project_archive_completed: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  content: string;
  date_created: string;
  date_completed?: string | null;
  order: number;
  completed: boolean;
  archived: boolean;
  project_id?: string | null;
  carry_over_count: number;
  eisenhower_quadrant?: 1 | 2 | 3 | 4 | null;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  date_created: string;
  last_accessed: string;
  archived: boolean;
  task_count: number;
}

export interface DailyTaskList {
  date: string;
  tasks: Task[];
  total_tasks: number;
  completed_tasks: number;
}

// Eisenhower Matrix quadrants
export type EisenhowerQuadrant = {
  id: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  color: string;
};

export const EISENHOWER_QUADRANTS: EisenhowerQuadrant[] = [
  { id: 1, name: "Do First", description: "Urgent + Important", color: "bg-red-100 border-red-300" },
  { id: 2, name: "Schedule", description: "Important, Not Urgent", color: "bg-blue-100 border-blue-300" },
  { id: 3, name: "Delegate", description: "Urgent, Not Important", color: "bg-yellow-100 border-yellow-300" },
  { id: 4, name: "Eliminate", description: "Not Urgent, Not Important", color: "bg-gray-100 border-gray-300" },
];

// UI State types
export interface AppState {
  currentView: 'daily' | 'projects' | 'settings' | 'matrix' | 'onboarding';
  selectedDate: string;
  isLoading: boolean;
  user: User | null;
  showPreviousDays: boolean;
  showProjects: boolean;
}

// Component props types
export interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onUpdateContent: (taskId: string, content: string) => void;
  onDelete: (taskId: string) => void;
  onReorder: (taskId: string, newOrder: number) => void;
}

export interface TaskListProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  onDeleteTask?: (task: Task) => void;
  userSettings?: UserSettings;
  isMatrixMode?: boolean;
}
