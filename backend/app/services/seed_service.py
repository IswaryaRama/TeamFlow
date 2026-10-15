import logging
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import get_password_hash
from app.models.user import User
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.task import Task
from app.models.comment import TaskComment
from app.models.deadline_history import TaskDeadlineHistory
from app.schemas.enums import UserRole, ProjectStatus, TaskPriority, TaskStatus

logger = logging.getLogger(__name__)


async def seed_database(db: AsyncSession):
    """Seed initial demo users and a sample project with tasks and deadline history."""
    logger.info("Seeding / verifying demo users...")
    demo_users_specs = [
        ("admin@teamflow.com", "admin", "Alex Administrator", "AdminPass123!", UserRole.ADMIN),
        ("member@teamflow.com", "john_dev", "John Developer", "MemberPass123!", UserRole.TEAM_MEMBER),
        ("sarah@teamflow.com", "sarah_qa", "Sarah Quality", "MemberPass123!", UserRole.TEAM_MEMBER),
        ("michael@teamflow.com", "michael_ds", "Michael Data", "MemberPass123!", UserRole.TEAM_MEMBER),
    ]

    users_by_email = {}
    for email, username, full_name, password, role in demo_users_specs:
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        u = result.scalar_one_or_none()
        if not u:
            u = User(
                email=email,
                username=username,
                full_name=full_name,
                hashed_password=get_password_hash(password),
                role=role,
                is_active=True,
            )
            db.add(u)
            await db.flush()
        else:
            u.hashed_password = get_password_hash(password)
            u.is_active = True
            u.username = username
            u.full_name = full_name
            u.role = role
            await db.flush()
        users_by_email[email] = u

    admin = users_by_email["admin@teamflow.com"]
    member1 = users_by_email["member@teamflow.com"]
    member2 = users_by_email["sarah@teamflow.com"]
    member3 = users_by_email["michael@teamflow.com"]

    # Check if demo project exists
    stmt = select(Project).where(Project.title == "TeamFlow NextGen Platform")
    result = await db.execute(stmt)
    existing_project = result.scalar_one_or_none()

    if existing_project:
        # Ensure members are linked
        for user_obj in [admin, member1, member2, member3]:
            pm_stmt = select(ProjectMember).where(
                ProjectMember.project_id == existing_project.id,
                ProjectMember.user_id == user_obj.id
            )
            pm_res = await db.execute(pm_stmt)
            if not pm_res.scalar_one_or_none():
                db.add(ProjectMember(project_id=existing_project.id, user_id=user_obj.id))
        await db.commit()
        logger.info("Demo users and project memberships verified.")
        return

    logger.info("Seeding demo project and members...")
    project = Project(
        title="TeamFlow NextGen Platform",
        description="Core platform modernization initiative with real-time task tracking and deadline audit logs.",
        status=ProjectStatus.ACTIVE,
        created_by_id=admin.id,
    )
    db.add(project)
    await db.flush()

    # Add project members
    pm1 = ProjectMember(project_id=project.id, user_id=admin.id)
    pm2 = ProjectMember(project_id=project.id, user_id=member1.id)
    pm3 = ProjectMember(project_id=project.id, user_id=member2.id)
    db.add_all([pm1, pm2, pm3])
    await db.flush()

    logger.info("Seeding demo tasks and deadline history...")
    now = datetime.now(timezone.utc)
    initial_deadline_task1 = now + timedelta(days=5)
    updated_deadline_task1 = now + timedelta(days=7)

    task1 = Task(
        project_id=project.id,
        title="Implement PostgreSQL Relational Schema & Indices",
        description="Design and apply tables for users, projects, tasks, comments, and deadline audit history.",
        assigned_to_id=member1.id,
        created_by_id=admin.id,
        priority=TaskPriority.HIGH,
        status=TaskStatus.IN_PROGRESS,
        deadline=updated_deadline_task1,
    )

    task2 = Task(
        project_id=project.id,
        title="Design Responsive Tailwind CSS Dashboard",
        description="Build responsive UI views with status metrics, filterable task lists, and glassmorphism styling.",
        assigned_to_id=member2.id,
        created_by_id=admin.id,
        priority=TaskPriority.MEDIUM,
        status=TaskStatus.TODO,
        deadline=now + timedelta(days=10),
    )

    task3 = Task(
        project_id=project.id,
        title="Security & JWT Authorization Setup",
        description="Enforce Role-Based Access Control protecting Admin endpoints against unauthorized access.",
        assigned_to_id=member1.id,
        created_by_id=admin.id,
        priority=TaskPriority.URGENT,
        status=TaskStatus.COMPLETED,
        deadline=now + timedelta(days=2),
    )

    db.add_all([task1, task2, task3])
    await db.flush()

    # Add comments
    comment1 = TaskComment(
        task_id=task1.id,
        author_id=member1.id,
        content="Completed all table schemas, primary keys, and cascade foreign keys.",
    )
    comment2 = TaskComment(
        task_id=task1.id,
        author_id=admin.id,
        content="Great progress! Extended the deadline by 2 days to account for indexing verification.",
    )
    db.add_all([comment1, comment2])

    # Add deadline history entry for task 1 (Mandatory Additional Challenge demonstration)
    deadline_history = TaskDeadlineHistory(
        task_id=task1.id,
        previous_deadline=initial_deadline_task1,
        new_deadline=updated_deadline_task1,
        changed_by_id=admin.id,
        changed_at=now - timedelta(hours=2),
        reason="Extended deadline for database performance testing",
    )
    db.add(deadline_history)

    await db.commit()
    logger.info("Database seeding completed successfully with demo data!")
