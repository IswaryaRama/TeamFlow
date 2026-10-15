import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.schemas.enums import UserRole


# Shared user properties
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = UserRole.TEAM_MEMBER


# Properties to receive on user registration/creation
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


# Properties to receive on user update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)


# Properties returned in API responses
class UserResponse(UserBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Minimal user representation (for nested relations in tasks/comments)
class UserSummary(BaseModel):
    id: uuid.UUID
    username: str
    full_name: str
    role: UserRole

    model_config = ConfigDict(from_attributes=True)


# User stats summary
class UserStats(BaseModel):
    id: uuid.UUID
    username: str
    full_name: str
    role: UserRole
    total_assigned_tasks: int = 0
    completed_tasks: int = 0
    pending_tasks: int = 0
