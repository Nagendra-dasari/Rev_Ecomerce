from pydantic import BaseModel, Field


class ReviewModel(BaseModel):
    id: str
    user_id: str
    user_name: str
    product_id: str
    rating: int
    title: str
    comment: str
    helpful_votes: int = 0
    helpful_by: list[str] = Field(default_factory=list)
    created_at: str
