"""Application settings, single-sourced and cached."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the CRA API."""

    model_config = SettingsConfigDict(env_prefix="CRA_")

    app_name: str = "cra-api"
    api_version: str = "0.1.0"
    database_url: str = "sqlite:///./cra.db"


@lru_cache
def get_settings() -> Settings:
    """Return the cached application settings instance."""
    return Settings()
