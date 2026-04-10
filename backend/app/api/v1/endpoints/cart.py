from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.cart import CartItemRequest, CartQuantityUpdate
from app.schemas.user import UserResponse
from app.services.cart_service import cart_service

router = APIRouter()


@router.get("")
async def get_cart(current_user: UserResponse = Depends(get_current_user)) -> dict:
    return cart_service.get_cart(current_user.id)


@router.post("")
async def add_to_cart(
    payload: CartItemRequest,
    current_user: UserResponse = Depends(get_current_user),
) -> dict:
    return cart_service.add_item(current_user.id, payload.product_id, payload.quantity)


@router.put("/{product_id}")
async def update_cart_item(
    product_id: str,
    payload: CartQuantityUpdate,
    current_user: UserResponse = Depends(get_current_user),
) -> dict:
    return cart_service.update_item(current_user.id, product_id, payload.quantity)


@router.delete("/{product_id}")
async def delete_cart_item(product_id: str, current_user: UserResponse = Depends(get_current_user)) -> dict:
    return cart_service.remove_item(current_user.id, product_id)


@router.delete("")
async def clear_cart(current_user: UserResponse = Depends(get_current_user)) -> dict:
    return cart_service.clear_cart(current_user.id)
