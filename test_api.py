#!/usr/bin/env python3
"""Simple script to test the task API endpoints"""

import requests
import json
from datetime import datetime, timedelta

# Base URL
BASE_URL = "http://localhost:8000"

# Mock JWT token (in real usage, this would come from Clerk)
headers = {
    "Authorization": "Bearer mock-jwt-token",
    "Content-Type": "application/json"
}

def test_health():
    """Test health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_create_category():
    """Test creating a category"""
    print("\n=== Testing Create Category ===")
    data = {
        "name": "Work",
        "color": "#FF6B6B",
        "icon": "💼",
        "description": "Work-related tasks"
    }
    response = requests.post(f"{BASE_URL}/api/task-categories", json=data, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
        return response.json()
    else:
        print(f"Error: {response.text}")
    return None

def test_create_tag():
    """Test creating a tag"""
    print("\n=== Testing Create Tag ===")
    data = {
        "name": "urgent",
        "color": "#FF0000"
    }
    response = requests.post(f"{BASE_URL}/api/task-tags", json=data, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
        return response.json()
    else:
        print(f"Error: {response.text}")
    return None

def test_create_task(category_id=None, tag_ids=None):
    """Test creating a task"""
    print("\n=== Testing Create Task ===")
    data = {
        "title": "Complete Phase 2 Implementation",
        "description": "Finish implementing the task management system with:\n- Kanban board\n- List view\n- AI prioritization",
        "priority": "high",
        "status": "in_progress",
        "due_date": (datetime.now() + timedelta(days=3)).isoformat(),
        "estimated_hours": 8
    }
    
    if category_id:
        data["category_id"] = category_id
    if tag_ids:
        data["tag_ids"] = tag_ids
    
    response = requests.post(f"{BASE_URL}/api/tasks", json=data, headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {response.json()}")
        return response.json()
    else:
        print(f"Error: {response.text}")
    return None

def test_get_tasks():
    """Test getting all tasks"""
    print("\n=== Testing Get Tasks ===")
    response = requests.get(f"{BASE_URL}/api/tasks", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Total tasks: {data['total']}")
        print(f"Tasks: {json.dumps(data['tasks'], indent=2)}")
    else:
        print(f"Error: {response.text}")

def test_ai_recommendations():
    """Test AI recommendations"""
    print("\n=== Testing AI Recommendations ===")
    response = requests.get(f"{BASE_URL}/api/tasks/recommendations", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        tasks = response.json()
        print(f"Recommended tasks: {len(tasks)}")
        for task in tasks:
            print(f"- {task['title']} (Score: {task.get('ai_score', 'N/A')})")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    print("Testing AI Productivity App API...")
    
    # Test basic health
    test_health()
    
    # Create test data
    category = test_create_category()
    tag = test_create_tag()
    
    # Create a task
    category_id = category['id'] if category else None
    tag_ids = [tag['id']] if tag else []
    task = test_create_task(category_id, tag_ids)
    
    # Get all tasks
    test_get_tasks()
    
    # Test AI recommendations
    test_ai_recommendations()
    
    print("\n=== Testing Complete ===")