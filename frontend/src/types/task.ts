export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  ARCHIVED = "archived"
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent"
}

export interface TaskTag {
  id: number;
  name: string;
  color?: string;
  created_at: string;
  updated_at?: string;
}

export interface TaskCategory {
  id: number;
  name: string;
  color?: string;
  icon?: string;
  description?: string;
  position: number;
  created_at: string;
  updated_at?: string;
}

export enum GoalType {
  PERSONAL = "personal",
  PROFESSIONAL = "professional",
  HEALTH = "health",
  LEARNING = "learning",
  FINANCIAL = "financial",
  OTHER = "other"
}

export enum GoalStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  PAUSED = "paused",
  CANCELLED = "cancelled"
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  goal_type: GoalType;
  status: GoalStatus;
  target_date?: string;
  is_specific: boolean;
  is_measurable: boolean;
  is_achievable: boolean;
  is_relevant: boolean;
  is_time_bound: boolean;
  smart_score: number;
  progress_percentage: number;
  color?: string;
  icon?: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  position: number;
  category_id?: number;
  category?: TaskCategory;
  goal_id?: number;
  goal?: Goal;
  parent_task_id?: number;
  tags: TaskTag[];
  ai_score?: number;
  ai_suggestions?: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
  category_id?: number;
  goal_id?: number;
  parent_task_id?: number;
  tag_ids?: number[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  category_id?: number;
  goal_id?: number;
  parent_task_id?: number;
  tag_ids?: number[];
}

export interface TaskAICreate {
  title: string;
  description?: string;
  priority: TaskPriority | string;
  due_date?: string;
  estimated_duration?: number;
  tags?: string[];
  goal_id?: number;
}

export interface TaskStatusUpdate {
  status: TaskStatus;
}

export interface TaskPositionUpdate {
  position: number;
  status?: TaskStatus;
}

export interface TaskList {
  tasks: Task[];
  total: number;
}

export interface TaskCategoryCreate {
  name: string;
  color?: string;
  icon?: string;
  description?: string;
}

export interface TaskCategoryUpdate {
  name?: string;
  color?: string;
  icon?: string;
  description?: string;
  position?: number;
}

export interface TaskTagCreate {
  name: string;
  color?: string;
}

export interface TaskTagUpdate {
  name?: string;
  color?: string;
}

export interface GoalCreate {
  title: string;
  description?: string;
  goal_type: GoalType;
  target_date?: string;
  color?: string;
  icon?: string;
}

export interface GoalUpdate {
  title?: string;
  description?: string;
  goal_type?: GoalType;
  status?: GoalStatus;
  target_date?: string;
  is_specific?: boolean;
  is_measurable?: boolean;
  is_achievable?: boolean;
  is_relevant?: boolean;
  is_time_bound?: boolean;
  progress_percentage?: number;
  color?: string;
  icon?: string;
}

// Helper types for UI
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category_id?: number;
  search?: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}