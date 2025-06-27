#!/usr/bin/env python3
"""
Script to create a test Pro subscription for development
"""
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.subscription import UserSubscription, SubscriptionPlan, SubscriptionStatus

# Use the same test user from the seed script
TEST_USER_ID = os.getenv("SEED_USER_ID", "user_2yoMSqpncPzVv8aHfOzvVybzkVi")

def create_test_subscription():
    """Create a test Pro subscription for the sample user"""
    db = SessionLocal()
    
    try:
        # Check if subscription already exists
        existing_subscription = db.query(UserSubscription).filter(
            UserSubscription.user_id == TEST_USER_ID
        ).first()
        
        if existing_subscription:
            print(f"Updating existing subscription for user {TEST_USER_ID}")
            # Update to Pro plan
            existing_subscription.plan_name = SubscriptionPlan.PRO
            existing_subscription.status = SubscriptionStatus.ACTIVE
            existing_subscription.subscription_id = "test_pro_subscription_123"
            existing_subscription.started_at = datetime.utcnow()
            existing_subscription.ends_at = datetime.utcnow() + timedelta(days=365)  # 1 year
            existing_subscription.subscription_metadata = {
                "test_subscription": True,
                "created_for": "development_testing"
            }
        else:
            print(f"Creating new Pro subscription for user {TEST_USER_ID}")
            # Create new Pro subscription
            subscription = UserSubscription(
                user_id=TEST_USER_ID,
                plan_name=SubscriptionPlan.PRO,
                status=SubscriptionStatus.ACTIVE,
                subscription_id="test_pro_subscription_123",
                started_at=datetime.utcnow(),
                ends_at=datetime.utcnow() + timedelta(days=365),  # 1 year
                subscription_metadata={
                    "test_subscription": True,
                    "created_for": "development_testing"
                }
            )
            db.add(subscription)
        
        db.commit()
        print("✅ Test Pro subscription created successfully!")
        print(f"   User ID: {TEST_USER_ID}")
        print(f"   Plan: PRO")
        print(f"   Status: ACTIVE")
        print(f"   Valid until: {(datetime.utcnow() + timedelta(days=365)).strftime('%Y-%m-%d')}")
        
    except Exception as e:
        print(f"❌ Error creating subscription: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_subscription()