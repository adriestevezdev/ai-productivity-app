export enum ConversationStatus {
  ACTIVE = "active",
  ARCHIVED = "archived", 
  COMPLETED = "completed"
}

export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system"
}

export interface Message {
  id: number;
  conversation_id: number;
  role: MessageRole;
  content: string;
  message_metadata?: Record<string, any>;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  status: ConversationStatus;
  user_id: string;
  generated_goal_id?: number;
  context_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface ConversationCreate {
  title: string;
  status?: ConversationStatus;
  initial_message?: string;
}

export interface ChatMessage {
  content: string;
}

export interface ChatResponse {
  message: Message;
  conversation: Conversation;
}

export interface ProjectAnalysis {
  suggested_title: string;
  suggested_description: string;
  estimated_timeline: string;
  key_milestones: string[];
  suggested_tasks: Array<{
    title: string;
    description: string;
    priority: string;
    estimated_duration: number;
  }>;
  confidence_score: number;
}

export interface ProjectGenerationRequest {
  conversation_id: number;
  analysis?: ProjectAnalysis;
  create_goal: boolean;
}

export interface ProjectGenerationResponse {
  analysis: ProjectAnalysis;
  goal_id?: number;
  created_tasks: Array<{
    title: string;
    description: string;
    priority: string;
    estimated_hours: number;
  }>;
}