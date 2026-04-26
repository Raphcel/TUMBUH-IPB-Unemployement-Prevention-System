from fastapi import HTTPException, status

from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationResponse, NotificationListResponse


class NotificationService:
    """Service handling notification business logic."""

    def __init__(self, notification_repo: NotificationRepository):
        self._repo = notification_repo

    def get_user_notifications(
        self, user_id: int, skip: int = 0, limit: int = 50
    ) -> NotificationListResponse:
        items = self._repo.get_by_user(user_id, skip, limit)
        total = self._repo.count_by_user(user_id)
        unread = self._repo.count_unread(user_id)
        return NotificationListResponse(
            items=[NotificationResponse.model_validate(n) for n in items],
            total=total,
            unread_count=unread,
        )

    def mark_as_read(self, user_id: int, notification_id: int) -> NotificationResponse:
        notif = self._repo.get_by_id(notification_id)
        if not notif or notif.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )
        updated = self._repo.update(notif, {"is_read": True})
        return NotificationResponse.model_validate(updated)

    def mark_all_read(self, user_id: int) -> dict:
        count = self._repo.mark_all_read(user_id)
        return {"message": f"Marked {count} notifications as read"}

    def create_notification(
        self, user_id: int, title: str, message: str, notif_type: str = "info"
    ) -> NotificationResponse:
        notif = self._repo.create({
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": notif_type,
        })
        return NotificationResponse.model_validate(notif)
