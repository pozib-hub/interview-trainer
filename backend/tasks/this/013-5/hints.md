## Подсказка 1
`this.roles.map(function(role){...})` — внутри callback `this = undefined` (обычная функция, не метод объекта).

## Подсказка 2
Код выполняется как ESM-модуль (strict mode): `this.name` выбрасывает `TypeError: Cannot read properties of undefined (reading 'name')`.

## Подсказка 3
В браузерном скрипте (нестрогий режим) `this = window`, а `window.name` — пустая строка, поэтому там вывод был бы `[" is friend", " is brother", " is student"]`. Это классическая ловушка: ответ зависит от режима.

## Подсказка 4
Как исправить:
- Стрелочная функция: `this.roles.map((role) => this.name + " is " + role)` — захватывает `this` из `getRoles`.
- `.bind(this)`: `this.roles.map(function(role){...}.bind(this))`.
