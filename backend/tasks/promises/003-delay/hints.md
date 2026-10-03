## Подсказка 1
`delay(ms)` возвращает Promise, который resolve через `ms` миллисекунд. Используйте `setTimeout`.

## Подсказка 2
`new Promise(resolve => setTimeout(resolve, ms))` — основа. Для отмены — `AbortSignal`.
