import sys
import asyncio
from app.core.database import AsyncSessionLocal
from app.core.init_db import init_database, reset_database
from app.services.seed_service import seed_database


async def seed():
    await init_database()
    async with AsyncSessionLocal() as session:
        await seed_database(session)


def print_help():
    print("TeamFlow Database & Management CLI")
    print("Usage:")
    print("  python manage.py init-db     Create database tables if not exist")
    print("  python manage.py seed-db     Initialize DB & seed initial demo data")
    print("  python manage.py reset-db    Drop all tables, recreate and reseed")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_help()
        sys.exit(1)

    command = sys.argv[1].lower()
    if command == "init-db":
        asyncio.run(init_database())
    elif command == "seed-db":
        asyncio.run(seed())
    elif command == "reset-db":
        async def reset_and_seed():
            await reset_database()
            async with AsyncSessionLocal() as session:
                await seed_database(session)
        asyncio.run(reset_and_seed())
    else:
        print(f"Unknown command: {command}")
        print_help()
        sys.exit(1)
