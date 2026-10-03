## Подсказка 1
Оберните async функцию с таймером: `Promise.race([fn(), timeout])`. Таймер rejected по истечении времени.

## Подсказка 2
Используйте `setTimeout` + `clearTimeout`. Возвращайте `TimeoutError` при превышении лимита.
