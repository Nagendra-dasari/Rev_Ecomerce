from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException, status

from app.models.review import ReviewModel
from app.repositories.product_repo import product_repository
from app.repositories.review_repo import review_repository
from app.repositories.user_repo import user_repository
from app.schemas.review import ReviewCreate, ReviewResponse


class ReviewService:
    def list_reviews(self, product_id: str) -> list[ReviewResponse]:
        reviews = review_repository.list_for_product(product_id)
        reviews.sort(key=lambda item: item.created_at, reverse=True)
        return [ReviewResponse(**review.model_dump(exclude={"helpful_by"})) for review in reviews]

    def add_review(self, user_id: str, payload: ReviewCreate) -> ReviewResponse:
        user = user_repository.get_by_id(user_id)
        product = product_repository.get(payload.product_id)
        if not user or not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User or product not found")
        review = ReviewModel(
            id=f"rev-{uuid4().hex[:8]}",
            user_id=user_id,
            user_name=user.name,
            product_id=payload.product_id,
            rating=payload.rating,
            title=payload.title,
            comment=payload.comment,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        review_repository.save(review)
        self._refresh_product_rating(payload.product_id)
        return ReviewResponse(**review.model_dump(exclude={"helpful_by"}))

    def vote_helpful(self, user_id: str, review_id: str) -> ReviewResponse:
        review = review_repository.get(review_id)
        if not review:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
        if user_id not in review.helpful_by:
            review.helpful_by.append(user_id)
            review.helpful_votes = len(review.helpful_by)
            review_repository.save(review)
        return ReviewResponse(**review.model_dump(exclude={"helpful_by"}))

    def _refresh_product_rating(self, product_id: str) -> None:
        product = product_repository.get(product_id)
        if not product:
            return
        reviews = review_repository.list_for_product(product_id)
        if reviews:
            product.rating = round(sum(item.rating for item in reviews) / len(reviews), 1)
            product_repository.save(product)


review_service = ReviewService()
