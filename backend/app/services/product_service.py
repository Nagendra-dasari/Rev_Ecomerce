from math import ceil
from uuid import uuid4

from fastapi import HTTPException, status

from app.db.init_db import seed_local_data
from app.models.product import ProductModel
from app.repositories.product_repo import product_repository
from app.repositories.review_repo import review_repository
from app.schemas.product import (
    BulkProductCreate,
    ProductCreate,
    ProductDetailResponse,
    ProductListResponse,
    ProductResponse,
    ProductReviewSummary,
)


class ProductService:
    @staticmethod
    def _ensure_catalog_seeded() -> None:
        if product_repository.count() == 0:
            seed_local_data()

    def list_products(
        self,
        search: str | None = None,
        category: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        sort_by: str = "featured",
        page: int = 1,
        page_size: int = 8,
    ) -> ProductListResponse:
        self._ensure_catalog_seeded()
        products = product_repository.list_all()
        if search:
            search_value = search.lower()
            products = [
                item
                for item in products
                if search_value in item.name.lower()
                or search_value in item.description.lower()
                or any(search_value in tag.lower() for tag in item.tags)
            ]
        if category:
            products = [item for item in products if item.category.lower() == category.lower()]
        if min_price is not None:
            products = [item for item in products if item.price >= min_price]
        if max_price is not None:
            products = [item for item in products if item.price <= max_price]

        if sort_by == "price_asc":
            products.sort(key=lambda item: item.price)
        elif sort_by == "price_desc":
            products.sort(key=lambda item: item.price, reverse=True)
        elif sort_by == "rating":
            products.sort(key=lambda item: item.rating, reverse=True)
        else:
            products.sort(key=lambda item: (not item.featured, -item.rating, item.name.lower()))

        total = len(products)
        start = (page - 1) * page_size
        paged_products = products[start : start + page_size]
        return ProductListResponse(
            items=[ProductResponse(**product.model_dump()) for product in paged_products],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=max(1, ceil(total / page_size)),
            categories=sorted({product.category for product in product_repository.list_all()}),
        )

    def create_product(self, payload: ProductCreate) -> ProductResponse:
        product = ProductModel(
            id=f"prod-{uuid4().hex[:8]}",
            rating=4.5,
            **payload.model_dump(),
        )
        product_repository.save(product)
        return ProductResponse(**product.model_dump())

    def bulk_create(self, payload: BulkProductCreate) -> list[ProductResponse]:
        return [self.create_product(product) for product in payload.products]

    def get_product(self, product_id: str) -> ProductDetailResponse:
        self._ensure_catalog_seeded()
        product = product_repository.get(product_id)
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        reviews = review_repository.list_for_product(product_id)
        related_products = [
            ProductResponse(**item.model_dump())
            for item in product_repository.list_all()
            if item.category == product.category and item.id != product.id
        ][:4]
        average = sum(item.rating for item in reviews) / len(reviews) if reviews else product.rating
        return ProductDetailResponse(
            **product.model_dump(),
            review_summary=ProductReviewSummary(average_rating=round(average, 1), total_reviews=len(reviews)),
            related_products=related_products,
        )

    def list_low_stock(self) -> list[ProductResponse]:
        self._ensure_catalog_seeded()
        products = [item for item in product_repository.list_all() if item.stock <= item.low_stock_threshold]
        products.sort(key=lambda item: item.stock)
        return [ProductResponse(**item.model_dump()) for item in products]


product_service = ProductService()
