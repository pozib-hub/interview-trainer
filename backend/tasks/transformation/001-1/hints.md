## Подсказка 1
`Number(null)` → `0`, но `Number(undefined)` → `NaN`. `Number("A")` → `NaN` (не число), `Number("24")` → `24`.

## Подсказка 2
`Boolean()` возвращает `false` для всех falsy значений: `0`, `null`, `undefined`, `NaN`, `""`, `false`. Всё остальное → `true`.
