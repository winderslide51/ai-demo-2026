"""Tests for the centralised French error boundary (ADR 0001, §6)."""

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.errors import register_exception_handlers


def test_unknown_path_returns_404_with_french_detail(client: TestClient) -> None:
    """An unknown path under ``/api`` is normalised to a French 404."""
    response = client.get("/api/does-not-exist")

    assert response.status_code == 404
    assert response.json() == {"detail": "Ressource introuvable."}


def test_wrong_method_returns_405_with_french_detail(client: TestClient) -> None:
    """A method not declared on an existing route is normalised to French."""
    response = client.delete("/api/health")

    assert response.status_code == 405
    assert response.json() == {"detail": "Méthode non autorisée."}


def test_http_exception_with_french_detail_is_preserved_verbatim(client: TestClient) -> None:
    """A raised ``HTTPException`` with an explicit French detail is kept as-is."""
    app = FastAPI()
    register_exception_handlers(app)

    @app.get("/boom")
    def boom() -> None:
        from fastapi import HTTPException

        raise HTTPException(status_code=409, detail="Conflit métier personnalisé.")

    with TestClient(app, raise_server_exceptions=False) as local_client:
        response = local_client.get("/boom")

    assert response.status_code == 409
    assert response.json() == {"detail": "Conflit métier personnalisé."}


def test_validation_error_is_flattened_into_one_french_sentence() -> None:
    """A ``422`` list payload is flattened into one French sentence."""
    app = FastAPI()
    register_exception_handlers(app)

    from pydantic import BaseModel

    class Payload(BaseModel):
        commentaire: str

    @app.post("/validate-me")
    def validate_me(payload: Payload) -> Payload:
        return payload

    with TestClient(app, raise_server_exceptions=False) as local_client:
        response = local_client.post("/validate-me", json={})

    assert response.status_code == 422
    body = response.json()
    assert isinstance(body["detail"], str)
    assert body["detail"] == "Données invalides : commentaire : champ obligatoire"


def test_unhandled_exception_returns_500_with_fixed_french_detail() -> None:
    """An unhandled exception never leaks its content and returns a fixed detail."""
    app = FastAPI()
    register_exception_handlers(app)

    @app.get("/crash")
    def crash() -> None:
        raise RuntimeError("secret internal detail")

    with TestClient(app, raise_server_exceptions=False) as local_client:
        response = local_client.get("/crash")

    assert response.status_code == 500
    assert response.json() == {"detail": "Une erreur interne est survenue."}
    assert "secret internal detail" not in response.text
