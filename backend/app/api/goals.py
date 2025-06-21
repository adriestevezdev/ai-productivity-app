from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from typing import List, Optional, Dict, Any

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models.goal import Goal, GoalStatus, GoalType
from app.schemas.goal import (
    Goal as GoalSchema,
    GoalCreate,
    GoalUpdate,
    GoalStatusUpdate,
    GoalProgressUpdate,
    GoalPositionUpdate,
    GoalList,
    GoalAIBreakdown,
    GoalAIBreakdownRequest
)
from app.services.goal_service import GoalService

router = APIRouter(prefix="/api", tags=["goals"])


@router.get("/goals", response_model=GoalList)
async def get_goals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[GoalStatus] = None,
    goal_type: Optional[GoalType] = None,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get all goals for the current user with optional filters"""
    goals = GoalService.get_goals(
        db=db,
        user_id=current_user,
        status=status,
        goal_type=goal_type,
        limit=limit,
        offset=skip
    )
    
    # Get total count
    total_query = db.query(Goal).filter(Goal.user_id == current_user)
    if status:
        total_query = total_query.filter(Goal.status == status)
    if goal_type:
        total_query = total_query.filter(Goal.goal_type == goal_type)
    total = total_query.count()
    
    return GoalList(goals=goals, total=total)


@router.get("/goals/{goal_id}", response_model=GoalSchema)
async def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get a specific goal by ID"""
    goal = db.query(Goal).options(
        joinedload(Goal.tasks)
    ).filter(
        and_(Goal.id == goal_id, Goal.user_id == current_user)
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return goal


@router.post("/goals", response_model=GoalSchema)
async def create_goal(
    goal_data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new goal"""
    goal = GoalService.create_goal(db=db, goal_data=goal_data, user_id=current_user)
    
    # Load relationships
    db.refresh(goal, ["tasks"])
    
    return goal


@router.put("/goals/{goal_id}", response_model=GoalSchema)
async def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update a goal"""
    goal = GoalService.update_goal(db=db, goal_id=goal_id, goal_data=goal_data, user_id=current_user)
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Load relationships
    db.refresh(goal, ["tasks"])
    
    return goal


@router.delete("/goals/{goal_id}")
async def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete a goal"""
    success = GoalService.delete_goal(db=db, goal_id=goal_id, user_id=current_user)
    
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return {"message": "Goal deleted successfully"}


@router.patch("/goals/{goal_id}/status", response_model=GoalSchema)
async def update_goal_status(
    goal_id: int,
    status_data: GoalStatusUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update only the status of a goal"""
    goal = GoalService.get_goal(db=db, goal_id=goal_id, user_id=current_user)
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal_update = GoalUpdate(status=status_data.status)
    updated_goal = GoalService.update_goal(db=db, goal_id=goal_id, goal_data=goal_update, user_id=current_user)
    
    # Load relationships
    db.refresh(updated_goal, ["tasks"])
    
    return updated_goal


@router.patch("/goals/{goal_id}/progress", response_model=GoalSchema)
async def update_goal_progress(
    goal_id: int,
    progress_data: GoalProgressUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update only the progress of a goal"""
    goal = GoalService.get_goal(db=db, goal_id=goal_id, user_id=current_user)
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal_update = GoalUpdate(progress=progress_data.progress)
    updated_goal = GoalService.update_goal(db=db, goal_id=goal_id, goal_data=goal_update, user_id=current_user)
    
    # Load relationships
    db.refresh(updated_goal, ["tasks"])
    
    return updated_goal


@router.patch("/goals/{goal_id}/auto-progress", response_model=GoalSchema)
async def auto_update_goal_progress(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Automatically update goal progress based on linked tasks"""
    goal = GoalService.update_goal_progress(db=db, goal_id=goal_id, user_id=current_user)
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Load relationships
    db.refresh(goal, ["tasks"])
    
    return goal


@router.patch("/goals/{goal_id}/position", response_model=GoalSchema)
async def update_goal_position(
    goal_id: int,
    position_data: GoalPositionUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update the position of a goal"""
    goal = GoalService.get_goal(db=db, goal_id=goal_id, user_id=current_user)
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal_update = GoalUpdate(position=position_data.position)
    updated_goal = GoalService.update_goal(db=db, goal_id=goal_id, goal_data=goal_update, user_id=current_user)
    
    # Load relationships
    db.refresh(updated_goal, ["tasks"])
    
    return updated_goal


@router.post("/goals/reorder", response_model=List[GoalSchema])
async def reorder_goals(
    goal_positions: List[Dict[str, int]],
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Reorder multiple goals by updating their positions"""
    goals = GoalService.reorder_goals(db=db, user_id=current_user, goal_positions=goal_positions)
    
    return goals


@router.get("/goals/statistics")
async def get_goal_statistics(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get goal statistics for the current user"""
    stats = GoalService.get_goal_statistics(db=db, user_id=current_user)
    
    return stats


@router.get("/goals/due-soon", response_model=List[GoalSchema])
async def get_goals_due_soon(
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get goals due within the specified number of days"""
    goals = GoalService.get_goals_due_soon(db=db, user_id=current_user, days=days)
    
    return goals


@router.post("/goals/{goal_id}/ai-breakdown", response_model=GoalAIBreakdown)
async def generate_ai_breakdown(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Generate AI-powered breakdown for a goal"""
    breakdown = GoalService.generate_ai_breakdown(db=db, goal_id=goal_id, user_id=current_user)
    
    if not breakdown:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return GoalAIBreakdown(
        milestones=breakdown["milestones"],
        success_metrics=breakdown["success_metrics"],
        estimated_hours=breakdown["estimated_hours"],
        potential_obstacles=breakdown["potential_obstacles"]
    )