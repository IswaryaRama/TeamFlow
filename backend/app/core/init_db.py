import asyncio
import logging
from app.core.database import async_engine, Base
# Import all models to ensure they are registered with Base.metadata
from app.models import User, Project, ProjectMember, Task, TaskComment, TaskDeadlineHistory

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


from sqlalchemy import text

async def init_database():
    """Create all tables in the database if they do not exist and clean orphaned records."""
    logger.info("Initializing database tables...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Clean up any orphaned child records from previously deleted projects
        try:
            await conn.execute(text("DELETE FROM task_comments WHERE task_id NOT IN (SELECT id FROM tasks)"))
            await conn.execute(text("DELETE FROM task_deadline_histories WHERE task_id NOT IN (SELECT id FROM tasks)"))
            await conn.execute(text("DELETE FROM tasks WHERE project_id NOT IN (SELECT id FROM projects)"))
            await conn.execute(text("DELETE FROM project_members WHERE project_id NOT IN (SELECT id FROM projects)"))
        except Exception as e:
            logger.debug(f"Cleanup check note: {e}")
    logger.info("Database tables initialized successfully.")


async def reset_database():
    """Drop and recreate all database tables (for testing/development)."""
    logger.warning("Dropping and recreating all database tables...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database reset complete.")


if __name__ == "__main__":
    asyncio.run(init_database())
