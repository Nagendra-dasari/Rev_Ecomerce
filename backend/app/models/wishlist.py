from pydantic import BaseModel, Field


class WishlistModel(BaseModel):
    user_id: str
    product_ids: list[str] = Field(default_factory=list)
    share_code: str
