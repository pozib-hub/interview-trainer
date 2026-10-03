# Task Authoring Guide

Подробные правила создания и изменения задач в Interview Trainer.

## Архитектура проекта

```
interview-trainer/
├── tasks/                          # Все задачи
│   ├── <тема>/                     # Тема (категория)
│   │   └── <NNN-slug>/            # Задача
│   │       ├── meta.json          # метаданные (обязательно)
│   │       ├── condition.md       # условие в markdown
│   │       ├── template.ts        # стартовый код для пользователя
│   │       ├── solution.ts        # эталонное решение
│   │       ├── hints.md           # подсказки по уровням
│   │       └── tests/
│   │           └── test.ts        # тесты на vitest
│   └── ...
├── src/
│   ├── lib/
│   │   ├── scanner.ts             # сканирует tasks/, строит список задач
│   │   ├── runner.ts              # запускает тесты через vitest
│   │   ├── vitest-worker.mts      # worker-скрипт для vitest
│   │   ├── types.ts               # TypeScript-типы
│   │   └── fileStorage.ts         # хранение данных (data.json)
│   ├── app/
│   │   ├── api/                   # API-маршруты
│   │   │   ├── tasks/route.ts     # GET /api/tasks — список задач
│   │   │   ├── task/[id]/route.ts # GET /api/task/:id — данные задачи
│   │   │   ├── run/route.ts       # POST /api/run — запуск тестов
│   │   │   └── data/route.ts      # GET/POST /api/data — прогресс
│   │   └── tasks/[id]/page.tsx    # страница задачи (UI)
│   └── components/                # UI-компоненты
└── scripts/
    └── test-all.mjs               # прогон всех задач
```

## Как работает система

1. **Scanner** (`src/lib/scanner.ts`) рекурсивно обходит `tasks/`, находит папки с `meta.json`, читает файлы. Кэширует результаты.
2. **API** (`/api/task/:id`) возвращает `TaskFull` (condition, template, hints, solution, testFile).
3. **Runner** (`src/lib/runner.ts`) создаёт временную директорию, пишет код пользователя как `solution.ts`, копирует `tests/test.ts`, запускает vitest через worker.
4. **Vitest worker** (`src/lib/vitest-worker.mts`) запускает vitest с JSON-репортёром.
5. **UI** показывает условие, редактор кода, результаты тестов, подсказки, эталонное решение.

## Идентификатор задачи

ID задачи — это относительный путь от `tasks/`: `<тема>/<NNN-slug>`.

Пример: `algorithms/014-find-sum-pairs`, `event-loop/001-1`, `proto/002-next-day`.

**Правила:**
- `NNN` — трёхзначный номер (001, 002, ...), следующий свободный в теме
- `slug` — краткое английское описание, kebab-case
- Тема — английский, kebab-case (см. список тем ниже)

## Существующие темы

| Тема | Описание | Примеры |
|---|---|---|
| `algorithms` | Алгоритмы общего назначения | find-sum-pairs, fibonacci |
| `algorithms-graph` | Графы | reconstruct-trip |
| `algorithms-is` | Проверки (is-anagram и т.д.) | is-anagram, is-palindrome |
| `algorithms-sort` | Сортировки | sort-ascending-order |
| `algorithms-string` | Строковые алгоритмы | find-anagrams, fuzzy-search |
| `algorithms-tree` | Деревья | folders, invert-tree |
| `array` | Методы массивов (prototype) | filter, flat, map, reduce |
| `carry` | Каррирование | sum, partial-with-placeholders |
| `companies` | Задачи от компаний | skb-contur, avito |
| `compare` | Сравнение значений | 1-7 |
| `event-loop` | Event loop, async | 1-18 |
| `lodash` | Утилитарные функции | clone-deep, debounce, throttle |
| `my` | Разные задачи | arr-to-obj, event-loop |
| `obj` | Объекты, Proxy | proxy, infinite-method-object |
| `other` | Прочее (EventEmitter и т.д.) | event-emitter, call-limit |
| `promises` | Promises, async/await | delay, promise-all, retry-fetch |
| `proto` | Прототипы | next-day, upper-bound, replicate-string |
| `react` | React-компоненты | use-callback, use-memo |
| `scope` | Области видимости | 1 |
| `sorts` | Алгоритмы сортировки | bubble-sort, quick-sort |
| `this` | Контекст this | my-bind, 1-18 |
| `transformation` | Преобразование типов | 1-2 |
| `ts` | TypeScript-типы | deep-readonly, mapped-type |
| `var` | var vs let | 1-8 |

