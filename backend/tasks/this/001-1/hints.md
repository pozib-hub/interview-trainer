## Подсказка 1
`greet("hello")` вызывается без контекста. Внутри `setTimeout(function(){...})` — обычная функция, `this = undefined` (strict mode) или `window`.

## Подсказка 2
`this.firstName` и `this.lastName` = `undefined`. Вывод: `"hello undefined undefined"`.

## Подсказка 3
Решения:
- `greet.bind(user)("hello")` — привязать контекст
- `greet.call(user, "hello")` — вызвать с контекстом
- `greet.apply(user, ["hello"])` — то же через apply
- Стрелочная функция внутри setTimeout не поможет (this будет внешним, а не user)
