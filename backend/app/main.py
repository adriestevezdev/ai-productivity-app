from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
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

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Productivity App API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}