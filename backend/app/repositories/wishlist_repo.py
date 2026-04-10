from app.db.connection import get_database
from app.models.wishlist import WishlistModel

_local_wishlists: dict[str, dict] = {}


class WishlistRepository:
    @property
    def collection(self):
        db = get_database()
        return db["wishlists"] if db is not None else None

    def get_for_user(self, user_id: str) -> WishlistModel | None:
        if self.collection is None:
            document = _local_wishlists.get(user_id)
            return WishlistModel(**document) if document else None
        document = self.collection.find_one({"user_id": user_id})
        return WishlistModel(**self._normalize(document)) if document else None

    def get_by_share_code(self, share_code: str) -> WishlistModel | None:
        if self.collection is None:
            document = next((item for item in _local_wishlists.values() if item["share_code"] == share_code), None)
            return WishlistModel(**document) if document else None
        document = self.collection.find_one({"share_code": share_code})
        return WishlistModel(**self._normalize(document)) if document else None

    def save(self, wishlist: WishlistModel) -> WishlistModel:
        if self.collection is None:
            _local_wishlists[wishlist.user_id] = wishlist.model_dump(mode="json")
            return wishlist
        self.collection.replace_one({"user_id": wishlist.user_id}, wishlist.model_dump(mode="json"), upsert=True)
        return wishlist

    @staticmethod
    def _normalize(document: dict | None) -> dict | None:
        if not document:
            return None
        document.pop("_id", None)
        return document


wishlist_repository = WishlistRepository()
