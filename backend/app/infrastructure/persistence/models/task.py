"""Task SQLAlchemy model."""

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.domain.models.task import Task
from app.infrastructure.persistence.database import Base
from app.infrastructure.persistence.models.mixins import DomainMappingMixin, PrimaryKeyMixin, TimestampsMixin


class TaskModel(PrimaryKeyMixin, TimestampsMixin, DomainMappingMixin[Task], Base):
    """Persistence model for tasks."""

    __tablename__ = "tasks"
    __domain_cls__ = Task

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
