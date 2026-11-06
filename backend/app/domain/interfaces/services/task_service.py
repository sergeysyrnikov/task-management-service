"""Task service interface."""

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.models.task import Task


class ITaskService(ABC):
    """Application-facing task operations."""

    @abstractmethod
    async def list_tasks(self) -> list[Task]: ...

    @abstractmethod
    async def create_task(self, title: str) -> Task: ...

    @abstractmethod
    async def update_task(self, task_id: UUID, *, title: str | None, completed: bool | None) -> Task: ...

    @abstractmethod
    async def delete_task(self, task_id: UUID) -> None: ...
