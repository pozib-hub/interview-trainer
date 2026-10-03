## Подсказка 1
`var fn = a.kek ? a.kek : a.kek` — `fn` получает ссылку на функцию без объекта `a`.

## Подсказка 2
`fn()` — вызов без контекста, `this = undefined` (strict mode). `this.lol` = `undefined`.

## Подсказка 3
Решение: `var fn = a.kek.bind(a)` — привязать контекст.
