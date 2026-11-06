"""Task repository interface."""

from abc import abstractmethod
from uuid import UUID

from app.domain.interfaces.repository.repository import IRepository
from app.domain.models.task import Task


class ITaskRepository(IRepository[Task]):
    """Repository contract for tasks."""

    @abstractmethod
    async def list_all(self) -> list[Task]:
        """Return all tasks ordered for display."""
        ...

    @abstractmethod
    async def delete(self, _id: UUID) -> bool:
        """Delete a task by id. Returns True if a row was deleted."""
        ...
