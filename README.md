# Task Management Service (Next.js + FastAPI + PostgreSQL)

Веб-сервис «Управление задачами» с сохранением данных в PostgreSQL.

## Функционал
- Добавление новой задачи.
- Отметка задачи выполненной / невыполненной.
- Удаление задачи.
- Сохранение задач после обновления страницы (данные хранятся в БД).

## Стек
- **Фронтенд:** Next.js (App Router) + TypeScript, Zustand, компоненты в стиле shadcn/ui, Tailwind CSS, светлая тема.
- **Бэкенд:** FastAPI (расширение существующего слоистого каркаса `backend/`), SQLAlchemy (async) + asyncpg, Alembic, одна таблица `tasks`.
- **База данных:** PostgreSQL 16.
- **Инфраструктура:** Dockerfile’ы, корневой `docker-compose.yml`.

## Структура проекта
```text
task-management-service/
├── backend/                  # FastAPI + Alembic + SQLAlchemy
│   ├── app/
│   │   ├── domain/           # сущность Task, интерфейсы, исключения
│   │   ├── application/      # TaskService
│   │   ├── infrastructure/   # модель/репозиторий/UoW SQLAlchemy
│   │   └── interfaces/api/   # /api/v1/tasks, схемы
│   ├── migrations/           # Alembic (таблица tasks)
│   ├── Dockerfile
│   └── Dockerfile.dev
├── frontend/                 # Next.js App Router
│   ├── src/app/              # layout/page + стили (светлая тема)
│   ├── src/components/ui/    # button/input/checkbox/card
│   ├── src/lib/              # API-клиент, утилиты
│   ├── src/store/            # Zustand-стор задач
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml        # основной запуск всего приложения
├── .env.example
└── README.md
```

## Быстрый запуск (Docker, из корня)
1. Создайте `.env` из примера:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Запустите:
   ```bash
   docker compose up --build
   ```
3. Откройте:
   - Фронтенд: http://localhost:3000
   - Бэкенд API: http://localhost:8000/api/v1
   - Проверка состояния: http://localhost:8000/api/v1/health
   - Задачи: http://localhost:8000/api/v1/tasks

Порядок запуска сервисов: `postgres` → `migrations` (`alembic upgrade head`) → `backend` → `frontend`.

## Локальная разработка (без Docker для приложений)
### Бэкенд
```bash
cd backend
cp .env.example .env   # скорректируйте DATABASE_DSN и TEMPLATE_APP_API_KEY под локальный PostgreSQL
uv sync
uv run alembic upgrade head
uv run uvicorn app.app:app --reload --host 0.0.0.0 --port 8000
```

### Фронтенд
```bash
cd frontend
cp .env.example .env   # NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1, NEXT_PUBLIC_API_KEY должен совпадать с TEMPLATE_APP_API_KEY
npm install
npm run dev
```

## API (минимальный)
- `GET /api/v1/tasks` — список задач.
- `POST /api/v1/tasks` — создать задачу: `{ "title": "..." }`.
- `PATCH /api/v1/tasks/{id}` — обновить задачу: `{ "title"?: string, "completed"?: boolean }`.
- `DELETE /api/v1/tasks/{id}` — удалить задачу (ответ 204).

## Таблица БД
`tasks`: `id` (UUID, PK), `title` (varchar 500), `completed` (boolean, по умолчанию `false`), `created_at`, `updated_at` (временные метки).

## Примечания
- **API-ключ:** если задан `TEMPLATE_APP_API_KEY` (бэкенд), запросы к `/api/v1/tasks` и корневому `/api/v1/` должны содержать заголовок, имя которого задаётся в `TEMPLATE_APP_API_KEY_HEADER` (по умолчанию `X-API-KEY`). `/api/v1/health`, `/docs`, `/metrics` остаются без ключа. Фронтенд отправляет ключ из `NEXT_PUBLIC_API_KEY` в заголовке `NEXT_PUBLIC_API_KEY_HEADER` (в браузере значения видны — для публичного клиента это компромисс; для строгой защиты нужен серверный proxy/BFF).
- CORS по умолчанию разрешает `http://localhost:3000` (см. `.env.example` / `CORS_ALLOW_ORIGINS`).
- `backend/docker-compose.yml` сохранён для отдельной разработки бэкенда; основной сценарий запуска — **корневой** `docker-compose.yml`.
- В `frontend/package.json` скрипты вызывают Next через `node ./node_modules/next/dist/bin/next ...` для совместимости с окружениями, где `.bin` не выставлен; `build` использует `--webpack` для устойчивой локальной сборки на Windows.
