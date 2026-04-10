from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException, status

from app.models.notification import NotificationModel
from app.repositories.notification_repo import notification_repository
from app.schemas.notification import NotificationResponse


class NotificationService:
    def list_notifications(self, user_id: str) -> list[NotificationResponse]:
        return [NotificationResponse(**notification.model_dump()) for notification in notification_repository.list_for_user(user_id)]

    def create_notification(self, user_id: str, title: str, message: str, type_: str, link: str = "") -> NotificationModel:
        notification = NotificationModel(
            id=f"notif-{uuid4().hex[:8]}",
            user_id=user_id,
            title=title,
            message=message,
            type=type_,
            link=link,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        return notification_repository.save(notification)

    def mark_read(self, user_id: str, notification_id: str) -> NotificationResponse:
        notification = notification_repository.get(notification_id)
        if not notification or notification.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        notification.read = True
        notification_repository.save(notification)
        return NotificationResponse(**notification.model_dump())


notification_service = NotificationService()
