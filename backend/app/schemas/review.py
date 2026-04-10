from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(ge=1, le=5)
    title: str = Field(min_length=2, max_length=80)
    comment: str = Field(min_length=4, max_length=600)


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    user_name: str
    product_id: str
    rating: int
    title: str
    comment: str
    helpful_votes: int
    created_at: str
