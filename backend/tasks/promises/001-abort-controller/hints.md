## Подсказка 1
`AbortController` позволяет отменить fetch. Создайте controller, передайте signal в fetch.

## Подсказка 2
Вызовите `controller.abort()` для отмены. Поймайте `AbortError` в catch.
