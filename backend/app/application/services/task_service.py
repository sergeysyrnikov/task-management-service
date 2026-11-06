"""Task application service."""

from uuid import UUID

from app.domain.exceptions import EntityNotFoundError
from app.domain.interfaces.services.task_service import ITaskService
from app.domain.models.task import Task
from app.infrastructure.persistence.sqlalchemy_unit_of_work import SqlAlchemyUnitOfWork


class TaskService(ITaskService):
    """Task CRUD orchestration."""

    def __init__(self, uow: SqlAlchemyUnitOfWork) -> None:
        self._uow = uow

    async def list_tasks(self) -> list[Task]:
        async with self._uow as uow:
            return await uow.tasks.list_all()

    async def create_task(self, title: str) -> Task:
        task = Task(id=None, title=title.strip(), completed=False)
        async with self._uow as uow:
            task_id = await uow.tasks.save(task)
            created = await uow.tasks.get_by_id(task_id)
        if created is None:
            raise EntityNotFoundError("Task not found after create", code="TASK_NOT_FOUND")
        return created

    async def update_task(self, task_id: UUID, *, title: str | None, completed: bool | None) -> Task:
        async with self._uow as uow:
            existing = await uow.tasks.get_by_id(task_id)
            if existing is None:
                raise EntityNotFoundError(f"Task {task_id} not found", code="TASK_NOT_FOUND")
            existing.title = title.strip() if title is not None else existing.title
            existing.completed = completed if completed is not None else existing.completed
            await uow.tasks.save(existing)
            updated = await uow.tasks.get_by_id(task_id)
        if updated is None:
            raise EntityNotFoundError(f"Task {task_id} not found", code="TASK_NOT_FOUND")
        return updated

    async def delete_task(self, task_id: UUID) -> None:
        async with self._uow as uow:
            deleted = await uow.tasks.delete(task_id)
        if not deleted:
            raise EntityNotFoundError(f"Task {task_id} not found", code="TASK_NOT_FOUND")
