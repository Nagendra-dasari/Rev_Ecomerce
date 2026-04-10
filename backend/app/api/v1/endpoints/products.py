from fastapi import APIRouter, Depends, Query

from app.api.deps import require_admin
from app.schemas.product import BulkProductCreate, ProductCreate, ProductDetailResponse, ProductListResponse, ProductResponse
from app.services.product_service import product_service

router = APIRouter()


@router.get("", response_model=ProductListResponse)
async def list_products(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    min_price: float | None = Query(default=None),
    max_price: float | None = Query(default=None),
    sort_by: str = Query(default="featured"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=8, ge=1, le=24),
) -> ProductListResponse:
    return product_service.list_products(
        search=search,
        category=category,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
        page=page,
        page_size=page_size,
    )


@router.get("/low-stock", response_model=list[ProductResponse], dependencies=[Depends(require_admin)])
async def get_low_stock() -> list[ProductResponse]:
    return product_service.list_low_stock()


@router.get("/{product_id}", response_model=ProductDetailResponse)
async def get_product(product_id: str) -> ProductDetailResponse:
    return product_service.get_product(product_id)


@router.post("", response_model=ProductResponse, dependencies=[Depends(require_admin)])
async def create_product(payload: ProductCreate) -> ProductResponse:
    return product_service.create_product(payload)


@router.post("/bulk", response_model=list[ProductResponse], dependencies=[Depends(require_admin)])
async def bulk_create_products(payload: BulkProductCreate) -> list[ProductResponse]:
    return product_service.bulk_create(payload)
