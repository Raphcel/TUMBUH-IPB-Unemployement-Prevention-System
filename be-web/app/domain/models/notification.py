from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.config.database import Base


def _utcnow():
    return datetime.now(timezone.utc)


class Notification(Base):
    """Notification entity — represents an in-app notification for a user."""

    __tablename__ = "notifications"

    id: int = Column(Integer, primary_key=True, index=True)
    user_id: int = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title: str = Column(String(255), nullable=False)
    message: str = Column(Text, nullable=False)
    type: str = Column(String(20), nullable=False, default="info")  # info, success, warning
    is_read: bool = Column(Boolean, default=False, nullable=False)
    created_at: datetime = Column(DateTime, default=_utcnow)

    # Relationships
    user = relationship("User")

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, user={self.user_id}, read={self.is_read})>"
