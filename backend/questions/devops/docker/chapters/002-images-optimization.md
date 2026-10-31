# Образы и оптимизация

## Как работает кэш слоёв при сборке?

Каждая инструкция Dockerfile создаёт слой. Кэш-hit — если инструкция и её вход идентичны предыдущей сборке (для COPY — по содержимому файлов). Hit использует готовый слой, miss пересобирает слой и все последующие.

```dockerfile
# ✅ зависимости отдельно — меняются редко
COPY package.json package-lock.json ./
RUN npm ci
# код меняется часто — ниже, кэш зависимостей сохраняется
COPY src ./src
```

Типовая ошибка: `COPY . .` первой инструкцией → любое изменение кода инвалидирует слой npm ci. Порядок: от стабильного к изменчивому.

## Что такое multi-stage build и зачем он?

Несколько стадий сборки в одном Dockerfile: тяжёлые инструменты (компиляторы, node_modules dev-зависимости) остаются в builder-стадии, в финальный образ копируются только артефакты.

```dockerfile
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
CMD ["node", "dist/server.js"]
```

Итог: образ без исходников, dev-зависимостей и инструментов сборки — часто в 5-10 раз меньше и с меньшей поверхностью атаки.

## Как уменьшить размер образа?

Базовые образы поменьше (alpine, distroless, scratch), multi-stage, .dockerignore, объединение RUN с очисткой кеша пакетного менеджера.

```dockerfile
# ❌ apt оставляет кеш в слое
RUN apt-get install -y curl

# ✅ кеш не попадает в слой
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
```

.dockerignore обязателен: node_modules, .git, тесты и локальные файлы не должны попадать в контекст сборки — это и размер, и утечки (.env в образе!).

## Чем alpine отличается от distroless и что выбрать?

Alpine — мини-дистрибутив (musl, busybox): 5 МБ, есть пакетный менеджер и shell. Distroless — только рантайм без shell и пакетного менеджера; вариант `:nonroot` — запуск не от root.

```dockerfile
FROM node:22-alpine        # отладка проста, musl — редкие проблемы совместимости
FROM gcr.io/distroless/nodejs22  # минимум: нет shell — exec sh невозможен
```

Компромисс: dev-образы — alpine/debian (shell для отладки), продакшен — distroless или alpine + USER. Меньше компонентов — меньше CVE в сканах.

## Почему контейнер должен запускаться не от root?

По умолчанию процессы в контейнере — root (uid 0). Убежав (уязвимость в приложении), код получает root внутри неймспейсов, а уязвимости ядра могут вывести его и на хост.

```dockerfile
USER node                       # готовый пользователь в node-образах

# или свой:
RUN addgroup -S app && adduser -S app -G app
USER app
```

Дополнительно: read-only файловая система (`--read-only`), запрет привилегий (`--cap-drop=ALL`), rootless-режим демона. Это глубина защиты, а не одно решение.

## Как версионировать образы: теги и best practices?

`latest` — муving target: одинаковый тег в разное время = разный код. Использовать неизменяемые идентификаторы: semver-теги, git SHA, digest.

```bash
docker build -t myapp:1.4.2 -t myapp:1.4 -t myapp:1 .
docker build -t myapp:sha-abc1234 .
docker pull myapp@sha256:9f86d08...   # точный digest — полная воспроизводимость

# ❌ продакшен по latest: "у меня работает" = "у меня образ полугодовой давности"
```

Конвенция: major.minor.patch + плавающие minor-теги для автообновлений CI. В манифестах (k8s) — конкретный тег или digest; `imagePullPolicy` + latest = невоспроизводимые деплои.

## Как сканировать образы на уязвимости?

Сканеры: Trivy, Grype, Snyk, встроенный docker scout. Сканируют слои образа на известные CVE пакетов и базовой ОС.

```bash
trivy image myapp:1.0
# REPORT: CRITICAL 3, HIGH 12 — с пакетами и версиями

# в CI: падение на критических
trivy image --exit-code 1 --severity CRITICAL,HIGH myapp:1.0
```

Сканирование — половина решения: устаревание идёт и после сборки (новые CVE находят в старых пакетах). Практика: регулярный rebuild + скан в CI + минимальный базовый образ = меньше поводов находить.

## Что положить в .dockerignore?

Всё, что не нужно для сборки: VCS, IDE, локальные конфиги, зависимости хоста, артефакты тестов.

```
.git
.github
node_modules
dist
*.log
.env
.env.*
coverage
Dockerfile
docker-compose*.yml
README.md
```

Каждый файл контекста отправляется демону при сборке — большой контекст = медленные сборки. `.env` в контексте — риск случайно скопировать секреты в образ через COPY . .
