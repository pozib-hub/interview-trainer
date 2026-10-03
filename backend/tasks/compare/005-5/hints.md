## Подсказка 1
Function declaration полностью поднимается: `typeof f1` → `"function"`. `var f2` поднимается, но присваивание — нет: `typeof f2` → `"undefined"`.

## Подсказка 2
`let f3` находится во временной мёртвой зоне (TDZ): обращение до объявления выбрасывает `ReferenceError: Cannot access 'f3' before initialization`, и выполнение скрипта на этом останавливается — последние три `console.log` не выполняются.

## Подсказка 3
Если бы ошибки не было: `undefined && (4 & 7)` → `undefined` (&& возвращает первый falsy). `undefined || 7 || 8` → `7`. `(7 && 8) || 6` → `8`.
