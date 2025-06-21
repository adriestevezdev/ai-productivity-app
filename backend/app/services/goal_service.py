from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from app.models.goal import Goal, GoalStatus, GoalType
from app.models.task import Task, TaskStatus
from app.schemas.goal import GoalCreate, GoalUpdate


class GoalService:
    """Service for managing goals and their AI-powered features"""
    
    @staticmethod
    def create_goal(db: Session, goal_data: GoalCreate, user_id: str) -> Goal:
        """Create a new goal for a user"""
        # Get the highest position for ordering
        max_position = db.query(Goal).filter(Goal.user_id == user_id).count()
        
        goal = Goal(
            title=goal_data.title,
            description=goal_data.description,
            specific=goal_data.specific,
            measurable=goal_data.measurable,
            achievable=goal_data.achievable,
            relevant=goal_data.relevant,
            time_bound=goal_data.time_bound,
            status=goal_data.status,
            goal_type=goal_data.goal_type,
            progress=goal_data.progress,
            position=max_position,
            user_id=user_id
        )
        
        db.add(goal)
        db.commit()
        db.refresh(goal)
        return goal
    
    @staticmethod
    def get_goal(db: Session, goal_id: int, user_id: str) -> Optional[Goal]:
        """Get a specific goal by ID for a user"""
        return db.query(Goal).filter(
            and_(Goal.id == goal_id, Goal.user_id == user_id)
        ).first()
    
    @staticmethod
    def get_goals(
        db: Session, 
        user_id: str, 
        status: Optional[GoalStatus] = None,
        goal_type: Optional[GoalType] = None,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> List[Goal]:
        """Get goals for a user with optional filtering"""
        query = db.query(Goal).filter(Goal.user_id == user_id)
        
        if status:
            query = query.filter(Goal.status == status)
        
        if goal_type:
            query = query.filter(Goal.goal_type == goal_type)
        
        query = query.order_by(Goal.position, Goal.created_at)
        
        if limit:
            query = query.offset(offset).limit(limit)
        
        return query.all()
    
    @staticmethod
    def update_goal(db: Session, goal_id: int, goal_data: GoalUpdate, user_id: str) -> Optional[Goal]:
        """Update a goal"""
        goal = db.query(Goal).filter(
            and_(Goal.id == goal_id, Goal.user_id == user_id)
        ).first()
        
        if not goal:
            return None
        
        update_data = goal_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(goal, field, value)
        
        goal.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(goal)
        return goal
    
    @staticmethod
    def delete_goal(db: Session, goal_id: int, user_id: str) -> bool:
        """Delete a goal and unlink associated tasks"""
        goal = db.query(Goal).filter(
            and_(Goal.id == goal_id, Goal.user_id == user_id)
        ).first()
        
        if not goal:
            return False
        
        # Unlink associated tasks
        db.query(Task).filter(Task.goal_id == goal_id).update({"goal_id": None})
        
        db.delete(goal)
        db.commit()
        return True
    
    @staticmethod
    def update_goal_progress(db: Session, goal_id: int, user_id: str) -> Optional[Goal]:
        """Automatically update goal progress based on linked tasks"""
        goal = db.query(Goal).filter(
            and_(Goal.id == goal_id, Goal.user_id == user_id)
        ).first()
        
        if not goal:
            return None
        
        # Get all tasks linked to this goal
        tasks = db.query(Task).filter(
            and_(Task.goal_id == goal_id, Task.user_id == user_id)
        ).all()
        
        if not tasks:
            goal.progress = 0.0
        else:
            completed_tasks = [t for t in tasks if t.status == TaskStatus.COMPLETED]
            goal.progress = len(completed_tasks) / len(tasks)
        
        # Auto-complete goal if all tasks are done
        if goal.progress >= 1.0 and goal.status == GoalStatus.active:
            goal.status = GoalStatus.completed
        
        goal.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(goal)
        return goal
    
    @staticmethod
    def reorder_goals(db: Session, user_id: str, goal_positions: List[Dict[str, int]]) -> List[Goal]:
        """Reorder goals by updating their positions"""
        for position_data in goal_positions:
            goal_id = position_data["id"]
            new_position = position_data["position"]
            
            goal = db.query(Goal).filter(
                and_(Goal.id == goal_id, Goal.user_id == user_id)
            ).first()
            
            if goal:
                goal.position = new_position
        
        db.commit()
        
        return db.query(Goal).filter(Goal.user_id == user_id).order_by(Goal.position).all()
    
    @staticmethod
    def get_goal_statistics(db: Session, user_id: str) -> Dict[str, Any]:
        """Get goal statistics for a user"""
        goals = db.query(Goal).filter(Goal.user_id == user_id).all()
        
        stats = {
            "total_goals": len(goals),
            "active_goals": len([g for g in goals if g.status == GoalStatus.active]),
            "completed_goals": len([g for g in goals if g.status == GoalStatus.completed]),
            "planning_goals": len([g for g in goals if g.status == GoalStatus.planning]),
            "abandoned_goals": len([g for g in goals if g.status == GoalStatus.abandoned]),
            "on_hold_goals": len([g for g in goals if g.status == GoalStatus.on_hold]),
            "average_progress": 0.0,
            "goals_by_type": {},
            "overdue_goals": 0
        }
        
        if goals:
            stats["average_progress"] = sum(g.progress or 0 for g in goals) / len(goals)
            
            # Count by type
            for goal_type in GoalType:
                stats["goals_by_type"][goal_type.value] = len([
                    g for g in goals if g.goal_type == goal_type
                ])
            
            # Count overdue goals
            now = datetime.utcnow()
            stats["overdue_goals"] = len([
                g for g in goals 
                if g.time_bound and g.time_bound < now and g.status in [GoalStatus.active, GoalStatus.planning]
            ])
        
        return stats
    
    @staticmethod
    def get_goals_due_soon(db: Session, user_id: str, days: int = 7) -> List[Goal]:
        """Get goals due within the specified number of days"""
        future_date = datetime.utcnow() + timedelta(days=days)
        
        return db.query(Goal).filter(
            and_(
                Goal.user_id == user_id,
                Goal.time_bound <= future_date,
                Goal.time_bound >= datetime.utcnow(),
                Goal.status.in_([GoalStatus.active, GoalStatus.planning])
            )
        ).order_by(Goal.time_bound).all()
    
    @staticmethod
    def generate_ai_breakdown(db: Session, goal_id: int, user_id: str) -> Optional[Dict[str, Any]]:
        """Generate AI-powered breakdown for a goal (placeholder for future AI integration)"""
        goal = db.query(Goal).filter(
            and_(Goal.id == goal_id, Goal.user_id == user_id)
        ).first()
        
        if not goal:
            return None
        
        # This is a placeholder - in a real implementation, this would call an AI service
        breakdown = {
            "milestones": [
                {"title": f"Milestone 1 for {goal.title}", "description": "First major step", "target_date": None},
                {"title": f"Milestone 2 for {goal.title}", "description": "Second major step", "target_date": None},
                {"title": f"Final milestone for {goal.title}", "description": "Final step", "target_date": goal.time_bound}
            ],
            "success_metrics": [
                {"metric": "Progress tracking", "target": "100% completion"},
                {"metric": "Quality measure", "target": "Meet all requirements"}
            ],
            "estimated_hours": 40.0,  # Placeholder estimate
            "potential_obstacles": [
                {"obstacle": "Time constraints", "mitigation": "Better time management"},
                {"obstacle": "Resource limitations", "mitigation": "Identify required resources early"}
            ]
        }
        
        # Update the goal with AI breakdown
        goal.ai_milestones = breakdown["milestones"]
        goal.ai_success_metrics = breakdown["success_metrics"]
        goal.ai_estimated_hours = breakdown["estimated_hours"]
        goal.ai_potential_obstacles = breakdown["potential_obstacles"]
        goal.ai_breakdown_generated_at = datetime.utcnow()
        
        db.commit()
        return breakdown