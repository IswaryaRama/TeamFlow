import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.user import UserSummary


# Properties to receive on comment creation
class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


# Properties returned in comment responses
class CommentResponse(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    author_id: uuid.UUID
    author: Optional[UserSummary] = None
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
