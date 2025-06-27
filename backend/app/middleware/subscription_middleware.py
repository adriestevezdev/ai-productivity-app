from fastapi import HTTPException, Depends, Request
from functools import wraps
from typing import Callable, Any
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.subscription_service import SubscriptionService
from app.middleware.auth import get_current_user


def require_pro_plan(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Dependency that validates user has Pro plan access
    Raises HTTPException if user doesn't have Pro access
    """
    subscription_service = SubscriptionService(db)
    
    if not subscription_service.is_user_pro(current_user_id):
        raise HTTPException(
            status_code=403,
            detail={
                "error": "Pro plan required",
                "message": "This feature requires a Pro subscription. Please upgrade your plan.",
                "upgrade_url": "/pricing"
            }
        )
    
    return current_user_id


def validate_ai_task_limit(
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Dependency that validates AI task usage limits
    For Pro users: unlimited access
    For Free users: validates daily limit
    """
    subscription_service = SubscriptionService(db)
    
    # For now, we'll assume current usage is 0 since we don't have usage tracking yet
    # TODO: Implement proper usage tracking with Redis or database
    current_daily_usage = 0
    
    validation_result = subscription_service.validate_ai_task_limit(
        current_user_id, 
        current_daily_usage
    )
    
    if not validation_result["can_use"]:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Daily AI task limit reached",
                "message": f"You've reached your daily limit of {validation_result['limit']} AI tasks. Upgrade to Pro for unlimited AI task creation.",
                "remaining": validation_result["remaining"],
                "limit": validation_result["limit"],
                "plan": validation_result["plan"],
                "upgrade_url": "/pricing"
            }
        )
    
    return {
        "user_id": current_user_id,
        "validation_result": validation_result
    }


def validate_feature_access(feature: str):
    """
    Decorator factory for validating feature access
    Usage: @validate_feature_access("ai_insights")
    """
    def decorator(
        db: Session = Depends(get_db),
        current_user_id: str = Depends(get_current_user)
    ):
        subscription_service = SubscriptionService(db)
        
        if not subscription_service.validate_feature_access(current_user_id, feature):
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "Feature access denied",
                    "message": f"Access to '{feature}' requires a Pro subscription.",
                    "feature": feature,
                    "upgrade_url": "/pricing"
                }
            )
        
        return current_user_id
    
    return decorator