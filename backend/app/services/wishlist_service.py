from fastapi import HTTPException, status

from app.models.wishlist import WishlistModel
from app.repositories.product_repo import product_repository
from app.repositories.wishlist_repo import wishlist_repository
from app.schemas.product import ProductResponse
from app.schemas.wishlist import WishlistResponse


class WishlistService:
    def get_wishlist(self, user_id: str) -> WishlistResponse:
        wishlist = self._get_or_create(user_id)
        items = [product_repository.get(product_id) for product_id in wishlist.product_ids]
        return WishlistResponse(
            user_id=user_id,
            share_code=wishlist.share_code,
            items=[ProductResponse(**item.model_dump()) for item in items if item],
        )

    def add_product(self, user_id: str, product_id: str) -> WishlistResponse:
        if not product_repository.get(product_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        wishlist = self._get_or_create(user_id)
        if product_id not in wishlist.product_ids:
            wishlist.product_ids.append(product_id)
            wishlist_repository.save(wishlist)
        return self.get_wishlist(user_id)

    def remove_product(self, user_id: str, product_id: str) -> WishlistResponse:
        wishlist = self._get_or_create(user_id)
        wishlist.product_ids = [item for item in wishlist.product_ids if item != product_id]
        wishlist_repository.save(wishlist)
        return self.get_wishlist(user_id)

    def share_wishlist(self, share_code: str) -> WishlistResponse:
        wishlist = wishlist_repository.get_by_share_code(share_code)
        if not wishlist:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wishlist not found")
        return self.get_wishlist(wishlist.user_id)

    def _get_or_create(self, user_id: str) -> WishlistModel:
        wishlist = wishlist_repository.get_for_user(user_id)
        if wishlist is None:
            wishlist = WishlistModel(user_id=user_id, share_code=f"wish-{user_id}", product_ids=[])
            wishlist_repository.save(wishlist)
        return wishlist


wishlist_service = WishlistService()
