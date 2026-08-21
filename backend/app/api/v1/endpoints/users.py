import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.task import Task
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserSummary, UserStats
from app.schemas.enums import UserRole, TaskStatus
from app.api.deps import get_current_user, require_admin

router = APIRouter()


@router.get("", response_model=List[UserResponse])
async def list_users(
    role: UserRole = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """List users in the system. Filterable by role."""
    stmt = select(User).where(User.is_active == True)
    if role:
        stmt = stmt.where(User.role == role)
    stmt = stmt.order_by(User.full_name.asc())
    result = await db.execute(stmt)
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]


@router.get("/summaries", response_model=List[UserSummary])
async def list_user_summaries(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Lightweight user summaries for dropdowns and assignee selection."""
    stmt = select(User).where(User.is_active == True).order_by(User.full_name.asc())
    result = await db.execute(stmt)
    users = result.scalars().all()
    return [UserSummary.model_validate(u) for u in users]


@router.get("/stats", response_model=List[UserStats])
async def get_team_workload_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Get task workload and completion statistics for all team members (Admin only)."""
    stmt = select(User).where(User.is_active == True).order_by(User.full_name.asc())
    result = await db.execute(stmt)
    users = result.scalars().all()

    stats_list = []
    for u in users:
        # Count total assigned tasks
        total_stmt = select(func.count(Task.id)).where(Task.assigned_to_id == u.id)
        total_res = await db.execute(total_stmt)
        total_tasks = total_res.scalar() or 0

        # Count completed tasks
        comp_stmt = select(func.count(Task.id)).where(
            Task.assigned_to_id == u.id,
            Task.status == TaskStatus.COMPLETED
        )
        comp_res = await db.execute(comp_stmt)
        completed_tasks = comp_res.scalar() or 0

        pending_tasks = total_tasks - completed_tasks

        stats_list.append(UserStats(
            id=u.id,
            username=u.username,
            full_name=u.full_name,
            role=u.role,
            total_assigned_tasks=total_tasks,
            completed_tasks=completed_tasks,
            pending_tasks=pending_tasks,
        ))

    return stats_list


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_by_admin(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Create a new team member or admin account directly (Admin only)."""
    stmt = select(User).where(
        or_(User.email == user_in.email.lower(), User.username == user_in.username.lower())
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists."
        )

    new_user = User(
        email=user_in.email.lower(),
        username=user_in.username.lower(),
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role or UserRole.TEAM_MEMBER,
        is_active=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return UserResponse.model_validate(new_user)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Update user information, role, or active status (Admin only)."""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user_update.email is not None:
        user.email = user_update.email.lower()
    if user_update.username is not None:
        user.username = user_update.username.lower()
    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.role is not None:
        user.role = user_update.role
    if user_update.is_active is not None:
        user.is_active = user_update.is_active
    if user_update.password is not None:
        user.hashed_password = get_password_hash(user_update.password)

    await db.commit()
    await db.refresh(user)
    return UserResponse.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Deactivate or remove a user and clean up associations (Admin only)."""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admins cannot delete their own account."
        )
    stmt = (
        select(User)
        .options(
            selectinload(User.project_memberships),
            selectinload(User.task_comments),
            selectinload(User.deadline_changes)
        )
        .where(User.id == user_id)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Unassign any tasks assigned to this user
    unassign_stmt = select(Task).where(Task.assigned_to_id == user_id)
    assigned_tasks = (await db.execute(unassign_stmt)).scalars().all()
    for t in assigned_tasks:
        t.assigned_to_id = None

    # Delete memberships & comments
    for pm in user.project_memberships:
        await db.delete(pm)
    for c in user.task_comments:
        await db.delete(c)
    for dh in user.deadline_changes:
        await db.delete(dh)

    await db.delete(user)
    await db.commit()
    return {"message": "User deleted successfully."}
