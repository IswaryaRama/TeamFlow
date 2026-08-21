import uuid
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.user import User
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.task import Task
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectDetailResponse,
    ProjectMemberResponse,
    ProjectMemberAdd,
    ProjectProgress
)
from app.schemas.enums import UserRole, TaskStatus
from app.schemas.user import UserSummary
from app.api.deps import get_current_user, require_admin

router = APIRouter()


async def calculate_project_progress(project_id: uuid.UUID, db: AsyncSession) -> ProjectProgress:
    """Calculate task completion metrics for a project."""
    stmt = select(Task.status, func.count(Task.id)).where(Task.project_id == project_id).group_by(Task.status)
    result = await db.execute(stmt)
    status_counts = dict(result.all())

    todo = status_counts.get(TaskStatus.TODO, 0)
    in_progress = status_counts.get(TaskStatus.IN_PROGRESS, 0)
    in_review = status_counts.get(TaskStatus.IN_REVIEW, 0)
    completed = status_counts.get(TaskStatus.COMPLETED, 0)
    total = todo + in_progress + in_review + completed

    percentage = round((completed / total * 100), 1) if total > 0 else 0.0

    return ProjectProgress(
        total_tasks=total,
        completed_tasks=completed,
        in_progress_tasks=in_progress,
        todo_tasks=todo,
        in_review_tasks=in_review,
        completion_percentage=percentage,
    )


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Create a new project and optionally assign initial members (Admin only)."""
    new_project = Project(
        title=project_in.title,
        description=project_in.description,
        status=project_in.status,
        created_by_id=current_user.id,
    )
    db.add(new_project)
    await db.flush()

    # Automatically add creator as a member
    creator_member = ProjectMember(project_id=new_project.id, user_id=current_user.id)
    db.add(creator_member)

    # Add other specified members
    if project_in.member_ids:
        for member_id in project_in.member_ids:
            if member_id != current_user.id:
                pm = ProjectMember(project_id=new_project.id, user_id=member_id)
                db.add(pm)

    await db.commit()
    await db.refresh(new_project)

    progress = await calculate_project_progress(new_project.id, db)
    
    response = ProjectResponse.model_validate(new_project)
    response.creator = UserSummary.model_validate(current_user)
    response.progress = progress
    return response


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """List projects. Admins see all projects; Team Members see projects they belong to or are assigned tasks in."""
    if current_user.role == UserRole.ADMIN:
        stmt = (
            select(Project)
            .options(selectinload(Project.creator))
            .order_by(Project.created_at.desc())
        )
    else:
        # Team Members see projects where they are in project_members or have assigned tasks
        member_proj_subquery = select(ProjectMember.project_id).where(ProjectMember.user_id == current_user.id)
        task_proj_subquery = select(Task.project_id).where(Task.assigned_to_id == current_user.id)
        
        stmt = (
            select(Project)
            .options(selectinload(Project.creator))
            .where(
                or_(
                    Project.id.in_(member_proj_subquery),
                    Project.id.in_(task_proj_subquery)
                )
            )
            .order_by(Project.created_at.desc())
        )

    result = await db.execute(stmt)
    projects = result.scalars().all()

    project_responses = []
    for proj in projects:
        progress = await calculate_project_progress(proj.id, db)
        proj_res = ProjectResponse.model_validate(proj)
        proj_res.progress = progress
        if proj.creator:
            proj_res.creator = UserSummary.model_validate(proj.creator)
        project_responses.append(proj_res)

    return project_responses


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project_details(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get project details, member list, and progress statistics."""
    stmt = (
        select(Project)
        .options(
            selectinload(Project.creator),
            selectinload(Project.members).selectinload(ProjectMember.user)
        )
        .where(Project.id == project_id)
    )
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    progress = await calculate_project_progress(project.id, db)
    
    member_responses = []
    for m in project.members:
        if m.user:
            member_responses.append(
                ProjectMemberResponse(
                    id=m.id,
                    project_id=m.project_id,
                    user=UserSummary.model_validate(m.user),
                    joined_at=m.joined_at,
                )
            )

    proj_detail = ProjectDetailResponse.model_validate(project)
    proj_detail.progress = progress
    proj_detail.members = member_responses
    if project.creator:
        proj_detail.creator = UserSummary.model_validate(project.creator)
    
    return proj_detail


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    project_update: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Update project title, description, or status (Admin only)."""
    stmt = select(Project).options(selectinload(Project.creator)).where(Project.id == project_id)
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project_update.title is not None:
        project.title = project_update.title
    if project_update.description is not None:
        project.description = project_update.description
    if project_update.status is not None:
        project.status = project_update.status

    await db.commit()
    await db.refresh(project)

    progress = await calculate_project_progress(project.id, db)
    res = ProjectResponse.model_validate(project)
    res.progress = progress
    if project.creator:
        res.creator = UserSummary.model_validate(project.creator)
    return res


@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
async def delete_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Delete a project and its associated tasks/members (Admin only)."""
    stmt = (
        select(Project)
        .options(
            selectinload(Project.tasks).selectinload(Task.comments),
            selectinload(Project.tasks).selectinload(Task.deadline_histories),
            selectinload(Project.members)
        )
        .where(Project.id == project_id)
    )
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Cleanly remove all child tasks, comments, history, and memberships
    for task in project.tasks:
        for c in task.comments:
            await db.delete(c)
        for dh in task.deadline_histories:
            await db.delete(dh)
        await db.delete(task)

    for m in project.members:
        await db.delete(m)

    await db.delete(project)
    await db.commit()
    return {"message": "Project and all associated tasks deleted successfully."}


@router.post("/{project_id}/members", response_model=ProjectMemberResponse, status_code=status.HTTP_201_CREATED)
async def add_project_member(
    project_id: uuid.UUID,
    member_data: ProjectMemberAdd,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Add a team member to a project (Admin only)."""
    # Check project existence
    proj_stmt = select(Project).where(Project.id == project_id)
    proj_res = await db.execute(proj_stmt)
    if not proj_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Check user existence
    user_stmt = select(User).where(User.id == member_data.user_id)
    user_res = await db.execute(user_stmt)
    target_user = user_res.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Check if already a member
    exist_stmt = select(ProjectMember).where(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == member_data.user_id
    )
    exist_res = await db.execute(exist_stmt)
    if exist_res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already a member of this project")

    new_pm = ProjectMember(project_id=project_id, user_id=member_data.user_id)
    db.add(new_pm)
    await db.commit()
    await db.refresh(new_pm)

    return ProjectMemberResponse(
        id=new_pm.id,
        project_id=new_pm.project_id,
        user=UserSummary.model_validate(target_user),
        joined_at=new_pm.joined_at,
    )


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_200_OK)
async def remove_project_member(
    project_id: uuid.UUID,
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """Remove a team member from a project (Admin only)."""
    stmt = select(ProjectMember).where(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    )
    result = await db.execute(stmt)
    membership = result.scalar_one_or_none()

    if not membership:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Membership not found")

    await db.delete(membership)
    await db.commit()
    return {"message": "Member removed from project successfully."}
