# Task Management Service (backend) — AGENTS.md

## Overview
FastAPI backend for the `task-management-service` project (To-Do / Task Management). Implements a minimal `tasks` module (1 table, CRUD + toggle) on top of an existing DDD-ish skeleton: async SQLAlchemy + PostgreSQL, Alembic, dependency-injector, pydantic-settings, API key auth, and health/root endpoints.

## Stack
- Python `>=3.14,<3.15`, package `task_management_service` (see `pyproject.toml`), `uv`.
- FastAPI + Uvicorn, Pydantic v2 / pydantic-settings (`TEMPLATE_APP_` prefix).
- PostgreSQL, SQLAlchemy 2 async (`asyncpg`), Alembic (`psycopg2-binary` for the sync Alembic URL).
- DI: `dependency-injector` (`app/core/di/containers.py`).
- Quality: `black`, `ruff`, `isort`, `flake8`, `mypy`, `pytest` + `pytest-asyncio` + `pytest-cov` + `httpx`.

## Structure (layers)
`app/`:
- `app.py` — FastAPI app factory, lifespan (logger + DB init/dispose), middleware, exception handlers, routers mounted under `/api/v1`, plus `/docs` and `/metrics`.
- `core/config/*` — `AppSettings` (`api_key`, `api_key_header`, host/port/debug), DB/CORS/Sentry settings.
- `core/di/containers.py` — wiring for route/service modules; `db_engine/session_factory`, `unit_of_work` (`SqlAlchemyUnitOfWork`), `health_service`, `task_service`.
- `core/exception_handlers.py` — `EntityNotFoundError` → 404, `DomainError` → 400, generic → 500.
- `domain/` — `Task` entity (`id`, `title`, `completed`, `created_at`, `updated_at`), exceptions, repository/service/UoW interfaces.
- `application/services/task_service.py` — task business logic via UoW (`create/list/get/update/delete`).
- `infrastructure/persistence/` — `Base`/DB engine, ORM `TaskModel` (`tasks`: `id` UUID PK, `title` String(500), `completed` bool default false, timestamp mixins), `TaskRepository`, `SqlAlchemyUnitOfWork`.
- `interfaces/api/` — `dependencies.verify_api_key` (checks the header from `TEMPLATE_APP_API_KEY_HEADER`, default `X-API-KEY`, when `TEMPLATE_APP_API_KEY` is set), schemas, routes.

## API (prefix `/api/v1`)
- `GET /` — service info (protected by API key when configured).
- `GET /health` — health check (no API key).
- `/metrics`, `/docs`, `/openapi.json` — no API key.
- `GET /tasks` — list tasks (ordered by `created_at,id` desc — newest first).
- `POST /tasks` — create `{ "title": "..." }` → 201.
- `PATCH /tasks/{task_id}` — partial update `{ "title"?, "completed"? }`.
- `DELETE /tasks/{task_id}` → 204.

`/tasks` routes (and `/`) depend on `verify_api_key`. Missing/invalid key → 401.

## Configuration
Copy `backend/.env.example` → `backend/.env` (for `backend/docker-compose.yml`) or use the repository root `.env` / `docker-compose.yml`. **Do not commit real secrets** in `*.env.example`.

Key variables:
- `DATABASE_DSN` — async URL, e.g. `postgresql+asyncpg://task_user:<password>@<host>:5432/task_db`. In `backend/docker-compose.yml` the DB host is the `postgres` service; in the root compose it is also `postgres`.
- `TEMPLATE_APP_API_KEY` — API key; empty/unset disables verification. `TEMPLATE_APP_API_KEY_HEADER` — header name.
- `CORS_ALLOW_ORIGINS` — JSON list of origins (frontend `http://localhost:3000`).
- `POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB/POSTGRES_PORT` — for compose Postgres.

## Running
From the repository root (canonical stack): see root `README.md` / `docker-compose.yml` (`postgres`, `migrations`, `backend:8000`, `frontend:3000`).

Backend only (dev; `backend/docker-compose.yml` starts `postgres` + `migrations` + `backend`, network `task_management_backend_network`):
```bash
cd backend
cp .env.example .env   # fill in secrets locally
docker compose up -d --build
```
In `backend/docker-compose.yml` the backend is published as `8001:8000`.

Local without Docker (requires PostgreSQL and a valid `DATABASE_DSN` in env): install deps with `uv sync --dev`; run the app as `app.app:app` (Uvicorn) and run migrations with Alembic.

## Migrations (Alembic)
- Config: `alembic.ini`, `migrations/env.py` (reads `DATABASE_DSN`, rewrites `postgresql+asyncpg://` → `postgresql://` for sync Alembic; imports `TaskModel`).
- Current revision: `migrations/versions/2026_11_06_create_tasks.py` (`down_revision=None`) — creates the `tasks` table.

Make targets (run in container unless `CI=1`): `migrations-create MSG="..."`, `migrations-up`, `migrations-down`.

## Quality checks (per `.cursor/plans/format_plan.md`)
Run sequentially; stop on failure:
1. `CI=1 make format`
2. `CI=1 make type-check`
3. `CI=1 make test`

On **Windows**, `make format` may fail in `clean-pycache` (Makefile uses `docker compose`/sh). CI-mode equivalent from `backend/`:
```powershell
$env:CI='1'
uv run black .
uv run ruff check --fix .
uv run isort .
uv run mypy .
uv run pytest tests/ --cov=. --cov-report=xml --cov-report=html --cov-report=term --junit-xml=test-reports/junit.xml
```
Tooling/config: `pyproject.toml` (black line-length 119, isort profile black, ruff/mypy/pytest/coverage), `.flake8`.

## Tests and coverage
Current tests: `tests/unit/test_health_service.py`, `tests/integration/test_{base,health}_api.py`. There are no dedicated `/tasks` tests yet; `task_service`/`task_repository`/task routes have low coverage — add unit/integration tests when changing tasks.

## Conventions
- Keep changes within the layer boundaries (domain → application → infrastructure/interfaces); dependencies point inward.
- Register new ORM models in `migrations/env.py`/imports and add Alembic revisions for schema changes.
- Wire new routes in `interfaces/api/routes/router.py` and DI wiring as needed.
- `EntityNotFoundError` from the domain maps to HTTP 404 via the global handler.
- Do not add secrets to the repository; `*.env.example` files must contain placeholders only.

## Key files
- `app/app.py`, `app/core/config/*`, `app/core/di/containers.py`
- `app/interfaces/api/routes/tasks.py`, `dependencies.py`, `schemas/tasks.py`
- `app/application/services/task_service.py`
- `app/infrastructure/persistence/models/task.py`, `task_repository.py`, `sqlalchemy_unit_of_work.py`
- `migrations/env.py`, `migrations/versions/2026_11_06_create_tasks.py`
- `docker-compose.yml`, `Dockerfile`, `Makefile`, `pyproject.toml`, `.cursor/plans/format_plan.md`
