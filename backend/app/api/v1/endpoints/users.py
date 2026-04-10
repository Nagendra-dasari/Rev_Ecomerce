from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, require_admin
from app.schemas.user import AddressCreate, AddressResponse, UserProfileUpdate, UserResponse
from app.services.user_service import user_service

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return user_service.get_profile(current_user.id)


@router.put("/me", response_model=UserResponse)
async def update_me(payload: UserProfileUpdate, current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return user_service.update_profile(current_user.id, payload)


@router.post("/me/addresses", response_model=list[AddressResponse])
async def add_address(payload: AddressCreate, current_user: UserResponse = Depends(get_current_user)) -> list[AddressResponse]:
    return user_service.add_address(current_user.id, payload)


@router.get("", response_model=list[UserResponse], dependencies=[Depends(require_admin)])
async def list_users() -> list[UserResponse]:
    return user_service.list_users()
