"""
Application configuration loaded from environment variables / .env file.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── GDELT ────────────────────────────────────────────
    gdelt_api_url: str = "https://api.gdeltproject.org/api/v2/doc/doc"

    # ── News ─────────────────────────────────────────────
    news_api_key: str = ""
    news_api_url: str = "https://newsapi.org/v2/everything"

    # ── Commodities ──────────────────────────────────────
    commodity_api_key: str = ""
    commodity_api_url: str = "https://api.example.com/commodities"

    # ── AI / LLM ─────────────────────────────────────────
    openai_api_key: str = ""

    # ── Server ───────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    model_config = {
        "env_file": ".env", 
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
