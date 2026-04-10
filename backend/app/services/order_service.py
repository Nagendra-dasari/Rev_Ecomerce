from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException, status

from app.core.constants import ORDER_STATUSES
from app.models.order import OrderAddressModel, OrderItemModel, OrderModel, StatusEventModel
from app.repositories.order_repo import order_repository
from app.repositories.product_repo import product_repository
from app.repositories.user_repo import user_repository
from app.schemas.order import InvoiceResponse, OrderCreate, OrderResponse, OrderStatusUpdate
from app.services.notification_service import notification_service


class OrderService:
    @staticmethod
    def _notify_admins(title: str, message: str) -> None:
        for user in user_repository.list_users():
            if user.role == "admin":
                notification_service.create_notification(
                    user.id,
                    title,
                    message,
                    "order",
                    "/dashboard",
                )

    def create_order(self, user_id: str, payload: OrderCreate) -> OrderResponse:
        items: list[OrderItemModel] = []
        total_amount = 0.0

        for item in payload.items:
            product = product_repository.get(item.product_id)
            if not product:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item.product_id} not found")
            if item.quantity > product.stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Not enough stock for {product.name}",
                )

            product.stock -= item.quantity
            product_repository.save(product)
            total_price = product.price * item.quantity
            total_amount += total_price
            items.append(
                OrderItemModel(
                    product_id=product.id,
                    name=product.name,
                    quantity=item.quantity,
                    unit_price=product.price,
                    total_price=total_price,
                )
            )

        order = OrderModel(
            id=f"ord-{uuid4().hex[:8]}",
            invoice_number=f"INV-{uuid4().hex[:6].upper()}",
            user_id=user_id,
            status=ORDER_STATUSES[1],
            items=items,
            shipping_address=OrderAddressModel(**payload.shipping_address.model_dump()),
            payment_status="paid" if payload.payment_method.lower() != "cash on delivery" else "pending",
            payment_method=payload.payment_method,
            payment_reference=f"PAY-{uuid4().hex[:10].upper()}",
            total_amount=round(total_amount, 2),
            created_at=datetime.now(timezone.utc).isoformat(),
            status_history=[
                StatusEventModel(
                    status=ORDER_STATUSES[1],
                    message="Order confirmed and payment initiated.",
                    timestamp=datetime.now(timezone.utc).isoformat(),
                )
            ],
        )
        order_repository.save(order)
        notification_service.create_notification(
            user_id,
            "Order confirmed",
            f"Your order {order.invoice_number} has been confirmed.",
            "order",
            "/dashboard",
        )
        self._notify_admins(
            "New customer order",
            f"Order {order.invoice_number} has been placed and is ready for admin review.",
        )
        return OrderResponse(**order.model_dump())

    def list_orders(self, user_id: str) -> list[OrderResponse]:
        return [OrderResponse(**order.model_dump()) for order in order_repository.list_for_user(user_id)]

    def list_all_orders(self) -> list[OrderResponse]:
        return [OrderResponse(**order.model_dump()) for order in order_repository.list_all()]

    def get_order(self, user_id: str, order_id: str, is_admin: bool = False) -> OrderResponse:
        order = order_repository.get(order_id)
        if not order or (not is_admin and order.user_id != user_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        return OrderResponse(**order.model_dump())

    def update_status(self, order_id: str, payload: OrderStatusUpdate) -> OrderResponse:
        order = order_repository.get(order_id)
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        if payload.status not in ORDER_STATUSES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid order status")
        order.status = payload.status
        if payload.status == "delivered":
            order.payment_status = "paid"
        order.status_history.append(
            StatusEventModel(status=payload.status, message=payload.message, timestamp=datetime.now(timezone.utc).isoformat())
        )
        order_repository.save(order)
        notification_service.create_notification(
            order.user_id,
            "Order status updated",
            f"Your order {order.invoice_number} is now {payload.status}.",
            "order",
            "/dashboard",
        )
        return OrderResponse(**order.model_dump())

    def generate_invoice(self, user_id: str, order_id: str, is_admin: bool = False) -> InvoiceResponse:
        order = order_repository.get(order_id)
        if not order or (not is_admin and order.user_id != user_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        user = user_repository.get_by_id(order.user_id)
        lines = [
            f"Invoice Number: {order.invoice_number}",
            f"Customer: {user.name if user else order.user_id}",
            f"Order Date: {order.created_at}",
            f"Payment Method: {order.payment_method}",
            f"Payment Status: {order.payment_status}",
            "",
            "Items:",
        ]
        for item in order.items:
            lines.append(f"- {item.name} x {item.quantity} = Rs. {item.total_price:.2f}")
        lines.extend(
            [
                "",
                f"Shipping To: {order.shipping_address.full_name}, {order.shipping_address.line1}, {order.shipping_address.city}",
                f"Total Amount: Rs. {order.total_amount:.2f}",
            ]
        )
        return InvoiceResponse(order_id=order.id, invoice_number=order.invoice_number, content="\n".join(lines))


order_service = OrderService()
