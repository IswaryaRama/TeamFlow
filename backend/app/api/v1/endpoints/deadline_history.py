import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.task import Task
from app.models.deadline_history import TaskDeadlineHistory
from app.schemas.deadline_history import DeadlineHistoryResponse
from app.schemas.user import UserSummary
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/{task_id}/deadline-history", response_model=List[DeadlineHistoryResponse])
async def get_task_deadline_history(
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve the full audit history of deadline changes for a specific task.
    Returns previous deadline, updated deadline, timestamp, and the admin who performed the change.
    """
    # Verify task exists
    t_stmt = select(Task).where(Task.id == task_id)
    t_res = await db.execute(t_stmt)
    if not t_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    stmt = (
        select(TaskDeadlineHistory)
        .options(selectinload(TaskDeadlineHistory.changed_by))
        .where(TaskDeadlineHistory.task_id == task_id)
        .order_by(TaskDeadlineHistory.changed_at.desc())
    )
    result = await db.execute(stmt)
    history_records = result.scalars().all()

    response_list = []
    for r in history_records:
        r_res = DeadlineHistoryResponse.model_validate(r)
        if r.changed_by:
            r_res.changed_by = UserSummary.model_validate(r.changed_by)
        response_list.append(r_res)

    return response_list
