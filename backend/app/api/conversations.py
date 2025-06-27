from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, desc
from typing import List, Optional

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.middleware.subscription_middleware import validate_ai_task_limit, require_pro_plan
from app.models.conversation import Conversation, Message, ConversationStatus, MessageRole
from app.models.goal import Goal, GoalType, GoalStatus
from app.models.task import Task, TaskPriority, TaskStatus
from app.schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    Conversation as ConversationSchema,
    ConversationWithMessages,
    MessageCreate,
    Message as MessageSchema,
    ChatMessage,
    ChatResponse,
    ProjectAnalysis,
    ProjectGenerationRequest,
    ProjectGenerationResponse
)
from app.services.ai_service import get_ai_service
from datetime import datetime

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.post("/", response_model=ConversationSchema)
async def create_conversation(
    conversation_data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
    validation_result: dict = Depends(validate_ai_task_limit)
):
    """Create a new conversation with optional initial message"""
    
    # Create conversation
    conversation = Conversation(
        title=conversation_data.title,
        status=conversation_data.status,
        user_id=current_user
    )
    
    db.add(conversation)
    db.flush()  # Flush to get the ID but don't commit yet
    
    # Ensure updated_at is set
    if conversation.updated_at is None:
        conversation.updated_at = conversation.created_at
    
    db.commit()
    db.refresh(conversation)
    
    # Add initial message if provided
    if conversation_data.initial_message:
        # Add user message
        user_message = Message(
            conversation_id=conversation.id,
            role=MessageRole.USER,
            content=conversation_data.initial_message
        )
        db.add(user_message)
        
        # Get AI response
        ai_service = get_ai_service()
        if ai_service:
            try:
                ai_response = ai_service.chat_with_context([
                    {"role": "user", "content": conversation_data.initial_message}
                ])
                
                assistant_message = Message(
                    conversation_id=conversation.id,
                    role=MessageRole.ASSISTANT,
                    content=ai_response
                )
                db.add(assistant_message)
                
            except Exception as e:
                print(f"Error getting AI response: {e}")
                # Add fallback message
                assistant_message = Message(
                    conversation_id=conversation.id,
                    role=MessageRole.ASSISTANT,
                    content="Hello! I'm here to help you plan and organize your projects. What would you like to work on?"
                )
                db.add(assistant_message)
        
        db.commit()
    
    return conversation


