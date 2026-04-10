from pydantic import BaseModel, Field


class ProductModel(BaseModel):
    id: str
    sku: str
    name: str
    description: str
    category: str
    price: float
    stock: int
    image: str
    rating: float = 4.5
    tags: list[str] = Field(default_factory=list)
    featured: bool = False
    low_stock_threshold: int = 5