## Файлы задачи

Каждая задача — папка с **ровно 6 файлами**. Имена фиксированы, хардкод в раннере.

### `meta.json` (обязательно)

```json
{
  "title": "Найти пары чисел с заданной суммой",
  "difficulty": "medium",
  "tags": ["algorithms", "array", "hash-map"],
  "language": "typescript",
  "exports": ["findSumPairs"]
}
```

- **`title`** — на русском, человекочитаемое. Максимум ~80 символов.
- **`difficulty`** — `"easy"` | `"medium"` | `"hard"`
- **`tags`** — массив строк, английский, kebab-case. Всегда включай имя темы.
- **`language`** — `"typescript"` или `"javascript"`
- **`exports`** — массив имён функций/типов, которые пользователь должен экспортировать.
  - Для function export задач: `["findSumPairs"]`
  - Для getResult задач: `["getResult"]`
  - Для prototype задач: `[]` (импорт для побочного эффекта)
  - Для TS type задач: `[]` (проверка через import type)

### `condition.md`

Markdown с условием. Включай:
- Название задачи (заголовок `#`)
- Что дано, что нужно вернуть
- Примеры в блоке ` ```ts `
- Ограничения (сложность, крайние случаи)
- Для output-задач: оригинальный код с `console.log` и инструкцию реализовать `getResult()`

### `template.ts`

Стартовый код, который видит пользователь в редакторе.
- Содержит сигнатуру функции/типа с `// TODO` комментарием
- **Должен компилироваться** (возвращать заглушку)
- Для prototype задач: `declare global` + `export {}`

### `solution.ts`

Эталонное решение. Должно проходить все тесты.
- **Не должно содержать** `console.log`, закомментированный код, отладочные сообщения
- **Имя файла всегда `solution.ts`** — хардкод в раннере

### `hints.md`

Подсказки. Каждая начинается с `## Подсказка N`.

```markdown
## Подсказка 1
Текст первой подсказки.

## Подсказка 2
Текст второй.

## Подсказка 3
Текст третьей.
```

### `tests/test.ts`

Тесты на vitest. **Импортируют решение из `../solution`**.
- **Имя файла всегда `test.ts`** — хардкод в раннере
- Покрывай базовый кейс, крайние случаи, неочевидные сценарии
- Используй `import { test, expect } from "vitest"` (не `describe`)

## Паттерны задач

### ПАТТЕРН 1: Function Export (алгоритмическая задача)

Самый распространённый тип. Пользователь реализует и экспортирует функцию.

**Reference:** `algorithms/014-find-sum-pairs`, `sorts/001-bubble-sort`, `promises/003-delay`, `lodash/003-debounce`, `carry/001-sum`

**`meta.json`:**
```json
{
  "title": "Найти пары чисел с заданной суммой",
  "difficulty": "medium",
  "tags": ["algorithms", "array"],
  "language": "typescript",
  "exports": ["findSumPairs"]
}
```

**`template.ts`:**
```ts
export function findSumPairs(array: number[], targetSum: number) {
  // TODO: реализуйте
  return;
}
```

**`solution.ts`:**
```ts
export function findSumPairs(array: number[], targetSum: number) {
  // ...реализация...
}
```

**`tests/test.ts`:**
```ts
import { test, expect } from "vitest";
import { findSumPairs } from "../solution";

test("базовый случай", () => {
  expect(findSumPairs([6, 4, 7, 0, 1, 2, 8, 5], 7)).toEqual([6, 1]);
});

test("пустой массив", () => {
  expect(findSumPairs([], 5)).toEqual([]);
});
```

