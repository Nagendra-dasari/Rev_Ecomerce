from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, require_admin
from app.schemas.order import InvoiceResponse, OrderCreate, OrderResponse, OrderStatusUpdate
from app.schemas.user import UserResponse
from app.services.order_service import order_service

router = APIRouter()


@router.get("", response_model=list[OrderResponse])
async def list_orders(current_user: UserResponse = Depends(get_current_user)) -> list[OrderResponse]:
    return order_service.list_orders(current_user.id)


@router.get("/admin", response_model=list[OrderResponse], dependencies=[Depends(require_admin)])
async def list_all_orders() -> list[OrderResponse]:
    return order_service.list_all_orders()


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, current_user: UserResponse = Depends(get_current_user)) -> OrderResponse:
    return order_service.get_order(current_user.id, order_id, current_user.role == "admin")


@router.get("/{order_id}/invoice", response_model=InvoiceResponse)
async def get_invoice(order_id: str, current_user: UserResponse = Depends(get_current_user)) -> InvoiceResponse:
    return order_service.generate_invoice(current_user.id, order_id, current_user.role == "admin")


@router.post("", response_model=OrderResponse)
async def create_order(
    payload: OrderCreate,
    current_user: UserResponse = Depends(get_current_user),
) -> OrderResponse:
    return order_service.create_order(current_user.id, payload)


@router.put("/{order_id}/status", response_model=OrderResponse, dependencies=[Depends(require_admin)])
async def update_order_status(order_id: str, payload: OrderStatusUpdate) -> OrderResponse:
    return order_service.update_status(order_id, payload)
