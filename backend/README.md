# Бэкенд (FastAPI)

Сервис задач для приложения «Управление задачами» (Task Management).

## Возможности
- REST API: `/api/v1/tasks` (создание, список, обновление, удаление).
- Одна таблица БД: `tasks`.
- PostgreSQL + SQLAlchemy (async) + Alembic.
- Слоистая структура: `domain` / `application` / `infrastructure` / `interfaces`.

## Запуск (локально)
```bash
cd backend
cp .env.example .env   # при необходимости скорректируйте DATABASE_DSN и TEMPLATE_APP_API_KEY
uv sync
uv run alembic upgrade head
uv run uvicorn app.app:app --reload --host 0.0.0.0 --port 8000
```

## Запуск в составе проекта
Основной способ — корневой `docker-compose.yml` (бэкенд на порту `8000`):
```bash
docker compose up --build
```
Отдельный `backend/docker-compose.yml` сохранён для разработки только бэкенда (сервисы `backend`/`migrations`/`postgres`, порт `8001:8000`).

## API
- `GET /api/v1/health` — проверка состояния (без ключа).
- `GET /api/v1/tasks` — список задач (требует заголовок с API-ключом, если настроен `TEMPLATE_APP_API_KEY`; имя заголовка — `TEMPLATE_APP_API_KEY_HEADER`, по умолчанию `X-API-KEY`).
- `POST /api/v1/tasks` — создать задачу.
- `PATCH /api/v1/tasks/{id}` — обновить задачу (заголовок/статус выполнения).
- `DELETE /api/v1/tasks/{id}` — удалить задачу.