**`condition.md`:**
```markdown
# Найти пары чисел с заданной суммой

Дан массив чисел и целевая сумма. Найдите пару чисел, сумма которых равна целевой.

```ts
findSumPairs([1, 2, 6, 4, 8, 5], 7) // [1, 6]
```
```

**`hints.md`:**
```markdown
## Подсказка 1
Разбейте задачу на шаги: обработка входных данных, основной алгоритм, возврат результата.

## Подсказка 2
Подумайте о крайних случаях: пустой массив, один элемент, отрицательные числа, дубликаты.
```

---

### ПАТТЕРН 2: Output Prediction (задача на вывод)

Пользователь анализирует код с `console.log` и реализует `getResult()`, возвращающую ожидаемый результат.

**Reference:** `event-loop/001-1`, `this/001-1`, `scope/001-1`, `var/001-1`, `compare/001-1`, `transformation/001-1`

**`meta.json`:**
```json
{
  "title": "Event Loop: базовый порядок",
  "difficulty": "medium",
  "tags": ["event-loop", "async"],
  "language": "typescript",
  "exports": ["getResult"]
}
```

**`template.ts`:**
```ts
export function getResult(): string[] {
  // TODO: реализуйте
  return undefined as any;
}
```

**`solution.ts`:**
```ts
export function getResult(): string[] {
  return ["final", "Promise 1", "Promise 2", "setTimeout 1", "setTimeout 3", "setTimeout 2"];
}
```

**`tests/test.ts`:**
```ts
import { test, expect } from "vitest";
import { getResult } from "../solution";

test("порядок вывода event-loop 1", () => {
  expect(getResult()).toEqual([
    "final", "Promise 1", "Promise 2", "setTimeout 1", "setTimeout 3", "setTimeout 2",
  ]);
});
```

**`condition.md`:**
```markdown
# Event Loop: базовый порядок

Определите порядок вывода в консоль:

```ts
setTimeout(() => console.log("setTimeout 1"), 0);
Promise.resolve().then(() => console.log("Promise 1"));
console.log("final");
```

Реализуйте функцию `getResult()`, возвращающую массив строк в порядке вывода.
```

**`hints.md`:**
```markdown
## Подсказка 1
Синхронный код выполняется раньше любых асинхронных операций.

## Подсказка 2
Микрозадачи (Promise.then) выполняются до макрозадач (setTimeout).
```

---

### ПАТТЕРН 3: TypeScript Types

Пользователь реализует тип. Тесты используют `expectTypeOf`.

**Reference:** `ts/004-deep-readonly`, `ts/003-concat`, `ts/009-mapped-type`

**`meta.json`:**
```json
{
  "title": "deep-readonly",
  "difficulty": "easy",
  "tags": ["ts", "types"],
  "language": "typescript",
  "exports": []
}
```

**`template.ts`:**
```ts
export type DeepReadonly<T> = any;
```

**`solution.ts`:**
```ts
export type DeepReadonly<T> = {
  readonly [Key in keyof T]: T[Key] extends any[] | Record<string, unknown>
    ? DeepReadonly<T[Key]>
    : T[Key];
};
```

**`tests/test.ts`:**
```ts
import { test, expectTypeOf } from "vitest";
import type { DeepReadonly } from "../solution";

test("DeepReadonly — объект", () => {
  type T = { a: number; b: string };
  type Expected = { readonly a: number; readonly b: string };
  expectTypeOf<DeepReadonly<T>>().toEqualTypeOf<Expected>();
});
```

**`condition.md`:**
```markdown
# deep-readonly

См. код решения для понимания задачи.
```

**`hints.md`:**
```markdown
## Подсказка 1
Используйте conditional types, mapped types, infer. Проверяйте через `expectTypeOf`.

## Подсказка 2
Проверьте крайние случаи: пустой объект, never, unknown, optional properties.
```

