## Подсказка 1
`obj.prop.getname()` — `this = obj.prop`, вернёт `"Rox"`. `test()` без контекста — `this = undefined` → TypeError.

## Подсказка 2
`.bind(obj)` возвращает функцию (не вызывает её). Стрелочная функция `arrow` захватывает `this` из лексического контекста (модуль) — `undefined`.
