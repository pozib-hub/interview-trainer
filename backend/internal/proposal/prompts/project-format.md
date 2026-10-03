# Спецификация формата задач Interview Trainer

## Где хранятся задачи

Задачи — файлы в `backend/tasks/<тема>/<NNN-slug>/`. Каждая задача = папка с 6 файлами:

```
backend/tasks/<topic>/<NNN-slug>/
├── meta.json        # метаданные
├── condition.md     # условие (markdown)
├── template.ts      # стартовый код пользователя
├── solution.ts      # эталонное решение (скрыто)
├── hints.md         # подсказки (## Подсказка N)
└── tests/
    └── test.ts      # тесты (vitest)
```

- `NNN` — трёхзначный номер (назначает код, не ты).
- Номер в `slug` не нужен.

## meta.json

```json
{
  "title": "Найти пары чисел с заданной суммой",
  "difficulty": "medium",
  "tags": ["algorithms", "array", "hash-map"],
  "language": "typescript",
  "exports": ["findSumPairs"]
}
```

- `title` — русский, человекочитаемый.
- `difficulty` — `"easy"` | `"medium"` | `"hard"`.
- `tags` — массив; первый элемент = имя темы.
- `language` — всегда `"typescript"`.
- `exports` — имена функций, которые экспортирует решение.

## condition.md

Markdown. Генератор добавляет заголовок `# <title>`. Поэтому в твоём `condition`
**не пиши** ведущий `#`. **НЕ пиши примеры и ограничения в `condition`** —
они идут в отдельных массивах `examples` и `constraints`, генератор сам
соберёт всё в один файл.

## template.ts

Стартовый код с заглушкой:

```ts
export function fnName(param: number): number {
  // TODO: реализуйте
  return undefined as any;
}
```

## solution.ts

Эталонное решение. Экспортирует функцию из `exports`. Без `console.log`,
без закомментированного кода.

## tests/test.ts

```ts
import { test, expect } from "vitest";
import { fnName } from "../solution";

test("базовый кейс", () => {
  expect(fnName(2)).toBe(4);
});
```

- Только `test`, НЕ `describe`.
- Импорт решения — из `"../solution"`.
- Базовый кейс + 2–4 крайних случая.

## hints.md

```markdown
## Подсказка 1
Текст подсказки.

## Подсказка 2
Другое направление мысли.
```

Подсказки передаются массивом строк без заголовков `## ` — генератор добавит их сам.
