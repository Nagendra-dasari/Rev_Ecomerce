from datetime import datetime, timezone

from app.core.constants import DEMO_PRODUCTS, DEMO_USERS
from app.core.security import get_password_hash
from app.db.connection import get_database
from app.models.product import ProductModel
from app.models.user import UserModel
from app.models.wishlist import WishlistModel
from app.repositories.notification_repo import notification_repository
from app.repositories.product_repo import product_repository
from app.repositories.user_repo import user_repository
from app.repositories.wishlist_repo import wishlist_repository


def seed_local_data() -> None:
    db = get_database()
    if db is not None:
        db.users.create_index("email", unique=True)
        db.products.create_index("category")
        db.orders.create_index("user_id")
        db.reviews.create_index("product_id")
        db.carts.create_index("user_id", unique=True)
        db.wishlists.create_index("user_id", unique=True)
        db.notifications.create_index("user_id")

    if not user_repository.exists():
        for item in DEMO_USERS:
            user_repository.save(
                UserModel(
                    id=item["id"],
                    name=item["name"],
                    email=item["email"],
                    hashed_password=get_password_hash(item["password"]),
                    role=item["role"],
                    phone=item.get("phone", ""),
                    addresses=item.get("addresses", []),
                    created_at=datetime.now(timezone.utc).isoformat(),
                )
            )
    if not product_repository.exists():
        for item in DEMO_PRODUCTS:
            product_repository.save(ProductModel(**item))
    for user in user_repository.list_users():
        if wishlist_repository.get_for_user(user.id) is None:
            wishlist_repository.save(WishlistModel(user_id=user.id, share_code=f"wish-{user.id}", product_ids=[]))
        if not notification_repository.list_for_user(user.id):
            notification_repository.create_welcome(user.id)
