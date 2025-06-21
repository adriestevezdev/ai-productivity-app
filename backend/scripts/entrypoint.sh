#!/bin/bash
set -e

echo "Waiting for postgres..."
while ! nc -z postgres 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

echo "Running database migrations..."
alembic upgrade head

# Check if we should run seeds (only if no tasks exist)
python -c "
from app.db.database import SessionLocal
from app.models.task import Task
db = SessionLocal()
task_count = db.query(Task).count()
db.close()
exit(0 if task_count == 0 else 1)
" && {
    echo "Database is empty, running seed script..."
    python scripts/seed_tasks.py --auto-seed
} || {
    echo "Database already has data, skipping seed..."
}

echo "Starting application..."
exec "$@"