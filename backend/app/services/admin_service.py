from app.db.init_db import seed_local_data
from app.repositories.order_repo import order_repository
from app.repositories.product_repo import product_repository
from app.repositories.user_repo import user_repository
from app.schemas.admin import AdminDashboardResponse, AnalyticsMetric
from app.schemas.order import OrderResponse
from app.schemas.product import ProductResponse
from app.schemas.user import UserResponse


class AdminService:
    def get_dashboard(self) -> AdminDashboardResponse:
        seed_local_data()
        orders = order_repository.list_all()
        products = product_repository.list_all()
        users = [user for user in user_repository.list_users() if user.role != "admin"]
        revenue = round(sum(order.total_amount for order in orders), 2)
        low_stock = [product for product in products if product.stock <= product.low_stock_threshold]
        low_stock.sort(key=lambda item: item.stock)
        return AdminDashboardResponse(
            metrics=[
                AnalyticsMetric(label="Revenue", value=revenue),
                AnalyticsMetric(label="Orders", value=len(orders)),
                AnalyticsMetric(label="Customers", value=len(users)),
                AnalyticsMetric(label="Products", value=len(products)),
            ],
            low_stock_products=[ProductResponse(**item.model_dump()) for item in low_stock[:5]],
            recent_orders=[OrderResponse(**item.model_dump()) for item in orders[:5]],
            users=[
                UserResponse(
                    id=user.id,
                    name=user.name,
                    email=user.email,
                    role=user.role,
                    phone=user.phone,
                    addresses=user.addresses,
                )
                for user in users[:10]
            ],
        )


admin_service = AdminService()
