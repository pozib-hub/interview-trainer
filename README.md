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
| GET   | /api/questions     | Дерево сборника вопросов (направления → технологии → главы) |
| POST  | /api/task-proposal | Запустить генерацию задачи (LLM) → `{id}`  |
| POST  | /api/task-hint    | Запустить подсказку (LLM) → `{id}`          |
| POST  | /api/task-review  | Запустить ИИ-ревью кода (LLM) → `{id}`      |
| POST  | /api/question-proposal | Запустить оформление вопроса (LLM → PR) → `{id}` |
| POST  | /api/question-interview/plan | Запустить план устного собеседования → `{id}` |
| POST  | /api/question-interview/analyze | Запустить разбор ответов → `{id}` |
| GET   | /api/jobs/{id}    | Статус/результат фоновой задачи (поллинг)   |
| GET   | /api/my-questions | Свои вопросы пользователя (PostgreSQL)      |
| POST  | /api/my-questions | Создать свой вопрос                          |
| PUT   | /api/my-questions/{id} | Изменить свой вопрос                      |
| DELETE| /api/my-questions/{id} | Удалить свой вопрос                      |
| POST  | /api/question-proposal | Форма → ИИ оформляет вопрос-ответ → draft PR |
| GET   | /api/data          | Прогресс текущего пользователя                |
| POST  | /api/data          | Обновить прогресс (merge)                    |
| GET   | /api/auth/me       | Текущий пользователь                         |
| POST  | /api/auth/register | Регистрация (`{login, password}`)           |
| POST  | /api/auth/login    | Вход (`{login, password}`)                   |
| POST  | /api/auth/logout   | Выход                                        |
| GET   | /api/health        | Health check                                 |

## Фоновые задачи (LLM)

Все длительные LLM-операции — генерация задачи, подсказки, ИИ-ревью,
оформление вопроса, план и разбор устного собеседования — выполняются
**фоновыми задачами в PostgreSQL** (`llm_jobs`): POST возвращает `202 + {id}`
мгновенно, результат забирается поллингом `GET /api/jobs/{id}`. Поэтому
любая операция переживает перезагрузку страницы и не зависит от таймаутов
соединения даже если модель отвечает дольше 5 минут. Задачи старше 15 минут
помечаются failed; при рестарте сервера незавершённые задачи закрываются
с понятной причиной.

## Сборник вопросов с собеседований

`/questions` — вопросы по направлениям (frontend, backend, devops, hr) и
технологиям: главы с аккордеоном вопросов, поиск по всему сборнику.
`/questions/my` — свои вопросы, хранятся в PostgreSQL и привязаны к аккаунту
(у гостя — к гостевой сессии; при входе сливаются в аккаунт).
`/questions/interview` — устное собеседование: LLM подбирает вопросы на 30
минут, ответы — голосом (Web Speech API) или текстом, в конце ИИ разбирает
каждый ответ. План и разбор — фоновые задачи (см. раздел выше): перезагрузка
страницы не теряет прогресс генерации.

**«➕ Добавить вопрос»** — форма: вопрос + свой ответ (необязательно) +
направление/технология (необязательно). ИИ сам выбирает главу, оформляет
полноценный ответ и открывает черновик pull request в общий сборник
(нужны `LLM_API_KEY` и `GITHUB_TOKEN`; `PROPOSAL_DRY_RUN=true` — без GitHub).

Формат глав и правила — `docs/QUESTIONS_AUTHORING.md`. Внешние контрибьюторы
могут предлагать вопросы через GitHub Issue (workflow тоже создаёт draft PR).

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
