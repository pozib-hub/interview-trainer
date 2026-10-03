## Подсказка 1
`var` поднимается (hoisting): `console.log(a)` → `undefined` (не `ReferenceError`). `let` не поднимается: `ReferenceError` (TDZ). Выполнение первого блока останавливается на `console.log(b)`.

## Подсказка 2
Повторное `var a` — допустимо. Повторное `let a` в той же области видимости — это ошибка этапа компиляции: `SyntaxError: Identifier 'a' has already been declared`.

## Подсказка 3
`SyntaxError` возникает до выполнения второго блока: из-за дублирующегося `let a` весь блок не компилируется, и ни один `console.log` в нём не вызывается.
