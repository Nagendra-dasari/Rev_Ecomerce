from datetime import datetime, timezone

from pydantic import BaseModel, EmailStr, Field


class AddressModel(BaseModel):
    id: str
    label: str
    full_name: str
    line1: str
    line2: str = ""
    city: str
    state: str
    postal_code: str
    country: str
    phone: str
    is_default: bool = False


class UserModel(BaseModel):
    id: str
    name: str
    email: EmailStr
    hashed_password: str
    role: str = "customer"
    phone: str = ""
    addresses: list[AddressModel] = Field(default_factory=list)
    reset_token: str | None = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
