from datetime import datetime, timezone
from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.task import Task
from app.schemas.enums import UserRole, TaskStatus, TaskPriority
from app.schemas.task import TaskResponse
from app.schemas.project import ProjectResponse
from app.api.v1.endpoints.projects import calculate_project_progress
from app.api.v1.endpoints.tasks import enrich_task_response
from app.api.deps import get_current_user, require_admin

router = APIRouter()


@router.get("/admin")
async def get_admin_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Dict[str, Any]:
    """Retrieve global system-wide metrics, project progress, and team workload."""
    now = datetime.now(timezone.utc)

    # 1. Total counts
    user_count_stmt = select(func.count(User.id)).where(User.is_active == True)
    total_users = (await db.execute(user_count_stmt)).scalar() or 0

    proj_count_stmt = select(func.count(Project.id))
    total_projects = (await db.execute(proj_count_stmt)).scalar() or 0

    task_count_stmt = select(func.count(Task.id))
    total_tasks = (await db.execute(task_count_stmt)).scalar() or 0

    # 2. Status distribution
    status_stmt = select(Task.status, func.count(Task.id)).group_by(Task.status)
    status_res = await db.execute(status_stmt)
    status_counts = dict(status_res.all())

    todo = status_counts.get(TaskStatus.TODO, 0)
    in_progress = status_counts.get(TaskStatus.IN_PROGRESS, 0)
    in_review = status_counts.get(TaskStatus.IN_REVIEW, 0)
    completed = status_counts.get(TaskStatus.COMPLETED, 0)
    completion_rate = round((completed / total_tasks * 100), 1) if total_tasks > 0 else 0.0

    # 3. Overdue tasks count
    overdue_stmt = select(func.count(Task.id)).where(
        Task.deadline < now,
        Task.status != TaskStatus.COMPLETED
    )
    overdue_count = (await db.execute(overdue_stmt)).scalar() or 0

    # 4. Recent projects with progress
    proj_stmt = select(Project).options(selectinload(Project.creator)).order_by(Project.created_at.desc()).limit(5)
    recent_projects_raw = (await db.execute(proj_stmt)).scalars().all()
    
    recent_projects = []
    for p in recent_projects_raw:
        prog = await calculate_project_progress(p.id, db)
        p_res = ProjectResponse.model_validate(p)
        p_res.progress = prog
        recent_projects.append(p_res)

    # 5. Team workload breakdown
    users_stmt = select(User).where(User.is_active == True).order_by(User.full_name.asc())
    users_list = (await db.execute(users_stmt)).scalars().all()
    
    team_workload = []
    for u in users_list:
        assigned_c_stmt = select(func.count(Task.id)).where(Task.assigned_to_id == u.id)
        assigned_c = (await db.execute(assigned_c_stmt)).scalar() or 0

        completed_c_stmt = select(func.count(Task.id)).where(
            Task.assigned_to_id == u.id,
            Task.status == TaskStatus.COMPLETED
        )
        completed_c = (await db.execute(completed_c_stmt)).scalar() or 0

        team_workload.append({
            "id": str(u.id),
            "username": u.username,
            "full_name": u.full_name,
            "role": u.role,
            "total_assigned": assigned_c,
            "completed": completed_c,
            "pending": assigned_c - completed_c,
        })

    return {
        "summary": {
            "total_users": total_users,
            "total_projects": total_projects,
            "total_tasks": total_tasks,
            "completed_tasks": completed,
            "in_progress_tasks": in_progress,
            "todo_tasks": todo,
            "in_review_tasks": in_review,
            "overdue_tasks": overdue_count,
            "completion_rate": completion_rate,
        },
        "recent_projects": recent_projects,
        "team_workload": team_workload,
    }


@router.get("/member")
async def get_member_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Retrieve personal metrics, assigned tasks, and upcoming deadlines for a team member."""
    now = datetime.now(timezone.utc)

    # 1. Total assigned to member (in existing projects)
    assigned_stmt = select(func.count(Task.id)).join(Project, Task.project_id == Project.id).where(Task.assigned_to_id == current_user.id)
    total_assigned = (await db.execute(assigned_stmt)).scalar() or 0

    # 2. Member status distribution
    status_stmt = (
        select(Task.status, func.count(Task.id))
        .join(Project, Task.project_id == Project.id)
        .where(Task.assigned_to_id == current_user.id)
        .group_by(Task.status)
    )
    status_counts = dict((await db.execute(status_stmt)).all())

    todo = status_counts.get(TaskStatus.TODO, 0)
    in_progress = status_counts.get(TaskStatus.IN_PROGRESS, 0)
    in_review = status_counts.get(TaskStatus.IN_REVIEW, 0)
    completed = status_counts.get(TaskStatus.COMPLETED, 0)
    completion_rate = round((completed / total_assigned * 100), 1) if total_assigned > 0 else 0.0

    # 3. Overdue count for member
    overdue_stmt = (
        select(func.count(Task.id))
        .join(Project, Task.project_id == Project.id)
        .where(
            Task.assigned_to_id == current_user.id,
            Task.deadline < now,
            Task.status != TaskStatus.COMPLETED
        )
    )
    overdue_count = (await db.execute(overdue_stmt)).scalar() or 0

    # 4. Assigned tasks list (only existing projects)
    tasks_stmt = (
        select(Task)
        .join(Project, Task.project_id == Project.id)
        .options(selectinload(Task.assignee), selectinload(Task.creator), selectinload(Task.project))
        .where(Task.assigned_to_id == current_user.id)
        .order_by(Task.deadline.asc().nullslast(), Task.created_at.desc())
    )
    tasks_raw = (await db.execute(tasks_stmt)).scalars().all()
    
    my_tasks = []
    for t in tasks_raw:
        enriched = await enrich_task_response(t, db)
        my_tasks.append(enriched)

    # 5. Member's projects
    proj_sub = select(ProjectMember.project_id).where(ProjectMember.user_id == current_user.id)
    proj_stmt = select(Project).options(selectinload(Project.creator)).where(Project.id.in_(proj_sub))
    projects_raw = (await db.execute(proj_stmt)).scalars().all()

    my_projects = []
    for p in projects_raw:
        prog = await calculate_project_progress(p.id, db)
        p_res = ProjectResponse.model_validate(p)
        p_res.progress = prog
        my_projects.append(p_res)

    return {
        "summary": {
            "total_assigned": total_assigned,
            "completed_tasks": completed,
            "in_progress_tasks": in_progress,
            "todo_tasks": todo,
            "in_review_tasks": in_review,
            "overdue_tasks": overdue_count,
            "completion_rate": completion_rate,
        },
        "my_tasks": my_tasks,
        "my_projects": my_projects,
    }
