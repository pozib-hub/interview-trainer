# Transformation: неявное приведение типов

Что выведется в консоль?

```ts
console.log([] + null + 1);
console.log("foo" + +"bar");
console.log(!!"false" == !!"true");

console.log("a" && "" && "c");
console.log("a" && "" || "c");
console.log("" ?? "a");
```

Реализуйте функцию `getResult()`, возвращающую массив значений в порядке вывода.
