from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductResponse


class WishlistResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: str
    share_code: str
    items: list[ProductResponse]
