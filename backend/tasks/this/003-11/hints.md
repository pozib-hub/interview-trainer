## Подсказка 1
`object.foo()` — `this = object`, `this.data = "Some Data"`. Внутри `foo` обычная функция `bar()` вызывается без контекста.

## Подсказка 2
`bar()` — не метод объекта, а обычный вызов. В модуле (ESM, strict mode) `this = undefined`, поэтому `this.data` выбрасывает `TypeError: Cannot read properties of undefined (reading 'data')`.

## Подсказка 3
В нестрогом режиме (например, обычный скрипт в браузере) `this = window/globalThis`, и вывод был бы `undefined`. Платформа выполняет код как ESM-модуль — ответ `TypeError`.
