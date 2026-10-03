# Compare: hoisting функций и логические операторы

Что выведется в консоль?

```ts
console.log(typeof f1);
console.log(typeof f2);
console.log(typeof f3);
function f1() {}

var f2 = function () {};
let f3 = function () {};

console.log(undefined && 4 & 7);
console.log(undefined || 7 || 8);
console.log((7 && 8) || 6);
```

Реализуйте функцию `getResult()`, возвращающую массив значений в порядке вывода.
