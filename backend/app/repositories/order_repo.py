from datetime import datetime, timezone

from pydantic import ValidationError

from app.models.order import OrderModel
from app.db.connection import get_database

_local_orders: dict[str, dict] = {}


class OrderRepository:
    @property
    def collection(self):
        db = get_database()
        return db["orders"] if db is not None else None

    def list_for_user(self, user_id: str) -> list[OrderModel]:
        if self.collection is None:
            documents = [item for item in _local_orders.values() if item["user_id"] == user_id]
            documents.sort(key=lambda item: item["created_at"], reverse=True)
            models = [self._to_model(document) for document in documents]
            return [m for m in models if m is not None]
        models = [self._to_model(document) for document in self.collection.find({"user_id": user_id}).sort("created_at", -1)]
        return [m for m in models if m is not None]

    def list_all(self) -> list[OrderModel]:
        if self.collection is None:
            documents = list(_local_orders.values())
            documents.sort(key=lambda item: item["created_at"], reverse=True)
            models = [self._to_model(document) for document in documents]
            return [m for m in models if m is not None]
        models = [self._to_model(document) for document in self.collection.find().sort("created_at", -1)]
        return [m for m in models if m is not None]

    def get(self, order_id: str) -> OrderModel | None:
        if self.collection is None:
            document = _local_orders.get(order_id)
            return self._to_model(document) if document else None
        document = self.collection.find_one({"id": order_id})
        return self._to_model(document) if document else None

    def save(self, order: OrderModel) -> OrderModel:
        if self.collection is None:
            _local_orders[order.id] = order.model_dump(mode="json")
            return order
        self.collection.replace_one({"id": order.id}, order.model_dump(mode="json"), upsert=True)
        return order

    def count(self) -> int:
        if self.collection is None:
            return len(_local_orders)
        return self.collection.count_documents({})

    @staticmethod
    def _normalize_address(value: dict | str | None) -> dict:
        if isinstance(value, dict):
            return {
                "full_name": value.get("full_name", "Customer"),
                "line1": value.get("line1", value.get("address_line1", "Address line 1")),
                "line2": value.get("line2", value.get("address_line2", "")),
                "city": value.get("city", "Unknown"),
                "state": value.get("state", "Unknown"),
                "postal_code": str(value.get("postal_code", value.get("pincode", "000000"))),
                "country": value.get("country", "India"),
                "phone": str(value.get("phone", value.get("mobile", "0000000000"))),
            }
        text = (value or "").strip() if isinstance(value, str) else ""
        parts = [p.strip() for p in text.split(",")] if text else []
        city = parts[0] if len(parts) > 0 and parts[0] else "Unknown"
        state = parts[1] if len(parts) > 1 and parts[1] else "Unknown"
        return {
            "full_name": "Customer",
            "line1": text or "Address line 1",
            "line2": "",
            "city": city,
            "state": state,
            "postal_code": "000000",
            "country": "India",
            "phone": "0000000000",
        }

    @staticmethod
    def _normalize(document: dict | None) -> dict | None:
        if not document:
            return None
        normalized = dict(document)
        normalized.pop("_id", None)

        order_id = str(normalized.get("id") or f"ord-legacy-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}")
        normalized["id"] = order_id
        normalized["invoice_number"] = normalized.get("invoice_number") or f"INV-{order_id[-8:].upper()}"
        normalized["status"] = normalized.get("status") or "pending"
        normalized["shipping_address"] = OrderRepository._normalize_address(normalized.get("shipping_address"))
        normalized["payment_status"] = normalized.get("payment_status") or "pending"
        normalized["payment_method"] = normalized.get("payment_method") or "unknown"
        normalized["payment_reference"] = normalized.get("payment_reference") or f"PAY-{order_id[-8:].upper()}"
        normalized["status_history"] = normalized.get("status_history") or [
            {
                "status": normalized["status"],
                "message": "Legacy order loaded",
                "timestamp": normalized.get("created_at") or datetime.now(timezone.utc).isoformat(),
            }
        ]
        if "created_at" not in normalized or not normalized.get("created_at"):
            normalized["created_at"] = datetime.now(timezone.utc).isoformat()

        if normalized.get("total_amount") is None:
            total = 0.0
            for item in normalized.get("items", []):
                total += float(item.get("total_price") or (float(item.get("unit_price", 0)) * int(item.get("quantity", 0))))
            normalized["total_amount"] = round(total, 2)
        return normalized

    @staticmethod
    def _to_model(document: dict | None) -> OrderModel | None:
        normalized = OrderRepository._normalize(document)
        if not normalized:
            return None
        try:
            return OrderModel(**normalized)
        except ValidationError:
            return None


order_repository = OrderRepository()
