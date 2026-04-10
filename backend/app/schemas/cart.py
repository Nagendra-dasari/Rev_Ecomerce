from pydantic import BaseModel, Field


class CartItemRequest(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)


class CartQuantityUpdate(BaseModel):
    quantity: int = Field(ge=0)
