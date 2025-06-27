from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, List, Optional, Any


class Bottleneck(BaseModel):
    type: str
    description: str
    impact: str  # high, medium, low
    suggestion: str


class Optimization(BaseModel):
    type: str
    description: str
    suggestion: str
    priority: str  # high, medium, low


class AIRecommendation(BaseModel):
    type: str
    title: str
    description: str
    action_items: List[str]


class ProductivityInsights(BaseModel):
    productivity_score: float = Field(..., ge=0, le=100)
    total_tasks: int
    completed_tasks: int
    completion_rate: float = Field(..., ge=0, le=100)
    overdue_tasks: int
    avg_completion_days: float
    priority_distribution: Dict[str, int]
    status_distribution: Dict[str, int]
    bottlenecks: List[Bottleneck]
    optimizations: List[Optimization]
    ai_recommendations: List[AIRecommendation]
    period_days: int
    generated_at: datetime


class Milestone(BaseModel):
    title: str
    description: str
    target_date: Optional[datetime]
    estimated_hours: float


class SuccessMetric(BaseModel):
    metric: str
    target_value: str
    measurement_method: str


class PotentialObstacle(BaseModel):
    obstacle: str
    likelihood: str  # high, medium, low
    mitigation_strategy: str


class GoalBreakdownRequest(BaseModel):
    goal_id: int


class GoalBreakdown(BaseModel):
    goal_id: int
    milestones: List[Milestone]
    success_metrics: List[SuccessMetric]
    estimated_total_hours: float
    potential_obstacles: List[PotentialObstacle]
    recommended_tasks: List[Dict[str, Any]]  # Simplified task suggestions
    generated_at: datetime