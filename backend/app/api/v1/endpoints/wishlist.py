from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.user import UserResponse
from app.schemas.wishlist import WishlistResponse
from app.services.wishlist_service import wishlist_service

router = APIRouter()


@router.get("", response_model=WishlistResponse)
async def get_wishlist(current_user: UserResponse = Depends(get_current_user)) -> WishlistResponse:
    return wishlist_service.get_wishlist(current_user.id)


@router.get("/share/{share_code}", response_model=WishlistResponse)
async def get_shared_wishlist(share_code: str) -> WishlistResponse:
    return wishlist_service.share_wishlist(share_code)


@router.post("/{product_id}", response_model=WishlistResponse)
async def add_to_wishlist(product_id: str, current_user: UserResponse = Depends(get_current_user)) -> WishlistResponse:
    return wishlist_service.add_product(current_user.id, product_id)


@router.delete("/{product_id}", response_model=WishlistResponse)
async def remove_from_wishlist(product_id: str, current_user: UserResponse = Depends(get_current_user)) -> WishlistResponse:
    return wishlist_service.remove_product(current_user.id, product_id)
