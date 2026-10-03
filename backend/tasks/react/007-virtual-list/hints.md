## Подсказка 1

`getBigRandomList` должен вернуть массив из 1000 случайных чисел в диапазоне [0, 1).

## Подсказка 2

`calculateVisibleItems(scrollTop, itemHeight, viewportHeight, count)`:
`start = Math.floor(scrollTop / itemHeight)`, `end = Math.min(count - 1, Math.ceil((scrollTop + viewportHeight) / itemHeight))`.

## Подсказка 3

`areDepsEqual` сравнивает длины массивов и каждый элемент через `Object.is` (учитывает `NaN`).
