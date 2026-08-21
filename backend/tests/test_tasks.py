import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_task_lifecycle_and_status_update(client: AsyncClient, admin_token: str, member_token: str, member_user):
    # 1. Admin creates project
    proj_res = await client.post(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Task Test Project", "status": "ACTIVE"},
    )
    proj_id = proj_res.json()["id"]

    # 2. Admin creates task assigned to member
    task_res = await client.post(
        "/api/v1/tasks",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "title": "Backend API Development",
            "description": "Develop FastAPI endpoints",
            "project_id": proj_id,
            "assigned_to_id": str(member_user.id),
            "priority": "HIGH",
            "status": "TODO",
        },
    )
    assert task_res.status_code == 201
    task_id = task_res.json()["id"]

    # 3. Team Member updates task status from TODO to IN_PROGRESS
    status_update_res = await client.patch(
        f"/api/v1/tasks/{task_id}",
        headers={"Authorization": f"Bearer {member_token}"},
        json={"status": "IN_PROGRESS"},
    )
    assert status_update_res.status_code == 200
    assert status_update_res.json()["status"] == "IN_PROGRESS"

    # 4. Team Member adds a progress comment
    comm_res = await client.post(
        f"/api/v1/tasks/{task_id}/comments",
        headers={"Authorization": f"Bearer {member_token}"},
        json={"content": "Started working on database models."},
    )
    assert comm_res.status_code == 201
    assert comm_res.json()["content"] == "Started working on database models."
