## Подсказка 1
`new Promise` executor выполняется синхронно: `console.log(1)`, планируется `setTimeout`, `console.log(2)`.

## Подсказка 2
`setTimeout` — макрозадача. Внутри: `console.log("timerStart")`, `resolve("success")`, `console.log("timerEnd")`. После resolve — микрозадача `.then` выведет `success`.
