from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.schemas.task import Task as TaskSchema
from app.services.task_prioritization import TaskPrioritizationService

router = APIRouter(prefix="/api/tasks", tags=["task-ai"])


@router.post("/update-scores", response_model=List[TaskSchema])
async def update_task_scores(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update AI priority scores for all active tasks"""
    updated_tasks = TaskPrioritizationService.update_task_scores(db, current_user)
    return updated_tasks


@router.get("/recommendations", response_model=List[TaskSchema])
async def get_task_recommendations(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get AI-recommended tasks based on priority scoring"""
    recommended_tasks = TaskPrioritizationService.get_recommended_tasks(
        db, current_user, limit
    )
    return recommended_tasks