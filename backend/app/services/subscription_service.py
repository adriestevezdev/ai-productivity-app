from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta

from app.models.subscription import UserSubscription, SubscriptionPlan, SubscriptionStatus


class SubscriptionService:
    """Service for managing user subscriptions and plan validation"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_subscription(self, user_id: str) -> Optional[UserSubscription]:
        """Get user subscription from database"""
        return self.db.query(UserSubscription).filter(
            UserSubscription.user_id == user_id
        ).first()
    
    def is_user_pro(self, user_id: str) -> bool:
        """Check if user has an active Pro or Enterprise subscription"""
        subscription = self.get_user_subscription(user_id)
        
        if not subscription:
            return False
            
        return subscription.is_pro()
    
    def get_user_plan(self, user_id: str) -> SubscriptionPlan:
        """Get user's current plan (defaults to FREE if no subscription)"""
        subscription = self.get_user_subscription(user_id)
        
        if not subscription:
            return SubscriptionPlan.FREE
            
        return subscription.plan_name
    
    def validate_ai_task_limit(self, user_id: str, current_daily_usage: int = 0) -> dict:
        """
        Validate if user can create AI tasks based on their plan
        Returns validation result with details
        """
        is_pro = self.is_user_pro(user_id)
        
        if is_pro:
            return {
                "can_use": True,
                "remaining": -1,  # Unlimited for pro users
                "limit": -1,
                "plan": "pro"
            }
        else:
            daily_limit = 3  # Free tier limit
            remaining = max(0, daily_limit - current_daily_usage)
            
            return {
                "can_use": remaining > 0,
                "remaining": remaining,
                "limit": daily_limit,
                "plan": "free"
            }
    
    def validate_feature_access(self, user_id: str, feature: str) -> bool:
        """
        Validate if user has access to a specific feature
        Pro features require active Pro/Enterprise subscription
        """
        pro_features = {
            "ai_task_creation_unlimited",
            "ai_insights",
            "advanced_analytics",
            "priority_support",
            "unlimited_tasks",
            "unlimited_goals"
        }
        
        if feature in pro_features:
            return self.is_user_pro(user_id)
        
        # Free features are always available
        return True


def get_subscription_service(db: Session) -> SubscriptionService:
    """Dependency injection for subscription service"""
    return SubscriptionService(db)