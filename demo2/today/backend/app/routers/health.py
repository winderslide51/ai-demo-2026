"""Health router: a single, public, database-free liveness probe."""

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.schemas.health import HealthResponse
from app.services import health as health_service

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse, status_code=200)
def read_health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Return the frozen liveness payload. Does not access the database."""
    report = health_service.build_health_report(settings)
    return HealthResponse.model_validate(report)
