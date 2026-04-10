from app.models.user import UserModel
from app.db.connection import get_database

_local_users: dict[str, dict] = {}


class UserRepository:
    @property
    def collection(self):
        db = get_database()
        return db["users"] if db is not None else None

    def list_users(self) -> list[UserModel]:
        if self.collection is None:
            return [UserModel(**document) for document in _local_users.values()]
        return [UserModel(**self._normalize(document)) for document in self.collection.find()]

    def get_by_email(self, email: str) -> UserModel | None:
        if self.collection is None:
            document = next((item for item in _local_users.values() if item["email"] == email), None)
            return UserModel(**document) if document else None
        document = self.collection.find_one({"email": email})
        return UserModel(**self._normalize(document)) if document else None

    def get_by_id(self, user_id: str) -> UserModel | None:
        if self.collection is None:
            document = _local_users.get(user_id)
            return UserModel(**document) if document else None
        document = self.collection.find_one({"id": user_id})
        return UserModel(**self._normalize(document)) if document else None

    def save(self, user: UserModel) -> UserModel:
        if self.collection is None:
            _local_users[user.id] = user.model_dump(mode="json")
            return user
        self.collection.replace_one({"id": user.id}, user.model_dump(mode="json"), upsert=True)
        return user

    def exists(self) -> bool:
        if self.collection is None:
            return bool(_local_users)
        return self.collection.count_documents({}) > 0

    def count(self) -> int:
        if self.collection is None:
            return len(_local_users)
        return self.collection.count_documents({})

    @staticmethod
    def _normalize(document: dict | None) -> dict | None:
        if not document:
            return None
        document.pop("_id", None)
        return document


user_repository = UserRepository()
