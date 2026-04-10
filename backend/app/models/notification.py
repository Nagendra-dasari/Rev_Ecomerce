from pydantic import BaseModel


class NotificationModel(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    link: str = ""
    read: bool = False
    created_at: str
