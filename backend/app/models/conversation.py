from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.models.base import Base, TimestampMixin, UserOwnedMixin


class ConversationStatus(str, enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    COMPLETED = "completed"


class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Conversation(Base, TimestampMixin, UserOwnedMixin):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    status = Column(String(20), default=ConversationStatus.ACTIVE.value, nullable=False)
    
    # Optional: link to a generated goal/project
    generated_goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    
    # Metadata for storing conversation context
    context_metadata = Column(JSON, nullable=True, default=dict)
    
    # Relationships
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    generated_goal = relationship("Goal", foreign_keys=[generated_goal_id])

    def __repr__(self):
        return f"<Conversation(id={self.id}, title='{self.title}', status='{self.status}')>"


class Message(Base, TimestampMixin):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    
    # Optional metadata for storing additional info (tokens used, model version, etc.)
    message_metadata = Column(JSON, nullable=True, default=dict)
    
    # Relationship
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<Message(id={self.id}, role='{self.role}', content='{self.content[:50]}...')>"

    @property
    def is_from_user(self) -> bool:
        """Check if message is from user"""
        return self.role == MessageRole.USER.value

    @property
    def is_from_assistant(self) -> bool:
        """Check if message is from AI assistant"""
        return self.role == MessageRole.ASSISTANT.value