export interface Task {
  id: number;
  title: string;
  description?: string;
  task_date: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PomodoroSettings {
  id: number;
  work_duration: number;
  short_break: number;
  long_break: number;
  sessions_until_long_break: number;
  created_at: string;
  updated_at: string;
}

export interface PomodoroSession {
  id: number;
  task_id?: number;
  session_type: 'work' | 'short_break' | 'long_break';
  duration: number;
  completed: boolean;
  started_at: string;
  completed_at?: string;
  tasks?: {
    title: string;
  };
}
