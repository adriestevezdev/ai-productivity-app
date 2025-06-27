from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Dict, Any, List
from datetime import datetime, timedelta

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.middleware.subscription_middleware import require_pro_plan
from app.models.task import Task, TaskStatus, TaskPriority
from app.models.goal import Goal, GoalStatus
from app.services.ai_service import get_ai_service
from app.schemas.ai import ProductivityInsights, GoalBreakdown, GoalBreakdownRequest

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.get("/insights", response_model=ProductivityInsights)
async def get_productivity_insights(
    days: int = 30,  # Default to last 30 days
    db: Session = Depends(get_db),
    current_user: str = Depends(require_pro_plan)
):
    """Get AI-powered productivity insights and recommendations"""
    
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get user's tasks statistics
    tasks_query = db.query(Task).filter(
        and_(
            Task.user_id == current_user,
            Task.created_at >= start_date
        )
    )
    
    # Task completion stats
    total_tasks = tasks_query.count()
    completed_tasks = tasks_query.filter(Task.status == TaskStatus.COMPLETED).count()
    overdue_tasks = tasks_query.filter(
        and_(
            Task.due_date < datetime.utcnow(),
            Task.status != TaskStatus.COMPLETED
        )
    ).count()
    
    # Average completion time (for tasks with both created and completed dates)
    avg_completion_time_query = db.query(
        func.avg(
            func.extract('epoch', Task.completed_at - Task.created_at) / 86400  # Convert to days
        )
    ).filter(
        and_(
            Task.user_id == current_user,
            Task.completed_at.isnot(None),
            Task.created_at >= start_date
        )
    ).scalar()
    
    avg_completion_time = float(avg_completion_time_query) if avg_completion_time_query else 0
    
    # Task distribution by priority
    priority_distribution = {}
    for priority in TaskPriority:
        count = tasks_query.filter(Task.priority == priority).count()
        priority_distribution[priority.value] = count
    
    # Task distribution by status
    status_distribution = {}
    for status in TaskStatus:
        count = tasks_query.filter(Task.status == status).count()
        status_distribution[status.value] = count
    
    # Productivity score (0-100)
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    overdue_rate = (overdue_tasks / total_tasks * 100) if total_tasks > 0 else 0
    productivity_score = max(0, min(100, completion_rate - (overdue_rate * 0.5)))
    
    # Identify bottlenecks
    bottlenecks = []
    
    # Check for too many high priority tasks
    high_priority_count = priority_distribution.get(TaskPriority.HIGH.value, 0)
    if total_tasks > 0 and high_priority_count / total_tasks > 0.5:
        bottlenecks.append({
            "type": "priority_imbalance",
            "description": "Over 50% of tasks are marked as high priority",
            "impact": "high",
            "suggestion": "Review and reprioritize tasks. Not everything can be urgent."
        })
    
    # Check for overdue tasks
    if overdue_rate > 20:
        bottlenecks.append({
            "type": "overdue_tasks",
            "description": f"{overdue_rate:.1f}% of tasks are overdue",
            "impact": "high",
            "suggestion": "Focus on clearing overdue tasks or adjusting unrealistic deadlines."
        })
    
    # Check for tasks in progress for too long
    long_running_tasks = tasks_query.filter(
        and_(
            Task.status == TaskStatus.IN_PROGRESS,
            Task.updated_at < datetime.utcnow() - timedelta(days=7)
        )
    ).count()
    
    if long_running_tasks > 0:
        bottlenecks.append({
            "type": "stalled_tasks",
            "description": f"{long_running_tasks} tasks have been in progress for over a week",
            "impact": "medium",
            "suggestion": "Review in-progress tasks and either complete or break them down."
        })
    
    # Generate workflow optimizations
    optimizations = []
    
    # Suggestion based on completion patterns
    if avg_completion_time > 7:  # Tasks taking more than a week on average
        optimizations.append({
            "type": "task_breakdown",
            "description": "Tasks take an average of {:.1f} days to complete".format(avg_completion_time),
            "suggestion": "Break down large tasks into smaller, manageable subtasks.",
            "priority": "high"
        })
    
    # Suggestion based on task distribution
    todo_count = status_distribution.get(TaskStatus.TODO.value, 0)
    if total_tasks > 0 and todo_count / total_tasks > 0.7:
        optimizations.append({
            "type": "task_backlog",
            "description": "Large backlog of TODO tasks",
            "suggestion": "Prioritize and schedule tasks. Consider archiving or delegating low-priority items.",
            "priority": "medium"
        })
    
    # Time-based patterns
    completed_by_day = {}
    completed_tasks_with_dates = tasks_query.filter(
        and_(
            Task.status == TaskStatus.COMPLETED,
            Task.completed_at.isnot(None)
        )
    ).all()
    
    for task in completed_tasks_with_dates:
        day_name = task.completed_at.strftime("%A")
        completed_by_day[day_name] = completed_by_day.get(day_name, 0) + 1
    
    # Find most productive day
    if completed_by_day:
        most_productive_day = max(completed_by_day, key=completed_by_day.get)
        optimizations.append({
            "type": "time_pattern",
            "description": f"Most productive on {most_productive_day}s",
            "suggestion": f"Schedule important tasks on {most_productive_day}s when you're most productive.",
            "priority": "low"
        })
    
    # AI-powered recommendations using OpenAI
    ai_recommendations = []
    ai_service = get_ai_service()
    
    if ai_service and (bottlenecks or optimizations):
        try:
            # Prepare context for AI
            context = {
                "productivity_score": productivity_score,
                "completion_rate": completion_rate,
                "overdue_rate": overdue_rate,
                "avg_completion_days": avg_completion_time,
                "bottlenecks": bottlenecks[:3],  # Top 3 bottlenecks
                "current_optimizations": optimizations[:3]  # Top 3 optimizations
            }
            
            # For now, we'll generate static recommendations
            # In a production system, you'd call OpenAI here for personalized insights
            
            if productivity_score < 50:
                ai_recommendations.append({
                    "type": "productivity_boost",
                    "title": "Focus on Quick Wins",
                    "description": "Your productivity score is below 50%. Start with small, easy-to-complete tasks to build momentum.",
                    "action_items": [
                        "Identify 3 tasks you can complete today",
                        "Use the Pomodoro technique for focused work sessions",
                        "Review and remove tasks that are no longer relevant"
                    ]
                })
            
            if overdue_rate > 20:
                ai_recommendations.append({
                    "type": "deadline_management",
                    "title": "Improve Deadline Management",
                    "description": "Many tasks are overdue. Let's fix your scheduling approach.",
                    "action_items": [
                        "Add buffer time to all estimates (multiply by 1.5x)",
                        "Set due dates only for truly deadline-driven tasks",
                        "Use 'target dates' instead of hard deadlines for flexible tasks"
                    ]
                })
            
        except Exception as e:
            print(f"Error generating AI recommendations: {str(e)}")
    
    return ProductivityInsights(
        productivity_score=round(productivity_score, 1),
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        completion_rate=round(completion_rate, 1),
        overdue_tasks=overdue_tasks,
        avg_completion_days=round(avg_completion_time, 1),
        priority_distribution=priority_distribution,
        status_distribution=status_distribution,
        bottlenecks=bottlenecks,
        optimizations=optimizations,
        ai_recommendations=ai_recommendations,
        period_days=days,
        generated_at=datetime.utcnow()
    )


