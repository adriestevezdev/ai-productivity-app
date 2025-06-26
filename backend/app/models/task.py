from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
from app.models.base import TimestampMixin, UserOwnedMixin
import enum
import uuid


class TaskStatus(enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class TaskPriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


# Association table for many-to-many relationship between tasks and tags
task_tags = Table(
    'task_tags',
    Base.metadata,
    Column('task_id', Integer, ForeignKey('tasks.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('task_tags_list.id', ondelete='CASCADE'), primary_key=True)
)


class Task(Base, TimestampMixin, UserOwnedMixin):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO, nullable=False)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False)
    due_date = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    estimated_hours = Column(Integer)  # Estimated time in hours
    actual_hours = Column(Integer)  # Actual time spent in hours
    
    # Position for Kanban board ordering
    position = Column(Integer, default=0)
    
    # Category relationship
    category_id = Column(Integer, ForeignKey('task_categories.id', ondelete='SET NULL'))
    category = relationship("TaskCategory", back_populates="tasks")
    
    # Tags relationship (many-to-many)
    tags = relationship("TaskTag", secondary=task_tags, back_populates="tasks")
    
    # Self-referential relationship for task dependencies
    parent_task_id = Column(Integer, ForeignKey('tasks.id', ondelete='CASCADE'))
    parent_task = relationship("Task", remote_side=[id], backref="subtasks")
    
    # Goal relationship
    goal_id = Column(Integer, ForeignKey('goals.id', ondelete='CASCADE'))
    goal = relationship("Goal", back_populates="tasks")
    
    # AI-related fields
    ai_score = Column(Integer)  # AI-calculated priority score (0-100)
    ai_suggestions = Column(Text)  # JSON field for AI suggestions


class TaskCategory(Base, TimestampMixin, UserOwnedMixin):
    __tablename__ = "task_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    color = Column(String(7))  # Hex color code
    icon = Column(String(50))  # Icon name/identifier
    description = Column(Text)
    
    # Position for ordering
    position = Column(Integer, default=0)
    
    # Relationship with tasks
    tasks = relationship("Task", back_populates="category")


class TaskTag(Base, TimestampMixin, UserOwnedMixin):
    __tablename__ = "task_tags_list"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    color = Column(String(7))  # Hex color code
    
    # Relationship with tasks
    tasks = relationship("Task", secondary=task_tags, back_populates="tags")