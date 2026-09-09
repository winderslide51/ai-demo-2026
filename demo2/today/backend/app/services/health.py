"""Business logic for the liveness probe."""

from dataclasses import dataclass

from app.core.config import Settings
from app.schemas.health import HealthStatus


@dataclass(frozen=True)
class HealthReport:
    """Deterministic liveness report, built with no I/O."""

    status: HealthStatus
    service: str
    api_version: str


def build_health_report(settings: Settings) -> HealthReport:
    """Build the liveness report from application settings only.

    Performs no I/O and takes no database session: ``GET /api/health`` is a
    liveness probe, not a readiness probe (see ADR 0001).
    """
    return HealthReport(
        status=HealthStatus.OK,
        service=settings.app_name,
        api_version=settings.api_version,
    )
