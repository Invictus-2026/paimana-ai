"""Application Configuration Module."""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """System settings loaded from environment variables."""

    PROJECT_NAME: str = "PAIMANA PredictIQ"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    API_V1_STR: str = "/api/v1"
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000

    # Database
    DATABASE_URL: str = "sqlite:///./paimana.db"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def get_database_url(self) -> str:
        """Retrieve database URL from environment or fallback."""
        env_url = os.getenv("DATABASE_URL")
        if env_url:
            return env_url
        return self.DATABASE_URL


settings = Settings()
