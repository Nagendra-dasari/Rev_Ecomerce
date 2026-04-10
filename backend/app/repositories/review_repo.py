from app.models.review import ReviewModel
from app.db.connection import get_database

_local_reviews: dict[str, dict] = {}


class ReviewRepository:
    @property
    def collection(self):
        db = get_database()
        return db["reviews"] if db is not None else None

    def list_for_product(self, product_id: str) -> list[ReviewModel]:
        if self.collection is None:
            return [ReviewModel(**item) for item in _local_reviews.values() if item["product_id"] == product_id]
        return [ReviewModel(**self._normalize(document)) for document in self.collection.find({"product_id": product_id})]

    def save(self, review: ReviewModel) -> ReviewModel:
        if self.collection is None:
            _local_reviews[review.id] = review.model_dump(mode="json")
            return review
        self.collection.replace_one({"id": review.id}, review.model_dump(mode="json"), upsert=True)
        return review

    def get(self, review_id: str) -> ReviewModel | None:
        if self.collection is None:
            document = _local_reviews.get(review_id)
            return ReviewModel(**document) if document else None
        document = self.collection.find_one({"id": review_id})
        return ReviewModel(**self._normalize(document)) if document else None

    def list_all(self) -> list[ReviewModel]:
        if self.collection is None:
            return [ReviewModel(**document) for document in _local_reviews.values()]
        return [ReviewModel(**self._normalize(document)) for document in self.collection.find()]

    @staticmethod
    def _normalize(document: dict | None) -> dict | None:
        if not document:
            return None
        document.pop("_id", None)
        return document


review_repository = ReviewRepository()
