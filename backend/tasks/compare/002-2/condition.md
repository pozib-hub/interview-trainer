# Compare: логические операторы || и &&

Что выведется в консоль?

```ts
console.log(true || false);
console.log(1 || false);
console.log(0 || false);
console.log("string" || false);
console.log(0 || false || "string" || 1);
console.log(false || (0 && 5));
console.log(true || (1 && 5));
console.log(true && false);
console.log(false && true);
console.log(1 && 0 && 5);
console.log((1 && 5) || 7);
```

Реализуйте функцию `getResult()`, возвращающую массив значений в порядке вывода.
