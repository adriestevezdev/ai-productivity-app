from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.middleware.subscription_middleware import validate_ai_task_limit
from app.models.task import Task, TaskCategory, TaskTag, TaskStatus, TaskPriority
from app.schemas.task import (
    Task as TaskSchema,
    TaskCreate,
    TaskUpdate,
    TaskStatusUpdate,
    TaskPositionUpdate,
    TaskList,
    TaskCategory as TaskCategorySchema,
    TaskCategoryCreate,
    TaskCategoryUpdate,
    TaskTag as TaskTagSchema,
    TaskTagCreate,
    TaskTagUpdate,
    TaskAICreate,
    TaskSubtaskSuggestion,
    SubtaskSuggestion
)
from app.services.ai_service import get_ai_service

router = APIRouter(prefix="/api", tags=["tasks"])


# Task endpoints
@router.get("/tasks", response_model=TaskList)
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get all tasks for the current user with optional filters"""
    query = db.query(Task).filter(Task.user_id == current_user)
    
    # Apply filters
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if category_id:
        query = query.filter(Task.category_id == category_id)
    if search:
        query = query.filter(
            or_(
                Task.title.ilike(f"%{search}%"),
                Task.description.ilike(f"%{search}%")
            )
        )
    
    # Get total count
    total = query.count()
    
    # Get paginated results with relationships
    tasks = query.options(
        joinedload(Task.tags),
        joinedload(Task.category)
    ).order_by(Task.position, Task.created_at.desc()).offset(skip).limit(limit).all()
    
    return TaskList(tasks=tasks, total=total)


@router.get("/tasks/{task_id}", response_model=TaskSchema)
async def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get a specific task by ID"""
    task = db.query(Task).options(
        joinedload(Task.tags),
        joinedload(Task.category)
    ).filter(
        and_(Task.id == task_id, Task.user_id == current_user)
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task


@router.post("/tasks", response_model=TaskSchema)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new task"""
    # Get the highest position for the user's tasks in the same status
    max_position = db.query(Task).filter(
        and_(Task.user_id == current_user, Task.status == task_data.status)
    ).count()
    
    # Create the task
    task_dict = task_data.model_dump(exclude={"tag_ids"})
    task = Task(
        **task_dict,
        user_id=current_user,
        position=max_position
    )
    
    # Add tags if provided
    if task_data.tag_ids:
        tags = db.query(TaskTag).filter(
            and_(
                TaskTag.id.in_(task_data.tag_ids),
                TaskTag.user_id == current_user
            )
        ).all()
        task.tags = tags
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Load relationships
    db.refresh(task, ["tags", "category"])
    
    return task


@router.post("/tasks/parse-ai", response_model=TaskAICreate)
async def parse_task_with_ai(
    description: str = Query(..., description="Natural language task description"),
    current_user: str = Depends(get_current_user),
    validation_result: dict = Depends(validate_ai_task_limit)
):
    """Parse natural language task description using AI"""
    ai_service = get_ai_service()
    if not ai_service:
        raise HTTPException(
            status_code=503,
            detail="AI service not configured. Please set OPENAI_API_KEY."
        )
    
    try:
        parsed_task = ai_service.parse_natural_language_task(description)
        return parsed_task
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing task with AI: {str(e)}"
        )


@router.post("/tasks/create-from-ai", response_model=TaskSchema)
async def create_task_from_ai(
    ai_task: TaskAICreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
    validation_result: dict = Depends(validate_ai_task_limit)
):
    """Create a task from AI-parsed data"""
    # Convert AI task to regular task create
    task_data = TaskCreate(
        title=ai_task.title,
        description=ai_task.description,
        priority=TaskPriority(ai_task.priority) if isinstance(ai_task.priority, str) else ai_task.priority,
        due_date=datetime.fromisoformat(ai_task.due_date.replace('Z', '+00:00')) if isinstance(ai_task.due_date, str) else ai_task.due_date,
        estimated_hours=ai_task.estimated_duration // 60 if ai_task.estimated_duration else None,
        goal_id=ai_task.goal_id,
        tag_ids=[]
    )
    
    # Handle tags - create new ones if needed
    tag_ids = []
    if ai_task.tags:
        for tag_name in ai_task.tags:
            # Check if tag exists
            tag = db.query(TaskTag).filter(
                and_(
                    TaskTag.name == tag_name,
                    TaskTag.user_id == current_user
                )
            ).first()
            
            if not tag:
                # Create new tag
                tag = TaskTag(
                    name=tag_name,
                    user_id=current_user
                )
                db.add(tag)
                db.commit()
                db.refresh(tag)
            
            tag_ids.append(tag.id)
    
    task_data.tag_ids = tag_ids
    
    # Create the task using existing logic
    max_position = db.query(Task).filter(
        and_(Task.user_id == current_user, Task.status == task_data.status)
    ).count()
    
    task_dict = task_data.model_dump(exclude={"tag_ids"})
    task = Task(
        **task_dict,
        user_id=current_user,
        position=max_position,
        ai_score=90  # Mark as AI-created with high confidence
    )
    
    # Add tags
    if tag_ids:
        tags = db.query(TaskTag).filter(
            and_(
                TaskTag.id.in_(tag_ids),
                TaskTag.user_id == current_user
            )
        ).all()
        task.tags = tags
    
    db.add(task)
    db.commit()
    db.refresh(task, ["tags", "category"])
    
    return task


@router.put("/tasks/{task_id}", response_model=TaskSchema)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update a task"""
    task = db.query(Task).filter(
        and_(Task.id == task_id, Task.user_id == current_user)
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update fields
    update_data = task_data.model_dump(exclude_unset=True, exclude={"tag_ids"})
    
    # Handle status change
    if "status" in update_data and update_data["status"] != task.status:
        if update_data["status"] == TaskStatus.COMPLETED:
            update_data["completed_at"] = datetime.utcnow()
        else:
            update_data["completed_at"] = None
    
    for field, value in update_data.items():
        setattr(task, field, value)
    
    # Update tags if provided
    if task_data.tag_ids is not None:
        tags = db.query(TaskTag).filter(
            and_(
                TaskTag.id.in_(task_data.tag_ids),
                TaskTag.user_id == current_user
            )
        ).all()
        task.tags = tags
    
    db.commit()
    db.refresh(task, ["tags", "category"])
    
    return task


@router.patch("/tasks/{task_id}/status", response_model=TaskSchema)
async def update_task_status(
    task_id: int,
    status_data: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Quick status update for a task"""
    task = db.query(Task).filter(
        and_(Task.id == task_id, Task.user_id == current_user)
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.status = status_data.status
    
    if status_data.status == TaskStatus.COMPLETED:
        task.completed_at = datetime.utcnow()
    else:
        task.completed_at = None
    
    db.commit()
    db.refresh(task, ["tags", "category"])
    
    return task


@router.patch("/tasks/{task_id}/position", response_model=TaskSchema)
async def update_task_position(
    task_id: int,
    position_data: TaskPositionUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update task position (for drag and drop)"""
    task = db.query(Task).filter(
        and_(Task.id == task_id, Task.user_id == current_user)
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # If status is changing, handle completed_at
    if position_data.status and position_data.status != task.status:
        if position_data.status == TaskStatus.COMPLETED:
            task.completed_at = datetime.utcnow()
        else:
            task.completed_at = None
        task.status = position_data.status
    
    # Reorder tasks
    if position_data.status:
        target_status = position_data.status
    else:
        target_status = task.status
    
    # Get all tasks in the target status
    tasks_in_status = db.query(Task).filter(
        and_(
            Task.user_id == current_user,
            Task.status == target_status,
            Task.id != task_id
        )
    ).order_by(Task.position).all()
    
    # Insert the task at the new position
    tasks_in_status.insert(position_data.position, task)
    
    # Update positions
    for idx, t in enumerate(tasks_in_status):
        t.position = idx
    
    task.position = position_data.position
    
    db.commit()
    db.refresh(task, ["tags", "category"])
    
    return task


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete a task"""
    task = db.query(Task).filter(
        and_(Task.id == task_id, Task.user_id == current_user)
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}


# Category endpoints
@router.get("/task-categories", response_model=List[TaskCategorySchema])
async def get_categories(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get all task categories for the current user"""
    categories = db.query(TaskCategory).filter(
        TaskCategory.user_id == current_user
    ).order_by(TaskCategory.position).all()
    
    return categories


@router.post("/task-categories", response_model=TaskCategorySchema)
async def create_category(
    category_data: TaskCategoryCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new task category"""
    # Get the highest position
    max_position = db.query(TaskCategory).filter(
        TaskCategory.user_id == current_user
    ).count()
    
    category = TaskCategory(
        **category_data.model_dump(),
        user_id=current_user,
        position=max_position
    )
    
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return category


@router.put("/task-categories/{category_id}", response_model=TaskCategorySchema)
async def update_category(
    category_id: int,
    category_data: TaskCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update a task category"""
    category = db.query(TaskCategory).filter(
        and_(TaskCategory.id == category_id, TaskCategory.user_id == current_user)
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    
    return category


@router.delete("/task-categories/{category_id}")
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete a task category"""
    category = db.query(TaskCategory).filter(
        and_(TaskCategory.id == category_id, TaskCategory.user_id == current_user)
    ).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Set category_id to null for all tasks with this category
    db.query(Task).filter(
        and_(Task.category_id == category_id, Task.user_id == current_user)
    ).update({"category_id": None})
    
    db.delete(category)
    db.commit()
    
    return {"message": "Category deleted successfully"}


# Tag endpoints
@router.get("/task-tags", response_model=List[TaskTagSchema])
async def get_tags(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get all task tags for the current user"""
    tags = db.query(TaskTag).filter(
        TaskTag.user_id == current_user
    ).order_by(TaskTag.name).all()
    
    return tags


@router.post("/task-tags", response_model=TaskTagSchema)
async def create_tag(
    tag_data: TaskTagCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new task tag"""
    # Check if tag already exists
    existing_tag = db.query(TaskTag).filter(
        and_(
            TaskTag.name == tag_data.name,
            TaskTag.user_id == current_user
        )
    ).first()
    
    if existing_tag:
        raise HTTPException(status_code=400, detail="Tag with this name already exists")
    
    tag = TaskTag(
        **tag_data.model_dump(),
        user_id=current_user
    )
    
    db.add(tag)
    db.commit()
    db.refresh(tag)
    
    return tag


@router.put("/task-tags/{tag_id}", response_model=TaskTagSchema)
async def update_tag(
    tag_id: int,
    tag_data: TaskTagUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update a task tag"""
    tag = db.query(TaskTag).filter(
        and_(TaskTag.id == tag_id, TaskTag.user_id == current_user)
    ).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Check for duplicate name if changing name
    if tag_data.name and tag_data.name != tag.name:
        existing_tag = db.query(TaskTag).filter(
            and_(
                TaskTag.name == tag_data.name,
                TaskTag.user_id == current_user,
                TaskTag.id != tag_id
            )
        ).first()
        
        if existing_tag:
            raise HTTPException(status_code=400, detail="Tag with this name already exists")
    
    update_data = tag_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tag, field, value)
    
    db.commit()
    db.refresh(tag)
    
    return tag


@router.delete("/task-tags/{tag_id}")
async def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete a task tag"""
    tag = db.query(TaskTag).filter(
        and_(TaskTag.id == tag_id, TaskTag.user_id == current_user)
    ).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    db.delete(tag)
    db.commit()
    
    return {"message": "Tag deleted successfully"}


# AI Subtask Suggestions endpoint
@router.post("/tasks/{task_id}/suggest-subtasks", response_model=TaskSubtaskSuggestion)
async def suggest_subtasks(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
    validation_result: dict = Depends(validate_ai_task_limit)
):
    """Suggest subtasks for a given task using AI"""
    # Get the task
    task = db.query(Task).filter(
        and_(Task.id == task_id, Task.user_id == current_user)
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get AI service
    ai_service = get_ai_service()
    if not ai_service:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please set up your OpenAI API key."
        )
    
    try:
        # Get AI suggestions
        subtask_suggestions = ai_service.suggest_subtasks(
            task.title,
            task.description or task.title
        )
        
        # Convert to response format
        subtasks = []
        for suggestion in subtask_suggestions:
            subtasks.append(SubtaskSuggestion(
                title=suggestion["title"],
                description=suggestion["description"],
                estimated_duration=suggestion["estimated_duration"],
                priority=suggestion["priority"]
            ))
        
        return TaskSubtaskSuggestion(
            task_id=task_id,
            subtasks=subtasks
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate subtask suggestions: {str(e)}"
        )