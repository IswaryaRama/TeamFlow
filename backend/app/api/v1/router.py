from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    projects,
    tasks,
    comments,
    deadline_history,
    dashboard
)

api_router = APIRouter()

# Register all modular sub-routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users & Team"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(comments.router, prefix="/tasks", tags=["Comments & Progress"])
api_router.include_router(deadline_history.router, prefix="/tasks", tags=["Deadline History"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])


@api_router.get("/status", tags=["System"])
async def get_system_status():
    """System health check endpoint"""
    return {
        "status": "online",
        "service": "TeamFlow API",
        "version": "1.0.0",
        "message": "TeamFlow backend service is running smoothly."
    }
