import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.schemas.enums import UserRole


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole, name="user_role_enum", native_enum=False), nullable=False, default=UserRole.TEAM_MEMBER)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    created_projects = relationship("Project", back_populates="creator", foreign_keys="[Project.created_by_id]", cascade="all, delete-orphan")
    project_memberships = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
    assigned_tasks = relationship("Task", back_populates="assignee", foreign_keys="[Task.assigned_to_id]")
    created_tasks = relationship("Task", back_populates="creator", foreign_keys="[Task.created_by_id]")
    task_comments = relationship("TaskComment", back_populates="author", cascade="all, delete-orphan")
    deadline_changes = relationship("TaskDeadlineHistory", back_populates="changed_by")

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"
