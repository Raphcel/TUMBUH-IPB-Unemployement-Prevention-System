from datetime import datetime, timezone

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

    def create_many(self, notifications: list[dict]) -> list[Notification]:
        """Create several notifications in one transaction."""
        if not notifications:
            return []

        db_objects = [Notification(**item) for item in notifications]
        self._db.add_all(db_objects)
        self._db.commit()
        for obj in db_objects:
            self._db.refresh(obj)
        return db_objects

    def get_latest_unread_by_user_and_title_today(
        self,
        user_id: int,
        title: str,
        now: datetime | None = None,
    ) -> Notification | None:
        current_time = now or datetime.now(timezone.utc)
        start_of_day = current_time.replace(hour=0, minute=0, second=0, microsecond=0)
        return (
            self._db.query(Notification)
            .filter(
                Notification.user_id == user_id,
                Notification.title == title,
                Notification.is_read == False,
                Notification.created_at >= start_of_day,
            )
            .order_by(Notification.created_at.desc())
            .first()
        )
