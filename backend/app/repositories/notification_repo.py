from datetime import datetime, timezone
from uuid import uuid4

from app.db.connection import get_database
from app.models.notification import NotificationModel

_local_notifications: dict[str, dict] = {}


class NotificationRepository:
    @property
    def collection(self):
        db = get_database()
        return db["notifications"] if db is not None else None

    def list_for_user(self, user_id: str) -> list[NotificationModel]:
        if self.collection is None:
            items = [item for item in _local_notifications.values() if item["user_id"] == user_id]
            items.sort(key=lambda item: item["created_at"], reverse=True)
            return [NotificationModel(**item) for item in items]
        return [
            NotificationModel(**self._normalize(document))
            for document in self.collection.find({"user_id": user_id}).sort("created_at", -1)
        ]

    def get(self, notification_id: str) -> NotificationModel | None:
        if self.collection is None:
            document = _local_notifications.get(notification_id)
            return NotificationModel(**document) if document else None
        document = self.collection.find_one({"id": notification_id})
        return NotificationModel(**self._normalize(document)) if document else None

    def save(self, notification: NotificationModel) -> NotificationModel:
        if self.collection is None:
            _local_notifications[notification.id] = notification.model_dump(mode="json")
            return notification
        self.collection.replace_one({"id": notification.id}, notification.model_dump(mode="json"), upsert=True)
        return notification

    def create_welcome(self, user_id: str) -> NotificationModel:
        notification = NotificationModel(
            id=f"notif-{uuid4().hex[:8]}",
            user_id=user_id,
            title="Welcome",
            message="Your account is ready. Browse products, manage wishlist, and track orders here.",
            type="system",
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        return self.save(notification)

    @staticmethod
    def _normalize(document: dict | None) -> dict | None:
        if not document:
            return None
        document.pop("_id", None)
        return document


notification_repository = NotificationRepository()
