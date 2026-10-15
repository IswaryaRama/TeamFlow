import uuid
from datetime import datetime, timezone
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.task import Task
from app.models.comment import TaskComment
from app.models.deadline_history import TaskDeadlineHistory
from app.schemas.task import (
    TaskCreate,
    TaskAdminUpdate,
    TaskMemberStatusUpdate,
    TaskResponse,
    TaskDetailResponse
)
from app.schemas.enums import UserRole, TaskStatus, TaskPriority
from app.schemas.user import UserSummary
from app.api.deps import get_current_user, require_admin

router = APIRouter()


async def enrich_task_response(task: Task, db: AsyncSession) -> TaskResponse:
    """Enrich task ORM model with comment counts and deadline history counts."""
    # Count comments
    comm_stmt = select(func.count(TaskComment.id)).where(TaskComment.task_id == task.id)
    comm_res = await db.execute(comm_stmt)
    comments_count = comm_res.scalar() or 0

    # Count deadline changes
    hist_stmt = select(func.count(TaskDeadlineHistory.id)).where(TaskDeadlineHistory.task_id == task.id)
    hist_res = await db.execute(hist_stmt)
    history_count = hist_res.scalar() or 0

    res = TaskResponse.model_validate(task)
    res.comments_count = comments_count
    res.deadline_history_count = history_count
    if task.assignee:
        res.assignee = UserSummary.model_validate(task.assignee)
    if task.creator:
        res.creator = UserSummary.model_validate(task.creator)
    return res


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Create a new task in a project and assign priority/deadline/assignee (Admin only)."""
    # Verify project exists
    proj_stmt = select(Project).where(Project.id == task_in.project_id)
    proj_res = await db.execute(proj_stmt)
    project = proj_res.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # If assignee specified, verify user exists
    assignee = None
    if task_in.assigned_to_id:
        user_stmt = select(User).where(User.id == task_in.assigned_to_id)
        user_res = await db.execute(user_stmt)
        assignee = user_res.scalar_one_or_none()
        if not assignee:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assigned user not found")

    new_task = Task(
        project_id=task_in.project_id,
        title=task_in.title,
        description=task_in.description,
        assigned_to_id=task_in.assigned_to_id,
        created_by_id=current_user.id,
        priority=task_in.priority,
        status=task_in.status,
        deadline=task_in.deadline,
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)

    # If assignee is set and not already in project_members, auto-add them to project
    if task_in.assigned_to_id:
        pm_stmt = select(ProjectMember).where(
            ProjectMember.project_id == task_in.project_id,
            ProjectMember.user_id == task_in.assigned_to_id
        )
        pm_res = await db.execute(pm_stmt)
        if not pm_res.scalar_one_or_none():
            db.add(ProjectMember(project_id=task_in.project_id, user_id=task_in.assigned_to_id))
            await db.commit()

    # Load relationships for response
    task_stmt = (
        select(Task)
        .options(selectinload(Task.assignee), selectinload(Task.creator))
        .where(Task.id == new_task.id)
    )
    t_res = await db.execute(task_stmt)
    full_task = t_res.scalar_one()

    return await enrich_task_response(full_task, db)


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    project_id: Optional[uuid.UUID] = None,
    assigned_to_id: Optional[uuid.UUID] = None,
    assigned_to_me: Optional[bool] = None,
    status_filter: Optional[TaskStatus] = Query(None, alias="status"),
    priority_filter: Optional[TaskPriority] = Query(None, alias="priority"),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    List tasks with flexible filtering:
    - By Project ID
    - By Assignee ID
    - Filter assigned to currently logged-in user
    - Filter by Status (TODO, IN_PROGRESS, IN_REVIEW, COMPLETED)
    - Filter by Priority (LOW, MEDIUM, HIGH, URGENT)
    - Text search in title and description
    """
    stmt = (
        select(Task)
        .join(Project, Task.project_id == Project.id)
        .options(selectinload(Task.assignee), selectinload(Task.creator), selectinload(Task.project))
        .order_by(Task.created_at.desc())
    )

    if project_id:
        stmt = stmt.where(Task.project_id == project_id)
    
    if assigned_to_me:
        stmt = stmt.where(Task.assigned_to_id == current_user.id)
    elif assigned_to_id:
        stmt = stmt.where(Task.assigned_to_id == assigned_to_id)

    if status_filter:
        stmt = stmt.where(Task.status == status_filter)

    if priority_filter:
        stmt = stmt.where(Task.priority == priority_filter)

    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )

    result = await db.execute(stmt)
    tasks = result.scalars().all()

    response_list = []
    for t in tasks:
        enriched = await enrich_task_response(t, db)
        response_list.append(enriched)

    return response_list