**Важно: типовые тесты реально проверяются.** Раннер запускает задачи
с `expectTypeOf` в typecheck-режиме vitest (`ignoreSourceErrors: true` —
lax-код пользователя не фейлит прогон, но мисматчи `expectTypeOf` — фейлят).
Поэтому:

- шаблон `type X = any` **обязан** падать под tsc (иначе задача не отличает
  верное решение от неверного);
- эталонное решение обязано проходить tsc с нулём ошибок;
- не используйте несуществующие методы expect-type (`toExtend` и пр.) —
  только `toEqualTypeOf` / `toMatchTypeOf` / `toMatchObjectType`;
- `toEqualTypeOf` строго различает intersection (`A & B`) и плоский объект —
  для проверок полей предпочтителен индексный доступ: `expectTypeOf<R["a"]>().toEqualTypeOf<string>()`;
- проверяется автоматически: `make verify-tasks` (эталон 0 ошибок tsc, шаблон ≥ 1).

---

### ПАТТЕРН 4: Prototype Modification (прямая модификация прототипа)

Пользователь модифицирует прототип напрямую. Тесты импортируют решение для побочного эффекта.

**Reference:** `proto/002-next-day`, `proto/003-upper-bound`, `proto/004-replicate-string`, `proto/005-array-for-each`, `array/001-filter`, `array/004-map`

**`meta.json`:**
```json
{
  "title": "Date.prototype.nextDay: следующий день",
  "difficulty": "medium",
  "tags": ["proto", "date", "prototype"],
  "language": "typescript",
  "exports": []
}
```

**`template.ts`:**
```ts
declare global {
  interface Date {
    nextDay(): string;
  }
}

// TODO: реализуйте — назначьте метод nextDay на Date.prototype
Date.prototype.nextDay = function (): string {
  return "";
};

export {};
```

**`solution.ts`:**
```ts
declare global {
  interface Date {
    nextDay(): string;
  }
}

Date.prototype.nextDay = function (): string {
  const date = new Date(this.valueOf());
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

export {};
```

**`tests/test.ts`:**
```ts
import { test, expect } from "vitest";
import "../solution";

test("следующий день в середине месяца", () => {
  const date = new Date("2014-06-20");
  expect(date.nextDay()).toBe("2014-06-21");
});
```

**ВАЖНО:** `export {}` необходим для TypeScript — он делает файл модулем, позволяя `declare global` работать.

**НЕ ИСПОЛЬЗУЙ** паттерн `enhanceXxx()` для новых задач. Прямая модификация прототипа + `export {}` — канонический подход.

---

### ПАТТЕРН 5: Hybrid (prototype + function export)

Задача модифицирует прототип И экспортирует функцию для тестирования.

**Reference:** `this/018-my-bind`

**`meta.json`:**
```json
{
  "title": "Реализовать аналог Function.prototype.myBind",
  "difficulty": "hard",
  "tags": ["this", "types"],
  "language": "typescript",
  "exports": ["getResult"]
}
```

**`template.ts`:**
```ts
declare global {
  interface Function {
    myBind<T extends any[]>(
      this: (...args: T) => void,
      context: object,
      ...boundArgs: any[]
    ): (...args: any[]) => void;
  }
}

export function getResult(): boolean {
  // TODO: реализуйте
  return undefined as any;
}
```

**`solution.ts`:**
```ts
declare global {
  interface Function {
    myBind<T extends any[]>(
      this: (...args: T) => void,
      context: object,
      ...boundArgs: any[]
    ): (...args: any[]) => void;
  }
}

Function.prototype.myBind = function (context: object, ...boundArgs: any[]) {
  const fn = this;
  return function (...args: any[]) {
    return fn.apply(context, [...boundArgs, ...args]);
  };
};

export function getResult(): boolean {
  return true;
}
```

