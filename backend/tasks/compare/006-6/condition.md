# Compare: приведение типов

Что выведется в консоль?

```ts
console.log(true == "true");
console.log(["x"] == "x");
console.log(0 == false);
console.log(null == undefined);
console.log(NaN == NaN);
console.log("number" + 15 + 3);
console.log(15 + 3 + "number");
console.log(0 || ("0" && {}));

console.log(!!"true" == !!"0");
console.log("" + null);
```

Реализуйте функцию `getResult()`, возвращающую массив значений в порядке вывода.
