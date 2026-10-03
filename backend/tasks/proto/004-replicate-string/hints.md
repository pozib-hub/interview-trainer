## Подсказка 1
Метод нужно добавить в `String.prototype`, чтобы он был доступен на любой строке. Внутри метода `this` — это строка, на которой вызвали `replicate`.

## Подсказка 2
Создайте массив длины `times`, заполните его `this` и объедините через `join("")`: `new Array(times).fill(this).join("")`.

## Подсказка 3
Не используйте встроенный `String.prototype.repeat` — создайте массив вручную через `fill(this)` и `join`. Для TypeScript не забудьте `declare global { interface String { replicate(times: number): string } }`.
