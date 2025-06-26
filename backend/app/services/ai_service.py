import openai
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import json
import re
from app.core.config import settings
from app.schemas.task import TaskAICreate
from pydantic import ValidationError

class AIService:
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key not configured")
        openai.api_key = settings.OPENAI_API_KEY
    
    def parse_natural_language_task(self, description: str) -> TaskAICreate:
        """
        Parse natural language description into structured task data using OpenAI
        """
        system_prompt = """You are a task parsing assistant. Given a natural language description of a task, 
        extract and structure the information into a JSON format. Extract the following fields:
        
        - title: A concise title for the task (required)
        - description: A detailed description if provided, otherwise use the input
        - priority: Determine priority (low, medium, high) based on keywords like urgent, important, ASAP
        - due_date: Extract any date/time mentioned (format: YYYY-MM-DD)
        - estimated_duration: Extract time estimates (in minutes)
        - tags: Extract relevant tags or categories mentioned
        
        Return ONLY valid JSON without any markdown formatting or explanation.
        
        Example input: "I need to finish the quarterly report by Friday, it's urgent and will take about 2 hours"
        Example output: {
            "title": "Finish quarterly report",
            "description": "Complete the quarterly report",
            "priority": "high",
            "due_date": "2025-06-27",
            "estimated_duration": 120,
            "tags": ["report", "quarterly"]
        }
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Parse this task: {description}"}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            # Extract JSON from response
            content = response.choices[0].message.content
            
            # Clean the response if it contains markdown
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            # Parse JSON
            parsed_data = json.loads(content.strip())
            
            # Process due_date to ensure it's properly formatted
            if parsed_data.get("due_date"):
                # If it's a relative date like "Friday", convert to actual date
                due_date_str = parsed_data["due_date"]
                parsed_data["due_date"] = self._parse_due_date(due_date_str)
            
            # Ensure required fields
            if not parsed_data.get("title"):
                parsed_data["title"] = description[:50] + "..." if len(description) > 50 else description
            
            if not parsed_data.get("description"):
                parsed_data["description"] = description
            
            # Set defaults for optional fields
            parsed_data.setdefault("priority", "medium")
            parsed_data.setdefault("tags", [])
            
            # Create and return TaskAICreate schema
            return TaskAICreate(**parsed_data)
            
        except json.JSONDecodeError as e:
            # Fallback if AI response is not valid JSON
            return TaskAICreate(
                title=description[:50] + "..." if len(description) > 50 else description,
                description=description,
                priority="medium",
                tags=[]
            )
        except Exception as e:
            # Handle any other errors
            raise ValueError(f"Error parsing task with AI: {str(e)}")
    
    def _parse_due_date(self, date_str: str) -> Optional[str]:
        """
        Parse various date formats and relative dates into YYYY-MM-DD format
        """
        from datetime import datetime, timedelta
        import re
        
        # If already in correct format
        if re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
            return date_str
        
        # Try to parse relative dates
        today = datetime.now()
        date_str_lower = date_str.lower()
        
        # Map weekday names to days ahead
        weekdays = {
            'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
            'friday': 4, 'saturday': 5, 'sunday': 6
        }
        
        # Check for relative terms
        if 'today' in date_str_lower:
            return today.strftime('%Y-%m-%d')
        elif 'tomorrow' in date_str_lower:
            return (today + timedelta(days=1)).strftime('%Y-%m-%d')
        elif 'next week' in date_str_lower:
            return (today + timedelta(days=7)).strftime('%Y-%m-%d')
        
        # Check for weekday names
        for day_name, day_num in weekdays.items():
            if day_name in date_str_lower:
                days_ahead = (day_num - today.weekday()) % 7
                if days_ahead == 0:  # If it's the same day, assume next week
                    days_ahead = 7
                return (today + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
        
        # Try to extract numbers for "in X days" pattern
        match = re.search(r'in (\d+) days?', date_str_lower)
        if match:
            days = int(match.group(1))
            return (today + timedelta(days=days)).strftime('%Y-%m-%d')
        
        # If we can't parse it, return None
        return None

# Lazy singleton instance
_ai_service: Optional[AIService] = None

def get_ai_service() -> Optional[AIService]:
    """Get AI service instance if configured (lazy initialization)"""
    global _ai_service
    
    if _ai_service is None and settings.OPENAI_API_KEY:
        try:
            _ai_service = AIService()
        except Exception as e:
            print(f"Failed to initialize AI service: {e}")
            return None
    
    return _ai_service