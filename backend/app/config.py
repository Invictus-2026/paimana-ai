"""Application Configuration Module."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Share the repository .env with provider adapters as well as typed settings.
load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=False)
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
        """Retrieve database URL from environment or fallback to absolute backend/paimana.db."""
        env_url = os.getenv("DATABASE_URL")
        if env_url:
            return env_url
        from pathlib import Path
        backend_dir = Path(__file__).resolve().parent.parent
        db_path = backend_dir / "paimana.db"
        return f"sqlite:///{db_path}"


settings = Settings()
