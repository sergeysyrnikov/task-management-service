"""SQLAlchemy task repository."""

from __future__ import annotations

from typing import cast
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.engine import CursorResult

from app.domain.interfaces.repository.task_repository import ITaskRepository
from app.domain.models.task import Task
from app.infrastructure.persistence.base_repository import BaseRepository
from app.infrastructure.persistence.models.task import TaskModel


class TaskRepository(BaseRepository, ITaskRepository):
    """Task persistence operations."""

    async def save(self, item: Task) -> UUID:
        existing = None
        if item.id is not None:
            result = await self.session.execute(select(TaskModel).where(TaskModel.id == item.id))
            existing = result.scalar_one_or_none()
        if existing is not None:
            existing.title = item.title
            existing.completed = item.completed
            model = existing
        else:
            model = TaskModel.from_domain(item)
            self.session.add(model)
        await self.session.flush()
        await self.session.refresh(model)
        return model.id

    async def get_by_id(self, _id: UUID) -> Task | None:
        result = await self.session.execute(select(TaskModel).where(TaskModel.id == _id))
        model = result.scalar_one_or_none()
        return model.to_domain() if model else None

    async def list_all(self) -> list[Task]:
        result = await self.session.execute(
            select(TaskModel).order_by(TaskModel.created_at.desc(), TaskModel.id.desc())
        )
        return [row.to_domain() for row in result.scalars().all()]

    async def delete(self, _id: UUID) -> bool:
        result = cast(CursorResult[object], await self.session.execute(delete(TaskModel).where(TaskModel.id == _id)))
        return (result.rowcount or 0) > 0
