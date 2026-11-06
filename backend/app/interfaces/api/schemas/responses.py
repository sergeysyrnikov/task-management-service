"""Схемы ответов API."""

from typing import Any

from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """Детали ошибки."""

    code: str = Field(..., description="Код ошибки")
    message: str = Field(..., description="Сообщение об ошибке")
    details: dict[str, Any] | None = Field(default=None, description="Дополнительные сведения об ошибке")


class ErrorResponse(BaseModel):
    """Схема ответа с ошибкой."""

    status: str = Field(default="error", description="Статус ответа")
    error: ErrorDetail = Field(..., description="Информация об ошибке")


class SuccessResponse(BaseModel):
    """Схема успешного ответа."""

    status: str = Field(default="success", description="Статус ответа")
    data: dict[str, Any] | None = Field(default=None, description="Данные ответа")
    message: str | None = Field(default=None, description="Сообщение об успешном выполнении")
