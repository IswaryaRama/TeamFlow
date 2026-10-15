
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy import event
from app.core.config import settings

engine_args = {
    "echo": settings.ENVIRONMENT == "development",
    "future": True,
}

if not settings.DATABASE_URL.startswith("sqlite"):
    engine_args["pool_pre_ping"] = True
    engine_args["connect_args"] = {"ssl": "require"}

async_engine = create_async_engine(
    settings.DATABASE_URL,
    **engine_args,
)

if settings.DATABASE_URL.startswith("sqlite"):

    @event.listens_for(async_engine.sync_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        try:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
        except Exception:
            pass


AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining an asynchronous database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
