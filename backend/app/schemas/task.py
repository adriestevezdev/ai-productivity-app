from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.models.task import TaskStatus, TaskPriority


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    estimated_hours: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None
    parent_task_id: Optional[int] = None


class TaskCreate(TaskBase):
    tag_ids: Optional[List[int]] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[int] = Field(None, ge=0)
    actual_hours: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None
    parent_task_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class TaskPositionUpdate(BaseModel):
    position: int
    status: Optional[TaskStatus] = None


class TagInTask(BaseModel):
    id: int
    name: str
    color: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CategoryInTask(BaseModel):
    id: int
    name: str
    color: Optional[str] = None
    icon: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class Task(TaskBase):
    id: int
    user_id: str
    position: int
    completed_at: Optional[datetime] = None
    actual_hours: Optional[int] = None
    ai_score: Optional[int] = None
    ai_suggestions: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    tags: List[TagInTask] = []
    category: Optional[CategoryInTask] = None

    model_config = ConfigDict(from_attributes=True)


class TaskList(BaseModel):
    tasks: List[Task]
    total: int


# Category schemas
class TaskCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = None
    description: Optional[str] = None


class TaskCategoryCreate(TaskCategoryBase):
    pass


class TaskCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None


class TaskCategory(TaskCategoryBase):
    id: int
    user_id: str
    position: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# Tag schemas
class TaskTagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")


class TaskTagCreate(TaskTagBase):
    pass


class TaskTagUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")


class TaskTag(TaskTagBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)