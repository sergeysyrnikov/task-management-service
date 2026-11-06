# Фронтенд (Next.js)

Интерфейс «Управление задачами» (Task Management).

## Стек
- Next.js (App Router) + TypeScript
- Zustand (состояние и запросы к API)
- Компоненты в стиле shadcn/ui
- Tailwind CSS (светлая тема)

## Настройка
Создайте `.env` из примера:
```bash
cp .env.example .env
```
Переменные:
- `NEXT_PUBLIC_API_URL` — базовый URL API, по умолчанию `http://localhost:8000/api/v1`.
- `NEXT_PUBLIC_API_KEY_HEADER` — имя заголовка с API-ключом (по умолчанию `X-API-KEY`, должно совпадать с `TEMPLATE_APP_API_KEY_HEADER` на бэкенде).
- `NEXT_PUBLIC_API_KEY` — значение API-ключа (должно совпадать с `TEMPLATE_APP_API_KEY`). Значение попадает в клиентский бандл.

## Локальный запуск
```bash
npm install
npm run dev
```
Откройте http://localhost:3000.

## Сборка
```bash
npm run build
npm run start
```

## Примечания
- Скрипты вызывают Next через `node ./node_modules/next/dist/bin/next ...` для совместимости с окружениями, где `.bin` недоступен.
- Сборка использует `--webpack` для устойчивой локальной сборки на Windows (обход проблем с нативным SWC/Turbopack в некоторых окружениях).
- В Docker всё приложение запускается из корневого `docker-compose.yml`.
