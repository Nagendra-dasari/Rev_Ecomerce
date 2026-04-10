from fastapi import APIRouter, WebSocket

router = APIRouter()


@router.websocket("/ws/notifications")
async def notifications_socket(websocket: WebSocket) -> None:
    await websocket.accept()
    await websocket.send_json({"message": "Notification socket connected"})
    await websocket.close()
