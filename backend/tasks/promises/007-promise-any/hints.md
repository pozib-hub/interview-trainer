## Подсказка 1
`Promise.any` возвращает первый fulfilled promise. Если все reject — `AggregateError`.

## Подсказка 2
В отличие от `Promise.race`, игнорирует rejections. Ждёт первого успеха, а не первого завершения.
