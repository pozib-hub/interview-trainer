## Подсказка 1
`hi()` — обычный вызов функции без контекста. `this = undefined` (strict mode).

## Подсказка 2
`this.name` → `TypeError: Cannot read properties of undefined (reading 'name')`.

## Подсказка 3
Решение: `hi.call(user)`, `hi.apply(user)`, или `hi.bind(user)()`.
