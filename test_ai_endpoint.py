#!/usr/bin/env python3
"""Test the AI task parsing endpoint"""

import requests
import json
import os

# Test configuration
API_URL = "http://localhost:8000"
TEST_TOKEN = os.getenv("TEST_JWT_TOKEN", "test-token")  # You'll need a valid JWT token

# Test descriptions
test_descriptions = [
    "I need to finish the quarterly report by Friday, it's urgent and will take about 2 hours",
    "Schedule a meeting with the team next Monday to discuss the new project",
    "Buy groceries tomorrow: milk, bread, eggs, and fruits",
    "Complete the Python tutorial this week, should take 3-4 hours",
]

def test_parse_ai():
    """Test the AI parsing endpoint"""
    headers = {
        "Authorization": f"Bearer {TEST_TOKEN}",
        "Content-Type": "application/json"
    }
    
    for desc in test_descriptions:
        print(f"\n{'='*60}")
        print(f"Testing: {desc}")
        print('='*60)
        
        try:
            response = requests.post(
                f"{API_URL}/api/tasks/parse-ai",
                params={"description": desc},
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Success!")
                print(json.dumps(result, indent=2))
            else:
                print(f"❌ Error {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

if __name__ == "__main__":
    print("AI Task Parsing Endpoint Test")
    print("Note: This requires a valid JWT token and OPENAI_API_KEY to be set")
    test_parse_ai()