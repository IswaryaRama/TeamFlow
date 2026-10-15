import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.enums import ProjectStatus
from app.schemas.user import UserSummary


# Shared project properties
class ProjectBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.ACTIVE


# Properties to receive on project creation
class ProjectCreate(ProjectBase):
    member_ids: Optional[List[uuid.UUID]] = []


# Properties to receive on project update
class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None


# Project Member response
class ProjectMemberResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    user: UserSummary
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Add member to project request
class ProjectMemberAdd(BaseModel):
    user_id: uuid.UUID


# Project statistics summary
class ProjectProgress(BaseModel):
    total_tasks: int = 0
    completed_tasks: int = 0
    in_progress_tasks: int = 0
    todo_tasks: int = 0
    in_review_tasks: int = 0
    completion_percentage: float = 0.0


# Basic Project Response
class ProjectResponse(ProjectBase):
    id: uuid.UUID
    created_by_id: uuid.UUID
    creator: Optional[UserSummary] = None
    created_at: datetime
    updated_at: datetime
    progress: Optional[ProjectProgress] = None

    model_config = ConfigDict(from_attributes=True)


# Detailed Project Response with members
class ProjectDetailResponse(ProjectResponse):
    members: List[ProjectMemberResponse] = []
