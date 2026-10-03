## Подсказка 1
Синхронно: `in promise`, `log1`, микрозадача `Promise then`. `setTimeout(100мс)` — первый макротаск.

## Подсказка 2
`sleep(2000)` → `sleep 2000 then`, `.finally` → `sleep 2000 finally` + планирует `setTimeout(1000)`. `sleep(1000)` от `setTimeout(100)` → `sleep 1000 then`.
