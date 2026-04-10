from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.schemas.review import ReviewCreate, ReviewResponse
from app.schemas.user import UserResponse
from app.services.review_service import review_service

router = APIRouter()


@router.get("")
async def list_reviews(product_id: str = Query(...)) -> list[ReviewResponse]:
    return review_service.list_reviews(product_id)


@router.post("")
async def create_review(
    payload: ReviewCreate,
    current_user: UserResponse = Depends(get_current_user),
) -> ReviewResponse:
    return review_service.add_review(current_user.id, payload)


@router.post("/{review_id}/helpful", response_model=ReviewResponse)
async def mark_review_helpful(review_id: str, current_user: UserResponse = Depends(get_current_user)) -> ReviewResponse:
    return review_service.vote_helpful(current_user.id, review_id)
