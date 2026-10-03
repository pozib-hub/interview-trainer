## Подсказка 1
`new Promise` executor синхронен: `console.log(2)`, `resolve()`. `console.log(4)` — синхронно. `setTimeout` — макрозадача.

## Подсказка 2
Две цепочки `.then` на одном promise: `5, 7` (обе первые `.then` выполняются), затем `6, 8` (вторые `.then`).
