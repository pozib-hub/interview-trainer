# Obj: области видимости

Что выведется в консоль?

```ts
var a = 1;
var b = 3;

function c() {
  let b = 4;
  a = 4;
}

c();

console.log(a);
console.log(b);
```

Реализуйте функцию `getResult()`, возвращающую массив строк с выводом консоли.
