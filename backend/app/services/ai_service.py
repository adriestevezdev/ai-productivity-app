import openai
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import json
import re
from app.core.config import settings
from app.schemas.task import TaskAICreate
from app.schemas.conversation import ProjectAnalysis
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
    
    def suggest_subtasks(self, task_title: str, task_description: str) -> list[Dict[str, Any]]:
        """
        Suggest subtasks based on task title and description using OpenAI
        """
        system_prompt = """You are a task breakdown assistant. Given a task title and description, 
        suggest 3-5 specific, actionable subtasks that would help complete the main task.
        
        Return a JSON array of subtasks, each with:
        - title: A concise, actionable title (start with a verb)
        - description: Brief description of what needs to be done
        - estimated_duration: Estimated time in minutes
        - priority: Priority level (low, medium, high) based on importance to main task
        
        Return ONLY valid JSON array without any markdown formatting or explanation.
        
        Example output: [
            {
                "title": "Research competitor pricing",
                "description": "Analyze pricing models of top 3 competitors",
                "estimated_duration": 60,
                "priority": "high"
            },
            {
                "title": "Create pricing comparison table",
                "description": "Document findings in a structured format",
                "estimated_duration": 30,
                "priority": "medium"
            }
        ]
        """
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Task: {task_title}\nDescription: {task_description}\n\nSuggest subtasks:"}
                ],
                temperature=0.7,
                max_tokens=800
            )
            
            # Extract JSON from response
            content = response.choices[0].message.content
            
            # Clean the response if it contains markdown
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            # Parse JSON
            subtasks = json.loads(content.strip())
            
            # Validate each subtask
            validated_subtasks = []
            for subtask in subtasks:
                if isinstance(subtask, dict) and subtask.get("title"):
                    validated_subtask = {
                        "title": subtask.get("title", ""),
                        "description": subtask.get("description", ""),
                        "estimated_duration": subtask.get("estimated_duration", 30),
                        "priority": subtask.get("priority", "medium")
                    }
                    validated_subtasks.append(validated_subtask)
            
            return validated_subtasks[:5]  # Limit to 5 subtasks
            
        except Exception as e:
            # Return empty list on error
            print(f"Error suggesting subtasks: {str(e)}")
            return []
    
    def break_down_goal(self, goal_title: str, goal_description: str, goal_specifics: Dict[str, str]) -> Dict[str, Any]:
        """
        Break down a SMART goal into actionable milestones, metrics, and tasks using AI
        """
        system_prompt = """You are a goal planning assistant specializing in SMART goals. Given a goal with its SMART components,
        create a comprehensive breakdown including milestones, success metrics, and potential obstacles.
        
        Return a JSON object with:
        - milestones: Array of 3-5 major milestones, each with:
          - title: Concise milestone title
          - description: What needs to be achieved
          - target_date: Suggested completion date (relative like "2 weeks", "1 month")
          - estimated_hours: Hours needed for this milestone
        
        - success_metrics: Array of 2-4 measurable success criteria, each with:
          - metric: What to measure
          - target_value: The target to achieve
          - measurement_method: How to measure it
        
        - estimated_total_hours: Total hours for the entire goal
        
        - potential_obstacles: Array of 2-3 likely challenges, each with:
          - obstacle: Description of the challenge
          - likelihood: "high", "medium", or "low"
          - mitigation_strategy: How to address it
        
        - recommended_tasks: Array of 5-8 initial tasks to get started, each with:
          - title: Task title
          - description: Brief description
          - milestone: Which milestone it belongs to (by index, starting at 0)
          - estimated_duration: Duration in minutes
          - priority: "high", "medium", or "low"
        
        Return ONLY valid JSON without any markdown formatting or explanation.
        """
        
        # Build context from SMART components
        context = f"""Goal: {goal_title}
Description: {goal_description}

SMART Components:
- Specific: {goal_specifics.get('specific', 'Not specified')}
- Measurable: {goal_specifics.get('measurable', 'Not specified')}
- Achievable: {goal_specifics.get('achievable', 'Not specified')}
- Relevant: {goal_specifics.get('relevant', 'Not specified')}
- Time-bound: {goal_specifics.get('time_bound', 'Not specified')}"""
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Break down this goal:\n\n{context}"}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            # Extract JSON from response
            content = response.choices[0].message.content
            
            # Clean the response if it contains markdown
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            # Parse JSON
            breakdown = json.loads(content.strip())
            
            # Validate and ensure all required fields exist
            breakdown.setdefault("milestones", [])
            breakdown.setdefault("success_metrics", [])
            breakdown.setdefault("estimated_total_hours", 40)
            breakdown.setdefault("potential_obstacles", [])
            breakdown.setdefault("recommended_tasks", [])
            
            return breakdown
            
        except Exception as e:
            # Return a basic breakdown on error
            print(f"Error breaking down goal: {str(e)}")
            return {
                "milestones": [
                    {
                        "title": "Initial Planning",
                        "description": "Define clear action steps and timeline",
                        "target_date": "1 week",
                        "estimated_hours": 5
                    },
                    {
                        "title": "Implementation Phase",
                        "description": "Execute the main work required",
                        "target_date": "1 month",
                        "estimated_hours": 20
                    },
                    {
                        "title": "Review and Completion",
                        "description": "Finalize and measure success",
                        "target_date": "6 weeks",
                        "estimated_hours": 5
                    }
                ],
                "success_metrics": [
                    {
                        "metric": "Goal Completion",
                        "target_value": "100%",
                        "measurement_method": "Track milestone completion"
                    }
                ],
                "estimated_total_hours": 30,
                "potential_obstacles": [
                    {
                        "obstacle": "Time constraints",
                        "likelihood": "medium",
                        "mitigation_strategy": "Block dedicated time slots in calendar"
                    }
                ],
                "recommended_tasks": []
            }
    
    def chat_with_context(self, messages: List[Dict[str, str]], system_context: Optional[str] = None) -> str:
        """
        Have a conversation with the AI assistant with full context
        """
        system_prompt = system_context or """You are a helpful AI assistant for a productivity app. 
        You help users plan projects, break down goals, and organize their work.
        
        Your role is to:
        - Help users clarify their project ideas
        - Ask relevant questions to understand scope and requirements
        - Suggest practical approaches and methodologies
        - Eventually help analyze conversations to extract structured project information
        
        Be conversational, helpful, and focus on productivity and project management."""
        
        try:
            conversation_messages = [{"role": "system", "content": system_prompt}]
            conversation_messages.extend(messages)
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=conversation_messages,
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error in chat conversation: {str(e)}")
            return "I'm sorry, I'm having trouble responding right now. Please try again later."
    
    def analyze_conversation_for_project(self, messages: List[Dict[str, str]]) -> ProjectAnalysis:
        """
        Analyze a conversation to extract project information and generate structured data
        """
        system_prompt = """You are a project analysis expert. Analyze the following conversation between a user and an AI assistant
        to extract project information and create a structured project proposal.
        
        Extract and organize:
        1. A clear project title
        2. A comprehensive description
        3. Estimated timeline
        4. Key milestones (3-5 major checkpoints)
        5. Suggested initial tasks (5-8 actionable items)
        6. Your confidence in this analysis (0.0 to 1.0)
        
        Return ONLY valid JSON in this exact format:
        {
            "suggested_title": "Clear project title",
            "suggested_description": "Comprehensive project description based on conversation",
            "estimated_timeline": "Human readable timeline like '2-3 months' or '4-6 weeks'",
            "key_milestones": ["Milestone 1", "Milestone 2", "Milestone 3"],
            "suggested_tasks": [
                {
                    "title": "Task title",
                    "description": "Task description",
                    "priority": "high|medium|low",
                    "estimated_duration": 60
                }
            ],
            "confidence_score": 0.85
        }
        
        If the conversation doesn't contain enough information for a project, set confidence_score to 0.3 or lower."""
        
        try:
            # Prepare conversation context
            conversation_text = "\n".join([
                f"{msg['role'].upper()}: {msg['content']}" for msg in messages
            ])
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Analyze this conversation for project extraction:\n\n{conversation_text}"}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            result = response.choices[0].message.content.strip()
            
            # Clean up response
            if result.startswith("```json"):
                result = result[7:]
            if result.endswith("```"):
                result = result[:-3]
            
            parsed_result = json.loads(result)
            
            # Validate required fields
            required_fields = ["suggested_title", "suggested_description", "estimated_timeline", 
                             "key_milestones", "suggested_tasks", "confidence_score"]
            
            for field in required_fields:
                if field not in parsed_result:
                    raise ValueError(f"Missing required field: {field}")
            
            # Validate confidence score
            confidence = parsed_result.get("confidence_score", 0.0)
            if not isinstance(confidence, (int, float)) or confidence < 0 or confidence > 1:
                parsed_result["confidence_score"] = 0.5
            
            return ProjectAnalysis(**parsed_result)
            
        except Exception as e:
            print(f"Error analyzing conversation: {str(e)}")
            # Return a low-confidence fallback analysis
            return ProjectAnalysis(
                suggested_title="New Project",
                suggested_description="Based on our conversation, this appears to be a project that needs further clarification.",
                estimated_timeline="To be determined",
                key_milestones=["Initial planning", "Implementation", "Review and completion"],
                suggested_tasks=[
                    {
                        "title": "Define project scope",
                        "description": "Clarify the exact requirements and goals",
                        "priority": "high",
                        "estimated_duration": 60
                    }
                ],
                confidence_score=0.2
            )
    
    def generate_project_suggestions(self, user_input: str) -> str:
        """
        Generate suggestions for project ideas based on user input
        """
        system_prompt = """You are a project ideation assistant. Help users brainstorm and refine project ideas.
        
        Given user input about their interests, goals, or challenges, suggest 2-3 specific, actionable project ideas.
        For each suggestion, include:
        - A clear project title
        - Brief description (2-3 sentences)
        - Estimated scope/timeline
        - Key benefits
        
        Be encouraging and practical. Focus on projects that can realistically be completed."""
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.8,
                max_tokens=400
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error generating project suggestions: {str(e)}")
            return "I'm having trouble generating suggestions right now. Could you tell me more about what kind of project you're interested in?"

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