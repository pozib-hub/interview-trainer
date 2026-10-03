## Подсказка 1
`new Promise` executor выполняется синхронно: `console.log("Promise 1")`, `resolve()`, `console.log("Promise 2")`.

## Подсказка 2
`.then` от resolved promise — микрозадача. `setTimeout` — макрозадача. Микрозадача, планирующая `setTimeout`, ставит его в конец очереди макрозадач.
