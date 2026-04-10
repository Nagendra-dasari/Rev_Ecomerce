from fastapi import HTTPException, status

from app.models.cart import CartItemModel, CartModel
from app.repositories.cart_repo import cart_repository
from app.repositories.product_repo import product_repository


class CartService:
    def get_cart(self, user_id: str) -> dict:
        cart = cart_repository.get_for_user(user_id)
        return self._serialize(cart)

    def add_item(self, user_id: str, product_id: str, quantity: int) -> dict:
        product = product_repository.get(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        cart = cart_repository.get_for_user(user_id)
        existing = next((item for item in cart.items if item.product_id == product_id), None)
        if existing:
            existing.quantity += quantity
        else:
            cart.items.append(CartItemModel(product_id=product_id, quantity=quantity))
        cart_repository.save(cart)
        return self._serialize(cart)

    def update_item(self, user_id: str, product_id: str, quantity: int) -> dict:
        cart = cart_repository.get_for_user(user_id)
        existing = next((item for item in cart.items if item.product_id == product_id), None)
        if not existing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
        if quantity == 0:
            cart = cart_repository.delete_item(user_id, product_id)
        else:
            existing.quantity = quantity
            cart = cart_repository.save(cart)
        return self._serialize(cart)

    def remove_item(self, user_id: str, product_id: str) -> dict:
        return self._serialize(cart_repository.delete_item(user_id, product_id))

    def clear_cart(self, user_id: str) -> dict:
        return self._serialize(cart_repository.clear(user_id))

    def _serialize(self, cart: CartModel) -> dict:
        items: list[dict] = []
        total_amount = 0.0
        for item in cart.items:
            product = product_repository.get(item.product_id)
            if not product:
                continue
            line_total = round(product.price * item.quantity, 2)
            total_amount += line_total
            items.append(
                {
                    "product_id": product.id,
                    "name": product.name,
                    "image": product.image,
                    "price": product.price,
                    "quantity": item.quantity,
                    "stock": product.stock,
                    "line_total": line_total,
                }
            )
        return {"user_id": cart.user_id, "items": items, "total_amount": round(total_amount, 2)}


cart_service = CartService()
