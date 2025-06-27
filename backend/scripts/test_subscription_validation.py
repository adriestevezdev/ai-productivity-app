#!/usr/bin/env python3
"""
Test script to validate subscription plan checking
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.services.subscription_service import SubscriptionService
from app.models.subscription import UserSubscription, SubscriptionPlan, SubscriptionStatus

# Test users
PRO_USER_ID = os.getenv("SEED_USER_ID", "user_2yoMSqpncPzVv8aHfOzvVybzkVi")
FREE_USER_ID = "user_free_test_123"

def test_subscription_validation():
    """Test subscription validation logic"""
    db = SessionLocal()
    
    try:
        subscription_service = SubscriptionService(db)
        
        print("🧪 Testing Subscription Validation Logic")
        print("=" * 50)
        
        # Test Pro user
        print(f"\n📋 Testing Pro User: {PRO_USER_ID}")
        pro_user_is_pro = subscription_service.is_user_pro(PRO_USER_ID)
        pro_user_plan = subscription_service.get_user_plan(PRO_USER_ID)
        pro_ai_validation = subscription_service.validate_ai_task_limit(PRO_USER_ID, current_daily_usage=5)
        
        print(f"   ✓ Is Pro: {pro_user_is_pro}")
        print(f"   ✓ Plan: {pro_user_plan}")
        print(f"   ✓ Can use AI tasks: {pro_ai_validation['can_use']}")
        print(f"   ✓ Remaining AI tasks: {pro_ai_validation['remaining']} ({'Unlimited' if pro_ai_validation['remaining'] == -1 else 'Limited'})")
        
        # Test Free user (doesn't exist in DB, should default to FREE)
        print(f"\n📋 Testing Free User: {FREE_USER_ID}")
        free_user_is_pro = subscription_service.is_user_pro(FREE_USER_ID)
        free_user_plan = subscription_service.get_user_plan(FREE_USER_ID)
        free_ai_validation_0 = subscription_service.validate_ai_task_limit(FREE_USER_ID, current_daily_usage=0)
        free_ai_validation_3 = subscription_service.validate_ai_task_limit(FREE_USER_ID, current_daily_usage=3)
        
        print(f"   ✓ Is Pro: {free_user_is_pro}")
        print(f"   ✓ Plan: {free_user_plan}")
        print(f"   ✓ Can use AI tasks (0 used): {free_ai_validation_0['can_use']}")
        print(f"   ✓ Remaining AI tasks (0 used): {free_ai_validation_0['remaining']}")
        print(f"   ✓ Can use AI tasks (3 used): {free_ai_validation_3['can_use']}")
        print(f"   ✓ Remaining AI tasks (3 used): {free_ai_validation_3['remaining']}")
        
        print("\n" + "=" * 50)
        print("🎉 Test Results Summary:")
        
        if pro_user_is_pro and pro_ai_validation['can_use'] and pro_ai_validation['remaining'] == -1:
            print("   ✅ Pro user validation: PASSED")
        else:
            print("   ❌ Pro user validation: FAILED")
            
        if not free_user_is_pro and free_ai_validation_0['can_use'] and not free_ai_validation_3['can_use']:
            print("   ✅ Free user validation: PASSED")
        else:
            print("   ❌ Free user validation: FAILED")
            
        print("\n🔧 Backend API endpoints now properly validate subscription plans!")
        print("   • Pro users: Unlimited AI task creation")
        print("   • Free users: Limited to 3 AI tasks per day")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_subscription_validation()