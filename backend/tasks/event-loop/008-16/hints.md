## Подсказка 1
В Node.js нет `document`, `MutationObserver`, `requestAnimationFrame`. Код упадёт на `document.createElement`.

## Подсказка 2
В браузере: синхронно `1, 3, 4, 10`. Микрозадачи: `5` (then), затем MutationObserver `6, 7`. Макрозадачи: `2`, затем RAF `8`, затем fetch `9`.
