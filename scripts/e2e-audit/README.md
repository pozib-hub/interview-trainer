# E2E-аудит задач (Playwright)

Полный прогон всех задач через UI как реальный пользователь:
для каждой задачи открывается страница, вставляется эталонное решение
(из `solutions/`), запускаются тесты, затем тем же флоу отправляется
шаблон задачи — ожидается, что решение проходит, а шаблон отклоняется.

## Настройка (закрытая сеть)

```bash
cd scripts/e2e-audit
# .npmrc с корпоративным registry (см. AGENTS.md)
npm install

# браузер через nexus-прокси + корпоративный CA
export PLAYWRIGHT_DOWNLOAD_HOST=https://nexus.vimpelcom.ru/repository/proxy__raw__playwright-azureedge
export NODE_EXTRA_CA_CERTS=<путь к corp-ca.pem>
npx playwright install chromium
```

## Запуск

```bash
# поднятый стек: frontend :3000, backend :8080 (docker compose up -d --build)
npm run plan     # сгенерировать plan.json по backend/tasks + solutions/
npm run audit    # полный прогон, результаты в results/run.jsonl
```

Прогон занимает ~30–40 минут. Каждая запись `results/run.jsonl`:
`{ id, passed (моё решение), summary, templatePassed (шаблон прошёл?), ... }`.

Ожидаемое состояние после аудита-фиксов:
все `passed: true`; `templatePassed: true` допустим только для «устных» задач
(my/001-1, my/002-arr-to-obj, react/001-1, react/002-2, this/007-15, this/012-4,
companies/001-1, companies/009-umschool, this/010-2) — у них тесты-заглушки by design.

## Отдельные проверки

```bash
# запуск одного решения через API
node runapi.js <taskId> <файл с кодом>
```
