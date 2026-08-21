import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SAEnum, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.schemas.enums import TaskPriority, TaskStatus


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    project_id = Column(Uuid, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    assigned_to_id = Column(Uuid, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_by_id = Column(Uuid, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    
    priority = Column(SAEnum(TaskPriority, name="task_priority_enum", native_enum=False), nullable=False, default=TaskPriority.MEDIUM)
    status = Column(SAEnum(TaskStatus, name="task_status_enum", native_enum=False), nullable=False, default=TaskStatus.TODO)
    deadline = Column(DateTime(timezone=True), nullable=True, index=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_to_id])
    creator = relationship("User", back_populates="created_tasks", foreign_keys=[created_by_id])
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan", order_by="TaskComment.created_at.asc()")
    deadline_histories = relationship("TaskDeadlineHistory", back_populates="task", cascade="all, delete-orphan", order_by="TaskDeadlineHistory.changed_at.desc()")

    def __repr__(self):
        return f"<Task {self.title} [{self.status}]>"
