## Подсказка 1
`a.hasOwnProperty("__proto__")` — проверяет собственное свойство. У `a` нет собственного свойства `"__proto__"`.

## Подсказка 2
`a.__proto__` — это `Object.prototype`. У `Object.prototype` есть свойство `__proto__` (указывает на `null`), поэтому `hasOwnProperty("__proto__")` → `true`.
