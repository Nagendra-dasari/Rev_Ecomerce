import app.db.connection as db_connection
import pytest

from app.core.security import verify_password
from app.repositories.user_repo import user_repository
from app.schemas.user import PasswordResetConfirm, PasswordResetRequest, UserCreate, UserLogin
from app.services.auth_service import auth_service
from fastapi import HTTPException


db_connection._mongo_unavailable = True
_db_client = getattr(db_connection, "_client", None)
if _db_client is not None:
    db_connection._client = None

db_connection.connect_to_mongo = lambda: None

db_connection.get_database = lambda: None


def test_register_user_returns_token_and_saves_user():
    payload = UserCreate(
        name="Test User",
        email="test-user@example.com",
        password="Password123",
        phone="1234567890",
    )

    response = auth_service.register(payload)

    assert response.access_token
    assert response.user.email == payload.email
    assert response.user.name == payload.name
    assert response.user.role == "customer"
    saved_user = user_repository.get_by_email(payload.email)
    assert saved_user is not None
    assert saved_user.email == payload.email


def test_register_duplicate_email_raises_http_exception():
    payload = UserCreate(
        name="Duplicate User",
        email="duplicate@example.com",
        password="Password123",
    )

    auth_service.register(payload)

    with pytest.raises(HTTPException) as exc:
        auth_service.register(payload)

    assert exc.value.status_code == 400
    assert "Email already registered" in str(exc.value.detail)


def test_login_with_valid_and_invalid_credentials():
    payload = UserCreate(
        name="Login User",
        email="login-user@example.com",
        password="Password123",
    )
    auth_service.register(payload)

    login_payload = UserLogin(email=payload.email, password=payload.password)
    response = auth_service.login(login_payload)
    assert response.access_token
    assert response.user.email == payload.email

    with pytest.raises(HTTPException) as exc:
        auth_service.login(UserLogin(email=payload.email, password="WrongPassword"))
    assert exc.value.status_code == 401


def test_password_reset_request_and_confirm_flow():
    payload = UserCreate(
        name="Password Reset User",
        email="reset-user@example.com",
        password="Password123",
    )
    auth_service.register(payload)

    request_response = auth_service.request_password_reset(PasswordResetRequest(email=payload.email))
    assert request_response.reset_token.startswith("reset-")
    saved_user = user_repository.get_by_email(payload.email)
    assert saved_user is not None
    assert saved_user.reset_token == request_response.reset_token

    token = request_response.reset_token
    confirm_response = auth_service.reset_password(PasswordResetConfirm(token=token, password="NewPassword123"))

    assert confirm_response.message == "Password updated successfully"
    assert confirm_response.reset_token == ""
    stored_user = user_repository.get_by_email(payload.email)
    assert stored_user is not None
    assert stored_user.reset_token is None
    assert verify_password("NewPassword123", stored_user.hashed_password) is True
