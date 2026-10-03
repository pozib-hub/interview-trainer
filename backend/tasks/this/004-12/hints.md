## Подсказка 1
`myObj.greet()` — вызов как метод объекта, `this = myObj`, выведет `"Maxim"`.

## Подсказка 2
`const fn = myObj.greet` — ссылка на функцию без объекта. `fn()` — вызов без контекста, `this = undefined` (strict mode). `this.name` → `TypeError`.

## Подсказка 3
Решение: `fn.call(myObj)`, `fn.apply(myObj)`, или `const fn = myObj.greet.bind(myObj)`.
