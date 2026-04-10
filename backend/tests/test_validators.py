from app.utils.validators import is_strong_password


def test_is_strong_password_accepts_valid_password():
    assert is_strong_password("StrongPass1") is True


def test_is_strong_password_rejects_weak_passwords():
    assert is_strong_password("password") is False
    assert is_strong_password("Pas1") is False
    assert is_strong_password("PASSWORD1") is False
    assert is_strong_password("password1") is False
