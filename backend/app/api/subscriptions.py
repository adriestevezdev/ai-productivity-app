from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.models.subscription import UserSubscription, SubscriptionPlan, SubscriptionStatus
from app.schemas.subscription import (
    SubscriptionResponse,
    SubscriptionUpdate,
    SubscriptionWebhookPayload
)
from app.core.config import settings

router = APIRouter(prefix="/api", tags=["subscriptions"])


def verify_internal_secret(x_internal_secret: Optional[str] = Header(None)) -> bool:
    """Verify the internal API secret for webhook requests"""
    if not x_internal_secret or x_internal_secret != settings.INTERNAL_API_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


@router.put("/users/{user_id}/subscription")
async def update_user_subscription(
    user_id: str,
    subscription_data: SubscriptionWebhookPayload,
    db: Session = Depends(get_db),
    _: bool = Depends(verify_internal_secret)
):
    """Update user subscription from webhook"""
    
    # Find existing subscription or create new one
    subscription = db.query(UserSubscription).filter(
        UserSubscription.user_id == user_id
    ).first()
    
    if not subscription:
        subscription = UserSubscription(user_id=user_id)
        db.add(subscription)
    
    # Update subscription data
    subscription.plan_name = subscription_data.plan_name
    subscription.status = subscription_data.status
    subscription.subscription_id = subscription_data.subscription_id
    subscription.subscription_metadata = subscription_data.subscription_metadata
    
    # Update timestamps based on status
    if subscription_data.status == SubscriptionStatus.ACTIVE:
        subscription.started_at = subscription_data.subscription_metadata.get("started_at")
        subscription.ends_at = subscription_data.subscription_metadata.get("ends_at")
    elif subscription_data.status == SubscriptionStatus.CANCELLED:
        subscription.cancelled_at = subscription_data.subscription_metadata.get("cancelled_at")
    
    db.commit()
    db.refresh(subscription)
    
    return {"status": "success", "subscription_id": subscription.id}


@router.get("/users/{user_id}/subscription", response_model=SubscriptionResponse)
async def get_user_subscription(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get user subscription details"""
    
    subscription = db.query(UserSubscription).filter(
        UserSubscription.user_id == user_id
    ).first()
    
    if not subscription:
        # Return default free subscription
        return SubscriptionResponse(
            id=0,
            user_id=user_id,
            plan_name=SubscriptionPlan.FREE,
            status=SubscriptionStatus.ACTIVE,
            is_pro=False,
            is_active=True
        )
    
    return SubscriptionResponse(
        id=subscription.id,
        user_id=subscription.user_id,
        plan_name=subscription.plan_name,
        status=subscription.status,
        subscription_id=subscription.subscription_id,
        started_at=subscription.started_at,
        ends_at=subscription.ends_at,
        cancelled_at=subscription.cancelled_at,
        is_pro=subscription.is_pro(),
        is_active=subscription.is_active()
    )