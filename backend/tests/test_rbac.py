import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_admin_can_create_project(client: AsyncClient, admin_token: str):
    response = await client.post(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "title": "Admin Created Project",
            "description": "Authorized project",
            "status": "ACTIVE",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Admin Created Project"


@pytest.mark.asyncio
async def test_team_member_forbidden_to_create_project(client: AsyncClient, member_token: str):
    response = await client.post(
        "/api/v1/projects",
        headers={"Authorization": f"Bearer {member_token}"},
        json={
            "title": "Unauthorized Project",
            "description": "Should fail",
            "status": "ACTIVE",
        },
    )
    # Must return 403 Forbidden due to RBAC dependency
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_team_member_forbidden_to_view_admin_stats(client: AsyncClient, member_token: str):
    response = await client.get(
        "/api/v1/users/stats",
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert response.status_code == 403