@router.get("/{task_id}", response_model=TaskDetailResponse)
async def get_task_details(
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get single task details with project title and enriched relations."""
    stmt = (
        select(Task)
        .options(
            selectinload(Task.assignee),
            selectinload(Task.creator),
            selectinload(Task.project)
        )
        .where(Task.id == task_id)
    )
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    enriched = await enrich_task_response(task, db)
    detail_res = TaskDetailResponse.model_validate(enriched)
    detail_res.project_title = task.project.title if task.project else None
    return detail_res


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    task_update: TaskAdminUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update a task:
    - Admins can update all properties: title, description, assigned_to_id, priority, status, deadline.
      * If deadline changes, an audit record is automatically logged into TaskDeadlineHistory.
    - Team Members can ONLY update task status for tasks assigned to them or their projects.
    """
    stmt = (
        select(Task)
        .options(selectinload(Task.assignee), selectinload(Task.creator))
        .where(Task.id == task_id)
    )
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    # Role Permission Check
    if current_user.role != UserRole.ADMIN:
        # Team Member is attempting update
        if task.assigned_to_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Read-only access: You can only update the status of tasks assigned to you."
            )

        # Check if they are trying to update restricted fields
        restricted_fields_modified = any([
            task_update.title is not None,
            task_update.description is not None,
            task_update.assigned_to_id is not None,
            task_update.priority is not None,
            task_update.deadline is not None,
        ])
        if restricted_fields_modified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Team Members are only authorized to update task status. Contact an Admin to modify deadlines or assignments."
            )
        
        # Team Member updating status
        if task_update.status is not None:
            task.status = task_update.status
    else:
        # Admin updating task
        if task_update.title is not None:
            task.title = task_update.title
        if task_update.description is not None:
            task.description = task_update.description
        if "assigned_to_id" in task_update.model_fields_set:
            if task_update.assigned_to_id is not None:
                if task_update.assigned_to_id != task.assigned_to_id:
                    user_stmt = select(User).where(User.id == task_update.assigned_to_id)
                    user_res = await db.execute(user_stmt)
                    assignee_user = user_res.scalar_one_or_none()
                    if not assignee_user:
                        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assigned user not found")
                    task.assigned_to_id = task_update.assigned_to_id

                    # Auto add to project members if not already
                    pm_stmt = select(ProjectMember).where(
                        ProjectMember.project_id == task.project_id,
                        ProjectMember.user_id == task_update.assigned_to_id
                    )
                    pm_res = await db.execute(pm_stmt)
                    if not pm_res.scalar_one_or_none():
                        db.add(ProjectMember(project_id=task.project_id, user_id=task_update.assigned_to_id))
            else:
                task.assigned_to_id = None
        if task_update.priority is not None:
            task.priority = task_update.priority
        if task_update.status is not None:
            task.status = task_update.status

        # -------------------------------------------------------------
        # MANDATORY ADDITIONAL CHALLENGE: DEADLINE HISTORY LOGGING
        # -------------------------------------------------------------
        if task_update.deadline is not None:
            old_deadline = task.deadline
            new_deadline = task_update.deadline

            # Check if deadline actually changed
            if old_deadline != new_deadline:
                # Log audit entry
                deadline_audit_entry = TaskDeadlineHistory(
                    task_id=task.id,
                    previous_deadline=old_deadline,
                    new_deadline=new_deadline,
                    changed_by_id=current_user.id,
                    changed_at=datetime.now(timezone.utc),
                    reason=task_update.deadline_change_reason or "Deadline updated by Admin"
                )
                db.add(deadline_audit_entry)
                task.deadline = new_deadline

    await db.commit()
    
    # Reload with updated relations
    reload_stmt = (
        select(Task)
        .options(selectinload(Task.assignee), selectinload(Task.creator))
        .where(Task.id == task_id)
    )
    r_res = await db.execute(reload_stmt)
    updated_task = r_res.scalar_one()

    return await enrich_task_response(updated_task, db)


@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
async def delete_task(
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Delete a task and cascade its comments/deadline history (Admin only)."""
    stmt = (
        select(Task)
        .options(
            selectinload(Task.comments),
            selectinload(Task.deadline_histories)
        )
        .where(Task.id == task_id)
    )
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    for c in task.comments:
        await db.delete(c)
    for dh in task.deadline_histories:
        await db.delete(dh)

    await db.delete(task)
    await db.commit()
    return {"message": "Task and associated records deleted successfully."}
