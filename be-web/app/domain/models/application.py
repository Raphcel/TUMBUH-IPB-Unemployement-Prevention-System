import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, String, Enum, DateTime, ForeignKey, Text, UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.config.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class ApplicationStatus(str, enum.Enum):
    APPLIED = "Applied"
    SCREENING = "Screening"
    INTERVIEW = "Interview"
    ACCEPTED = "Accepted"
    REJECTED = "Rejected"


class Application(Base):
    """Application domain entity — represents a student's application to an opportunity."""

    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint("student_id", "opportunity_id", name="uq_student_opportunity"),
    )

    id: int = Column(Integer, primary_key=True, index=True)
    student_id: int = Column(Integer, ForeignKey("users.id"), nullable=False)
    opportunity_id: int = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    status: ApplicationStatus = Column(
        Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.APPLIED
    )
    applied_at: datetime = Column(DateTime, default=_utcnow)
    cover_letter: str = Column(Text, nullable=True)

    # JSON string storing status history: [{"status": "...", "date": "..."}]
    history: str = Column(Text, nullable=True)

    created_at: datetime = Column(DateTime, default=_utcnow)
    updated_at: datetime = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    # Relationships
    student = relationship("User", back_populates="applications")
    opportunity = relationship("Opportunity", back_populates="applications")

    def __repr__(self) -> str:
        return f"<Application(id={self.id}, student={self.student_id}, status='{self.status}')>"
