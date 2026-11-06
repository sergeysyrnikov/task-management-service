"""API settings."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class APPSettings(BaseSettings):
    name: str = Field(
        "Task Management Service",
        description="Название приложения",
    )
    version: str = Field(
        "0.1.0",
        description="Версия приложения",
    )
    host: str = Field(
        "0.0.0.0",
        description="Хост для запуска приложения",
    )
    port: int = Field(
        8000,
        description="Порт для запуска приложения",
    )
    debug: bool = Field(
        False,
        description="Включение режима отладки (debug)",
    )
    api_key: str | None = Field(
        default=None,
        description="Если задан, API требует заголовок с ключом (кроме /health, /docs, /metrics)",
    )
    api_key_header: str = Field(
        default="X-API-KEY",
        description="Имя HTTP-заголовка для API-ключа",
    )

    model_config = SettingsConfigDict(
        env_prefix="TEMPLATE_APP_",
    )

    @property
    def connection_url(self) -> str:
        return f"http://{self.host}:{self.port}"
