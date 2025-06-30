from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from app.core.config import settings
from app.api.tasks import router as tasks_router
from app.api.goals import router as goals_router

app = FastAPI(
    title="AI Productivity App API",
    description="API for AI-powered productivity management",
    version="0.2.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request path: {request.url.path}")
    print(f"Request headers: {dict(request.headers)}")
    response = await call_next(request)
    return response

# Include routers
app.include_router(tasks_router)
app.include_router(goals_router)

# Import and include AI router
from app.api.task_ai import router as task_ai_router
app.include_router(task_ai_router)

# Import and include AI analytics router
from app.api.ai import router as ai_router
app.include_router(ai_router)

# Import and include subscription router
from app.api.subscriptions import router as subscriptions_router
app.include_router(subscriptions_router)

# Import and include conversations router
from app.api.conversations import router as conversations_router
app.include_router(conversations_router)

# Import and include user context router
from app.api.user_context import router as user_context_router
app.include_router(user_context_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Productivity App API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Custom exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with user-friendly messages"""
    errors = []
    for error in exc.errors():
        field = error["loc"][-1] if error["loc"] else "campo"
        error_type = error["type"]
        
        # Custom error messages based on field and error type
        if field == "title" and error_type == "string_too_short":
            errors.append("El título no puede estar vacío")
        elif field == "title" and error_type == "string_too_long":
            errors.append("El título es demasiado largo (máximo 255 caracteres)")
        elif field == "estimated_hours" and error_type == "greater_than_equal":
            errors.append("El tiempo estimado no puede ser negativo")
        elif field == "estimated_hours" and error_type == "int_parsing":
            errors.append("El tiempo estimado debe ser un número entero")
        elif field == "actual_hours" and error_type == "greater_than_equal":
            errors.append("El tiempo real no puede ser negativo")
        elif field == "due_date" and error_type == "datetime_parsing":
            errors.append("La fecha de vencimiento no es válida")
        elif field == "category_id" and error_type == "int_parsing":
            errors.append("La categoría seleccionada no es válida")
        elif field == "priority" and error_type == "enum":
            errors.append("La prioridad seleccionada no es válida")
        elif field == "status" and error_type == "enum":
            errors.append("El estado seleccionado no es válido")
        else:
            # Generic message for other errors
            msg = error.get("msg", "Error de validación")
            errors.append(f"{field}: {msg}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": {
                "message": "Error al validar los datos",
                "errors": errors
            }
        }
    )