# AGENTS.md

Это файл инструкций для ИИ-агентов (opencode и др.), работающих в репозитории.
**Прочитай его целиком перед любыми изменениями.**

## Что это за проект

**Interview Trainer** — тренажёр для подготовки к JS/TS-собеседованиям.
Пользователь пишет решение в редакторе (Monaco), нажимает «Запустить тесты»,
и backend прогоняет код против тестов задачи (vitest), возвращая отчёт.

- **Стек:** Go 1.26 (chi, pgx, goose) · React 19 + Vite (react-router, Monaco) · PostgreSQL 16
- **Задачи хранятся как файлы** в `backend/tasks/<тема>/<NNN-slug>/` (не в БД)
- **Прогресс пользователей** — в PostgreSQL (`app_state`), API `/api/data`

## Структура

```
backend/
  cmd/server/          точка входа
  cmd/verifytask/      CLI-верификатор задач для CI (GitHub Actions)
  internal/
    config/            конфиг из env (cleanenv)
    domain/            модели Task, RunResult, AppData, User + MergeAppData
    auth/              сессии: middleware (кука sid), bcrypt, токены (SHA-256 в БД)
    scanner/           чтение задач с диска + кэш
    runner/            запуск vitest через node subprocess (worker.mjs в embed)
    storage/postgres/  pgx-пул, goose-миграции, репозитории users/sessions/app_state
    service/           бизнес-логика (task, run, state, auth)
    proposal/          генерация задач из формы: LLM + валидация + PR на GitHub
    hint/              подсказки от ИИ по ходу решения (не решают за пользователя)
    review/            ИИ-ревью кода после решения (вердикт, асимптотика, сравнение с эталоном)
    live/              лайвкодинг: комнаты по websocket, один пишет — все видят
    verify/            проверка задач из PR для CI (структура + прогоны vitest)
    question/          сборник вопросов: сканер questions/ + устное собеседование (план, разбор)
                       + свои вопросы в PostgreSQL (CRUD, переносятся при входе)
                       + proposal: форма → ИИ оформляет вопрос-ответ → draft PR в сборник
    jobs/              универсальные фоновые задачи для всех LLM-операций (llm_jobs в БД):
                       создание — мгновенный jobId, результат — поллингом GET /api/jobs/{id};
                       переживают перезагрузку страницы, не зависят от таймаутов HTTP
    handler/           HTTP-хэндлеры
    server/            chi-роутер, таймауты
  runtime/            node-окружение для тестов (vitest в node_modules)
  tasks/               219 задач — source of truth
  questions/           сборник вопросов (4 направления, 36 глав, 287 вопросов)
frontend/
  src/pages/           страницы (роутер: /tasks, /tasks/*, /interview)
  src/components/      TaskTree, CodeEditor, UserMenu (вход/регистрация), …
  src/hooks|ui|shared|lib
```

## Критически важные правила

**Существующий код — source of truth.**

Перед добавлением или изменением задачи **обязательно** читай
`docs/TASK_AUTHORING.md`. **Никогда не придумывай новый формат задачи** —
находи похожую существующую и копируй её паттерн (6 файлов:
`meta.json`, `condition.md`, `template.ts`, `solution.ts`, `hints.md`, `tests/test.ts`).

## Команды

```bash
# Backend
cd backend
make run            # :8080 (нужен postgres: docker compose up -d postgres)
make test           # go test ./...
go vet ./...

# Frontend (порт 5173 или следующий свободный)
cd frontend
npm run dev         # /api проксируется на :8080
npm run typecheck   # tsc --noEmit — должно быть 0 ошибок
npm run build

# Валидация задач (структура, шаблоны, контракт с тестами, tsc для типовых)
make verify-tasks   # из корня; ожидается «проблем: 0»

# Валидация сборника вопросов
make verify-questions   # из корня; ожидается «All questions valid ✓»

# Проверка задач из PR (то же делает GitHub Actions в .github/workflows/verify-task-pr.yml)
cd backend && go build -o /tmp/verifytask ./cmd/verifytask
/tmp/verifytask -tasks ./tasks -runtime ./runtime -ids "algorithms/010-fibonacci"
# + ИИ-ревью семантики (env LLM_API_KEY/LLM_BASE_URL/LLM_MODEL) или мок: -llm-mock

# Всё вместе
make up             # поднять стек и открыть фронтенд в браузере (docker compose up -d --build + open)
docker compose up -d --build   # то же без открытия браузера: frontend :3000 (nginx), backend :8080
```

### Проверить задачу через API

```bash
curl http://localhost:8080/api/tasks
curl "http://localhost:8080/api/task/algorithms/014-find-sum-pairs"
curl -X POST http://localhost:8080/api/run \
  -H "Content-Type: application/json" \
  -d '{"taskId":"algorithms/014-find-sum-pairs","code":"<код решения>"}'
```

