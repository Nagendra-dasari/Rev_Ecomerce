import re


def is_strong_password(password: str) -> bool:
    return bool(re.search(r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$", password))
