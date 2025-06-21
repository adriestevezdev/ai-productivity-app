#!/usr/bin/env python3
"""
Seed script to populate the database with sample task data
"""
import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
import random
import argparse

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.models.task import Task, TaskCategory, TaskTag, TaskStatus, TaskPriority
from app.models.goal import Goal, GoalStatus, GoalType
from app.models.base import Base

# Sample user ID (you should replace this with an actual user ID from Clerk)
# This can be overridden with the SEED_USER_ID environment variable
SAMPLE_USER_ID = os.getenv("SEED_USER_ID", "user_2yoMSqpncPzVv8aHfOzvVybzkVi")

def create_sample_data(db: Session):
    # Create categories
    categories = [
        TaskCategory(
            name="Work",
            color="#4169E1",
            user_id=SAMPLE_USER_ID
        ),
        TaskCategory(
            name="Personal",
            color="#32CD32",
            user_id=SAMPLE_USER_ID
        ),
        TaskCategory(
            name="Health",
            color="#FF6347",
            user_id=SAMPLE_USER_ID
        ),
        TaskCategory(
            name="Learning",
            color="#FF8C00",
            user_id=SAMPLE_USER_ID
        )
    ]
    
    for category in categories:
        db.add(category)
    db.commit()
    
    # Create tags
    tags = [
        TaskTag(
            name="urgent",
            color="#FF0000",
            user_id=SAMPLE_USER_ID
        ),
        TaskTag(
            name="important",
            color="#FFD700",
            user_id=SAMPLE_USER_ID
        ),
        TaskTag(
            name="quick-win",
            color="#00FF00",
            user_id=SAMPLE_USER_ID
        ),
        TaskTag(
            name="long-term",
            color="#4B0082",
            user_id=SAMPLE_USER_ID
        )
    ]
    
    for tag in tags:
        db.add(tag)
    db.commit()
    
    # Create tasks
    tasks_data = [
        {
            "title": "Complete project proposal",
            "description": "Write and submit the Q1 project proposal to the management team",
            "status": TaskStatus.IN_PROGRESS,
            "priority": TaskPriority.HIGH,
            "due_date": datetime.utcnow() + timedelta(days=3),
            "category_id": categories[0].id,
            "position": 1,
            "ai_score": 85,
            "user_id": SAMPLE_USER_ID
        },
        {
            "title": "Review code changes",
            "description": "Review PR #123 for the authentication module",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.MEDIUM,
            "due_date": datetime.utcnow() + timedelta(days=1),
            "category_id": categories[0].id,
            "position": 2,
            "ai_score": 70,
            "user_id": SAMPLE_USER_ID
        },
        {
            "title": "Doctor appointment",
            "description": "Annual health checkup at 3 PM",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.HIGH,
            "due_date": datetime.utcnow() + timedelta(days=7),
            "category_id": categories[2].id,
            "position": 3,
            "ai_score": 75,
            "user_id": SAMPLE_USER_ID
        },
        {
            "title": "Learn React hooks",
            "description": "Complete the React hooks tutorial on official documentation",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.LOW,
            "due_date": datetime.utcnow() + timedelta(days=14),
            "category_id": categories[3].id,
            "position": 4,
            "ai_score": 45,
            "user_id": SAMPLE_USER_ID
        },
        {
            "title": "Team meeting preparation",
            "description": "Prepare slides for weekly team sync",
            "status": TaskStatus.COMPLETED,
            "priority": TaskPriority.MEDIUM,
            "due_date": datetime.utcnow() - timedelta(days=1),
            "category_id": categories[0].id,
            "position": 5,
            "ai_score": 0,
            "user_id": SAMPLE_USER_ID
        },
        {
            "title": "Grocery shopping",
            "description": "Buy vegetables, fruits, and household items",
            "status": TaskStatus.TODO,
            "priority": TaskPriority.LOW,
            "due_date": datetime.utcnow() + timedelta(days=2),
            "category_id": categories[1].id,
            "position": 6,
            "ai_score": 30,
            "user_id": SAMPLE_USER_ID
        }
    ]
    
    created_tasks = []
    for task_data in tasks_data:
        task = Task(**task_data)
        db.add(task)
        created_tasks.append(task)
    
    db.commit()
    
    # Add tags to some tasks
    created_tasks[0].tags.append(tags[0])  # urgent
    created_tasks[0].tags.append(tags[1])  # important
    created_tasks[1].tags.append(tags[2])  # quick-win
    created_tasks[2].tags.append(tags[1])  # important
    created_tasks[3].tags.append(tags[3])  # long-term
    
    db.commit()
    
    # Create sample goals
    goals_data = [
        {
            "title": "Complete AI Productivity App",
            "description": "Build and deploy a full-featured AI-powered productivity application",
            "specific": "Develop a web application with task management, goal tracking, and AI-powered suggestions",
            "measurable": "Launch MVP with 100% test coverage and deployed to production", 
            "achievable": "Using existing skills in React, FastAPI, and database design",
            "relevant": "This project will enhance portfolio and showcase full-stack development skills",
            "time_bound": datetime.utcnow() + timedelta(days=30),
            "status": GoalStatus.active,
            "goal_type": GoalType.project,
            "progress": 0.6,
            "position": 1,
            "user_id": SAMPLE_USER_ID
        },
        {
            "title": "Learn Advanced Python Patterns",
            "description": "Master advanced Python programming patterns and best practices",
            "specific": "Study design patterns, async programming, and performance optimization",
            "measurable": "Complete 5 advanced Python courses and build 3 demo projects",
            "achievable": "Dedicate 2 hours daily to study and practice",
            "relevant": "Will improve code quality and career prospects",
            "time_bound": datetime.utcnow() + timedelta(days=90),
            "status": GoalStatus.planning,
            "goal_type": GoalType.educational,
            "progress": 0.1,
            "position": 2,
            "user_id": SAMPLE_USER_ID
        },
        {
            "title": "Improve Physical Fitness",
            "description": "Get in better shape through regular exercise and healthy eating",
            "specific": "Exercise 4 times per week and follow a balanced diet",
            "measurable": "Lose 10 pounds and run a 5K in under 25 minutes",
            "achievable": "Start with 30-minute workouts and gradually increase intensity",
            "relevant": "Better health improves energy and focus for work",
            "time_bound": datetime.utcnow() + timedelta(days=120),
            "status": GoalStatus.active,
            "goal_type": GoalType.health,
            "progress": 0.3,
            "position": 3,
            "user_id": SAMPLE_USER_ID
        }
    ]
    
    created_goals = []
    for goal_data in goals_data:
        goal = Goal(**goal_data)
        db.add(goal)
        created_goals.append(goal)
    
    db.commit()
    
    # Link some tasks to goals
    created_tasks[0].goal_id = created_goals[0].id  # Project proposal task -> AI App goal
    created_tasks[1].goal_id = created_goals[0].id  # Code review task -> AI App goal
    created_tasks[3].goal_id = created_goals[1].id  # Learn React hooks -> Learning goal
    
    db.commit()
    
    print(f"✅ Created {len(categories)} categories")
    print(f"✅ Created {len(tags)} tags")
    print(f"✅ Created {len(created_tasks)} tasks")
    print(f"✅ Created {len(created_goals)} goals")
    print(f"\nSample data created successfully for user: {SAMPLE_USER_ID}")

