import app.db.connection as db_connection

db_connection._mongo_unavailable = True

db_connection._client = None

db_connection.connect_to_mongo = lambda: None

db_connection.get_database = lambda: None

from fastapi.testclient import TestClient
from app.main import app


def test_login_endpoint_with_valid_demo_user():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "admin@nagendra.com", "password": "Admin@123"},
        )
        assert response.status_code == 200
        body = response.json()
        assert "access_token" in body
        assert body["user"]["email"] == "admin@nagendra.com"


def test_password_reset_request_for_unknown_user_returns_404():
    with TestClient(app) as client:
        response = client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "unknown-user@example.com"},
        )
        assert response.status_code == 404
