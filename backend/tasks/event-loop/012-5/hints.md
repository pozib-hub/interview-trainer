## Подсказка 1
Сначала синхронный код: `console.log(7)`. Затем микрозадачи: `Promise.reject.catch`, `Promise.resolve.then`.

## Подсказка 2
`new Promise(resolve => setTimeout(resolve)).then(...)` — resolve в макрозадаче, значит `.then` выполнится после первого `setTimeout`, но до второго.
