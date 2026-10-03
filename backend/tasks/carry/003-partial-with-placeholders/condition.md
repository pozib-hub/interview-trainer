# Частичное применение с плейсхолдерами

Дана функция `fn` и массив `args`. Верните функцию `partialFn`.

В массиве `args` плейсхолдеры `"_"` заменяются значениями из `restArgs` (аргументов вызова `partialFn`) по порядку, начиная с индекса `0`. Оставшиеся значения из `restArgs` добавляются в конец `args`. Затем результат передаётся в `fn` как отдельные аргументы.

```ts
const partialFn = partial(fn, args);
const result = partialFn(...restArgs);
```

## Пример 1

```ts
fn = (...args) => args;
args = [2, 4, 6];
restArgs = [8, 10];
const partialFn = partial(fn, args);
partialFn(...restArgs); // [2, 4, 6, 8, 10]
```
Плейсхолдеров нет — `restArgs` просто добавляются в конец `args`.

## Пример 2

```ts
fn = (...args) => args;
args = [1, 2, "_", 4, "_", 6];
restArgs = [3, 5];
const partialFn = partial(fn, args);
partialFn(...restArgs); // [1, 2, 3, 4, 5, 6]
```
Плейсхолдеры `"_"` заменяются значениями из `restArgs` по порядку.

## Пример 3

```ts
fn = (a, b, c) => b + a - c;
args = ["_", 5];
restArgs = [5, 20];
const partialFn = partial(fn, args);
partialFn(...restArgs); // -10
```
`"_"` заменяется на `5`, затем `20` добавляется в конец. `fn(5, 5, 20)` → `5 + 5 - 20 = -10`.

## Ограничения

- `fn` — функция.
- `args` и `restArgs` — допустимые массивы JSON.
- `1 <= args.length <= 5 * 10^4`
- `1 <= restArgs.length <= 5 * 10^4`
- `0 <= number of placeholders <= restArgs.length`
