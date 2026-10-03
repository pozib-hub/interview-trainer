## Подсказка 1
`Promise.race` возвращает первый завершённый promise (fulfilled или rejected).

## Подсказка 2
Используйте для таймаутов: `Promise.race([fetch(), timeoutReject()])`. Остальные promises продолжают выполняться, но результат игнорируется.
