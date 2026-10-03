## Подсказка 1
`this.users.filter(function(user){...})` — внутри callback `this = undefined` (обычная функция). `this.currentFilter` = `undefined`.

## Подсказка 2
`user.status === undefined` → всегда `false`. Результат: `[]` (пустой массив).

## Подсказка 3
Решения:
- Стрелочная функция: `this.users.filter((user) => user.status === this.currentFilter)` — захватывает `this` из `getFilteredUsers`.
- `.bind(this)`: `this.users.filter(function(user){...}.bind(this))`.
