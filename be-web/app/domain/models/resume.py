from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship

from app.config.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class ResumeProfile(Base):
    """Structured CV draft owned by a student."""

    __tablename__ = "resume_profiles"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title: str = Column(String(120), nullable=False)
    template_slug: str = Column(String(50), nullable=False, default="classic")
    personal_info: dict = Column(JSON, nullable=False)
    professional_info: dict = Column(JSON, nullable=False)
    education_info: dict = Column(JSON, nullable=False)
    organisational_info: dict = Column(JSON, nullable=False)
    other_info: dict = Column(JSON, nullable=False)
    created_at: datetime = Column(DateTime, default=_utcnow, nullable=False)
    updated_at: datetime = Column(DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)

    user = relationship("User", back_populates="resume_profiles")
