# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Productivity App - A productivity management application with AI-powered features, built with FastAPI backend and Next.js frontend, using Clerk for authentication.

## Essential Commands

### Development Environment

```bash
# Start all services (frontend, backend, database, adminer)
docker compose up

# Start services in background
docker compose up -d

# View logs
docker compose logs -f [service-name]

# Rebuild after dependency changes
docker compose build [service-name]
docker compose up --build
```

### Frontend Development

```bash
# Run frontend locally (outside Docker)
cd frontend
npm install
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### Backend Development

```bash
# Run backend locally (outside Docker)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Database migrations
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
alembic downgrade -1

# Create new migration
alembic revision -m "description"
```

### Testing

```bash
# Backend tests
cd backend
pytest
pytest tests/test_specific.py -v

# Frontend tests
cd frontend
npm test
npm run test:watch
```

## Architecture & Key Design Decisions

### Service Architecture

The application uses a microservices approach with Docker Compose:
- **Frontend (port 3000)**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend (port 8000)**: FastAPI with async support, SQLAlchemy ORM
- **PostgreSQL (port 5432)**: Primary database with persistent volumes
- **Adminer (port 8080)**: Database management UI

### Authentication Flow

1. **Clerk Integration**: Both frontend and backend use Clerk for authentication
2. **Frontend**: ClerkProvider wraps the app, middleware protects routes
3. **Backend**: JWT verification middleware validates tokens from Clerk
4. **API Calls**: Frontend includes JWT token in Authorization header

### Database Architecture

- **Base Models**: All models inherit from `BaseDBModel` with `created_at`, `updated_at`, `user_id`
- **User Isolation**: Every query filters by `user_id` from JWT claims
- **Migrations**: Alembic manages schema changes with version control

### Frontend Structure

```
frontend/src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks (e.g., useApi)
├── lib/             # Utilities (api-client)
└── middleware.ts    # Route protection
```

Key patterns:
- Server Components by default, 'use client' when needed
- Middleware redirects unauthenticated users to /sign-in
- API client with automatic token injection

### Backend Structure

```
backend/app/
├── api/         # API route handlers
├── core/        # Core functionality (config, security)
├── db/          # Database connection and session
├── middleware/  # Request/response middleware
├── models/      # SQLAlchemy ORM models
├── schemas/     # Pydantic validation schemas
└── services/    # Business logic layer
```

Key patterns:
- Dependency injection for database sessions
- Automatic user_id injection from JWT
- Pydantic for request/response validation

## Critical Implementation Details

### Environment Variables

Required variables (see .env.example):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key for frontend
- `CLERK_SECRET_KEY`: Clerk secret for backend JWT validation
- `DATABASE_URL`: PostgreSQL connection string (set in docker-compose)

### Current State & Next Steps

**Completed (Phase 1)**:
- Docker infrastructure with hot reload
- Clerk authentication integration
- Base models with user isolation
- Frontend routing and protection

**TODO (Phase 2)**: 
- Replace invoice models with Task/Goal/Category models
- Implement task CRUD endpoints
- Build task UI components (Kanban, List views)
- Integrate OpenAI for natural language processing

### Common Pitfalls to Avoid

1. **User Isolation**: Always filter by user_id in queries
2. **Migration Conflicts**: Run `alembic heads` to check for conflicts
3. **CORS Issues**: Backend configured for localhost:3000, update for production
4. **Type Safety**: Use TypeScript interfaces matching Pydantic schemas

### AI Integration Plans

The architecture supports AI features through:
- OpenAI API integration for task parsing
- Redis caching for AI responses (to be added)
- Background job processing with Celery (to be added)
- Embeddings for semantic search (future)

## Development Workflow

1. Check `todolist.md` for current phase and tasks and mark them with an X when you complete them.
2. Design documentation in `docs/design/` for UI/UX guidelines
3. Implement backend API first, then frontend
4. Write tests alongside implementation
5. Update migrations if model changes needed