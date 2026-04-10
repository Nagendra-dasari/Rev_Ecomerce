from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.notification import NotificationResponse
from app.schemas.user import UserResponse
from app.services.notification_service import notification_service

router = APIRouter()


@router.get("", response_model=list[NotificationResponse])
async def list_notifications(current_user: UserResponse = Depends(get_current_user)) -> list[NotificationResponse]:
    return notification_service.list_notifications(current_user.id)


@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: str,
    current_user: UserResponse = Depends(get_current_user),
) -> NotificationResponse:
    return notification_service.mark_read(current_user.id, notification_id)