@router.get("/", response_model=List[ConversationSchema])
async def get_conversations(
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[ConversationStatus] = None,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get user's conversations"""
    
    query = db.query(Conversation).filter(Conversation.user_id == current_user)
    
    if status:
        query = query.filter(Conversation.status == status)
    
    conversations = query.order_by(desc(Conversation.updated_at)).offset(offset).limit(limit).all()
    
    # Ensure all conversations have updated_at set (handle legacy data)
    for conv in conversations:
        if conv.updated_at is None:
            conv.updated_at = conv.created_at
            db.add(conv)
    
    if any(conv.updated_at is None for conv in conversations):
        db.commit()
        db.refresh_all(conversations)
    
    return conversations


@router.get("/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get a specific conversation with all messages"""
    
    conversation = db.query(Conversation).options(
        joinedload(Conversation.messages)
    ).filter(
        and_(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user
        )
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Sort messages by creation time
    conversation.messages.sort(key=lambda m: m.created_at)
    
    return conversation


@router.post("/{conversation_id}/messages", response_model=ChatResponse)
async def send_message(
    conversation_id: int,
    message_data: ChatMessage,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
    validation_result: dict = Depends(validate_ai_task_limit)
):
    """Send a message to the conversation and get AI response"""
    
    # Verify conversation exists and belongs to user
    conversation = db.query(Conversation).filter(
        and_(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user,
            Conversation.status == ConversationStatus.ACTIVE
        )
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found or inactive")
    
    # Add user message
    user_message = Message(
        conversation_id=conversation_id,
        role=MessageRole.USER,
        content=message_data.content
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    
    # Get conversation history for context
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at).all()
    
    # Prepare context for AI
    conversation_context = []
    for msg in messages:
        conversation_context.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # Get AI response
    ai_service = get_ai_service()
    if not ai_service:
        raise HTTPException(
            status_code=503,
            detail="AI service not configured. Please set OPENAI_API_KEY."
        )
    
    try:
        ai_response = ai_service.chat_with_context(conversation_context)
        
        assistant_message = Message(
            conversation_id=conversation_id,
            role=MessageRole.ASSISTANT,
            content=ai_response
        )
        
        db.add(assistant_message)
        
        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(assistant_message)
        db.refresh(conversation)
        
        return ChatResponse(
            message=assistant_message,
            conversation=conversation
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating AI response: {str(e)}"
        )


@router.post("/{conversation_id}/analyze", response_model=ProjectAnalysis)
async def analyze_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
    validation_result: dict = Depends(validate_ai_task_limit)
):
    """Analyze conversation to extract project information"""
    
    # Get conversation with messages
    conversation = db.query(Conversation).options(
        joinedload(Conversation.messages)
    ).filter(
        and_(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user
        )
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if len(conversation.messages) < 2:
        raise HTTPException(
            status_code=400, 
            detail="Conversation needs more messages to analyze for project extraction"
        )
    
    # Prepare messages for AI analysis
    messages_for_analysis = []
    for msg in sorted(conversation.messages, key=lambda m: m.created_at):
        messages_for_analysis.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # Get AI service
    ai_service = get_ai_service()
    if not ai_service:
        raise HTTPException(
            status_code=503,
            detail="AI service not configured. Please set OPENAI_API_KEY."
        )
    
    try:
        analysis = ai_service.analyze_conversation_for_project(messages_for_analysis)
        return analysis
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing conversation: {str(e)}"
        )


@router.post("/{conversation_id}/generate-project", response_model=ProjectGenerationResponse)
async def generate_project_from_conversation(
    conversation_id: int,
    request: ProjectGenerationRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
    validation_result: dict = Depends(validate_ai_task_limit)
):
    """Generate a project (goal) and tasks from conversation analysis"""
    
    # Verify conversation exists
    conversation = db.query(Conversation).filter(
        and_(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user
        )
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Get analysis (either provided or generate new one)
    analysis = request.analysis
    if not analysis:
        # Generate analysis first
        analysis = await analyze_conversation(conversation_id, db, current_user, validation_result)
    
    created_goal_id = None
    created_tasks = []
    
    if request.create_goal and analysis.confidence_score >= 0.5:
        try:
            # Create the goal/project
            goal = Goal(
                title=analysis.suggested_title,
                description=analysis.suggested_description,
                type=GoalType.PROJECT,
                status=GoalStatus.ACTIVE,
                user_id=current_user,
                estimated_hours=sum(task.get("estimated_duration", 60) for task in analysis.suggested_tasks) / 60.0,
                # Store analysis metadata
                ai_milestones=[{"title": milestone, "description": ""} for milestone in analysis.key_milestones],
                ai_estimated_hours=sum(task.get("estimated_duration", 60) for task in analysis.suggested_tasks) / 60.0,
                ai_breakdown_generated_at=datetime.utcnow()
            )
            
            db.add(goal)
            db.commit()
            db.refresh(goal)
            created_goal_id = goal.id
            
            # Create suggested tasks
            for task_data in analysis.suggested_tasks:
                task = Task(
                    title=task_data.get("title", ""),
                    description=task_data.get("description", ""),
                    priority=TaskPriority(task_data.get("priority", "medium")),
                    status=TaskStatus.TODO,
                    estimated_hours=task_data.get("estimated_duration", 60) / 60.0,
                    goal_id=goal.id,
                    user_id=current_user,
                    position=len(created_tasks),
                    ai_score=85  # Mark as AI-generated
                )
                
                db.add(task)
                created_tasks.append({
                    "title": task.title,
                    "description": task.description,
                    "priority": task.priority.value,
                    "estimated_hours": task.estimated_hours
                })
            
            # Link conversation to generated goal
            conversation.generated_goal_id = goal.id
            conversation.status = ConversationStatus.COMPLETED
            
            db.commit()
            
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error creating project: {str(e)}"
            )
    
    return ProjectGenerationResponse(
        analysis=analysis,
        goal_id=created_goal_id,
        created_tasks=created_tasks
    )


@router.put("/{conversation_id}", response_model=ConversationSchema)
async def update_conversation(
    conversation_id: int,
    update_data: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update conversation details"""
    
    conversation = db.query(Conversation).filter(
        and_(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user
        )
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Update fields
    if update_data.title is not None:
        conversation.title = update_data.title
    if update_data.status is not None:
        conversation.status = update_data.status
    if update_data.generated_goal_id is not None:
        conversation.generated_goal_id = update_data.generated_goal_id
    
    conversation.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(conversation)
    
    return conversation


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete a conversation and all its messages"""
    
    conversation = db.query(Conversation).filter(
        and_(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user
        )
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    db.delete(conversation)
    db.commit()
    
    return {"message": "Conversation deleted successfully"}