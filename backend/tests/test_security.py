from app.core.security import create_access_token, decode_token, extract_subject, verify_password, get_password_hash


def test_password_hash_and_verify_work_together():
    password = "SecurePass123"
    hashed = get_password_hash(password)

    assert verify_password(password, hashed) is True
    assert verify_password("wrong-password", hashed) is False


def test_token_lifecycle_extracts_subject():
    token = create_access_token("user-123")
    payload = decode_token(token)

    assert payload["sub"] == "user-123"
    assert extract_subject(token) == "user-123"


def test_extract_subject_returns_none_for_invalid_token():
    assert extract_subject("invalid.token.value") is None
