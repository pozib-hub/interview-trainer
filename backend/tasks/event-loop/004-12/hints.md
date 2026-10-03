## Подсказка 1
`test()` вызывается синхронно. `await console.log("2")` — `console.log` выполнится, `await` приостановит функцию.

## Подсказка 2
После `await` continuation — микрозадача. `.then` от `new Promise` — тоже микрозадача. Порядок: continuation, затем `.then`.
