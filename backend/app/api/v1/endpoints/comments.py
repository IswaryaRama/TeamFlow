import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User
from app.models.task import Task
from app.models.comment import TaskComment
from app.schemas.comment import CommentCreate, CommentResponse
from app.schemas.enums import UserRole
from app.schemas.user import UserSummary
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/{task_id}/comments", response_model=List[CommentResponse])
async def list_task_comments(
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Retrieve all comments and progress updates for a task in chronological order."""
    # Verify task existence
    t_stmt = select(Task).where(Task.id == task_id)
    t_res = await db.execute(t_stmt)
    if not t_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    stmt = (
        select(TaskComment)
        .options(selectinload(TaskComment.author))
        .where(TaskComment.task_id == task_id)
        .order_by(TaskComment.created_at.asc())
    )
    result = await db.execute(stmt)
    comments = result.scalars().all()

    response_list = []
    for c in comments:
        c_res = CommentResponse.model_validate(c)
        if c.author:
            c_res.author = UserSummary.model_validate(c.author)
        response_list.append(c_res)

    return response_list


@router.post("/{task_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_task_comment(
    task_id: uuid.UUID,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Add a new comment or progress update to a task."""
    # Verify task existence
    t_stmt = select(Task).where(Task.id == task_id)
    t_res = await db.execute(t_stmt)
    task = t_res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    new_comment = TaskComment(
        task_id=task_id,
        author_id=current_user.id,
        content=comment_in.content.strip(),
    )
    db.add(new_comment)
    await db.commit()
    await db.refresh(new_comment)

    res = CommentResponse.model_validate(new_comment)
    res.author = UserSummary.model_validate(current_user)
    return res


@router.delete("/{task_id}/comments/{comment_id}", status_code=status.HTTP_200_OK)
async def delete_task_comment(
    task_id: uuid.UUID,
    comment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Delete a comment (Admin or comment author only)."""
    stmt = select(TaskComment).where(TaskComment.id == comment_id, TaskComment.task_id == task_id)
    result = await db.execute(stmt)
    comment = result.scalar_one_or_none()

    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")

    # Author or Admin can delete
    if current_user.role != UserRole.ADMIN and comment.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this comment"
        )

    await db.delete(comment)
    await db.commit()
    return {"message": "Comment deleted successfully."}
