"""Application factory: lifespan, router and error handler registration."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.db.base import Base
from app.db.session import engine
from app.routers import health


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Create the database schema at startup, proving the SQLite wiring."""
    Base.metadata.create_all(bind=engine)
    yield


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""
    settings = get_settings()
    app = FastAPI(
        title="CRA API",
        version=settings.api_version,
        lifespan=lifespan,
    )
    app.include_router(health.router, prefix="/api")
    register_exception_handlers(app)
    return app


app = create_app()
