# Compose и практика

## Что такое Docker Compose и чем он отличается от «просто docker run»?

Compose — декларативное описание мульти-контейнерного приложения в YAML: сервисы, сети, тома. Одна команда поднимает всё окружение целиком.

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://db:5432/app
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: dev
    volumes: [pgdata:/var/lib/postgresql/data]

volumes:
  pgdata:
```

`docker compose up -d` вместо десяти `docker run` с флагами. Файл версионируется — окружение воспроизводимо у всей команды.

## Как работают переменные окружения в Compose?

Подстановка из `.env` рядом с compose-файлом + `environment`/`env_file` для контейнеров. `${VAR:-default}` — с дефолтом.

```yaml
services:
  app:
    image: myapp:${TAG:-latest}
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production
    env_file:
      - ./secrets.env   # не коммитить!
```

`.env` для локальной разработки в .gitignore; шаблон `.env.example` — в репозитории. `docker compose config` показывает итоговую конфигурацию с подставленными значениями — лучшая отладка «почему переменная не видна».

## Что делает depends_on и почему этого недостаточно?

`depends_on` управляет порядком запуска. С `condition: service_healthy` — ждёт готовности по healthcheck, а не просто старта процесса.

```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 10
```

Без healthcheck «зависимость» бессмысленна: postgres «запустился», но ещё минуту инициализируется — приложение получит connection refused. Приложение всё равно должно уметь делать retry при недоступности зависимостей.

## Как смотреть логи и отлаживать стек Compose?

Логи по сервису, фильтрация, исполнение команд в запущенных контейнерах.

```bash
docker compose logs -f app          # follow одного сервиса
docker compose logs --tail=100      # последние строки всех
docker compose ps                    # статус + health
docker compose exec app sh          # shell внутри
docker compose run --rm app npm test # разовый контейнер из сервиса
docker compose down -v               # убрать всё + тома (внимание к данным!)
```

`run` vs `exec`: run создаёт новый контейнер (для миграций, тестов), exec заходит в работающий. `up --build` пересборка при изменениях кода; `down` без -v сохраняет данные.

## Как настроить healthcheck и зачем он в Compose?

Healthcheck — периодическая команда внутри контейнера, сообщающая о живости сервиса. Compose/shows статус, зависимости могут ждать healthy.

```yaml
services:
  api:
    image: myapp:1.0
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 3s
      retries: 5
      start_period: 20s    # время на прогрев без штрафов
```

Типовая ошибка — healthcheck на «главный» эндпоинт с бизнес-логикой: тяжёлый чек под нагрузкой флопается. `/health` (живость процесса) и `/ready` (готовность принимать трафик) — разделяйте.

## Как описывать ресурсы и рестарты в Compose?

`deploy.resources.limits` — ограничения CPU/памяти, `restart` — политика перезапуска. Полезно для локальных «прод-подобных» конфигураций.

```yaml
services:
  worker:
    image: myworker:1.0
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
```

`restart: unless-stopped` — переживает падение процесса, но уважает ручной stop. `always` поднимет и после явной остановки при рестарте демона. OOM-kill контейнера с memory-лимитом виден в `docker inspect` (OOMKilled: true).

## Чем production-использование Compose отличается от Kubernetes?

Compose — один хост, docker-демон, YAML попроще; Kubernetes — кластер, самовосстановление, rolling updates, масштабирование реплик, service discovery из коробки.

```bash
# Compose: обновление = пересборка + up -d (короткий простой возможен)
docker compose up -d --build app
```

Compose подходит для dev-окружений и одиночных серверов; при потребностях в zero-downtime деплое, автомасштабировании и отказоустойчивости узлов — K8s. Промежуточный вариант — docker swarm (режим кластера в самом Docker, сегодня применяется редко).

## Как организовать dev- и prod-конфигурации Compose?

Базовый файл + override-файлы: `docker-compose.yml` (база) + `docker-compose.override.yml` (dev, подхватывается автоматически) + `-f` композиция для прод-варианта.

```bash
# dev: автоматически объединяет base + override
docker compose up

# prod: явный список файлов
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

В dev-override: bind mount кода, hot-reload команда, открытые порты БД. В prod-файле: конкретные теги образов, restart-политики, лимиты, external-сети. База — только общее (образы, env-структура, healthchecks).
