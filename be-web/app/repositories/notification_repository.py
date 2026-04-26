from sqlalchemy.orm import Session

from app.domain.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    """Repository for Notification entity."""

    def __init__(self, db: Session):
        super().__init__(Notification, db)

    def get_by_user(self, user_id: int, skip: int = 0, limit: int = 50) -> list[Notification]:
        return (
            self._db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_by_user(self, user_id: int) -> int:
        return (
            self._db.query(Notification)
            .filter(Notification.user_id == user_id)
            .count()
        )

    def count_unread(self, user_id: int) -> int:
        return (
            self._db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .count()
        )

    def mark_all_read(self, user_id: int) -> int:
        count = (
            self._db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .update({"is_read": True})
        )
        self._db.commit()
        return count
