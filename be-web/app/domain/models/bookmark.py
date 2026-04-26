from datetime import datetime, timezone

from sqlalchemy import (
    Column, Integer, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.config.database import Base


class Bookmark(Base):
    """Bookmark entity — represents a student saving/bookmarking an opportunity."""

    __tablename__ = "bookmarks"
    __table_args__ = (
        UniqueConstraint("user_id", "opportunity_id", name="uq_user_opportunity_bookmark"),
    )

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id: int = Column(Integer, ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: datetime = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="bookmarks")
    opportunity = relationship("Opportunity", back_populates="bookmarks")

    def __repr__(self) -> str:
        return f"<Bookmark(user_id={self.user_id}, opportunity_id={self.opportunity_id})>"
