"""Alembic environment repository."""

import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine import Connection

from app.infrastructure.persistence.database import Base
from app.infrastructure.persistence.models import TaskModel  # noqa: F401 - register models for autogenerate

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_url() -> str:
    """Get database URL from settings/env, fallback to alembic.ini."""
    url = os.getenv("DATABASE_DSN") or config.get_main_option("sqlalchemy.url")
    if not url:
        raise RuntimeError("Missing required database URL (DATABASE_DSN or sqlalchemy.url)")
    # Alembic sync engine cannot use async drivers.
    return url.replace("postgresql+asyncpg://", "postgresql://")


def get_configuration() -> dict[str, str]:
    configuration = config.get_section(config.config_ini_section)
    if configuration is None:
        raise RuntimeError("Alembic config section is missing")
    return configuration


def run_migrations_offline() -> None:
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = get_configuration()
    configuration["sqlalchemy.url"] = get_url()
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        do_run_migrations(connection)
    connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
