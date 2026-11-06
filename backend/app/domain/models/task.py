"""Task domain model."""

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(slots=True)
class Task:
    """Сущность задачи."""

    id: UUID | None
    title: str
    completed: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None
