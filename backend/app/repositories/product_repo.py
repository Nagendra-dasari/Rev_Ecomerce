from app.models.product import ProductModel
from app.db.connection import get_database

_local_products: dict[str, dict] = {}


class ProductRepository:
    @property
    def collection(self):
        db = get_database()
        return db["products"] if db is not None else None

    def list_all(self) -> list[ProductModel]:
        if self.collection is None:
            return [ProductModel(**document) for document in _local_products.values()]
        return [ProductModel(**self._normalize(document)) for document in self.collection.find()]

    def get(self, product_id: str) -> ProductModel | None:
        if self.collection is None:
            document = _local_products.get(product_id)
            return ProductModel(**document) if document else None
        document = self.collection.find_one({"id": product_id})
        return ProductModel(**self._normalize(document)) if document else None

    def save(self, product: ProductModel) -> ProductModel:
        if self.collection is None:
            _local_products[product.id] = product.model_dump(mode="json")
            return product
        self.collection.replace_one({"id": product.id}, product.model_dump(mode="json"), upsert=True)
        return product

    def exists(self) -> bool:
        if self.collection is None:
            return bool(_local_products)
        return self.collection.count_documents({}) > 0

    def count(self) -> int:
        if self.collection is None:
            return len(_local_products)
        return self.collection.count_documents({})

    @staticmethod
    def _normalize(document: dict | None) -> dict | None:
        if not document:
            return None
        document = dict(document)
        document.pop("_id", None)
        product_id = document.get("id", "product")
        document.setdefault("sku", f"SKU-{product_id}")
        document.setdefault("rating", 4.5)
        document.setdefault("tags", [])
        document.setdefault("featured", False)
        document.setdefault("low_stock_threshold", 5)
        document.setdefault("image", "https://images.unsplash.com/photo-1523275335684-37898b6baf30")
        return document


product_repository = ProductRepository()
