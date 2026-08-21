import uuid
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_serializer
from app.schemas.user import UserSummary


# Deadline change entry in response
class DeadlineHistoryResponse(BaseModel):
    id: uuid.UUID
    task_id: uuid.UUID
    previous_deadline: Optional[datetime] = None
    new_deadline: datetime
    changed_by_id: uuid.UUID
    changed_by: Optional[UserSummary] = None
    changed_at: datetime
    reason: Optional[str] = None

    @field_serializer("previous_deadline", "new_deadline", "changed_at", when_used="json")
    def serialize_datetimes(self, dt: Optional[datetime]) -> Optional[str]:
        if dt is None:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

    model_config = ConfigDict(from_attributes=True)
