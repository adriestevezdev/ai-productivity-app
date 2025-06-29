from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models.user_context import UserContext
from app.schemas.user_context import (
    UserContext as UserContextSchema,
    UserContextCreate,
    UserContextUpdate
)

router = APIRouter(prefix="/api", tags=["user_context"])


@router.get("/user-context", response_model=Optional[UserContextSchema])
async def get_user_context(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get user context for the current user"""
    user_context = db.query(UserContext).filter(
        UserContext.user_id == current_user
    ).first()
    
    return user_context


@router.post("/user-context", response_model=UserContextSchema)
async def create_or_update_user_context(
    user_context_data: UserContextCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create or update user context for the current user"""
    # Check if user context already exists
    existing_context = db.query(UserContext).filter(
        UserContext.user_id == current_user
    ).first()
    
    if existing_context:
        # Update existing context
        for field, value in user_context_data.dict(exclude_unset=True).items():
            setattr(existing_context, field, value)
        
        db.commit()
        db.refresh(existing_context)
        return existing_context
    else:
        # Create new context
        db_user_context = UserContext(
            user_id=current_user,
            **user_context_data.dict()
        )
        db.add(db_user_context)
        db.commit()
        db.refresh(db_user_context)
        return db_user_context


@router.put("/user-context", response_model=UserContextSchema)
async def update_user_context(
    user_context_data: UserContextUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update user context for the current user"""
    user_context = db.query(UserContext).filter(
        UserContext.user_id == current_user
    ).first()
    
    if not user_context:
        raise HTTPException(status_code=404, detail="User context not found")
    
    for field, value in user_context_data.dict(exclude_unset=True).items():
        setattr(user_context, field, value)
    
    db.commit()
    db.refresh(user_context)
    return user_context


@router.delete("/user-context")
async def delete_user_context(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete user context for the current user"""
    user_context = db.query(UserContext).filter(
        UserContext.user_id == current_user
    ).first()
    
    if not user_context:
        raise HTTPException(status_code=404, detail="User context not found")
    
    db.delete(user_context)
    db.commit()
    
    return {"message": "User context deleted successfully"}