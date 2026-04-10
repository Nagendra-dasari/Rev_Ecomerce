from uuid import uuid4

from fastapi import HTTPException, status

from app.models.user import AddressModel
from app.repositories.user_repo import user_repository
from app.schemas.user import AddressCreate, AddressResponse, UserProfileUpdate, UserResponse


class UserService:
    def list_users(self) -> list[UserResponse]:
        return [
            UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
                phone=user.phone,
                addresses=user.addresses,
            )
            for user in user_repository.list_users()
        ]

    def get_profile(self, user_id: str) -> UserResponse:
        user = user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            phone=user.phone,
            addresses=user.addresses,
        )

    def update_profile(self, user_id: str, payload: UserProfileUpdate) -> UserResponse:
        user = user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        user.name = payload.name
        user.phone = payload.phone
        user_repository.save(user)
        return self.get_profile(user_id)

    def add_address(self, user_id: str, payload: AddressCreate) -> list[AddressResponse]:
        user = user_repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        if payload.is_default:
            for address in user.addresses:
                address.is_default = False
        address = AddressModel(id=f"addr-{uuid4().hex[:8]}", **payload.model_dump())
        if not user.addresses:
            address.is_default = True
        user.addresses.append(address)
        user_repository.save(user)
        return [AddressResponse(**item.model_dump()) for item in user.addresses]


user_service = UserService()
