# Var: hoisting (поднятие переменных)

Что выведется в консоль?

```ts
console.log(a);
var a = 6;
console.log(b);
let b = 6;
```

И что будет, если выполнить этот блок дважды?

```ts
console.log(a);
var a = 6;
console.log(b);
let b = 6;
var a = 6;
var a = 60;
console.log(a);
let a = 5;
let a = 50;
console.log(a);
```

Реализуйте функцию `getResult()`, возвращающую массив строк с выводом и ошибками (начиная с `"ответ"`).
