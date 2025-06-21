from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.task import Task, TaskStatus, TaskPriority


class TaskPrioritizationService:
    """Service for calculating AI-powered task priority scores"""
    
    @staticmethod
    def calculate_priority_score(task: Task) -> int:
        """
        Calculate a priority score for a task based on multiple factors.
        Returns a score between 0-100.
        """
        score = 0
        
        # Base score from priority (0-40 points)
        priority_scores = {
            TaskPriority.URGENT: 40,
            TaskPriority.HIGH: 30,
            TaskPriority.MEDIUM: 20,
            TaskPriority.LOW: 10
        }
        score += priority_scores.get(task.priority, 0)
        
        # Due date urgency (0-30 points)
        if task.due_date:
            now = datetime.utcnow()
            due_date = task.due_date.replace(tzinfo=None) if task.due_date.tzinfo else task.due_date
            days_until_due = (due_date - now).days
            
            if days_until_due < 0:  # Overdue
                score += 30
            elif days_until_due == 0:  # Due today
                score += 25
            elif days_until_due == 1:  # Due tomorrow
                score += 20
            elif days_until_due <= 3:  # Due in 3 days
                score += 15
            elif days_until_due <= 7:  # Due this week
                score += 10
            elif days_until_due <= 14:  # Due in 2 weeks
                score += 5
        
        # Task age (0-15 points)
        created_date = task.created_at.replace(tzinfo=None) if task.created_at.tzinfo else task.created_at
        days_old = (datetime.utcnow() - created_date).days
        if days_old > 30:
            score += 15
        elif days_old > 14:
            score += 10
        elif days_old > 7:
            score += 5
        
        # Status bonus (0-10 points)
        if task.status == TaskStatus.IN_PROGRESS:
            score += 10  # Boost in-progress tasks
        elif task.status == TaskStatus.TODO:
            score += 5
        
        # Time estimation factor (0-5 points)
        if task.estimated_hours:
            if task.estimated_hours <= 1:
                score += 5  # Quick wins
            elif task.estimated_hours <= 2:
                score += 3
        
        # Ensure score is within bounds
        return min(100, max(0, score))
    
    @staticmethod
    def generate_suggestions(task: Task) -> dict:
        """
        Generate AI suggestions for a task based on its characteristics.
        Returns a dictionary with suggestions.
        """
        suggestions = {
            "recommendations": [],
            "warnings": [],
            "tips": []
        }
        
        # Check if task is overdue
        if task.due_date:
            now = datetime.utcnow()
            due_date = task.due_date.replace(tzinfo=None) if task.due_date.tzinfo else task.due_date
            if due_date < now and task.status != TaskStatus.COMPLETED:
                suggestions["warnings"].append("This task is overdue. Consider updating the due date or escalating priority.")
        
        # Check if task has been in progress too long
        if task.status == TaskStatus.IN_PROGRESS:
            if task.actual_hours and task.estimated_hours:
                if task.actual_hours > task.estimated_hours * 1.5:
                    suggestions["warnings"].append("Task is taking longer than estimated. Consider breaking it down or seeking help.")
        
        # Suggest breaking down large tasks
        if task.estimated_hours and task.estimated_hours > 8:
            suggestions["recommendations"].append("This is a large task. Consider breaking it into smaller subtasks.")
        
        # Quick win identification
        if task.estimated_hours and task.estimated_hours <= 1 and task.priority in [TaskPriority.LOW, TaskPriority.MEDIUM]:
            suggestions["tips"].append("Quick win! This task can be completed quickly.")
        
        # No description warning
        if not task.description:
            suggestions["recommendations"].append("Add a description to provide more context for this task.")
        
        # Long-standing TODO
        created_date = task.created_at.replace(tzinfo=None) if task.created_at.tzinfo else task.created_at
        if task.status == TaskStatus.TODO and (datetime.utcnow() - created_date).days > 30:
            suggestions["recommendations"].append("This task has been pending for over a month. Consider archiving or re-evaluating its importance.")
        
        return suggestions
    
    @staticmethod
    def update_task_scores(db: Session, user_id: str) -> List[Task]:
        """
        Update priority scores for all active tasks of a user.
        Returns the updated tasks.
        """
        tasks = db.query(Task).filter(
            Task.user_id == user_id,
            Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS])
        ).all()
        
        for task in tasks:
            task.ai_score = TaskPrioritizationService.calculate_priority_score(task)
            suggestions = TaskPrioritizationService.generate_suggestions(task)
            task.ai_suggestions = str(suggestions)  # Store as JSON string
        
        db.commit()
        return tasks
    
    @staticmethod
    def get_recommended_tasks(db: Session, user_id: str, limit: int = 5) -> List[Task]:
        """
        Get top recommended tasks for a user based on AI scoring.
        """
        # First update scores
        TaskPrioritizationService.update_task_scores(db, user_id)
        
        # Get top tasks by score
        tasks = db.query(Task).filter(
            Task.user_id == user_id,
            Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS])
        ).order_by(
            Task.ai_score.desc(),
            Task.created_at
        ).limit(limit).all()
        
        return tasks