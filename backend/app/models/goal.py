from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Enum, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.base import TimestampMixin, UserOwnedMixin
import enum


class GoalStatus(enum.Enum):
    planning = "planning"
    active = "active"
    completed = "completed"
    abandoned = "abandoned"
    on_hold = "on_hold"


class GoalType(enum.Enum):
    personal = "personal"
    professional = "professional"
    health = "health"
    financial = "financial"
    educational = "educational"
    project = "project"
    other = "other"


class Goal(Base, TimestampMixin, UserOwnedMixin):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    
    # SMART goal components
    specific = Column(Text)  # What exactly will be accomplished?
    measurable = Column(Text)  # How will progress be measured?
    achievable = Column(Text)  # How realistic is the goal?
    relevant = Column(Text)  # Why is this goal important?
    time_bound = Column(DateTime(timezone=True))  # When should it be completed?
    
    status = Column(Enum(GoalStatus), default=GoalStatus.planning, nullable=False)
    goal_type = Column(Enum(GoalType), default=GoalType.other, nullable=False)
    progress = Column(Float, default=0.0)  # Progress percentage (0.0 to 1.0)
    
    # AI-generated fields
    ai_milestones = Column(JSON)  # AI-suggested milestones
    ai_success_metrics = Column(JSON)  # AI-suggested success metrics
    ai_estimated_hours = Column(Float)  # AI estimation of time needed
    ai_potential_obstacles = Column(JSON)  # AI-identified potential obstacles
    ai_breakdown_generated_at = Column(DateTime(timezone=True))  # When AI analysis was last run
    
    # Position for ordering
    position = Column(Integer, default=0)
    
    # Relationship with tasks
    tasks = relationship("Task", back_populates="goal", cascade="all, delete-orphan")