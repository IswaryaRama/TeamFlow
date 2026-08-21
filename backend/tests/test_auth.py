import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@teamflow.com",
            "username": "newuser",
            "full_name": "New User",
            "password": "Password123!",
            "role": "TEAM_MEMBER",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newuser@teamflow.com"
    assert data["user"]["role"] == "TEAM_MEMBER"


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, admin_user):
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email_or_username": "test_admin@teamflow.com",
            "password": "AdminPass123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "test_admin"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, admin_user):
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email_or_username": "test_admin@teamflow.com",
            "password": "WrongPassword!",
        },
    )
    assert response.status_code == 401
