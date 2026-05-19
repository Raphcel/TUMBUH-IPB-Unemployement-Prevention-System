from datetime import datetime, timezone

from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.config.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class CompanyFollow(Base):
    """Company follow entity - represents a student following a company."""

    __tablename__ = "company_follows"
    __table_args__ = (
        UniqueConstraint("student_id", "company_id", name="uq_student_company_follow"),
    )

    id: int = Column(Integer, primary_key=True, index=True)
    student_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id: int = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: datetime = Column(DateTime, default=_utcnow)

    student = relationship("User", back_populates="company_follows")
    company = relationship("Company", back_populates="followers")

    def __repr__(self) -> str:
        return f"<CompanyFollow(student_id={self.student_id}, company_id={self.company_id})>"
