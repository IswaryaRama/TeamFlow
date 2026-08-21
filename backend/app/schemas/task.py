import uuid
from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, field_serializer
from app.schemas.enums import TaskPriority, TaskStatus
from app.schemas.user import UserSummary


# Shared task properties
class TaskBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.TODO
    deadline: Optional[datetime] = None

    @field_serializer("deadline", when_used="json")
    def serialize_deadline(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()


# Properties to receive on task creation
class TaskCreate(TaskBase):
    project_id: uuid.UUID
    assigned_to_id: Optional[uuid.UUID] = None


# Properties for Admin updating task (can update all fields)
class TaskAdminUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    assigned_to_id: Optional[uuid.UUID] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    deadline: Optional[datetime] = None
    deadline_change_reason: Optional[str] = None


# Properties for Team Member updating task (status update only)
class TaskMemberStatusUpdate(BaseModel):
    status: TaskStatus


# Task Response
class TaskResponse(TaskBase):
    id: uuid.UUID
    project_id: uuid.UUID
    assigned_to_id: Optional[uuid.UUID] = None
    created_by_id: uuid.UUID
    assignee: Optional[UserSummary] = None
    creator: Optional[UserSummary] = None
    created_at: datetime
    updated_at: datetime
    comments_count: int = 0
    deadline_history_count: int = 0

    @field_serializer("created_at", "updated_at", when_used="json")
    def serialize_datetimes(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

    model_config = ConfigDict(from_attributes=True)


# Task Detail Response with project title
class TaskDetailResponse(TaskResponse):
    project_title: Optional[str] = None
