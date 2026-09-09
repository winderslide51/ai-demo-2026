"""API contract tests for the frozen ``GET /api/health`` endpoint.

See design note ``docs/architecture/0001-project-scaffold.md`` §5 and
ADR 0001 for the frozen contract this file pins.
"""

from fastapi.testclient import TestClient


def test_get_health_returns_the_frozen_payload(client: TestClient) -> None:
    """The success payload is exactly the three frozen fields, camelCase."""
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/json"
    assert response.json() == {
        "status": "ok",
        "service": "cra-api",
        "apiVersion": "0.1.0",
    }


def test_get_health_does_not_expose_snake_case_api_version(client: TestClient) -> None:
    """``apiVersion`` is the deliberate camelCase probe: no ``api_version`` key."""
    response = client.get("/api/health")

    assert "api_version" not in response.json()


def test_post_health_returns_405_with_french_detail(client: TestClient) -> None:
    """Wrong method on a frozen route is normalised to the French contract."""
    response = client.post("/api/health")

    assert response.status_code == 405
    assert response.json() == {"detail": "Méthode non autorisée."}
