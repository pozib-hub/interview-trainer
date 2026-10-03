## Подсказка 1
`new Promise` executor выполняется синхронно. `await` приостанавливает функцию до resolve.

## Подсказка 2
`setTimeout` внутри executor — макрозадача. После resolve продолжение `await` — микрозадача.
