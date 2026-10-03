## Подсказка 1
`ILovePromise()` — синхронно: `before promise`, `in Promise`, `resolve()`. `console.log("log1")` — тоже синхронно.

## Подсказка 2
`.then` от resolved promise — микрозадача. `setTimeout` — макрозадача, выполняется после всех микрозадач.
