from fastapi import APIRouter

from app.schemas.user import (
    PasswordResetConfirm,
    PasswordResetRequest,
    PasswordResetResponse,
    TokenResponse,
    UserCreate,
    UserLogin,
)
from app.services.auth_service import auth_service

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(payload: UserCreate) -> TokenResponse:
    return auth_service.register(payload)


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin) -> TokenResponse:
    return auth_service.login(payload)


@router.post("/password-reset/request", response_model=PasswordResetResponse)
async def request_password_reset(payload: PasswordResetRequest) -> PasswordResetResponse:
    return auth_service.request_password_reset(payload)


@router.post("/password-reset/confirm", response_model=PasswordResetResponse)
async def confirm_password_reset(payload: PasswordResetConfirm) -> PasswordResetResponse:
    return auth_service.reset_password(payload)
