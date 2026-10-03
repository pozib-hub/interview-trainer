## Подсказка 1
Сначала весь синхронный код: `console.log(7)`. Затем микрозадачи, затем макрозадачи.

## Подсказка 2
`Promise.reject(2).catch(console.log)` — это микрозадача: выведет `2`. `new Promise(resolve => setTimeout(resolve)).then(...)` — resolve происходит в setTimeout, значит `.then` выполнится только после макрозадачи.
