from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AddressBase(BaseModel):
    label: str = Field(min_length=2, max_length=50)
    full_name: str = Field(min_length=2, max_length=100)
    line1: str = Field(min_length=3)
    line2: str = ""
    city: str = Field(min_length=2)
    state: str = Field(min_length=2)
    postal_code: str = Field(min_length=4, max_length=12)
    country: str = Field(min_length=2)
    phone: str = Field(min_length=8, max_length=20)
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressResponse(AddressBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)
    phone: str = ""
    role: Literal["customer", "admin"] = "customer"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: EmailStr
    role: str
    phone: str = ""
    addresses: list[AddressResponse] = Field(default_factory=list)


class UserProfileUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=8, max_length=20)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    password: str = Field(min_length=8)


class PasswordResetResponse(BaseModel):
    message: str
    reset_token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
