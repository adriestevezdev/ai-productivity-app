from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

from app.models.subscription import SubscriptionPlan, SubscriptionStatus


class SubscriptionBase(BaseModel):
    plan_name: SubscriptionPlan
    status: SubscriptionStatus
    subscription_id: Optional[str] = None


class SubscriptionWebhookPayload(SubscriptionBase):
    """Payload from Clerk webhook"""
    subscription_metadata: Dict[str, Any] = {}


class SubscriptionUpdate(SubscriptionBase):
    """Update subscription request"""
    ends_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None


class SubscriptionResponse(SubscriptionBase):
    """Subscription response model"""
    id: int
    user_id: str
    started_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    is_pro: bool
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True