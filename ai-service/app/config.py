import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Automatically load from ai-service/.env and root .env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")

class Settings(BaseSettings):
    APP_NAME: str = "InterviewPilot AI Service"
    ENV: str = "development"
    PORT: int = 8000
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333

    model_config = SettingsConfigDict(
        env_file=[str(BASE_DIR / ".env"), str(BASE_DIR.parent / ".env")],
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

