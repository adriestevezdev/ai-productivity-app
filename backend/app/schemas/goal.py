from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.models.goal import GoalStatus, GoalType


class GoalBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    specific: Optional[str] = None
    measurable: Optional[str] = None
    achievable: Optional[str] = None
    relevant: Optional[str] = None
    time_bound: Optional[datetime] = None
    status: GoalStatus = GoalStatus.planning
    goal_type: GoalType = GoalType.other
    progress: Optional[float] = Field(0.0, ge=0.0, le=1.0)


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    specific: Optional[str] = None
    measurable: Optional[str] = None
    achievable: Optional[str] = None
    relevant: Optional[str] = None
    time_bound: Optional[datetime] = None
    status: Optional[GoalStatus] = None
    goal_type: Optional[GoalType] = None
    progress: Optional[float] = Field(None, ge=0.0, le=1.0)
    position: Optional[int] = None


class GoalStatusUpdate(BaseModel):
    status: GoalStatus


class GoalProgressUpdate(BaseModel):
    progress: float = Field(..., ge=0.0, le=1.0)


class GoalPositionUpdate(BaseModel):
    position: int


class TaskInGoal(BaseModel):
    id: int
    title: str
    status: str
    priority: str
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Goal(GoalBase):
    id: int
    user_id: str
    position: int
    ai_milestones: Optional[List[Dict[str, Any]]] = None
    ai_success_metrics: Optional[List[Dict[str, Any]]] = None
    ai_estimated_hours: Optional[float] = None
    ai_potential_obstacles: Optional[List[Dict[str, Any]]] = None
    ai_breakdown_generated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    tasks: List[TaskInGoal] = []

    model_config = ConfigDict(from_attributes=True)


class GoalList(BaseModel):
    goals: List[Goal]
    total: int


class GoalAIBreakdown(BaseModel):
    milestones: List[Dict[str, Any]]
    success_metrics: List[Dict[str, Any]]
    estimated_hours: float
    potential_obstacles: List[Dict[str, Any]]


class GoalAIBreakdownRequest(BaseModel):
    goal_id: int