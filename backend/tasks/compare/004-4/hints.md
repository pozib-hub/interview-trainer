## Подсказка 1
`typeof NaN` → `"number"` (NaN — это числовое значение). `typeof null` → `"object"` (исторический баг JS).

## Подсказка 2
`typeof []` → `"object"` (массивы — объекты). `typeof Array` → `"function"` (Array — конструктор). `typeof (() => {})` → `"function"`.
