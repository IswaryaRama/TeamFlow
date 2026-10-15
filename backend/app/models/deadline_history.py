import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.core.database import Base


class TaskDeadlineHistory(Base):
    __tablename__ = "task_deadline_histories"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4, index=True)
    task_id = Column(Uuid, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_deadline = Column(DateTime(timezone=True), nullable=True)
    new_deadline = Column(DateTime(timezone=True), nullable=False)
    
    changed_by_id = Column(Uuid, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    changed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    reason = Column(String(255), nullable=True)

    # Relationships
    task = relationship("Task", back_populates="deadline_histories")
    changed_by = relationship("User", back_populates="deadline_changes")

    def __repr__(self):
        return f"<TaskDeadlineHistory Task={self.task_id} {self.previous_deadline} -> {self.new_deadline}>"
