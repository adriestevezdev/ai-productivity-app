from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.models.conversation import ConversationStatus, MessageRole


# Message Schemas
class MessageBase(BaseModel):
    role: MessageRole
    content: str
    message_metadata: Optional[Dict[str, Any]] = None


class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: int
    conversation_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Conversation Schemas
class ConversationBase(BaseModel):
    title: str
    status: ConversationStatus = ConversationStatus.ACTIVE


class ConversationCreate(ConversationBase):
    initial_message: Optional[str] = None


class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[ConversationStatus] = None
    generated_goal_id: Optional[int] = None


class Conversation(ConversationBase):
    id: int
    user_id: str
    generated_goal_id: Optional[int] = None
    context_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationWithMessages(Conversation):
    messages: List[Message] = []


# Chat-related schemas
class ChatMessage(BaseModel):
    content: str


class ChatResponse(BaseModel):
    message: Message
    conversation: Conversation


# Project analysis schemas
class ProjectAnalysis(BaseModel):
    suggested_title: str
    suggested_description: str
    estimated_timeline: str
    key_milestones: List[str]
    suggested_tasks: List[Dict[str, Any]]
    confidence_score: float = Field(..., ge=0, le=1)


class ProjectGenerationRequest(BaseModel):
    conversation_id: int
    analysis: Optional[ProjectAnalysis] = None
    create_goal: bool = True


class ProjectGenerationResponse(BaseModel):
    analysis: ProjectAnalysis
    goal_id: Optional[int] = None
    created_tasks: List[Dict[str, Any]] = []