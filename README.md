# Interview Trainer v2

Тренажёр для подготовки к JS/TS-собеседованиям: пользователь пишет решение
в редакторе (Monaco), запускает тесты (vitest) и получает отчёт.

**Стек:** Go (backend) · React + Vite (frontend) · PostgreSQL · Docker

## Структура

```
├── backend/           # Go API: задачи, запуск тестов, прогресс
│   ├── cmd/server/   # точка входа
│   ├── internal/     # config, domain, scanner, runner, storage, service, handler
│   ├── migrations/   # SQL-миграции (goose)
│   ├── runtime/      # node-окружение для запуска тестов (vitest)
│   └── tasks/        # 219 задач — source of truth (файлы, не БД)
├── frontend/         # React SPA (Vite)
└── docker-compose.yml
```

## Запуск локально с нуля

### 0. Предварительные требования

| Инструмент | Версия | Проверка |
|------------|--------|----------|
| Go         | 1.26+  | `go version` |
| Node.js    | 22+    | `node --version` |
| Docker Desktop | любая | `docker info` |

Установка (обычная сеть): `brew install go` (или установщик с go.dev), Node — с nodejs.org,
Docker Desktop — с docker.com.

Установка Go в закрытой сети Vimpelcom (без доступа к ghcr.io / go.dev):

```bash
mkdir -p ~/sdk
curl -o /tmp/go.tar.gz \
  "https://nexus.vimpelcom.ru/repository/proxy__raw__godev.dl/go1.26.5.darwin-arm64.tar.gz"
tar -C ~/sdk -xzf /tmp/go.tar.gz && mv ~/sdk/go ~/sdk/go1.26.5 && ln -sfn ~/sdk/go1.26.5 ~/sdk/go
echo 'export PATH="$HOME/sdk/go/bin:$PATH"' >> ~/.zshrc   # если ещё не добавлено
```

### 1. Получить проект

```bash
git clone <url-репозитория> interview-trainer-v2
cd interview-trainer-v2
```

(или просто открыть локальную копию папки)

### 2. Конфигурация окружения

Скопировать `.env.example` → `.env` (его читает docker compose):

```bash
cp .env.example .env
```

В закрытой сети Vimpelcom дополнительно раскомментировать/добавать в `.env`:

```dotenv
NPM_REGISTRY=https://nexus.vimpelcom.ru/repository/npm-all/
GOPROXY=https://nexus.vimpelcom.ru/repository/goproxy
GOSUMDB=off
POSTGRES_IMAGE=harbor.vimpelcom.ru/dockerhub/library/postgres:16-alpine
GOLANG_IMAGE=harbor.vimpelcom.ru/dockerhub/library/golang:1.26-alpine
NODE_IMAGE=harbor.vimpelcom.ru/dockerhub/library/node:22-alpine
NGINX_IMAGE=harbor.vimpelcom.ru/dockerhub/nginxinc/nginx-unprivileged:alpine-slim
```

Go (один раз на машине, закрытая сеть):

```bash
go env -w GOPROXY=https://nexus.vimpelcom.ru/repository/goproxy
go env -w GOSUMDB=off
```

npm — в закрытой сети создаём локальные registry-файлы (в git не попадают):

```bash
echo 'registry=https://nexus.vimpelcom.ru/repository/npm-all/' > frontend/.npmrc
echo 'registry=https://nexus.vimpelcom.ru/repository/npm-all/' > backend/runtime/.npmrc
```

Docker-образы в закрытой сети тянутся через Harbor: предварительно
`docker pull harbor.vimpelcom.ru/dockerhub/library/postgres:16-alpine` и т.д.

### 3. Установить зависимости

```bash
# Node-окружение для запуска тестов задач (vitest)
cd backend/runtime && npm install --omit=dev && cd ../..

# Зависимости Go
cd backend && go mod download && cd ..

# Зависимости фронтенда
cd frontend && npm install && cd ..
```

### 4. Поднять PostgreSQL

```bash
docker compose up -d postgres
```

Ждём статуса `healthy`:

```bash
docker compose ps
```

### 5. Запустить backend

```bash
cd backend
make run            # или: go run ./cmd/server
```

Сервер на `:8080`. Миграции применятся автоматически при старте.
Проверка:

```bash
curl http://localhost:8080/api/health
# {"status":"ok"}
```

### 6. Запустить frontend (второй терминал)

```bash
cd frontend
npm run dev
```

Открыть появившийся URL (обычно `http://localhost:5173`; если порт занят —
Vite возьмёт следующий, например 5174). `/api` проксируется на `:8080`.

### 7. Проверка

- Слева — дерево из 219 задач по 26 темам
- Выбрать задачу → пишем код в Monaco → «Запустить тесты»
- Прогресс (решённые, код, тренировки) хранится в localStorage и синхронизируется с Postgres

## Полный стек через Docker (как на VPS)

```bash
docker compose up -d --build
```

- frontend: http://localhost:3000 (nginx, `/api` → backend)
- backend:  http://localhost:8080
- postgres: `localhost:5432` (trainer/trainer/trainer)

Остановить: `docker compose down` (данные Postgres остаются в volume `pgdata`).

## API

| Метод | Путь               | Описание                                     |
|-------|--------------------|----------------------------------------------|
| GET   | /api/tasks         | Список задач + группировка по темам           |
| GET   | /api/task/{id}     | Полное содержимое задачи (`topic/slug`)       |
| POST  | /api/run           | Прогнать код против тестов (`{taskId, code}`) |
| GET   | /api/data          | Прогресс текущего пользователя                |
| POST  | /api/data          | Обновить прогресс (merge)                    |
| GET   | /api/auth/me       | Текущий пользователь                         |
| POST  | /api/auth/register | Регистрация (`{login, password}`)           |
| POST  | /api/auth/login    | Вход (`{login, password}`)                   |
| POST  | /api/auth/logout   | Выход                                        |
| GET   | /api/health        | Health check                                 |

## Авторизация и сессии

- **Гость** работает без регистрации: при первом запросе сервер создаёт
  анонимного пользователя и ставит httpOnly-куку `sid` (сессия в PostgreSQL, 30 дней).
  Прогресс гостя хранится на сервере как у обычного пользователя.
- **Регистрация** превращает текущего гостя в аккаунт (`users.is_anonymous = false`),
  поэтому весь гостевой прогресс автоматически остаётся с пользователем.
- **Вход** с гостевым прогрессом: данные гостя мерджатся в аккаунт
  (решённые — объединение, тренировки — по id, черновики кода — поверх).
- Пароли — bcrypt, токен сессии хранится в БД как SHA-256 хэш.
- `COOKIE_SECURE=true` — для деплоя за HTTPS.

## Формат задачи

`backend/tasks/<тема>/<NNN-slug>/` — 6 файлов: `meta.json`, `condition.md`,
`template.ts`, `solution.ts`, `hints.md`, `tests/test.ts`.

Подробнее: `docs/TASK_AUTHORING.md`.

## Роадмап

- [x] Go backend + React frontend, parity со старым Next.js-приложением
- [ ] Создание задач через LLM из формы в приложении
- [ ] Пошаговые подсказки через LLM (ведут к решению, не решают за вас)
- [ ] Альтернативные способы решения от LLM
