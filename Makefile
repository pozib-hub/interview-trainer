COMPOSE := docker compose

.PHONY: up down logs ps rebuild verify-tasks

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f --tail=100

ps:
	$(COMPOSE) ps

rebuild:
	$(COMPOSE) up -d --build --force-recreate

# Валидация всех задач: структура файлов, синтаксис шаблонов,
# контракт «шаблон ↔ тесты», tsc-проверка типовых задач (эталон/шаблон)
verify-tasks:
	cd scripts/e2e-audit && node verify-tasks.js
