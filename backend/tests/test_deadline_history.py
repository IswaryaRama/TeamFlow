import pytest
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_deadline_change_audit_history(client: AsyncClient, admin_token: str, member_token: str, admin_user):
    # 1. Admin creates project
    proj_res = await client.post(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"title": "Deadline Test Project", "status": "ACTIVE"},
    )
    proj_id = proj_res.json()["id"]

    # 2. Admin creates task with initial deadline
    initial_deadline = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    task_res = await client.post(
        "/api/v1/tasks",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "title": "Audit Trail Feature Task",
            "project_id": proj_id,
            "priority": "HIGH",
            "status": "TODO",
            "deadline": initial_deadline,
        },
    )
    assert task_res.status_code == 201
    task_id = task_res.json()["id"]

    # 3. Team Member attempts to modify deadline -> Must be forbidden (403)
    illegal_deadline = (datetime.now(timezone.utc) + timedelta(days=20)).isoformat()
    illegal_res = await client.patch(
        f"/api/v1/tasks/{task_id}",
        headers={"Authorization": f"Bearer {member_token}"},
        json={"deadline": illegal_deadline},
    )
    assert illegal_res.status_code == 403

    # 4. Admin modifies deadline with a reason
    updated_deadline = (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()
    update_res = await client.patch(
        f"/api/v1/tasks/{task_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "deadline": updated_deadline,
            "deadline_change_reason": "Client requested extra QA cycle",
        },
    )
    assert update_res.status_code == 200

    # 5. Fetch deadline change audit history
    history_res = await client.get(
        f"/api/v1/tasks/{task_id}/deadline-history",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert history_res.status_code == 200
    history_data = history_res.json()

    # Must contain exactly 1 history record
    assert len(history_data) == 1
    record = history_data[0]
    assert record["task_id"] == task_id
    assert record["reason"] == "Client requested extra QA cycle"
    assert record["changed_by"]["id"] == str(admin_user.id)
    assert record["new_deadline"] is not None
    assert record["previous_deadline"] is not None
    assert "changed_at" in record
