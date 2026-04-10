from pydantic import BaseModel, Field


class CartItemModel(BaseModel):
    product_id: str
    quantity: int


class CartModel(BaseModel):
    user_id: str
    items: list[CartItemModel] = Field(default_factory=list)
