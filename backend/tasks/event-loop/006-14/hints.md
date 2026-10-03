## Подсказка 1
Синхронно: `console.log(1)`, `console.log("Promise")`, `console.log(4)`. Затем макрозадачи в порядке очереди.

## Подсказка 2
`setTimeout` с `resolve` — макрозадача. После resolve, `.then` — микрозадача, которая выполняется до следующего `setTimeout`.
