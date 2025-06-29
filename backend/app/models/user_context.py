from sqlalchemy import Column, Integer, Text, JSON
from app.db.database import Base
from app.models.base import TimestampMixin, UserOwnedMixin


class UserContext(Base, TimestampMixin, UserOwnedMixin):
    __tablename__ = "user_contexts"

    id = Column(Integer, primary_key=True, index=True)
    work_description = Column(Text, nullable=True)
    short_term_focus = Column(JSON, nullable=True, default=list)
    long_term_goals = Column(JSON, nullable=True, default=list)
    other_context = Column(JSON, nullable=True, default=list)