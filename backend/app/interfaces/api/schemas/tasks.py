"""Схемы API для задач."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    """Схема создания задачи."""

    title: str = Field(..., min_length=1, max_length=500, description="Заголовок задачи")


class TaskUpdate(BaseModel):
    """Схема частичного обновления задачи."""

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=500,
        description="Новый заголовок задачи",
    )
    completed: bool | None = Field(default=None, description="Статус выполнения задачи")


class TaskResponse(BaseModel):
    """Схема задачи в ответе API."""

    id: UUID = Field(..., description="Идентификатор задачи")
    title: str = Field(..., description="Заголовок задачи")
    completed: bool = Field(..., description="Признак выполнения задачи")
    created_at: datetime | None = Field(default=None, description="Дата и время создания")
    updated_at: datetime | None = Field(default=None, description="Дата и время последнего обновления")

    model_config = {"from_attributes": True}
