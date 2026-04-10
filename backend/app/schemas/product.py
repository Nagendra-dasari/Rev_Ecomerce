from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    sku: str = Field(min_length=3)
    name: str = Field(min_length=2)
    description: str
    category: str
    price: float = Field(gt=0)
    stock: int = Field(ge=0)
    image: str
    tags: list[str] = Field(default_factory=list)
    featured: bool = False
    low_stock_threshold: int = Field(default=5, ge=1)


class ProductResponse(ProductCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    rating: float


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    categories: list[str]


class BulkProductCreate(BaseModel):
    products: list[ProductCreate]


class ProductReviewSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    average_rating: float
    total_reviews: int


class ProductDetailResponse(ProductResponse):
    review_summary: ProductReviewSummary
    related_products: list[ProductResponse]