def main(auto_seed=False):
    db = SessionLocal()
    try:
        # Check if data already exists
        existing_tasks = db.query(Task).filter_by(user_id=SAMPLE_USER_ID).first()
        if existing_tasks:
            if auto_seed:
                # In auto-seed mode, skip if data exists
                print(f"Sample data already exists for user {SAMPLE_USER_ID}. Skipping seed.")
                return
            else:
                response = input("Sample data already exists. Do you want to delete it and create new data? (y/n): ")
                if response.lower() == 'y':
                    # Delete existing data
                    db.query(Task).filter_by(user_id=SAMPLE_USER_ID).delete()
                    db.query(TaskCategory).filter_by(user_id=SAMPLE_USER_ID).delete()
                    db.query(TaskTag).filter_by(user_id=SAMPLE_USER_ID).delete()
                    db.query(Goal).filter_by(user_id=SAMPLE_USER_ID).delete()
                    db.commit()
                    print("Existing data deleted.")
                else:
                    print("Keeping existing data. Exiting.")
                    return
        
        create_sample_data(db)
    except Exception as e:
        print(f"Error during seeding: {e}")
        if not auto_seed:
            raise
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Seed the database with sample task data')
    parser.add_argument('--auto-seed', action='store_true', 
                        help='Run in automatic mode (skip if data exists, no prompts)')
    args = parser.parse_args()
    
    main(auto_seed=args.auto_seed)