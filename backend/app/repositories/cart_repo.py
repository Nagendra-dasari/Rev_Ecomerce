from app.models.cart import CartModel
from app.db.connection import get_database

_local_carts: dict[str, dict] = {}


class CartRepository:
    @property
    def collection(self):
        db = get_database()
        return db["carts"] if db is not None else None

    def get_for_user(self, user_id: str) -> CartModel:
        if self.collection is None:
            document = _local_carts.get(user_id)
            if not document:
                return CartModel(user_id=user_id, items=[])
            return CartModel(**document)
        document = self.collection.find_one({"user_id": user_id})
        if not document:
            return CartModel(user_id=user_id, items=[])
        document.pop("_id", None)
        return CartModel(**document)

    def save(self, cart: CartModel) -> CartModel:
        if self.collection is None:
            _local_carts[cart.user_id] = cart.model_dump(mode="json")
            return cart
        self.collection.replace_one({"user_id": cart.user_id}, cart.model_dump(mode="json"), upsert=True)
        return cart

    def clear(self, user_id: str) -> CartModel:
        cart = CartModel(user_id=user_id, items=[])
        return self.save(cart)

    def delete_item(self, user_id: str, product_id: str) -> CartModel:
        cart = self.get_for_user(user_id)
        cart.items = [item for item in cart.items if item.product_id != product_id]
        return self.save(cart)


cart_repository = CartRepository()
