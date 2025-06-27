from sqlalchemy import Column, Integer, String, DateTime, JSON, Enum
from sqlalchemy.sql import func
from app.db.database import Base
from app.models.base import TimestampMixin, UserOwnedMixin
import enum


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"
    PAST_DUE = "past_due"
    INCOMPLETE = "incomplete"
    TRIALING = "trialing"


class SubscriptionPlan(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class UserSubscription(Base, TimestampMixin, UserOwnedMixin):
    __tablename__ = "user_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    plan_name = Column(
        Enum(SubscriptionPlan),
        default=SubscriptionPlan.FREE,
        nullable=False
    )
    status = Column(
        Enum(SubscriptionStatus),
        default=SubscriptionStatus.ACTIVE,
        nullable=False
    )
    subscription_id = Column(String, unique=True, index=True)
    
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ends_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    
    # Store additional metadata from Clerk
    subscription_metadata = Column(JSON, default={})
    
    def is_pro(self) -> bool:
        """Check if user has an active Pro subscription"""
        return (
            self.plan_name in [SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE] and
            self.status == SubscriptionStatus.ACTIVE
        )
    
    def is_active(self) -> bool:
        """Check if subscription is active"""
        return self.status in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]