**`tests/test.ts`:**
```ts
import { test, expect } from "vitest";
import { getResult } from "../solution";

test("myBind привязывает контекст", () => {
  const obj = { a: 1 };
  function say(this: { a: number }) { return this.a; }
  const bound = say.myBind(obj);
  expect(bound()).toBe(1);
});

test("getResult возвращает true", () => {
  expect(getResult()).toBe(true);
});
```

---

## Workflow: добавление новой задачи

### Шаг 1: Определи тип задачи

Какой паттерн подходит?
- Функция с экспортом → **Паттерн 1**
- Код с console.log, вопрос «что выведется?» → **Паттерн 2**
- TypeScript-тип → **Паттерн 3**
- Модификация прототипа → **Паттерн 4**
- Прототип + функция → **Паттерн 5**

### Шаг 2: Найди reference-задачи

В `tasks/<тема>/` найди минимум 2 существующие задачи того же типа.
Прочитай ВСЕ их файлы. Определи общий паттерн.

**Приоритет выбора reference:**
1. Тот же тип задачи + тот же механизм JS/runtime
2. Тот же тип задачи
3. Максимально похожая архитектура
4. Другие близкие задачи

### Шаг 3: Определи тему и номер

- Тема должна уже существовать в `tasks/`. Если нет — используй ближайшую подходящую.
- Номер `NNN` — следующий свободный в теме.

### Шаг 4: Создай файлы

Создай папку `tasks/<тема>/<NNN-slug>/` со всеми 6 файлами.
Строго копируй структуру из reference-задач.

### Шаг 5: Проверь

1. `npm run typecheck` — 0 ошибок
2. Прогони решение через API — `"passed": true`
3. Прогони неправильный код — `"passed": false`
4. `GET /api/tasks` — задача появляется

## Что ЗАПРЕЩЕНО

- Создавать новый формат задачи без необходимости
- Придумывать новую структуру файлов
- Менять существующую архитектуру только ради одной новой задачи
- Использовать другой способ реализации аналогичной задачи
- Добавлять собственные conventions
- Рефакторить соседние задачи без необходимости
- Смешивать разные архитектурные подходы
- Исправлять «несовершенства» существующих задач, если это не требуется
- Менять API существующих задач без явной необходимости
- Создавать новую абстракцию только потому, что она кажется «правильной»
- Копировать структуру случайной задачи, если существуют более релевантные примеры

## Исключение: новый паттерн

Если новая задача действительно требует нового подхода:

1. Явно определи, почему существующие паттерны не подходят
2. Найди ближайшие альтернативы в проекте
3. Минимизируй количество новых архитектурных решений
4. Сохрани совместимость с существующей системой
5. Задокументируй новое решение в этом файле

## Несоответствия в существующих задачах

В проекте есть некоторые несоответствия. **Не исправляй их без явной просьбы.**

| Несоответствие | Пример | Канонический паттерн |
|---|---|---|
| `enhanceXxx()` в proto-задачах | `proto/003-upper-bound` (старый код) | Прямая модификация + `export {}` |
| `exports: []` vs `exports: ["getResult"]` | `compare/001-1` vs `this/001-1` | Для getResult: `exports: ["getResult"]` |
| `return undefined as any` vs `return` | Разные template.ts | Для getResult: `return undefined as any` |
| Дубликаты в exports | `algorithms/014-find-sum-pairs` | Уникальные имена |
| console.log в solution.ts | `algorithms/014-find-sum-pairs` | Без console.log |
| Закомментированный код в solution | `algorithms/014-find-sum-pairs` | Чистый код |
| Тема с точкой/подчёркиванием | `Promises-console.log`, `React-SKB_CONTUR` | kebab-case |

## Reference implementations

Реальные representative tasks для каждого паттерна:

### Паттерн 1 (Function Export)
- `sorts/001-bubble-sort` — чистый пример, хороший шаблон
- `promises/003-delay` — async-функция
- `lodash/003-debounce` — closure, fake timers в тестах
- `carry/001-sum` — каррирование

### Паттерн 2 (Output Prediction)
- `event-loop/001-1` — event loop
- `this/001-1` — this контекст
- `compare/001-1` — сравнение значений
- `scope/001-1` — области видимости

