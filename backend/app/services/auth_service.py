from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException, status

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import UserModel
from app.repositories.user_repo import user_repository
from app.schemas.user import (
    PasswordResetConfirm,
    PasswordResetRequest,
    PasswordResetResponse,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)


class AuthService:
    def register(self, payload: UserCreate) -> TokenResponse:
        existing = user_repository.get_by_email(payload.email)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        user = UserModel(
            id=f"user-{uuid4().hex[:8]}",
            name=payload.name,
            email=payload.email,
            hashed_password=get_password_hash(payload.password),
            role=payload.role,
            phone=payload.phone,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        user_repository.save(user)
        return self._build_auth_response(user)

    def login(self, payload: UserLogin) -> TokenResponse:
        user = user_repository.get_by_email(payload.email)
        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        return self._build_auth_response(user)

    def request_password_reset(self, payload: PasswordResetRequest) -> PasswordResetResponse:
        user = user_repository.get_by_email(payload.email)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        user.reset_token = f"reset-{uuid4().hex[:10]}"
        user_repository.save(user)
        return PasswordResetResponse(message="Password reset token generated", reset_token=user.reset_token)

    def reset_password(self, payload: PasswordResetConfirm) -> PasswordResetResponse:
        user = next((item for item in user_repository.list_users() if item.reset_token == payload.token), None)
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")
        user.hashed_password = get_password_hash(payload.password)
        user.reset_token = None
        user_repository.save(user)
        return PasswordResetResponse(message="Password updated successfully", reset_token="")

    def _build_auth_response(self, user: UserModel) -> TokenResponse:
        token = create_access_token(user.id)
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
                phone=user.phone,
                addresses=user.addresses,
            ),
        )


auth_service = AuthService()
