import pytest

import app.db.connection as db_connection
from app.repositories.cart_repo import _local_carts
from app.repositories.notification_repo import _local_notifications
from app.repositories.order_repo import _local_orders
from app.repositories.product_repo import _local_products
from app.repositories.review_repo import _local_reviews
from app.repositories.user_repo import _local_users
from app.repositories.wishlist_repo import _local_wishlists


db_connection._mongo_unavailable = True
_db_client = getattr(db_connection, "_client", None)
if _db_client is not None:
    db_connection._client = None

db_connection.connect_to_mongo = lambda: None

db_connection.get_database = lambda: None


@pytest.fixture(autouse=True)
def clear_local_repositories():
    _local_users.clear()
    _local_products.clear()
    _local_carts.clear()
    _local_wishlists.clear()
    _local_notifications.clear()
    _local_orders.clear()
    _local_reviews.clear()
    yield
