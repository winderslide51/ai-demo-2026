"""Schema for the frozen ``GET /api/health`` contract."""

from enum import StrEnum

from app.schemas.common import CamelModel


class HealthStatus(StrEnum):
    """Closed set of health statuses.

    A single member today; a future ``degraded`` value is additive.
    """

    OK = "ok"


class HealthResponse(CamelModel):
    """Response body of ``GET /api/health``."""

    status: HealthStatus
    service: str
    api_version: str