@router.post("/break-down-goal", response_model=GoalBreakdown)
async def break_down_goal(
    request: GoalBreakdownRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(require_pro_plan)
):
    """Break down a SMART goal into actionable milestones, metrics, and tasks using AI"""
    
    # Get the goal
    goal = db.query(Goal).filter(
        and_(Goal.id == request.goal_id, Goal.user_id == current_user)
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    # Get AI service
    ai_service = get_ai_service()
    if not ai_service:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please set up your OpenAI API key."
        )
    
    try:
        # Prepare SMART components
        goal_specifics = {
            "specific": goal.specific or "Not specified",
            "measurable": goal.measurable or "Not specified",
            "achievable": goal.achievable or "Not specified",
            "relevant": goal.relevant or "Not specified",
            "time_bound": goal.time_bound.isoformat() if goal.time_bound else "Not specified"
        }
        
        # Get AI breakdown
        breakdown_data = ai_service.break_down_goal(
            goal.title,
            goal.description or goal.title,
            goal_specifics
        )
        
        # Convert relative dates to actual dates
        current_date = datetime.utcnow()
        milestones = []
        for milestone_data in breakdown_data.get("milestones", []):
            # Parse relative date
            target_date = None
            relative_date = milestone_data.get("target_date", "")
            
            if "week" in relative_date:
                weeks = int(relative_date.split()[0]) if relative_date.split()[0].isdigit() else 1
                target_date = current_date + timedelta(weeks=weeks)
            elif "month" in relative_date:
                months = int(relative_date.split()[0]) if relative_date.split()[0].isdigit() else 1
                target_date = current_date + timedelta(days=months * 30)
            elif "day" in relative_date:
                days = int(relative_date.split()[0]) if relative_date.split()[0].isdigit() else 1
                target_date = current_date + timedelta(days=days)
            
            milestones.append(Milestone(
                title=milestone_data["title"],
                description=milestone_data["description"],
                target_date=target_date,
                estimated_hours=milestone_data.get("estimated_hours", 5)
            ))
        
        # Convert success metrics
        success_metrics = []
        for metric_data in breakdown_data.get("success_metrics", []):
            success_metrics.append(SuccessMetric(
                metric=metric_data["metric"],
                target_value=metric_data["target_value"],
                measurement_method=metric_data["measurement_method"]
            ))
        
        # Convert potential obstacles
        obstacles = []
        for obstacle_data in breakdown_data.get("potential_obstacles", []):
            obstacles.append(PotentialObstacle(
                obstacle=obstacle_data["obstacle"],
                likelihood=obstacle_data["likelihood"],
                mitigation_strategy=obstacle_data["mitigation_strategy"]
            ))
        
        # Update goal with AI-generated data
        goal.ai_milestones = [m.model_dump() for m in milestones]
        goal.ai_success_metrics = [m.model_dump() for m in success_metrics]
        goal.ai_estimated_hours = breakdown_data.get("estimated_total_hours", 40)
        goal.ai_potential_obstacles = [o.model_dump() for o in obstacles]
        goal.ai_breakdown_generated_at = datetime.utcnow()
        
        db.commit()
        
        return GoalBreakdown(
            goal_id=goal.id,
            milestones=milestones,
            success_metrics=success_metrics,
            estimated_total_hours=breakdown_data.get("estimated_total_hours", 40),
            potential_obstacles=obstacles,
            recommended_tasks=breakdown_data.get("recommended_tasks", []),
            generated_at=datetime.utcnow()
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate goal breakdown: {str(e)}"
        )