### Паттерн 3 (TS Types)
- `ts/004-deep-readonly` — mapped types
- `ts/003-concat` — conditional types
- `ts/009-mapped-type` — utility types

### Паттерн 4 (Prototype Modification)
- `proto/002-next-day` — Date.prototype
- `proto/003-upper-bound` — Array.prototype
- `proto/004-replicate-string` — String.prototype
- `array/001-filter` — Array.prototype (с generics)

### Паттерн 5 (Hybrid)
- `this/018-my-bind` — Function.prototype + getResult

### Паттерн 6 (React-компоненты, language: "tsx")
- `my/005-react` — хук useCounter + App, тесты через @testing-library/react

Для задач, где проверяется **фактическое React-поведение** (хуки, рендер, события):
- `meta.json`: `"language": "tsx"` — решение пишется с JSX, раннер кладёт его как `solution.tsx`;
- тесты — в `tests/test.tsx` (не test.ts), первая строка файла — `// @vitest-environment jsdom`;
- в runtime доступны `react`, `react-dom`, `jsdom`, `@testing-library/react` (`renderHook`, `render`, `fireEvent`, `act`);
- таймеры — `vi.useFakeTimers()` + `await act(async () => { await vi.advanceTimersByTimeAsync(ms) })`;
- JSX транслируется automatic-рантаймом (`react/jsx-runtime`) — `import React` в решении не нужен;
- задачи на **логику** хуков (react/005-use-callback, react/006-use-memo — свой useCallback/useMemo
  c prevRef) тестируются как чистые функции (обычный `test.ts`), renderHook там не нужен и не обязан работать.

## Чек-лист валидации

Перед завершением работы над задачей **обязательно** выполни:

1. **Typecheck** — `npm run typecheck` должен дать 0 ошибок
2. **Сборка** — `npm run build` (frontend, Vite) должен пройти без ошибок
3. **Прогон тестов** — отправь эталонное решение через API:
   ```bash
   curl -X POST http://localhost:8080/api/run \
     -H "Content-Type: application/json" \
     -d '{"taskId":"<тема>/<NNN-slug>","code":"<содержимое solution.ts>"}'
   ```
   Ответ должен содержать `"passed":true` и все `assertions[].passed === true`.
4. **Неправильное решение** — отправь заведомо сломанный код и шаблон, должны быть `"passed":false`
   с понятной диагностикой (не «0 из 0» без объяснений)
5. **Сканер** — задача появляется в `GET /api/tasks` под правильной темой
6. **Валидатор** — `make verify-tasks` из корня репозитория: 0 проблем
   (структура 6 файлов, синтаксис шаблона, контракт импортов «шаблон ↔ тесты»,
   для типовых задач — tsc-различение шаблона и эталона)
7. **CI** — при открытии PR с изменениями в `backend/tasks/**` GitHub Actions
   (`.github/workflows/verify-task-pr.yml`) автоматически проверит задачи
   Go-верификатором (`backend/cmd/verifytask`): структура, метаданные,
   эталонное решение (должно проходить все тесты), шаблон (должен проваливаться),
   а также **семантическое ИИ-ревью** (условие ↔ тесты ↔ решение, сложность,
   подсказки; нужен секрет `LLM_API_KEY` — тот же, что для генерации задач).
   Результат придёт комментарием на PR с метками `task-verified` / `task-failed`.
   Локальный прогон того же верификатора:
   ```bash
   cd backend && go build -o /tmp/verifytask ./cmd/verifytask
   /tmp/verifytask -tasks ./tasks -runtime ./runtime -ids "тема/NNN-slug"
   # с ИИ-ревью (env LLM_API_KEY) или моком для локальной разработки:
   LLM_API_KEY=... /tmp/verifytask -tasks ./tasks -runtime ./runtime -ids "..."
   /tmp/verifytask -tasks ./tasks -runtime ./runtime -ids "..." -llm-mock
   ```
