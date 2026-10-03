## Подсказка 1
Синхронно: `1, 15`. Микрозадачи: `.then(4)`, `.then(13)`, `queueMicrotask(16)`. В Node.js `requestAnimationFrame` и `MutationObserver` не работают.

## Подсказка 2
Макрозадачи в порядке: `setTimeout(2)` → микрозадача `3` + планирует `setTimeout(6)`, `setTimeout(10)` → микрозадача `11`, `setTimeout(14)`, затем `setTimeout(5)`, `setTimeout(6)`.
