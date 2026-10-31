COMPOSE := docker compose

.PHONY: up down logs ps rebuild verify-tasks verify-questions

up:
	$(COMPOSE) up -d --build
	@echo "⏳ Жду фронтенд на http://localhost:3000…"
	@i=0; until curl -sf -o /dev/null http://localhost:3000; do \
		i=$$((i+1)); \
		if [ $$i -gt 120 ]; then echo "⚠ Не ответил за 120 сек — открой http://localhost:3000 вручную"; exit 0; fi; \
		sleep 1; \
	done
	@if command -v open >/dev/null 2>&1; then echo "🚀 Открываю браузер…"; open http://localhost:3000; \
	elif command -v xdg-open >/dev/null 2>&1; then echo "🚀 Открываю браузер…"; xdg-open http://localhost:3000; \
	else echo "🚀 Готово: http://localhost:3000"; fi

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

# Валидация сборника вопросов: meta.json у узлов, заголовки глав,
# непустые ответы, kebab-case имён
verify-questions:
	node scripts/validate-questions.mjs
