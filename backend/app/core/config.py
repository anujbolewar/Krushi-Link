from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AgroVault Web MVP"
    environment: Literal["local", "dev", "prod"] = "local"

    database_url: str = "sqlite:///./agrovault.db"
    media_root: str = "media"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

