from pydantic import BaseModel

from app.schemas.order import OrderResponse
from app.schemas.product import ProductResponse
from app.schemas.user import UserResponse


class AnalyticsMetric(BaseModel):
    label: str
    value: float | int


class AdminDashboardResponse(BaseModel):
    metrics: list[AnalyticsMetric]
    low_stock_products: list[ProductResponse]
    recent_orders: list[OrderResponse]
    users: list[UserResponse]
