from typing import Optional
import uuid
from pydantic import BaseModel, EmailStr
from app.schemas.enums import UserRole
from app.schemas.user import UserResponse


class LoginRequest(BaseModel):
    email_or_username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[UserRole] = None
    exp: Optional[int] = None
