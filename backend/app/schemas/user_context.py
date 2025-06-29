from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class UserContextBase(BaseModel):
    work_description: Optional[str] = None
    short_term_focus: Optional[List[str]] = []
    long_term_goals: Optional[List[str]] = []
    other_context: Optional[List[str]] = []


class UserContextCreate(UserContextBase):
    pass


class UserContextUpdate(UserContextBase):
    pass


class UserContext(UserContextBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True